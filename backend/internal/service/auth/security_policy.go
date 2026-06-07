package auth

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/service/common/authutil"
	riskservice "mysso/backend/internal/service/risk"
	"mysso/backend/internal/service/settings"
	"mysso/backend/internal/store"
)

const (
	adminForcedPhoneBindingReason = "admin_force_phone_binding"
	loginStepUpChallengeTTL       = 10 * time.Minute
	mfaEnrollmentChallengeTTL     = 15 * time.Minute
)

type postAuthRiskOptions struct {
	RiskStepUpSatisfied  bool
	RiskCaptchaSatisfied bool
	RiskCaptchaAllowed   bool
}

type PasswordLoginRiskOptions struct {
	CaptchaSatisfied bool
}

func DefaultUserSecurityPolicy(userID string) domain.UserSecurityPolicy {
	now := time.Now().UTC()
	return domain.UserSecurityPolicy{
		UserID:          strings.TrimSpace(userID),
		LoginStepUpMode: domain.LoginStepUpModeNone,
		CreatedAt:       now,
		UpdatedAt:       now,
	}
}

func (s *AuthService) getUserSecurityPolicy(userID string) (domain.UserSecurityPolicy, error) {
	policy, err := s.deps.Store.GetUserSecurityPolicy(userID)
	if err != nil {
		if err == store.ErrNotFound {
			return DefaultUserSecurityPolicy(userID), nil
		}
		return domain.UserSecurityPolicy{}, err
	}
	if policy.LoginStepUpMode == "" {
		policy.LoginStepUpMode = domain.LoginStepUpModeNone
	}
	return policy, nil
}

func (s *AuthService) saveUserSecurityPolicy(policy domain.UserSecurityPolicy) error {
	if policy.LoginStepUpMode == "" {
		policy.LoginStepUpMode = domain.LoginStepUpModeNone
	}
	if policy.CreatedAt.IsZero() {
		policy.CreatedAt = time.Now().UTC()
	}
	policy.UpdatedAt = time.Now().UTC()
	return s.deps.Store.UpsertUserSecurityPolicy(policy)
}

func (s *AuthService) clearUserSecurityPolicy(userID string, clearPhone, clearStepUp, clearMFA bool) error {
	policy, err := s.getUserSecurityPolicy(userID)
	if err != nil {
		return err
	}
	changed := false
	if clearPhone && policy.ForcePhoneBindingNextLogin {
		policy.ForcePhoneBindingNextLogin = false
		changed = true
	}
	if clearStepUp && policy.LoginStepUpMode != domain.LoginStepUpModeNone {
		policy.LoginStepUpMode = domain.LoginStepUpModeNone
		changed = true
	}
	if clearMFA && policy.ForceMFAEnrollmentNextLogin {
		policy.ForceMFAEnrollmentNextLogin = false
		changed = true
	}
	if !changed {
		return nil
	}
	return s.saveUserSecurityPolicy(policy)
}

func deriveLoginMethodFromACR(acr string) string {
	acr = strings.TrimSpace(acr)
	switch {
	case strings.Contains(acr, "passkey"):
		return "passkey"
	case strings.Contains(acr, "email-otp"):
		return "email_otp"
	case strings.Contains(acr, "sms-otp"):
		return "sms_otp"
	default:
		return "password"
	}
}

func (s *AuthService) ContinuePostAuthentication(user domain.User, ip, loginMethod, acr string, binding ...settings.DeviceBindingInput) (PasswordLoginResult, error) {
	return s.continuePostAuthenticationWithRisk(user, ip, loginMethod, acr, riskservice.ClientInfo{}, binding...)
}

func (s *AuthService) ContinuePostAuthenticationWithRisk(user domain.User, ip, loginMethod, acr string, clientRisk riskservice.ClientInfo, binding ...settings.DeviceBindingInput) (PasswordLoginResult, error) {
	return s.continuePostAuthenticationWithRisk(user, ip, loginMethod, acr, clientRisk, binding...)
}

