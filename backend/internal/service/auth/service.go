package auth

import (
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/notify"
	"mysso/backend/internal/security"
	"mysso/backend/internal/service/audit"
	"mysso/backend/internal/service/common/authutil"
	"mysso/backend/internal/service/common/deps"
	"mysso/backend/internal/service/common/templateutil"
	"mysso/backend/internal/service/settings"
)

type AuthService struct {
	deps     *deps.Deps
	audit    *audit.Service
	settings *settings.Service
	user     interface{ CleanupExpiredDeletionRequests() error }
}

type Service = AuthService

func New(dependencies *deps.Deps, auditService *audit.Service, settingsService *settings.Service, userService interface{ CleanupExpiredDeletionRequests() error }) *Service {
	return &AuthService{deps: dependencies, audit: auditService, settings: settingsService, user: userService}
}

type PasswordLoginResult struct {
	RequiresMFA                  bool
	RequiresPhoneBinding         bool
	RequiresStepUpVerification   bool
	RequiresMFAEnrollmentSetup   bool
	ChallengeToken               string
	MFAMethod                    string
	MaskedTarget                 string
	PhoneBindingChallengeToken   string
	PhoneBindingReason           string
	StepUpChallengeToken         string
	StepUpMode                   string
	MaskedEmailTarget            string
	MaskedPhoneTarget            string
	MFAEnrollmentChallengeToken  string
	AvailableMFAMethods          []string
	RequiresDeletionConfirmation bool
	DeletionChallengeToken       string
	DeletionScheduledAt          *time.Time
	Session                      domain.Session
	User                         domain.User
}

type RegisterResult struct {
	User                       domain.User
	RequiresPhoneBinding       bool
	PhoneBindingChallengeToken string
	PhoneBindingReason         string
}

func preferredLocaleForRegistrationCountry(country string) string {
	switch strings.ToUpper(strings.TrimSpace(country)) {
	case "CN":
		return "zh-CN"
	case "HK", "MO", "TW":
		return "zh-TW"
	default:
		return "en-US"
	}
}

func (s *AuthService) Login(email, password, mfaCode, ip string) (domain.Session, domain.User, error) {
	result, err := s.StartPasswordLogin(email, password, ip, "")
	if err != nil {
		return domain.Session{}, domain.User{}, err
	}
	if result.RequiresMFA {
		if strings.TrimSpace(mfaCode) == "" {
			return domain.Session{}, domain.User{}, fmt.Errorf("invalid mfa code")
		}
		result, err = s.CompletePasswordLoginMFA(result.ChallengeToken, mfaCode, ip, "")
		if err != nil {
			return domain.Session{}, domain.User{}, err
		}
	}
	if result.RequiresDeletionConfirmation {
		result, err = s.ConfirmDeletionLogin(result.DeletionChallengeToken, ip)
		if err != nil {
			return domain.Session{}, domain.User{}, err
		}
	}
	if result.RequiresPhoneBinding {
		return domain.Session{}, result.User, fmt.Errorf("phone binding is required")
	}
	if result.RequiresStepUpVerification {
		return domain.Session{}, result.User, fmt.Errorf("login step-up verification is required")
	}
	if result.RequiresMFAEnrollmentSetup {
		return domain.Session{}, result.User, fmt.Errorf("mfa enrollment is required")
	}
	if strings.TrimSpace(result.Session.Token) == "" {
		return domain.Session{}, domain.User{}, fmt.Errorf("invalid credentials")
	}
	return result.Session, result.User, nil
}

