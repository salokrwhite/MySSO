package service

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"

	"mysso/backend/internal/appdefaults"
	"mysso/backend/internal/domain"
)

const (
	phoneBindingModeNone      = ""
	phoneBindingModeImmediate = "immediate"
	phoneBindingModeDelayed   = "delayed"
)

type phoneBindingRiskState struct {
	Mode       string
	Required   bool
	LoginCount int
}

func (s *AuthService) getPhoneBindingRiskState(userID string) (phoneBindingRiskState, error) {
	values, err := s.deps.store.GetSettings(
		domain.UserRiskPhoneBindingModeKey(userID),
		domain.UserRiskPhoneBindingRequiredKey(userID),
		domain.UserRiskPhoneBindingLoginCountKey(userID),
	)
	if err != nil {
		return phoneBindingRiskState{}, err
	}

	loginCount := 0
	if raw := strings.TrimSpace(values[domain.UserRiskPhoneBindingLoginCountKey(userID)]); raw != "" {
		if parsed, parseErr := strconv.Atoi(raw); parseErr == nil && parsed >= 0 {
			loginCount = parsed
		}
	}

	return phoneBindingRiskState{
		Mode:       strings.TrimSpace(values[domain.UserRiskPhoneBindingModeKey(userID)]),
		Required:   fallbackBoolSetting(values[domain.UserRiskPhoneBindingRequiredKey(userID)], false),
		LoginCount: loginCount,
	}, nil
}

func (s *AuthService) savePhoneBindingRiskState(userID string, state phoneBindingRiskState) error {
	return s.deps.store.UpsertSettings(map[string]string{
		domain.UserRiskPhoneBindingModeKey(userID):       strings.TrimSpace(state.Mode),
		domain.UserRiskPhoneBindingRequiredKey(userID):   strconv.FormatBool(state.Required),
		domain.UserRiskPhoneBindingLoginCountKey(userID): strconv.Itoa(max(state.LoginCount, 0)),
	})
}

func (s *AuthService) selectPhoneBindingRiskMode(country string) (string, error) {
	if !s.settings.IsPhoneVerificationEnabled() {
		return phoneBindingModeNone, nil
	}
	settings, err := s.settings.GetSystemSettings()
	if err != nil {
		return phoneBindingModeNone, err
	}
	if !settings.RiskControlEnabled || strings.ToUpper(strings.TrimSpace(country)) != "CN" {
		return phoneBindingModeNone, nil
	}
	if settings.RiskImmediateBindProbability <= 0 {
		return phoneBindingModeDelayed, nil
	}
	if settings.RiskDelayedBindProbability <= 0 {
		return phoneBindingModeImmediate, nil
	}
	roll, err := rand.Int(rand.Reader, big.NewInt(100))
	if err != nil {
		return phoneBindingModeNone, err
	}
	if int(roll.Int64()) < settings.RiskImmediateBindProbability {
		return phoneBindingModeImmediate, nil
	}
	return phoneBindingModeDelayed, nil
}

func (s *AuthService) createPhoneBindingChallenge(user domain.User, reason, acr string) (domain.PhoneBindingChallenge, error) {
	challenge := domain.PhoneBindingChallenge{
		Token:     uuid.NewString(),
		UserID:    user.ID,
		Reason:    strings.TrimSpace(reason),
		ACR:       strings.TrimSpace(acr),
		ExpiresAt: time.Now().UTC().Add(30 * time.Minute),
		CreatedAt: time.Now().UTC(),
	}
	if err := s.deps.store.SavePhoneBindingChallenge(challenge); err != nil {
		return domain.PhoneBindingChallenge{}, err
	}
	return challenge, nil
}