func (s *AuthService) continuePostAuthenticationWithRisk(user domain.User, ip, loginMethod, acr string, clientRisk riskservice.ClientInfo, binding ...settings.DeviceBindingInput) (PasswordLoginResult, error) {
	return s.continuePostAuthenticationWithRiskOptions(user, ip, loginMethod, acr, clientRisk, postAuthRiskOptions{}, binding...)
}

func (s *AuthService) continuePostAuthenticationWithRiskOptions(user domain.User, ip, loginMethod, acr string, clientRisk riskservice.ClientInfo, opts postAuthRiskOptions, binding ...settings.DeviceBindingInput) (PasswordLoginResult, error) {
	if user.DeletionScheduledAt != nil {
		challenge, err := s.createDeletionLoginChallengeWithRisk(user, acr, clientRisk)
		if err != nil {
			return PasswordLoginResult{}, err
		}
		return PasswordLoginResult{
			RequiresDeletionConfirmation: true,
			DeletionChallengeToken:       challenge.Token,
			DeletionScheduledAt:          &challenge.DeletionScheduledAt,
			User:                         user,
		}, nil
	}
	if result, enforced, err := s.maybeRequirePhoneBindingBeforeLogin(user, acr, clientRisk); err != nil {
		return PasswordLoginResult{}, err
	} else if enforced {
		return result, nil
	}
	policy, err := s.getUserSecurityPolicy(user.ID)
	if err != nil {
		return PasswordLoginResult{}, err
	}
	if result, enforced, err := s.maybeRequireLoginStepUp(user, policy, loginMethod, acr, clientRisk); err != nil {
		return PasswordLoginResult{}, err
	} else if enforced {
		return result, nil
	}
	if s.risk != nil && user.Role != domain.RoleAdmin {
		device := settings.DeviceBindingInput{}
		if len(binding) > 0 {
			device = binding[0]
		}
		assessment, err := s.risk.AssessLogin(riskservice.LoginParams{
			UserID:      user.ID,
			IP:          ip,
			DeviceKeyID: device.KeyID,
			Client:      clientRisk,
		})
		if err != nil {
			s.audit.Record(user.ID, user.Role, "risk.login_assessment_error", user.ID, map[string]any{"error": err.Error(), "ip": ip})
			assessment := riskservice.Assessment{Score: 100, Level: riskservice.LevelCritical, Action: riskservice.ActionBlock, Message: "Risk assessment is unavailable"}
			s.risk.RecordLogin(user.ID, ip, device.KeyID, clientRisk, assessment, false)
			return PasswordLoginResult{User: user, RiskLevel: assessment.Level, RiskAction: assessment.Action, RiskMessage: assessment.Message, RiskScore: assessment.Score}, fmt.Errorf("access_denied")
		} else {
			riskConfig := s.risk.Config()
			if assessment.Action == riskservice.ActionBlock {
				if !riskBlockCanUseStepUp(assessment) {
					s.risk.RecordLogin(user.ID, ip, device.KeyID, clientRisk, assessment, false)
					return PasswordLoginResult{User: user, RiskLevel: assessment.Level, RiskAction: assessment.Action, RiskMessage: assessment.Message, RiskScore: assessment.Score}, fmt.Errorf("access_denied")
				}
				if opts.RiskStepUpSatisfied && riskConfig.AllowBlockStepUp {
					assessment.Action = riskservice.ActionAllow
					assessment.Message = ""
					_ = s.risk.TrustDeviceAfterVerification(user.ID, clientRisk.Fingerprint, "block_step_up_completed")
				} else if !riskConfig.AllowBlockStepUp {
					s.risk.RecordLogin(user.ID, ip, device.KeyID, clientRisk, assessment, false)
					return PasswordLoginResult{User: user, RiskLevel: assessment.Level, RiskAction: assessment.Action, RiskMessage: assessment.Message, RiskScore: assessment.Score}, fmt.Errorf("access_denied")
				} else {
					assessment.Action = riskservice.ActionStepUp
					assessment.Message = "Strong verification is required"
				}
			}
			if assessment.Action == riskservice.ActionCaptcha && opts.RiskCaptchaSatisfied {
				assessment.Action = riskservice.ActionAllow
				assessment.Message = ""
			}
			if assessment.Action == riskservice.ActionCaptcha && !opts.RiskCaptchaSatisfied {
				if !opts.RiskCaptchaAllowed || s.settings == nil || !s.settings.GetCaptchaSettings().Enabled {
					assessment.Action = riskservice.ActionStepUp
					assessment.Message = "Additional verification is required"
				} else {
					s.risk.RecordLogin(user.ID, ip, device.KeyID, clientRisk, assessment, false)
					return PasswordLoginResult{User: user, RiskLevel: assessment.Level, RiskAction: assessment.Action, RiskMessage: assessment.Message, RiskScore: assessment.Score}, ErrCaptchaRequired
				}
			}
			if assessment.Action == riskservice.ActionStepUp {
				policy.LoginStepUpMode = bestRiskStepUpMode(user)
			}
			if assessment.Action != riskservice.ActionAllow && !opts.RiskStepUpSatisfied {
				if result, enforced, err := s.maybeRequireLoginStepUp(user, policy, loginMethod, acr, clientRisk); err != nil {
					return PasswordLoginResult{}, err
				} else if enforced {
					result.RiskLevel = assessment.Level
					result.RiskAction = assessment.Action
					result.RiskMessage = assessment.Message
					result.RiskScore = assessment.Score
					s.risk.RecordLogin(user.ID, ip, device.KeyID, clientRisk, assessment, false)
					return result, nil
				}
				assessment.Action = riskservice.ActionBlock
				assessment.Message = "Additional verification is unavailable"
				s.risk.RecordLogin(user.ID, ip, device.KeyID, clientRisk, assessment, false)
				return PasswordLoginResult{User: user, RiskLevel: assessment.Level, RiskAction: assessment.Action, RiskMessage: assessment.Message, RiskScore: assessment.Score}, fmt.Errorf("access_denied")
			}
			if assessment.Action != riskservice.ActionAllow && opts.RiskStepUpSatisfied {
				assessment.Action = riskservice.ActionAllow
				assessment.Message = ""
				_ = s.risk.TrustDeviceAfterVerification(user.ID, clientRisk.Fingerprint, "login_step_up_completed")
			}
			defer func() {
				s.risk.RecordLogin(user.ID, ip, device.KeyID, clientRisk, assessment, true)
			}()
		}
	}
	if result, enforced, err := s.maybeRequireMFAEnrollment(user, policy, loginMethod, acr, clientRisk, opts); err != nil {
		return PasswordLoginResult{}, err
	} else if enforced {
		return result, nil
	}
	session, updatedUser, err := createLoginSession(s.deps, s.audit, user, ip, acr, binding...)
	if err != nil {
		return PasswordLoginResult{}, err
	}
	return PasswordLoginResult{Session: session, User: updatedUser}, nil
}