func (s *AuthService) StartPasswordLogin(email, password, ip, deviceID string) (PasswordLoginResult, error) {
	if err := s.user.CleanupExpiredDeletionRequests(); err != nil {
		return PasswordLoginResult{}, err
	}
	email = strings.ToLower(strings.TrimSpace(email))
	password = strings.TrimSpace(password)
	attempt := authAttemptAuditContext{
		Kind:       "password_login",
		Identifier: email,
		IP:         strings.TrimSpace(ip),
		DeviceID:   strings.TrimSpace(deviceID),
	}
	if err := s.checkAuthAttempt(attempt); err != nil {
		return PasswordLoginResult{}, err
	}
	user, err := s.deps.Store.FindUserByEmail(email)
	if err != nil {
		if limitErr := s.failAuthAttempt(attempt, "user_not_found"); limitErr != nil {
			return PasswordLoginResult{}, limitErr
		}
		return PasswordLoginResult{}, fmt.Errorf("invalid credentials")
	}
	attempt.User = &user
	if user.Status != domain.UserActive && user.Status != domain.UserPending {
		if limitErr := s.failAuthAttempt(attempt, "user_status_"+string(user.Status)); limitErr != nil {
			return PasswordLoginResult{}, limitErr
		}
		return PasswordLoginResult{}, loginBlockedByUserStatus(user, "invalid credentials")
	}
	if !security.VerifyPassword(password, user.Password) {
		if limitErr := s.failAuthAttempt(attempt, "invalid_password"); limitErr != nil {
			return PasswordLoginResult{}, limitErr
		}
		return PasswordLoginResult{}, fmt.Errorf("invalid credentials")
	}
	s.resetAuthAttempt(attempt)
	if authutil.EffectiveUserMFAEnabled(user) {
		challenge, err := s.createMFALoginChallenge(user)
		if err != nil {
			return PasswordLoginResult{}, err
		}
		return PasswordLoginResult{
			RequiresMFA:    true,
			ChallengeToken: challenge.Token,
			MFAMethod:      challenge.Method,
			MaskedTarget:   maskMFATarget(challenge.Method, challenge.Target),
			User:           user,
		}, nil
	}
	return s.ContinuePostAuthentication(user, ip, "password", "urn:mysso:acr:password")
}

func (s *AuthService) CompletePasswordLoginMFA(challengeToken, otp, ip, deviceID string) (PasswordLoginResult, error) {
	challenge, user, err := s.loadMFALoginChallenge(challengeToken)
	if err != nil {
		return PasswordLoginResult{}, err
	}
	attempt := authAttemptAuditContext{
		Kind:       "mfa_login",
		Identifier: user.ID,
		IP:         strings.TrimSpace(ip),
		DeviceID:   strings.TrimSpace(deviceID),
		User:       &user,
	}
	if err := s.checkAuthAttempt(attempt); err != nil {
		return PasswordLoginResult{}, err
	}
	switch challenge.Method {
	case "email":
		verification, err := s.deps.Store.GetEmailVerificationCode(challenge.Target, "mfa_login", strings.TrimSpace(otp))
		if err != nil {
			if limitErr := s.failAuthAttempt(attempt, "invalid_code"); limitErr != nil {
				return PasswordLoginResult{}, limitErr
			}
			return PasswordLoginResult{}, fmt.Errorf("invalid mfa code")
		}
		if err := s.deps.Store.ConsumeEmailVerificationCode(verification.ID); err != nil {
			return PasswordLoginResult{}, err
		}
	case "sms":
		verification, err := s.deps.Store.GetSMSVerificationCode(challenge.Target, "mfa_login", strings.TrimSpace(otp))
		if err != nil {
			if limitErr := s.failAuthAttempt(attempt, "invalid_code"); limitErr != nil {
				return PasswordLoginResult{}, limitErr
			}
			return PasswordLoginResult{}, fmt.Errorf("invalid mfa code")
		}
		if err := s.deps.Store.ConsumeSMSVerificationCode(verification.ID); err != nil {
			return PasswordLoginResult{}, err
		}
	default:
		return PasswordLoginResult{}, fmt.Errorf("unsupported mfa method")
	}
	if err := s.deps.Store.ConsumeMFALoginChallenge(challenge.Token, time.Now().UTC()); err != nil {
		return PasswordLoginResult{}, err
	}
	_ = s.deps.Store.DeleteMFALoginChallenge(challenge.Token)
	s.resetAuthAttempt(attempt)
	return s.ContinuePostAuthentication(user, ip, "password", "urn:mysso:acr:password+mfa")
}