func (s *AuthService) loadPhoneBindingChallenge(challengeToken string) (domain.PhoneBindingChallenge, domain.User, error) {
	challengeToken = strings.TrimSpace(challengeToken)
	if challengeToken == "" {
		return domain.PhoneBindingChallenge{}, domain.User{}, fmt.Errorf("phone binding challenge token is required")
	}
	challenge, err := s.deps.store.GetPhoneBindingChallenge(challengeToken)
	if err != nil {
		return domain.PhoneBindingChallenge{}, domain.User{}, fmt.Errorf("phone binding challenge expired or invalid")
	}
	user, err := s.deps.store.GetUser(challenge.UserID)
	if err != nil {
		return domain.PhoneBindingChallenge{}, domain.User{}, fmt.Errorf("user not found")
	}
	return challenge, user, nil
}

func (s *AuthService) enforcePendingPhoneBinding(user domain.User, reason, acr string) (PasswordLoginResult, error) {
	state, err := s.getPhoneBindingRiskState(user.ID)
	if err != nil {
		return PasswordLoginResult{}, err
	}
	state.Required = true
	if state.Mode == phoneBindingModeNone {
		state.Mode = phoneBindingModeDelayed
	}
	if err := s.savePhoneBindingRiskState(user.ID, state); err != nil {
		return PasswordLoginResult{}, err
	}
	if user.Status != domain.UserPending {
		user.Status = domain.UserPending
		if err := s.deps.store.UpdateUser(user); err != nil {
			return PasswordLoginResult{}, err
		}
	}
	challenge, err := s.createPhoneBindingChallenge(user, reason, acr)
	if err != nil {
		return PasswordLoginResult{}, err
	}
	s.audit.Record(user.ID, user.Role, "user.risk.phone_binding_required", user.ID, map[string]any{
		"reason": reason,
	})
	return PasswordLoginResult{
		RequiresPhoneBinding:       true,
		PhoneBindingChallengeToken: challenge.Token,
		PhoneBindingReason:         reason,
		User:                       user,
	}, nil
}

func (s *AuthService) maybeRequirePhoneBindingBeforeLogin(user domain.User, acr string) (PasswordLoginResult, bool, error) {
	if !s.settings.IsPhoneVerificationEnabled() {
		return PasswordLoginResult{}, false, nil
	}
	policy, err := s.getUserSecurityPolicy(user.ID)
	if err != nil {
		return PasswordLoginResult{}, false, err
	}
	if strings.TrimSpace(user.Phone) != "" {
		if policy.ForcePhoneBindingNextLogin {
			if err := s.clearUserSecurityPolicy(user.ID, true, false, false); err != nil {
				return PasswordLoginResult{}, false, err
			}
		}
		return PasswordLoginResult{}, false, nil
	}
	if policy.ForcePhoneBindingNextLogin {
		result, resultErr := s.enforcePendingPhoneBinding(user, adminForcedPhoneBindingReason, acr)
		return result, true, resultErr
	}
	state, err := s.getPhoneBindingRiskState(user.ID)
	if err != nil {
		return PasswordLoginResult{}, false, err
	}
	if user.Status == domain.UserPending && state.Required {
		result, resultErr := s.enforcePendingPhoneBinding(user, "pending_activation", acr)
		return result, true, resultErr
	}
	if user.Status != domain.UserActive || state.Mode != phoneBindingModeDelayed {
		return PasswordLoginResult{}, false, nil
	}

	settings, err := s.settings.GetSystemSettings()
	if err != nil {
		return PasswordLoginResult{}, false, err
	}
	state.LoginCount++
	if state.LoginCount < settings.RiskDelayedBindLoginCount {
		if err := s.savePhoneBindingRiskState(user.ID, state); err != nil {
			return PasswordLoginResult{}, false, err
		}
		return PasswordLoginResult{}, false, nil
	}
	result, resultErr := s.enforcePendingPhoneBinding(user, "delayed_login_threshold", acr)
	return result, true, resultErr
}

func (s *SettingsService) GetRiskDelayedBindLoginCount() int {
	settings, err := s.GetSystemSettings()
	if err != nil || settings.RiskDelayedBindLoginCount <= 0 {
		return appdefaults.DefaultRiskDelayedBindLoginCount
	}
	return settings.RiskDelayedBindLoginCount
}