func bestRiskStepUpMode(user domain.User) domain.LoginStepUpMode {
	hasEmail := strings.TrimSpace(user.Email) != ""
	hasPhone := strings.TrimSpace(user.Phone) != ""
	if hasEmail && hasPhone {
		return domain.LoginStepUpModeEmailAndSMS
	}
	if hasEmail {
		return domain.LoginStepUpModeEmail
	}
	if hasPhone {
		return domain.LoginStepUpModeSMS
	}
	return domain.LoginStepUpModeNone
}

func riskBlockCanUseStepUp(assessment riskservice.Assessment) bool {
	for _, signal := range assessment.Signals {
		switch strings.TrimSpace(signal.Name) {
		case "ip_blacklisted":
			return false
		}
	}
	return true
}

func (s *AuthService) maybeRequireLoginStepUp(user domain.User, policy domain.UserSecurityPolicy, loginMethod, acr string, clientRisk ...riskservice.ClientInfo) (PasswordLoginResult, bool, error) {
	effectiveMode, err := resolveStepUpModeForUser(user, policy.LoginStepUpMode)
	if err != nil {
		return PasswordLoginResult{}, false, err
	}
	if effectiveMode == domain.LoginStepUpModeNone {
		return PasswordLoginResult{}, false, nil
	}
	riskSnapshot := riskservice.ClientInfo{}
	if len(clientRisk) > 0 {
		riskSnapshot = clientRisk[0]
	}
	challenge, err := s.createLoginStepUpChallengeWithRisk(user, loginMethod, acr, effectiveMode, riskSnapshot)
	if err != nil {
		return PasswordLoginResult{}, false, err
	}
	return PasswordLoginResult{
		RequiresStepUpVerification: true,
		StepUpChallengeToken:       challenge.Token,
		StepUpMode:                 string(challenge.EffectiveMode),
		MaskedEmailTarget:          maskMFATarget("email", challenge.EmailTarget),
		MaskedPhoneTarget:          maskMFATarget("sms", challenge.PhoneTarget),
		User:                       user,
	}, true, nil
}