func (s *AuthService) LoginWithOTP(email, otp, ip, deviceID string) (PasswordLoginResult, error) {
	if err := s.user.CleanupExpiredDeletionRequests(); err != nil {
		return PasswordLoginResult{}, err
	}
	email = strings.ToLower(strings.TrimSpace(email))
	attempt := authAttemptAuditContext{
		Kind:       "email_otp_login",
		Identifier: email,
		IP:         strings.TrimSpace(ip),
		DeviceID:   strings.TrimSpace(deviceID),
	}
	if err := s.checkAuthAttempt(attempt); err != nil {
		return PasswordLoginResult{}, err
	}
	user, err := s.deps.Store.FindUserByEmail(email)
	if err != nil {
		if limitErr := s.failAuthAttempt(attempt, "user_not_found"); limitErr != nil {
			return PasswordLoginResult{}, limitErr
		}
		return PasswordLoginResult{}, fmt.Errorf("invalid otp code")
	}
	attempt.User = &user
	verification, err := s.deps.Store.GetEmailVerificationCode(email, "login", strings.TrimSpace(otp))
	if err != nil {
		if limitErr := s.failAuthAttempt(attempt, "invalid_code"); limitErr != nil {
			return PasswordLoginResult{}, limitErr
		}
		return PasswordLoginResult{}, fmt.Errorf("invalid otp code")
	}
	if err := s.deps.Store.ConsumeEmailVerificationCode(verification.ID); err != nil {
		return PasswordLoginResult{}, err
	}
	if user.Status != domain.UserActive && user.Status != domain.UserPending {
		if limitErr := s.failAuthAttempt(attempt, "user_status_"+string(user.Status)); limitErr != nil {
			return PasswordLoginResult{}, limitErr
		}
		return PasswordLoginResult{}, loginBlockedByUserStatus(user, "invalid otp code")
	}
	s.resetAuthAttempt(attempt)
	return s.ContinuePostAuthentication(user, ip, "email_otp", "urn:mysso:acr:email-otp")
}

func (s *AuthService) LoginWithPhoneOTP(phone, otp, ip, deviceID string) (PasswordLoginResult, error) {
	if !s.settings.IsPhoneVerificationEnabled() {
		return PasswordLoginResult{}, fmt.Errorf("phone verification is disabled")
	}
	if err := s.user.CleanupExpiredDeletionRequests(); err != nil {
		return PasswordLoginResult{}, err
	}
	phone = strings.TrimSpace(phone)
	attempt := authAttemptAuditContext{
		Kind:       "sms_otp_login",
		Identifier: phone,
		IP:         strings.TrimSpace(ip),
		DeviceID:   strings.TrimSpace(deviceID),
	}
	if err := s.checkAuthAttempt(attempt); err != nil {
		return PasswordLoginResult{}, err
	}
	user, err := s.deps.Store.FindUserByPhone(phone)
	if err != nil {
		if limitErr := s.failAuthAttempt(attempt, "user_not_found"); limitErr != nil {
			return PasswordLoginResult{}, limitErr
		}
		return PasswordLoginResult{}, fmt.Errorf("invalid otp code")
	}
	attempt.User = &user
	verification, err := s.deps.Store.GetSMSVerificationCode(phone, "login", strings.TrimSpace(otp))
	if err != nil {
		if limitErr := s.failAuthAttempt(attempt, "invalid_code"); limitErr != nil {
			return PasswordLoginResult{}, limitErr
		}
		return PasswordLoginResult{}, fmt.Errorf("invalid otp code")
	}
	if err := s.deps.Store.ConsumeSMSVerificationCode(verification.ID); err != nil {
		return PasswordLoginResult{}, err
	}
	if user.Status != domain.UserActive && user.Status != domain.UserPending {
		if limitErr := s.failAuthAttempt(attempt, "user_status_"+string(user.Status)); limitErr != nil {
			return PasswordLoginResult{}, limitErr
		}
		return PasswordLoginResult{}, loginBlockedByUserStatus(user, "invalid otp code")
	}
	s.resetAuthAttempt(attempt)
	return s.ContinuePostAuthentication(user, ip, "sms_otp", "urn:mysso:acr:sms-otp")
}

func (s *AuthService) ConfirmDeletionLogin(challengeToken, ip string) (PasswordLoginResult, error) {
	challenge, err := s.deps.Store.GetDeletionLoginChallenge(strings.TrimSpace(challengeToken))
	if err != nil {
		return PasswordLoginResult{}, fmt.Errorf("deletion login challenge expired or invalid")
	}
	user, err := s.deps.Store.GetUser(challenge.UserID)
	if err != nil {
		return PasswordLoginResult{}, fmt.Errorf("user not found")
	}
	if user.Status != domain.UserActive {
		return PasswordLoginResult{}, loginBlockedByUserStatus(user, fmt.Sprintf("user status is %s", user.Status))
	}
	if err := s.deps.Store.ConsumeDeletionLoginChallenge(challenge.Token, time.Now().UTC()); err != nil {
		return PasswordLoginResult{}, err
	}
	_ = s.deps.Store.DeleteDeletionLoginChallenge(challenge.Token)
	if user.DeletionScheduledAt != nil {
		user, err = cancelUserDeletion(s.deps, s.audit, user, "deletion_login_confirm")
		if err != nil {
			return PasswordLoginResult{}, err
		}
	}
	return s.ContinuePostAuthentication(user, ip, deriveLoginMethodFromACR(challenge.ACR), challenge.ACR)
}