func max(value, minValue int) int {
	if value < minValue {
		return minValue
	}
	return value
}

func (s *AuthService) SendPhoneBindingVerificationCode(challengeToken, phone string) (int, error) {
	if !s.settings.IsPhoneVerificationEnabled() {
		return 0, fmt.Errorf("phone verification is disabled")
	}
	challenge, user, err := s.loadPhoneBindingChallenge(challengeToken)
	if err != nil {
		return 0, err
	}
	state, err := s.getPhoneBindingRiskState(user.ID)
	if err != nil {
		return 0, err
	}
	if !state.Required || strings.TrimSpace(user.Phone) != "" {
		return 0, fmt.Errorf("phone binding is not required")
	}
	_ = challenge
	return s.SendSMSVerificationCode(phone, "risk_phone_binding")
}

func (s *AuthService) CompletePhoneBinding(challengeToken, phone, code, ip, deviceID string) (PasswordLoginResult, error) {
	if !s.settings.IsPhoneVerificationEnabled() {
		return PasswordLoginResult{}, fmt.Errorf("phone verification is disabled")
	}
	challenge, user, err := s.loadPhoneBindingChallenge(challengeToken)
	if err != nil {
		return PasswordLoginResult{}, err
	}
	phone = strings.TrimSpace(phone)
	code = strings.TrimSpace(code)
	if phone == "" || code == "" {
		return PasswordLoginResult{}, fmt.Errorf("phone and verification code are required")
	}
	state, err := s.getPhoneBindingRiskState(user.ID)
	if err != nil {
		return PasswordLoginResult{}, err
	}
	if !state.Required || strings.TrimSpace(user.Phone) != "" {
		return PasswordLoginResult{}, fmt.Errorf("phone binding is not required")
	}
	if _, err := s.deps.store.FindUserByPhone(phone); err == nil {
		return PasswordLoginResult{}, fmt.Errorf("phone already bound")
	}
	attempt := authAttemptAuditContext{
		Kind:       "sms_code_verify",
		Identifier: user.ID,
		IP:         strings.TrimSpace(ip),
		DeviceID:   strings.TrimSpace(deviceID),
		User:       &user,
	}
	if err := s.checkAuthAttempt(attempt); err != nil {
		return PasswordLoginResult{}, err
	}
	verification, err := s.deps.store.GetSMSVerificationCode(phone, "risk_phone_binding", code)
	if err != nil {
		if limitErr := s.failAuthAttempt(attempt, "invalid_code"); limitErr != nil {
			return PasswordLoginResult{}, limitErr
		}
		return PasswordLoginResult{}, fmt.Errorf("invalid or expired phone verification code")
	}
	if err := s.deps.store.ConsumeSMSVerificationCode(verification.ID); err != nil {
		return PasswordLoginResult{}, err
	}
	s.resetAuthAttempt(attempt)
	user.Phone = phone
	user.Status = domain.UserActive
	if err := s.deps.store.UpdateUser(user); err != nil {
		return PasswordLoginResult{}, err
	}
	state.Required = false
	state.LoginCount = 0
	if err := s.savePhoneBindingRiskState(user.ID, state); err != nil {
		return PasswordLoginResult{}, err
	}
	if err := s.clearUserSecurityPolicy(user.ID, true, false, false); err != nil {
		return PasswordLoginResult{}, err
	}
	if err := s.deps.store.DeletePhoneBindingChallenge(challenge.Token); err != nil {
		return PasswordLoginResult{}, err
	}
	s.audit.Record(user.ID, user.Role, "user.risk.phone_bound", user.ID, map[string]any{
		"reason": challenge.Reason,
	})
	return s.continuePostAuthentication(user, ip, deriveLoginMethodFromACR(challenge.ACR), challenge.ACR)
}