func (s *AuthService) maybeRequireMFAEnrollment(user domain.User, policy domain.UserSecurityPolicy, loginMethod, acr string, clientRisk riskservice.ClientInfo, opts postAuthRiskOptions) (PasswordLoginResult, bool, error) {
	if !policy.ForceMFAEnrollmentNextLogin {
		return PasswordLoginResult{}, false, nil
	}
	if !authutil.SupportsUserMFA(user) {
		if err := s.clearUserSecurityPolicy(user.ID, false, false, true); err != nil {
			return PasswordLoginResult{}, false, err
		}
		return PasswordLoginResult{}, false, nil
	}
	if authutil.EffectiveUserMFAEnabled(user) {
		if err := s.clearUserSecurityPolicy(user.ID, false, false, true); err != nil {
			return PasswordLoginResult{}, false, err
		}
		return PasswordLoginResult{}, false, nil
	}
	methods := AvailableMFAEnrollmentMethods(user)
	if len(methods) == 0 {
		return PasswordLoginResult{}, false, fmt.Errorf("no available mfa method for current account")
	}
	challenge := domain.LoginMFAEnrollmentChallenge{
		Token:               uuid.NewString(),
		UserID:              user.ID,
		LoginMethod:         loginMethod,
		ACR:                 acr,
		RiskClientJSON:      encodeRiskClient(clientRisk),
		RiskStepUpSatisfied: opts.RiskStepUpSatisfied,
		ExpiresAt:           time.Now().UTC().Add(mfaEnrollmentChallengeTTL),
		CreatedAt:           time.Now().UTC(),
	}
	if err := s.deps.Store.SaveLoginMFAEnrollmentChallenge(challenge); err != nil {
		return PasswordLoginResult{}, false, err
	}
	return PasswordLoginResult{
		RequiresMFAEnrollmentSetup:  true,
		MFAEnrollmentChallengeToken: challenge.Token,
		AvailableMFAMethods:         methods,
		User:                        user,
	}, true, nil
}