func (s *AuthService) createDeletionLoginChallenge(user domain.User, acr string) (domain.DeletionLoginChallenge, error) {
	if user.DeletionScheduledAt == nil {
		return domain.DeletionLoginChallenge{}, fmt.Errorf("no deletion is pending")
	}
	challenge := domain.DeletionLoginChallenge{
		Token:               uuid.NewString(),
		UserID:              user.ID,
		ACR:                 strings.TrimSpace(acr),
		DeletionScheduledAt: *user.DeletionScheduledAt,
		ExpiresAt:           time.Now().UTC().Add(10 * time.Minute),
		CreatedAt:           time.Now().UTC(),
	}
	if err := s.deps.Store.SaveDeletionLoginChallenge(challenge); err != nil {
		return domain.DeletionLoginChallenge{}, err
	}
	return challenge, nil
}

func (s *AuthService) ResendPasswordLoginMFAChallenge(challengeToken, ip, deviceID string) (int, string, string, error) {
	challenge, user, err := s.loadMFALoginChallenge(challengeToken)
	if err != nil {
		return 0, "", "", err
	}
	attempt := authAttemptAuditContext{
		Kind:       "mfa_resend",
		Identifier: user.ID,
		IP:         strings.TrimSpace(ip),
		DeviceID:   strings.TrimSpace(deviceID),
		User:       &user,
	}
	cooldownSeconds, err := s.sendMFALoginCode(challenge.Method, challenge.Target)
	if err != nil {
		return cooldownSeconds, "", "", err
	}
	s.auditAuthAttempt(attempt, "sent", "resent")
	return cooldownSeconds, challenge.Method, maskMFATarget(challenge.Method, challenge.Target), nil
}

func (s *AuthService) SendPasswordLoginMFAChallenge(email, password, ip, deviceID string) (int, string, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	password = strings.TrimSpace(password)
	if email == "" || password == "" {
		return 0, "", fmt.Errorf("email and password are required")
	}
	attempt := authAttemptAuditContext{
		Kind:       "password_login",
		Identifier: email,
		IP:         strings.TrimSpace(ip),
		DeviceID:   strings.TrimSpace(deviceID),
	}
	if err := s.checkAuthAttempt(attempt); err != nil {
		return 0, "", err
	}
	user, err := s.deps.Store.FindUserByEmail(email)
	if err != nil {
		if limitErr := s.failAuthAttempt(attempt, "user_not_found"); limitErr != nil {
			return 0, "", limitErr
		}
		return 0, "", fmt.Errorf("invalid credentials")
	}
	attempt.User = &user
	if user.Status != domain.UserActive && user.Status != domain.UserPending {
		if limitErr := s.failAuthAttempt(attempt, "user_status_"+string(user.Status)); limitErr != nil {
			return 0, "", limitErr
		}
		return 0, "", loginBlockedByUserStatus(user, "invalid credentials")
	}
	if !security.VerifyPassword(password, user.Password) {
		if limitErr := s.failAuthAttempt(attempt, "invalid_password"); limitErr != nil {
			return 0, "", limitErr
		}
		return 0, "", fmt.Errorf("invalid credentials")
	}
	s.resetAuthAttempt(attempt)
	if !authutil.EffectiveUserMFAEnabled(user) {
		return 0, "", fmt.Errorf("mfa is not enabled")
	}

	switch authutil.EffectiveUserMFAMethod(user) {
	case "email":
		cooldownSeconds, err := s.SendEmailVerificationCode(user.Email, user.Country, "mfa_login")
		return cooldownSeconds, "email", err
	case "sms":
		cooldownSeconds, err := s.SendSMSVerificationCode(user.Phone, "mfa_login")
		return cooldownSeconds, "sms", err
	default:
		return 0, "", fmt.Errorf("current account uses a manual mfa code")
	}
}

