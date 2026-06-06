package auth

import (
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/service/common/authutil"
	"mysso/backend/internal/service/settings"
	"mysso/backend/internal/store"
)

const (
	adminForcedPhoneBindingReason = "admin_force_phone_binding"
	loginStepUpChallengeTTL       = 10 * time.Minute
	mfaEnrollmentChallengeTTL     = 15 * time.Minute
)

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
	if user.DeletionScheduledAt != nil {
		challenge, err := s.createDeletionLoginChallenge(user, acr)
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
	if result, enforced, err := s.maybeRequirePhoneBindingBeforeLogin(user, acr); err != nil {
		return PasswordLoginResult{}, err
	} else if enforced {
		return result, nil
	}
	policy, err := s.getUserSecurityPolicy(user.ID)
	if err != nil {
		return PasswordLoginResult{}, err
	}
	if result, enforced, err := s.maybeRequireLoginStepUp(user, policy, loginMethod, acr); err != nil {
		return PasswordLoginResult{}, err
	} else if enforced {
		return result, nil
	}
	if result, enforced, err := s.maybeRequireMFAEnrollment(user, policy, loginMethod, acr); err != nil {
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

func (s *AuthService) maybeRequireLoginStepUp(user domain.User, policy domain.UserSecurityPolicy, loginMethod, acr string) (PasswordLoginResult, bool, error) {
	effectiveMode, err := resolveStepUpModeForUser(user, policy.LoginStepUpMode)
	if err != nil {
		return PasswordLoginResult{}, false, err
	}
	if effectiveMode == domain.LoginStepUpModeNone {
		return PasswordLoginResult{}, false, nil
	}
	challenge, err := s.createLoginStepUpChallenge(user, loginMethod, acr, effectiveMode)
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

func (s *AuthService) maybeRequireMFAEnrollment(user domain.User, policy domain.UserSecurityPolicy, loginMethod, acr string) (PasswordLoginResult, bool, error) {
	if !policy.ForceMFAEnrollmentNextLogin {
		return PasswordLoginResult{}, false, nil
	}
	if !authutil.SupportsUserMFA(user) {
		if err := s.clearUserSecurityPolicy(user.ID, false, false, true); err != nil {
			return PasswordLoginResult{}, false, err
		}
		return PasswordLoginResult{}, false, nil
	}
	if loginMethod == "passkey" {
		if err := s.clearUserSecurityPolicy(user.ID, false, false, true); err != nil {
			return PasswordLoginResult{}, false, err
		}
		s.audit.Record(user.ID, user.Role, "user.security_policy.force_mfa_enrollment_skipped_by_passkey", user.ID, nil)
		s.deps.AppendUserOperationLog(user.ID, "user.security_policy.force_mfa_enrollment_skipped_by_passkey", user.ID, nil)
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
		Token:       uuid.NewString(),
		UserID:      user.ID,
		LoginMethod: loginMethod,
		ACR:         acr,
		ExpiresAt:   time.Now().UTC().Add(mfaEnrollmentChallengeTTL),
		CreatedAt:   time.Now().UTC(),
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
	challenge := domain.LoginStepUpChallenge{
		Token:         uuid.NewString(),
		UserID:        user.ID,
		LoginMethod:   strings.TrimSpace(loginMethod),
		ACR:           strings.TrimSpace(acr),
		EffectiveMode: effectiveMode,
		EmailTarget:   strings.TrimSpace(user.Email),
		PhoneTarget:   strings.TrimSpace(user.Phone),
		ExpiresAt:     time.Now().UTC().Add(loginStepUpChallengeTTL),
		CreatedAt:     time.Now().UTC(),
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

func (s *AuthService) CompleteLoginStepUp(challengeToken, emailOTP, smsOTP, ip string, binding ...settings.DeviceBindingInput) (PasswordLoginResult, error) {
	challenge, user, err := s.loadLoginStepUpChallenge(challengeToken)
	if err != nil {
		return PasswordLoginResult{}, err
	}
	switch challenge.EffectiveMode {
	case domain.LoginStepUpModeEmail:
		if err := s.verifyLoginStepUpEmail(challenge.EmailTarget, emailOTP); err != nil {
			return PasswordLoginResult{}, err
		}
	case domain.LoginStepUpModeSMS:
		if err := s.verifyLoginStepUpSMS(challenge.PhoneTarget, smsOTP); err != nil {
			return PasswordLoginResult{}, err
		}
	case domain.LoginStepUpModeEmailAndSMS:
		if err := s.verifyLoginStepUpEmail(challenge.EmailTarget, emailOTP); err != nil {
			return PasswordLoginResult{}, err
		}
		if err := s.verifyLoginStepUpSMS(challenge.PhoneTarget, smsOTP); err != nil {
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
	return s.ContinuePostAuthentication(user, ip, challenge.LoginMethod, challenge.ACR, binding...)
}

func (s *AuthService) CompleteForcedMFAEnrollment(challengeToken, method, ip string, binding ...settings.DeviceBindingInput) (PasswordLoginResult, error) {
	challenge, user, err := s.loadLoginMFAEnrollmentChallenge(challengeToken)
	if err != nil {
		return PasswordLoginResult{}, err
	}
	method = strings.TrimSpace(method)
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
	session, updatedUser, err := createLoginSession(s.deps, s.audit, user, ip, challenge.ACR, binding...)
	if err != nil {
		return PasswordLoginResult{}, err
	}
	return PasswordLoginResult{
		Session: session,
		User:    updatedUser,
	}, nil
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