func resolveStepUpModeForUser(user domain.User, desired domain.LoginStepUpMode) (domain.LoginStepUpMode, error) {
	switch desired {
	case "", domain.LoginStepUpModeNone:
		return domain.LoginStepUpModeNone, nil
	case domain.LoginStepUpModeEmail:
		if strings.TrimSpace(user.Email) == "" {
			return domain.LoginStepUpModeNone, fmt.Errorf("no available login verification target for current account")
		}
		return domain.LoginStepUpModeEmail, nil
	case domain.LoginStepUpModeSMS:
		if strings.TrimSpace(user.Phone) == "" {
			return domain.LoginStepUpModeNone, fmt.Errorf("no available login verification target for current account")
		}
		return domain.LoginStepUpModeSMS, nil
	case domain.LoginStepUpModeEmailAndSMS:
		hasEmail := strings.TrimSpace(user.Email) != ""
		hasPhone := strings.TrimSpace(user.Phone) != ""
		switch {
		case hasEmail && hasPhone:
			return domain.LoginStepUpModeEmailAndSMS, nil
		case hasEmail:
			return domain.LoginStepUpModeEmail, nil
		case hasPhone:
			return domain.LoginStepUpModeSMS, nil
		default:
			return domain.LoginStepUpModeNone, fmt.Errorf("no available login verification target for current account")
		}
	default:
		return domain.LoginStepUpModeNone, fmt.Errorf("unsupported login step-up mode")
	}
}

func AvailableMFAEnrollmentMethods(user domain.User) []string {
	if !authutil.SupportsUserMFA(user) {
		return nil
	}
	items := make([]string, 0, 2)
	if strings.TrimSpace(user.Email) != "" {
		items = append(items, "email")
	}
	if strings.TrimSpace(user.Phone) != "" {
		items = append(items, "sms")
	}
	return items
}

func (s *AuthService) createLoginStepUpChallenge(user domain.User, loginMethod, acr string, effectiveMode domain.LoginStepUpMode) (domain.LoginStepUpChallenge, error) {
	return s.createLoginStepUpChallengeWithRisk(user, loginMethod, acr, effectiveMode, riskservice.ClientInfo{})
}

func (s *AuthService) createLoginStepUpChallengeWithRisk(user domain.User, loginMethod, acr string, effectiveMode domain.LoginStepUpMode, clientRisk riskservice.ClientInfo) (domain.LoginStepUpChallenge, error) {
	challenge := domain.LoginStepUpChallenge{
		Token:          uuid.NewString(),
		UserID:         user.ID,
		LoginMethod:    strings.TrimSpace(loginMethod),
		ACR:            strings.TrimSpace(acr),
		EffectiveMode:  effectiveMode,
		EmailTarget:    strings.TrimSpace(user.Email),
		PhoneTarget:    strings.TrimSpace(user.Phone),
		RiskClientJSON: encodeRiskClient(clientRisk),
		ExpiresAt:      time.Now().UTC().Add(loginStepUpChallengeTTL),
		CreatedAt:      time.Now().UTC(),
	}
	if err := s.deps.Store.SaveLoginStepUpChallenge(challenge); err != nil {
		return domain.LoginStepUpChallenge{}, err
	}
	return challenge, nil
}

func (s *AuthService) loadLoginStepUpChallenge(token string) (domain.LoginStepUpChallenge, domain.User, error) {
	challenge, err := s.deps.Store.GetLoginStepUpChallenge(strings.TrimSpace(token))
	if err != nil {
		return domain.LoginStepUpChallenge{}, domain.User{}, fmt.Errorf("login step-up challenge expired or invalid")
	}
	user, err := s.deps.Store.GetUser(challenge.UserID)
	if err != nil {
		return domain.LoginStepUpChallenge{}, domain.User{}, fmt.Errorf("user not found")
	}
	return challenge, user, nil
}

func (s *AuthService) loadLoginMFAEnrollmentChallenge(token string) (domain.LoginMFAEnrollmentChallenge, domain.User, error) {
	challenge, err := s.deps.Store.GetLoginMFAEnrollmentChallenge(strings.TrimSpace(token))
	if err != nil {
		return domain.LoginMFAEnrollmentChallenge{}, domain.User{}, fmt.Errorf("mfa enrollment challenge expired or invalid")
	}
	user, err := s.deps.Store.GetUser(challenge.UserID)
	if err != nil {
		return domain.LoginMFAEnrollmentChallenge{}, domain.User{}, fmt.Errorf("user not found")
	}
	return challenge, user, nil
}