func (s *AuthService) createMFALoginChallenge(user domain.User) (domain.MFALoginChallenge, error) {
	method, target, err := resolveMFAMethodAndTarget(user)
	if err != nil {
		return domain.MFALoginChallenge{}, err
	}
	if _, err := s.sendMFALoginCode(method, target); err != nil {
		return domain.MFALoginChallenge{}, err
	}
	challenge := domain.MFALoginChallenge{
		Token:     uuid.NewString(),
		UserID:    user.ID,
		Method:    method,
		Target:    target,
		ExpiresAt: time.Now().UTC().Add(10 * time.Minute),
		CreatedAt: time.Now().UTC(),
	}
	if err := s.deps.Store.SaveMFALoginChallenge(challenge); err != nil {
		return domain.MFALoginChallenge{}, err
	}
	return challenge, nil
}

func (s *AuthService) loadMFALoginChallenge(challengeToken string) (domain.MFALoginChallenge, domain.User, error) {
	challengeToken = strings.TrimSpace(challengeToken)
	if challengeToken == "" {
		return domain.MFALoginChallenge{}, domain.User{}, fmt.Errorf("mfa challenge token is required")
	}
	challenge, err := s.deps.Store.GetMFALoginChallenge(challengeToken)
	if err != nil {
		return domain.MFALoginChallenge{}, domain.User{}, fmt.Errorf("mfa challenge expired or invalid")
	}
	user, err := s.deps.Store.GetUser(challenge.UserID)
	if err != nil {
		return domain.MFALoginChallenge{}, domain.User{}, fmt.Errorf("user not found")
	}
	if user.Status != domain.UserActive && user.Status != domain.UserPending {
		return domain.MFALoginChallenge{}, domain.User{}, loginBlockedByUserStatus(user, fmt.Sprintf("user status is %s", user.Status))
	}
	return challenge, user, nil
}

func loginBlockedByUserStatus(user domain.User, fallback string) error {
	if user.Status != domain.UserFrozen {
		return fmt.Errorf("%s", fallback)
	}
	if reason := strings.TrimSpace(user.FreezeReason); reason != "" {
		return fmt.Errorf("该账户已冻结，理由 %s", reason)
	}
	return fmt.Errorf("该账户已冻结")
}

func (s *AuthService) sendMFALoginCode(method, target string) (int, error) {
	switch method {
	case "email":
		return s.SendEmailVerificationCode(target, "", "mfa_login")
	case "sms":
		return s.SendSMSVerificationCode(target, "mfa_login")
	default:
		return 0, fmt.Errorf("unsupported mfa method")
	}
}

func resolveMFAMethodAndTarget(user domain.User) (string, string, error) {
	switch authutil.EffectiveUserMFAMethod(user) {
	case "email":
		if strings.TrimSpace(user.Email) == "" {
			return "", "", fmt.Errorf("email is not bound")
		}
		return "email", strings.TrimSpace(user.Email), nil
	case "sms":
		if strings.TrimSpace(user.Phone) == "" {
			return "", "", fmt.Errorf("phone is not bound")
		}
		return "sms", strings.TrimSpace(user.Phone), nil
	default:
		if strings.TrimSpace(user.Email) != "" {
			return "email", strings.TrimSpace(user.Email), nil
		}
		if strings.TrimSpace(user.Phone) != "" {
			return "sms", strings.TrimSpace(user.Phone), nil
		}
		return "", "", fmt.Errorf("current account uses a manual mfa code")
	}
}

func maskMFATarget(method, target string) string {
	switch method {
	case "email":
		parts := strings.Split(strings.TrimSpace(target), "@")
		if len(parts) != 2 {
			return target
		}
		local := parts[0]
		if len(local) <= 2 {
			local = local[:1] + "***"
		} else {
			local = local[:2] + "***"
		}
		return local + "@" + parts[1]
	case "sms":
		digits := strings.TrimSpace(target)
		if len(digits) <= 7 {
			return digits
		}
		return digits[:3] + "****" + digits[len(digits)-4:]
	default:
		return target
	}
}

func (s *AuthService) Register(input settings.RegisterInput) (RegisterResult, error) {
	email := strings.ToLower(strings.TrimSpace(input.Email))
	country := strings.ToUpper(strings.TrimSpace(input.Country))
	code := strings.TrimSpace(input.Code)
	password := input.Password

	if !s.settings.IsUserRegistrationAllowed() {
		return RegisterResult{}, fmt.Errorf("current system does not allow registration")
	}
	if email == "" || country == "" || code == "" || password == "" {
		return RegisterResult{}, fmt.Errorf("country, email, password and verification code are required")
	}
	if len(password) < 8 {
		return RegisterResult{}, fmt.Errorf("password must be at least 8 characters")
	}
	if input.Role != domain.RoleUser {
		return RegisterResult{}, fmt.Errorf("unsupported self-registration role")
	}
	attempt := authAttemptAuditContext{
		Kind:       "register_code_verify",
		Identifier: email,
		IP:         strings.TrimSpace(input.IP),
		DeviceID:   strings.TrimSpace(input.DeviceID),
	}
	if err := s.checkAuthAttempt(attempt); err != nil {
		return RegisterResult{}, err
	}
	if _, err := s.deps.Store.FindUserByEmail(email); err == nil {
		if limitErr := s.failAuthAttempt(attempt, "user_exists"); limitErr != nil {
			return RegisterResult{}, limitErr
		}
		return RegisterResult{}, fmt.Errorf("user already exists")
	}

	verification, err := s.deps.Store.GetEmailVerificationCode(email, "register", code)
	if err != nil {
		if limitErr := s.failAuthAttempt(attempt, "invalid_code"); limitErr != nil {
			return RegisterResult{}, limitErr
		}
		return RegisterResult{}, fmt.Errorf("invalid or expired verification code")
	}
	if err := s.deps.Store.ConsumeEmailVerificationCode(verification.ID); err != nil {
		return RegisterResult{}, err
	}
	passwordHash, err := security.HashPassword(password)
	if err != nil {
		return RegisterResult{}, err
	}

	now := time.Now().UTC()
	riskMode, err := s.selectPhoneBindingRiskMode(country)
	if err != nil {
		return RegisterResult{}, err
	}
	status := domain.UserActive
	riskRequired := false
	if riskMode == phoneBindingModeImmediate {
		status = domain.UserPending
		riskRequired = true
	}
	user := domain.User{
		ID:              uuid.NewString(),
		Country:         country,
		Email:           email,
		Phone:           "",
		DisplayName:     templateutil.DeriveDisplayName(email),
		Password:        passwordHash,
		Role:            input.Role,
		Status:          status,
		PreferredLocale: preferredLocaleForRegistrationCountry(country),
		MFAEnabled:      false,
		MFASecret:       "",
		CreatedAt:       now,
	}
	if err := s.deps.Store.CreateUser(user); err != nil {
		return RegisterResult{}, err
	}
	rollbackUser := func(cause error) error {
		if deleteErr := s.deps.Store.DeleteUser(user.ID); deleteErr != nil {
			return fmt.Errorf("%w (rollback user failed: %v)", cause, deleteErr)
		}
		return cause
	}
	if riskMode != phoneBindingModeNone || riskRequired {
		if err := s.savePhoneBindingRiskState(user.ID, phoneBindingRiskState{
			Mode:       riskMode,
			Required:   riskRequired,
			LoginCount: 0,
		}); err != nil {
			return RegisterResult{}, rollbackUser(err)
		}
	}
	s.audit.Record(user.ID, user.Role, "user.register", user.ID, map[string]any{
		"country": country,
		"ip":      input.IP,
	})
	result := RegisterResult{User: user}
	if riskMode == phoneBindingModeImmediate {
		challenge, challengeErr := s.createPhoneBindingChallenge(user, "post_register", "urn:mysso:acr:phone-binding")
		if challengeErr != nil {
			return RegisterResult{}, rollbackUser(challengeErr)
		}
		result.RequiresPhoneBinding = true
		result.PhoneBindingChallengeToken = challenge.Token
		result.PhoneBindingReason = "post_register"
	}
	s.resetAuthAttempt(attempt)
	return result, nil
}

func (s *AuthService) SendPublicEmailVerificationCode(email, country, purpose string) (int, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	cooldownSeconds, err := s.sendEmailVerificationCode(email, country, purpose, false)
	if shouldMaskPublicVerificationError(err) {
		return s.settings.GetVerificationCodeCooldownSeconds(), nil
	}
	return cooldownSeconds, err
}

func (s *AuthService) SendPublicSMSVerificationCode(phone, purpose string) (int, error) {
	phone = strings.TrimSpace(phone)
	if strings.EqualFold(strings.TrimSpace(purpose), "login") && !s.settings.IsPhoneVerificationEnabled() {
		return 0, fmt.Errorf("phone verification is disabled")
	}
	cooldownSeconds, err := s.sendSMSVerificationCode(phone, purpose, false)
	if shouldMaskPublicVerificationError(err) {
		return s.settings.GetVerificationCodeCooldownSeconds(), nil
	}
	return cooldownSeconds, err
}