func (s *AuthService) SendLoginStepUpCode(challengeToken, channel string) (int, string, error) {
	challenge, _, err := s.loadLoginStepUpChallenge(challengeToken)
	if err != nil {
		return 0, "", err
	}
	channel = strings.TrimSpace(channel)
	switch channel {
	case "email":
		if challenge.EffectiveMode != domain.LoginStepUpModeEmail && challenge.EffectiveMode != domain.LoginStepUpModeEmailAndSMS {
			return 0, "", fmt.Errorf("email login step-up is not required")
		}
		cooldownSeconds, err := s.SendEmailVerificationCode(challenge.EmailTarget, "", "login_step_up")
		return cooldownSeconds, maskMFATarget("email", challenge.EmailTarget), err
	case "sms":
		if challenge.EffectiveMode != domain.LoginStepUpModeSMS && challenge.EffectiveMode != domain.LoginStepUpModeEmailAndSMS {
			return 0, "", fmt.Errorf("sms login step-up is not required")
		}
		cooldownSeconds, err := s.SendSMSVerificationCode(challenge.PhoneTarget, "login_step_up")
		return cooldownSeconds, maskMFATarget("sms", challenge.PhoneTarget), err
	default:
		return 0, "", fmt.Errorf("unsupported login step-up channel")
	}
}

func (s *AuthService) SendLoginMFAEnrollmentCode(challengeToken, method string) (int, string, error) {
	challenge, user, err := s.loadLoginMFAEnrollmentChallenge(challengeToken)
	if err != nil {
		return 0, "", err
	}
	_ = challenge
	method = strings.TrimSpace(method)
	switch method {
	case "email":
		if strings.TrimSpace(user.Email) == "" {
			return 0, "", fmt.Errorf("email is not bound")
		}
		cooldownSeconds, err := s.SendEmailVerificationCode(user.Email, user.Country, "login_mfa_enrollment")
		return cooldownSeconds, maskMFATarget("email", user.Email), err
	case "sms":
		if strings.TrimSpace(user.Phone) == "" {
			return 0, "", fmt.Errorf("phone is not bound")
		}
		cooldownSeconds, err := s.SendSMSVerificationCode(user.Phone, "login_mfa_enrollment")
		return cooldownSeconds, maskMFATarget("sms", user.Phone), err
	default:
		return 0, "", fmt.Errorf("unsupported mfa method")
	}
}

func (s *AuthService) CompleteLoginStepUp(challengeToken, emailOTP, smsOTP, ip, deviceID string, binding ...settings.DeviceBindingInput) (PasswordLoginResult, error) {
	challenge, user, err := s.loadLoginStepUpChallenge(challengeToken)
	if err != nil {
		return PasswordLoginResult{}, err
	}
	attempt := authAttemptAuditContext{
		Kind:       "login_step_up",
		Identifier: user.ID,
		IP:         strings.TrimSpace(ip),
		DeviceID:   strings.TrimSpace(deviceID),
		User:       &user,
	}
	if err := s.checkAuthAttempt(attempt); err != nil {
		return PasswordLoginResult{}, err
	}
	switch challenge.EffectiveMode {
	case domain.LoginStepUpModeEmail:
		if err := s.verifyLoginStepUpEmail(challenge.EmailTarget, emailOTP); err != nil {
			if limitErr := s.failAuthAttempt(attempt, "invalid_code"); limitErr != nil {
				return PasswordLoginResult{}, limitErr
			}
			return PasswordLoginResult{}, err
		}
	case domain.LoginStepUpModeSMS:
		if err := s.verifyLoginStepUpSMS(challenge.PhoneTarget, smsOTP); err != nil {
			if limitErr := s.failAuthAttempt(attempt, "invalid_code"); limitErr != nil {
				return PasswordLoginResult{}, limitErr
			}
			return PasswordLoginResult{}, err
		}
	case domain.LoginStepUpModeEmailAndSMS:
		if err := s.verifyLoginStepUpEmail(challenge.EmailTarget, emailOTP); err != nil {
			if limitErr := s.failAuthAttempt(attempt, "invalid_code"); limitErr != nil {
				return PasswordLoginResult{}, limitErr
			}
			return PasswordLoginResult{}, err
		}
		if err := s.verifyLoginStepUpSMS(challenge.PhoneTarget, smsOTP); err != nil {
			if limitErr := s.failAuthAttempt(attempt, "invalid_code"); limitErr != nil {
				return PasswordLoginResult{}, limitErr
			}
			return PasswordLoginResult{}, err
		}
	default:
		return PasswordLoginResult{}, fmt.Errorf("unsupported login step-up mode")
	}
	if err := s.deps.Store.ConsumeLoginStepUpChallenge(challenge.Token, time.Now().UTC()); err != nil {
		return PasswordLoginResult{}, err
	}
	_ = s.deps.Store.DeleteLoginStepUpChallenge(challenge.Token)
	if err := s.clearUserSecurityPolicy(user.ID, false, true, false); err != nil {
		return PasswordLoginResult{}, err
	}
	s.resetAuthAttempt(attempt)
	return s.continuePostAuthenticationWithRiskOptions(user, ip, challenge.LoginMethod, challenge.ACR, decodeRiskClient(challenge.RiskClientJSON), postAuthRiskOptions{RiskStepUpSatisfied: true}, binding...)
}