func (s *AuthService) SendEmailVerificationCode(email, country, purpose string) (int, error) {
	return s.sendEmailVerificationCode(email, country, purpose, true)
}

func (s *AuthService) sendEmailVerificationCode(email, country, purpose string, enforceCooldown bool) (int, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	country = strings.ToUpper(strings.TrimSpace(country))
	purpose = strings.ToLower(strings.TrimSpace(purpose))
	if email == "" {
		return 0, fmt.Errorf("email is required")
	}
	if purpose != "register" && purpose != "login" && purpose != "mfa_login" && purpose != "login_step_up" && purpose != "change_email" && purpose != "reset_password" && purpose != "delete_account" {
		return 0, fmt.Errorf("unsupported verification purpose")
	}
	if purpose == "register" {
		if !s.settings.IsUserRegistrationAllowed() {
			return 0, fmt.Errorf("current system does not allow registration")
		}
		if country == "" {
			return 0, fmt.Errorf("country is required")
		}
		if _, err := s.deps.Store.FindUserByEmail(email); err == nil {
			return 0, fmt.Errorf("user already exists")
		}
	}
	if purpose == "change_email" {
		if _, err := s.deps.Store.FindUserByEmail(email); err == nil {
			return 0, fmt.Errorf("user already exists")
		}
	}
	if purpose != "register" {
		if user, err := s.deps.Store.FindUserByEmail(email); err == nil {
			country = strings.ToUpper(strings.TrimSpace(user.Country))
		}
	}
	if purpose == "mfa_login" || purpose == "login_step_up" {
		if _, err := s.deps.Store.FindUserByEmail(email); err != nil {
			return 0, fmt.Errorf("user not found")
		}
	}
	if purpose == "reset_password" {
		if _, err := s.deps.Store.FindUserByEmail(email); err != nil {
			return 0, fmt.Errorf("user not found")
		}
	}
	if purpose == "delete_account" {
		if _, err := s.deps.Store.FindUserByEmail(email); err != nil {
			return 0, fmt.Errorf("user not found")
		}
	}
	if !s.deps.Mail.Enabled() {
		return 0, fmt.Errorf("smtp not configured")
	}

	cooldownSeconds := s.settings.GetVerificationCodeCooldownSeconds()
	if enforceCooldown && cooldownSeconds > 0 {
		if latest, err := s.deps.Store.GetLatestEmailVerificationCode(email, purpose); err == nil {
			nextAvailableAt := latest.CreatedAt.Add(time.Duration(cooldownSeconds) * time.Second)
			if nextAvailableAt.After(time.Now().UTC()) {
				remaining := int(time.Until(nextAvailableAt).Seconds())
				if remaining < 1 {
					remaining = 1
				}
				return cooldownSeconds, &settings.VerificationCooldownError{RetryAfterSeconds: remaining}
			}
		}
	}

	code, err := authutil.GenerateNumericCode(6)
	if err != nil {
		return 0, err
	}
	record := domain.EmailVerificationCode{
		ID:        uuid.NewString(),
		Email:     email,
		Country:   country,
		Purpose:   purpose,
		Code:      code,
		ExpiresAt: time.Now().UTC().Add(s.deps.Cfg.SMTP.VerificationCodeTTL),
		Consumed:  false,
		CreatedAt: time.Now().UTC(),
	}
	if err := s.deps.Store.SaveEmailVerificationCode(record); err != nil {
		return 0, err
	}

	subject, body := s.settings.BuildVerificationEmailContent(purpose, email, country, code)
	if err := s.deps.Mail.Send(email, subject, body); err != nil {
		return 0, err
	}
	s.deps.AppendEmailSendLog(email, fmt.Sprintf("主题：%s\n%s", subject, body), s.deps.LookupUserEmailByEmail(email))
	return cooldownSeconds, nil
}

func (s *AuthService) SendSMSVerificationCode(phone, purpose string) (int, error) {
	return s.sendSMSVerificationCode(phone, purpose, true)
}

func (s *AuthService) sendSMSVerificationCode(phone, purpose string, enforceCooldown bool) (int, error) {
	phone = strings.TrimSpace(phone)
	purpose = strings.ToLower(strings.TrimSpace(purpose))
	if phone == "" {
		return 0, fmt.Errorf("phone is required")
	}
	if purpose != "change_phone" && purpose != "login" && purpose != "mfa_login" && purpose != "login_step_up" && purpose != "risk_phone_binding" && purpose != "delete_account" {
		return 0, fmt.Errorf("unsupported sms verification purpose")
	}
	if purpose == "change_phone" {
		if _, err := s.deps.Store.FindUserByPhone(phone); err == nil {
			return 0, fmt.Errorf("phone already bound")
		}
	}
	if purpose == "risk_phone_binding" {
		if _, err := s.deps.Store.FindUserByPhone(phone); err == nil {
			return 0, fmt.Errorf("phone already bound")
		}
	}
	if purpose == "mfa_login" || purpose == "login_step_up" || purpose == "delete_account" {
		if _, err := s.deps.Store.FindUserByPhone(phone); err != nil {
			return 0, fmt.Errorf("user not found")
		}
	}
	if !s.deps.SMS.Enabled() {
		return 0, fmt.Errorf("sms not configured")
	}

	cooldownSeconds := s.settings.GetVerificationCodeCooldownSeconds()
	if enforceCooldown && cooldownSeconds > 0 {
		if latest, err := s.deps.Store.GetLatestSMSVerificationCode(phone, purpose); err == nil {
			nextAvailableAt := latest.CreatedAt.Add(time.Duration(cooldownSeconds) * time.Second)
			if nextAvailableAt.After(time.Now().UTC()) {
				remaining := int(time.Until(nextAvailableAt).Seconds())
				if remaining < 1 {
					remaining = 1
				}
				return cooldownSeconds, &settings.VerificationCooldownError{RetryAfterSeconds: remaining}
			}
		}
	}

	code, err := authutil.GenerateNumericCode(6)
	if err != nil {
		return 0, err
	}
	record := domain.SMSVerificationCode{
		ID:        uuid.NewString(),
		Phone:     phone,
		Purpose:   purpose,
		Code:      code,
		ExpiresAt: time.Now().UTC().Add(s.deps.Cfg.SMTP.VerificationCodeTTL),
		Consumed:  false,
		CreatedAt: time.Now().UTC(),
	}
	if err := s.deps.Store.SaveSMSVerificationCode(record); err != nil {
		return 0, err
	}

	content := s.settings.BuildSMSVerificationContent(purpose, phone, code)
	if err := s.deps.SMS.Send(phone, purpose, content, notify.SendOptions{
		Code:    code,
		Minutes: int(s.deps.Cfg.SMTP.VerificationCodeTTL.Minutes()),
	}); err != nil {
		return 0, err
	}
	s.deps.AppendPhoneSendLog(phone, content, s.deps.LookupUserEmailByPhone(phone))
	return cooldownSeconds, nil
}

func (s *AuthService) CurrentUser(sessionToken string) (domain.User, domain.Session, error) {
	if err := s.user.CleanupExpiredDeletionRequests(); err != nil {
		return domain.User{}, domain.Session{}, err
	}
	session, err := s.deps.Store.GetSession(sessionToken)
	if err != nil || session.ExpiresAt.Before(time.Now().UTC()) {
		return domain.User{}, domain.Session{}, fmt.Errorf("session expired")
	}
	user, err := s.deps.Store.GetUser(session.UserID)
	if err != nil {
		return domain.User{}, domain.Session{}, fmt.Errorf("user not found")
	}
	if !authutil.AllowsAuthenticatedAccess(user) {
		_ = s.deps.Store.DeleteSession(sessionToken)
		return domain.User{}, domain.Session{}, fmt.Errorf("session expired")
	}
	return user, session, nil
}

func shouldMaskPublicVerificationError(err error) bool {
	if err == nil {
		return false
	}
	switch strings.TrimSpace(err.Error()) {
	case "user already exists", "user not found", "phone already bound":
		return true
	default:
		return false
	}
}

func (s *AuthService) Logout(sessionToken string) error {
	session, invalidated, err := InvalidateSessionAuthState(s.deps, sessionToken)
	if err != nil {
		return err
	}
	if invalidated {
		s.audit.Record(session.UserID, session.Role, "auth.logout", session.UserID, map[string]any{
			"transport": "api",
		})
	}
	return nil
}