func (s *AuthService) CompleteForcedMFAEnrollment(challengeToken, method, otp, ip, deviceID string, binding ...settings.DeviceBindingInput) (PasswordLoginResult, error) {
	challenge, user, err := s.loadLoginMFAEnrollmentChallenge(challengeToken)
	if err != nil {
		return PasswordLoginResult{}, err
	}
	method = strings.TrimSpace(method)
	otp = strings.TrimSpace(otp)
	if method != "email" && method != "sms" {
		return PasswordLoginResult{}, fmt.Errorf("unsupported mfa method")
	}
	if method == "email" && strings.TrimSpace(user.Email) == "" {
		return PasswordLoginResult{}, fmt.Errorf("email is not bound")
	}
	if method == "sms" && strings.TrimSpace(user.Phone) == "" {
		return PasswordLoginResult{}, fmt.Errorf("phone is not bound")
	}
	if !authutil.SupportsUserMFA(user) {
		return PasswordLoginResult{}, fmt.Errorf("mfa is disabled for admin accounts")
	}
	attempt := authAttemptAuditContext{
		Kind:       "login_mfa_enrollment",
		Identifier: user.ID,
		IP:         strings.TrimSpace(ip),
		DeviceID:   strings.TrimSpace(deviceID),
		User:       &user,
	}
	if err := s.checkAuthAttempt(attempt); err != nil {
		return PasswordLoginResult{}, err
	}
	switch method {
	case "email":
		if err := s.verifyLoginMFAEnrollmentEmail(user.Email, otp); err != nil {
			if limitErr := s.failAuthAttempt(attempt, "invalid_code"); limitErr != nil {
				return PasswordLoginResult{}, limitErr
			}
			return PasswordLoginResult{}, err
		}
	case "sms":
		if err := s.verifyLoginMFAEnrollmentSMS(user.Phone, otp); err != nil {
			if limitErr := s.failAuthAttempt(attempt, "invalid_code"); limitErr != nil {
				return PasswordLoginResult{}, limitErr
			}
			return PasswordLoginResult{}, err
		}
	}
	if err := s.deps.Store.ConsumeLoginMFAEnrollmentChallenge(challenge.Token, time.Now().UTC()); err != nil {
		return PasswordLoginResult{}, err
	}
	_ = s.deps.Store.DeleteLoginMFAEnrollmentChallenge(challenge.Token)
	user.MFAEnabled = true
	user.MFAMethod = method
	user.AuthVersion++
	if err := s.deps.Store.UpdateUserAndInvalidateAuth(user); err != nil {
		return PasswordLoginResult{}, err
	}
	if err := s.clearUserSecurityPolicy(user.ID, false, false, true); err != nil {
		return PasswordLoginResult{}, err
	}
	s.audit.Record(user.ID, user.Role, "user.security_policy.force_mfa_enrollment_completed", user.ID, map[string]any{
		"method": method,
	})
	s.deps.AppendUserOperationLog(user.ID, "user.security_policy.force_mfa_enrollment_completed", user.ID, map[string]any{
		"method": method,
	})
	s.resetAuthAttempt(attempt)
	return s.continuePostAuthenticationWithRiskOptions(user, ip, challenge.LoginMethod, challenge.ACR, decodeRiskClient(challenge.RiskClientJSON), postAuthRiskOptions{RiskStepUpSatisfied: challenge.RiskStepUpSatisfied}, binding...)
}

func (s *AuthService) verifyLoginMFAEnrollmentEmail(email, otp string) error {
	verification, err := s.deps.Store.GetEmailVerificationCode(strings.TrimSpace(email), "login_mfa_enrollment", strings.TrimSpace(otp))
	if err != nil {
		return fmt.Errorf("invalid mfa enrollment verification code")
	}
	return s.deps.Store.ConsumeEmailVerificationCode(verification.ID)
}

func (s *AuthService) verifyLoginMFAEnrollmentSMS(phone, otp string) error {
	verification, err := s.deps.Store.GetSMSVerificationCode(strings.TrimSpace(phone), "login_mfa_enrollment", strings.TrimSpace(otp))
	if err != nil {
		return fmt.Errorf("invalid mfa enrollment verification code")
	}
	return s.deps.Store.ConsumeSMSVerificationCode(verification.ID)
}

func (s *AuthService) verifyLoginStepUpEmail(email, otp string) error {
	verification, err := s.deps.Store.GetEmailVerificationCode(strings.TrimSpace(email), "login_step_up", strings.TrimSpace(otp))
	if err != nil {
		return fmt.Errorf("invalid login step-up verification code")
	}
	return s.deps.Store.ConsumeEmailVerificationCode(verification.ID)
}

func (s *AuthService) verifyLoginStepUpSMS(phone, otp string) error {
	verification, err := s.deps.Store.GetSMSVerificationCode(strings.TrimSpace(phone), "login_step_up", strings.TrimSpace(otp))
	if err != nil {
		return fmt.Errorf("invalid login step-up verification code")
	}
	return s.deps.Store.ConsumeSMSVerificationCode(verification.ID)
}

func encodeRiskClient(client riskservice.ClientInfo) string {
	client = normalizeRiskClient(client)
	data, err := json.Marshal(client)
	if err != nil {
		return ""
	}
	return string(data)
}

func decodeRiskClient(raw string) riskservice.ClientInfo {
	if strings.TrimSpace(raw) == "" {
		return riskservice.ClientInfo{}
	}
	var client riskservice.ClientInfo
	if err := json.Unmarshal([]byte(raw), &client); err != nil {
		return riskservice.ClientInfo{}
	}
	return normalizeRiskClient(client)
}

func normalizeRiskClient(client riskservice.ClientInfo) riskservice.ClientInfo {
	client.Score = 0
	client.Level = ""
	client.Fingerprint = strings.TrimSpace(client.Fingerprint)
	client.ClientType = strings.TrimSpace(client.ClientType)
	client.UserAgent = strings.TrimSpace(client.UserAgent)
	seen := map[string]struct{}{}
	signals := make([]string, 0, len(client.Signals))
	for _, signal := range client.Signals {
		signal = strings.TrimSpace(signal)
		if signal == "" {
			continue
		}
		if _, ok := seen[signal]; ok {
			continue
		}
		seen[signal] = struct{}{}
		signals = append(signals, signal)
		if len(signals) >= 32 {
			break
		}
	}
	client.Signals = signals
	return client
}
