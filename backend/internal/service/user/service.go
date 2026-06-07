package user

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"strings"
	"time"
	"unicode"

	"github.com/google/uuid"

	"mysso/backend/internal/appdefaults"
	"mysso/backend/internal/domain"
	"mysso/backend/internal/notify"
	"mysso/backend/internal/security"
	"mysso/backend/internal/service/audit"
	"mysso/backend/internal/service/auth"
	"mysso/backend/internal/service/common/appurl"
	"mysso/backend/internal/service/common/authutil"
	"mysso/backend/internal/service/common/deps"
	"mysso/backend/internal/service/common/templateutil"
	riskservice "mysso/backend/internal/service/risk"
	"mysso/backend/internal/service/settings"
	"mysso/backend/internal/store"
)

type UserService struct {
	deps     *deps.Deps
	audit    *audit.Service
	settings *settings.Service
	risk     *riskservice.Service
}

type Service = UserService

func New(dependencies *deps.Deps, auditService *audit.Service, settingsService *settings.Service) *Service {
	return &UserService{deps: dependencies, audit: auditService, settings: settingsService}
}

func (s *UserService) SetRiskService(risk *riskservice.Service) {
	s.risk = risk
}

func (s *UserService) invalidateUserSessionsAndRefreshTokens(userID string) error {
	if err := s.deps.Store.DeleteSessionsByUser(userID); err != nil {
		return err
	}
	if err := s.deps.Store.RevokeRefreshTokensByUser(userID); err != nil {
		return err
	}
	return nil
}

func (s *UserService) GetUserAnnouncement(userID string) (bool, string, error) {
	values, err := s.deps.Store.GetSettings(domain.UserAnnouncementEnabledKey(userID), domain.UserAnnouncementContentKey(userID))
	if err != nil {
		return false, "", err
	}
	enabled := authutil.FallbackBoolSetting(values[domain.UserAnnouncementEnabledKey(userID)], false)
	content := strings.TrimSpace(values[domain.UserAnnouncementContentKey(userID)])
	return enabled, content, nil
}

func (s *UserService) UpdateUserPreferredLocale(userID, preferredLocale string) (domain.User, error) {
	preferredLocale = strings.TrimSpace(preferredLocale)
	if preferredLocale == "" {
		return domain.User{}, fmt.Errorf("preferred locale is required")
	}
	if len(preferredLocale) > 16 {
		return domain.User{}, fmt.Errorf("preferred locale is invalid")
	}
	user, err := s.deps.Store.GetUser(userID)
	if err != nil {
		return domain.User{}, err
	}
	user.PreferredLocale = preferredLocale
	if err := s.deps.Store.UpdateUser(user); err != nil {
		return domain.User{}, err
	}
	s.audit.Record(user.ID, user.Role, "user.profile.update_preferred_locale", user.ID, map[string]any{
		"preferred_locale": preferredLocale,
	})
	s.deps.AppendUserOperationLog(user.ID, "user.profile.update_preferred_locale", user.ID, map[string]any{
		"preferred_locale": preferredLocale,
	})
	return user, nil
}

func (s *UserService) UpdateUserMFA(userID string, enabled bool, method, currentPassword, currentMFACode, ip, deviceID string) (domain.User, error) {
	method = strings.TrimSpace(method)
	user, err := s.deps.Store.GetUser(userID)
	if err != nil {
		return domain.User{}, err
	}
	if err := s.VerifyCurrentPassword(user, currentPassword, ip, deviceID); err != nil {
		return domain.User{}, err
	}
	if err := s.VerifyCurrentMFA(user, currentMFACode, ip, deviceID); err != nil {
		return domain.User{}, err
	}
	if err := s.enforceSecurityOperationRisk(user, ip, deviceID, "update_mfa"); err != nil {
		return domain.User{}, err
	}
	if !authutil.SupportsUserMFA(user) {
		if enabled {
			return domain.User{}, fmt.Errorf("mfa is disabled for admin accounts")
		}
		changed := user.MFAEnabled || strings.TrimSpace(user.MFAMethod) != "" || strings.TrimSpace(user.MFASecret) != ""
		user.MFAEnabled = false
		user.MFAMethod = ""
		user.MFASecret = ""
		if changed {
			if err := s.InvalidateAuthForSecurityEvent(&user); err != nil {
				return domain.User{}, err
			}
		}
		s.audit.Record(user.ID, user.Role, "user.profile.update_mfa", user.ID, map[string]any{
			"enabled": false,
			"method":  "",
		})
		s.deps.AppendUserOperationLog(user.ID, "user.profile.update_mfa", user.ID, map[string]any{
			"enabled": false,
			"method":  "",
		})
		return user, nil
	}

	if !enabled {
		user.MFAEnabled = false
		user.MFAMethod = ""
		user.MFASecret = ""
		if err := s.InvalidateAuthForSecurityEvent(&user); err != nil {
			return domain.User{}, err
		}
		s.audit.Record(user.ID, user.Role, "user.profile.update_mfa", user.ID, map[string]any{
			"enabled": false,
			"method":  "",
		})
		s.deps.AppendUserOperationLog(user.ID, "user.profile.update_mfa", user.ID, map[string]any{
			"enabled": false,
			"method":  "",
		})
		return user, nil
	}

	if method != "email" && method != "sms" {
		return domain.User{}, fmt.Errorf("unsupported mfa method")
	}
	if method == "email" && strings.TrimSpace(user.Email) == "" {
		return domain.User{}, fmt.Errorf("email is not bound")
	}
	if method == "sms" && strings.TrimSpace(user.Phone) == "" {
		return domain.User{}, fmt.Errorf("phone is not bound")
	}

	user.MFAEnabled = true
	user.MFAMethod = method
	if err := s.InvalidateAuthForSecurityEvent(&user); err != nil {
		return domain.User{}, err
	}
	s.audit.Record(user.ID, user.Role, "user.profile.update_mfa", user.ID, map[string]any{
		"enabled": true,
		"method":  method,
	})
	s.deps.AppendUserOperationLog(user.ID, "user.profile.update_mfa", user.ID, map[string]any{
		"enabled": true,
		"method":  method,
	})
	return user, nil
}

func (s *UserService) SendCurrentMFACode(userID, currentPassword, ip, deviceID string) (int, string, error) {
	user, err := s.deps.Store.GetUser(userID)
	if err != nil {
		return 0, "", err
	}
	if err := s.VerifyCurrentPassword(user, currentPassword, ip, deviceID); err != nil {
		return 0, "", err
	}
	if !authutil.EffectiveUserMFAEnabled(user) {
		return 0, "", fmt.Errorf("mfa is not enabled")
	}
	authService := auth.New(s.deps, s.audit, s.settings, s)

	switch authutil.EffectiveUserMFAMethod(user) {
	case "email":
		cooldownSeconds, err := authService.SendEmailVerificationCode(strings.TrimSpace(user.Email), "", "mfa_login")
		return cooldownSeconds, "email", err
	case "sms":
		cooldownSeconds, err := authService.SendSMSVerificationCode(strings.TrimSpace(user.Phone), "mfa_login")
		return cooldownSeconds, "sms", err
	default:
		return 0, "", fmt.Errorf("current account uses a manual mfa code")
	}
}

func (s *UserService) UpdateUserDisplayName(userID, displayName string) (domain.User, error) {
	displayName = strings.TrimSpace(displayName)
	if displayName == "" {
		return domain.User{}, fmt.Errorf("display name is required")
	}
	user, err := s.deps.Store.GetUser(userID)
	if err != nil {
		return domain.User{}, err
	}
	user.DisplayName = displayName
	if err := s.deps.Store.UpdateUser(user); err != nil {
		return domain.User{}, err
	}
	s.audit.Record(user.ID, user.Role, "user.profile.update_display_name", user.ID, map[string]any{
		"display_name": displayName,
	})
	s.deps.AppendUserOperationLog(user.ID, "user.profile.update_display_name", user.ID, map[string]any{
		"display_name": displayName,
	})
	return user, nil
}

func (s *UserService) UpdateUserGender(userID, gender string) (domain.User, error) {
	normalizedGender, err := templateutil.NormalizeGender(gender)
	if err != nil {
		return domain.User{}, err
	}
	user, err := s.deps.Store.GetUser(userID)
	if err != nil {
		return domain.User{}, err
	}
	user.Gender = normalizedGender
	if err := s.deps.Store.UpdateUser(user); err != nil {
		return domain.User{}, err
	}
	s.audit.Record(user.ID, user.Role, "user.profile.update_gender", user.ID, map[string]any{
		"gender": normalizedGender,
	})
	s.deps.AppendUserOperationLog(user.ID, "user.profile.update_gender", user.ID, map[string]any{
		"gender": normalizedGender,
	})
	return user, nil
}

func (s *UserService) UpdateUserEmail(userID, email, code, currentPassword, ip, deviceID string) (domain.User, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	code = strings.TrimSpace(code)
	if email == "" || code == "" {
		return domain.User{}, fmt.Errorf("email and verification code are required")
	}

	user, err := s.deps.Store.GetUser(userID)
	if err != nil {
		return domain.User{}, err
	}
	if strings.EqualFold(user.Email, email) {
		return domain.User{}, fmt.Errorf("new email must be different from current email")
	}
	if _, err := s.deps.Store.FindUserByEmail(email); err == nil {
		return domain.User{}, fmt.Errorf("user already exists")
	}
	if err := s.VerifyCurrentPassword(user, currentPassword, ip, deviceID); err != nil {
		return domain.User{}, err
	}

	attempt := userAttemptAuditContext{
		Kind:       "email_code_verify",
		Identifier: user.ID,
		IP:         strings.TrimSpace(ip),
		DeviceID:   strings.TrimSpace(deviceID),
		User:       &user,
	}
	if err := s.checkUserAttempt(attempt); err != nil {
		return domain.User{}, err
	}
	verification, err := s.deps.Store.GetEmailVerificationCode(email, "change_email", code)
	if err != nil {
		if limitErr := s.failUserAttempt(attempt, "invalid_code"); limitErr != nil {
			return domain.User{}, limitErr
		}
		return domain.User{}, fmt.Errorf("invalid or expired verification code")
	}
	if err := s.deps.Store.ConsumeEmailVerificationCode(verification.ID); err != nil {
		return domain.User{}, err
	}
	s.resetUserAttempt(attempt)
	if err := s.enforceSecurityOperationRisk(user, ip, deviceID, "change_email"); err != nil {
		return domain.User{}, err
	}

	previousEmail := user.Email
	user.Email = email
	if err := s.InvalidateAuthForSecurityEvent(&user); err != nil {
		return domain.User{}, err
	}
	s.audit.Record(user.ID, user.Role, "user.profile.update_email", user.ID, map[string]any{
		"previous_email": previousEmail,
		"email":          email,
	})
	s.deps.AppendUserOperationLog(user.ID, "user.profile.update_email", user.ID, map[string]any{
		"previous_email": previousEmail,
		"email":          email,
	})
	return user, nil
}

func (s *UserService) UpdateUserPhone(userID, phone, code, currentPhoneCode, currentPassword, ip, deviceID string) (domain.User, error) {
	if !s.settings.IsPhoneVerificationEnabled() {
		return domain.User{}, fmt.Errorf("phone verification is disabled")
	}
	phone = strings.TrimSpace(phone)
	code = strings.TrimSpace(code)
	currentPhoneCode = strings.TrimSpace(currentPhoneCode)
	if phone == "" || code == "" {
		return domain.User{}, fmt.Errorf("phone and new phone verification code are required")
	}

	user, err := s.deps.Store.GetUser(userID)
	if err != nil {
		return domain.User{}, err
	}
	currentPhone := strings.TrimSpace(user.Phone)
	if strings.TrimSpace(user.Phone) == phone {
		return domain.User{}, fmt.Errorf("new phone must be different from current phone")
	}
	if _, err := s.deps.Store.FindUserByPhone(phone); err == nil {
		return domain.User{}, fmt.Errorf("phone already bound")
	}
	if err := s.VerifyCurrentPassword(user, currentPassword, ip, deviceID); err != nil {
		return domain.User{}, err
	}
	attempt := userAttemptAuditContext{
		Kind:       "sms_code_verify",
		Identifier: user.ID,
		IP:         strings.TrimSpace(ip),
		DeviceID:   strings.TrimSpace(deviceID),
		User:       &user,
	}
	if err := s.checkUserAttempt(attempt); err != nil {
		return domain.User{}, err
	}
	if currentPhone != "" {
		if currentPhoneCode == "" {
			return domain.User{}, fmt.Errorf("current phone verification code is required")
		}
		currentVerification, err := s.deps.Store.GetSMSVerificationCode(currentPhone, "verify_current_phone", currentPhoneCode)
		if err != nil {
			if limitErr := s.failUserAttempt(attempt, "invalid_current_phone_code"); limitErr != nil {
				return domain.User{}, limitErr
			}
			return domain.User{}, fmt.Errorf("invalid or expired current phone verification code")
		}
		if err := s.deps.Store.ConsumeSMSVerificationCode(currentVerification.ID); err != nil {
			return domain.User{}, err
		}
	}

	verification, err := s.deps.Store.GetSMSVerificationCode(phone, "change_phone", code)
	if err != nil {
		if limitErr := s.failUserAttempt(attempt, "invalid_code"); limitErr != nil {
			return domain.User{}, limitErr
		}
		return domain.User{}, fmt.Errorf("invalid or expired new phone verification code")
	}
	if err := s.deps.Store.ConsumeSMSVerificationCode(verification.ID); err != nil {
		return domain.User{}, err
	}
	s.resetUserAttempt(attempt)
	if err := s.enforceSecurityOperationRisk(user, ip, deviceID, "change_phone"); err != nil {
		return domain.User{}, err
	}

	previousPhone := user.Phone
	user.Phone = phone
	policy, policyErr := s.deps.Store.GetUserSecurityPolicy(user.ID)
	if policyErr != nil && policyErr != store.ErrNotFound {
		return domain.User{}, policyErr
	}
	if policy.PhoneBindingRiskRequired {
		user.Status = domain.UserActive
		_ = s.deps.Store.UpdatePhoneBindingRiskState(user.ID, policy.PhoneBindingRiskMode, false, 0)
	}
	if err := s.InvalidateAuthForSecurityEvent(&user); err != nil {
		return domain.User{}, err
	}
	s.audit.Record(user.ID, user.Role, "user.profile.update_phone", user.ID, map[string]any{
		"previous_phone": previousPhone,
		"phone":          phone,
	})
	s.deps.AppendUserOperationLog(user.ID, "user.profile.update_phone", user.ID, map[string]any{
		"previous_phone": previousPhone,
		"phone":          phone,
	})
	return user, nil
}

func (s *UserService) SendPhoneVerificationCode(userID, phone, purpose string) (int, error) {
	phone = strings.TrimSpace(phone)
	purpose = strings.ToLower(strings.TrimSpace(purpose))
	if (purpose == "verify_current_phone" || purpose == "change_phone") && !s.settings.IsPhoneVerificationEnabled() {
		return 0, fmt.Errorf("phone verification is disabled")
	}
	if phone == "" {
		return 0, fmt.Errorf("phone is required")
	}
	if purpose != "verify_current_phone" && purpose != "change_phone" && purpose != "delete_account" {
		return 0, fmt.Errorf("unsupported sms verification purpose")
	}

	user, err := s.deps.Store.GetUser(userID)
	if err != nil {
		return 0, err
	}
	currentPhone := strings.TrimSpace(user.Phone)
	if purpose == "verify_current_phone" {
		if currentPhone == "" {
			return 0, fmt.Errorf("current phone is not bound")
		}
		if phone != currentPhone {
			return 0, fmt.Errorf("phone does not match current bound phone")
		}
	}
	if purpose == "change_phone" {
		if phone == currentPhone {
			return 0, fmt.Errorf("new phone must be different from current phone")
		}
		if _, err := s.deps.Store.FindUserByPhone(phone); err == nil {
			return 0, fmt.Errorf("phone already bound")
		}
	}
	if purpose == "delete_account" {
		if currentPhone == "" {
			return 0, fmt.Errorf("current phone is not bound")
		}
		if phone != currentPhone {
			return 0, fmt.Errorf("phone does not match current bound phone")
		}
	}
	if !s.deps.SMS.Enabled() {
		return 0, fmt.Errorf("sms not configured")
	}

	cooldownSeconds := s.settings.GetVerificationCodeCooldownSeconds()
	now := time.Now().UTC()
	dailyLimit := s.settings.GetVerificationCodeDailyLimit()
	if dailyLimit.SMS > 0 {
		startAt, endAt := settings.ChinaDayRange(now)
		count, err := s.deps.Store.CountSMSVerificationCodes(phone, startAt, endAt)
		if err != nil {
			return 0, err
		}
		if count >= dailyLimit.SMS {
			return cooldownSeconds, settings.VerificationDailyLimitError(now)
		}
	}
	if cooldownSeconds > 0 {
		if latest, err := s.deps.Store.GetLatestSMSVerificationCode(phone, purpose); err == nil {
			nextAvailableAt := latest.CreatedAt.Add(time.Duration(cooldownSeconds) * time.Second)
			if nextAvailableAt.After(now) {
				remaining := int(nextAvailableAt.Sub(now).Seconds())
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
		ExpiresAt: now.Add(s.deps.Cfg.SMTP.VerificationCodeTTL),
		Consumed:  false,
		CreatedAt: now,
	}
	if dailyLimit.SMS > 0 {
		startAt, endAt := settings.ChinaDayRange(now)
		saved, err := s.deps.Store.SaveSMSVerificationCodeWithinDailyLimit(record, startAt, endAt, dailyLimit.SMS)
		if err != nil {
			return 0, err
		}
		if !saved {
			return cooldownSeconds, settings.VerificationDailyLimitError(now)
		}
	} else if err := s.deps.Store.SaveSMSVerificationCode(record); err != nil {
		return 0, err
	}

	content := s.settings.BuildSMSVerificationContent(purpose, phone, code)
	if err := s.deps.SMS.Send(phone, purpose, content, notify.SendOptions{
		Code:    code,
		Minutes: int(s.deps.Cfg.SMTP.VerificationCodeTTL.Minutes()),
	}); err != nil {
		return 0, err
	}
	s.deps.AppendPhoneSendLog(phone, content, strings.TrimSpace(user.Email))
	return cooldownSeconds, nil
}

func (s *UserService) UpdateUserPassword(userID, currentPassword, newPassword, ip, deviceID string) error {
	currentPassword = strings.TrimSpace(currentPassword)
	newPassword = strings.TrimSpace(newPassword)
	if currentPassword == "" || newPassword == "" {
		return fmt.Errorf("current password and new password are required")
	}
	if len(newPassword) < 8 {
		return fmt.Errorf("new password must be at least 8 characters")
	}

	user, err := s.deps.Store.GetUser(userID)
	if err != nil {
		return err
	}
	if err := s.VerifyCurrentPassword(user, currentPassword, ip, deviceID); err != nil {
		return err
	}
	if security.VerifyPassword(newPassword, user.Password) {
		return fmt.Errorf("new password must be different from current password")
	}
	if err := s.enforceSecurityOperationRisk(user, ip, deviceID, "change_password"); err != nil {
		return err
	}

	passwordHash, err := security.HashPassword(newPassword)
	if err != nil {
		return err
	}
	user.Password = passwordHash
	if err := s.InvalidateAuthForSecurityEvent(&user); err != nil {
		return err
	}
	s.audit.Record(user.ID, user.Role, "user.profile.update_password", user.ID, nil)
	s.deps.AppendUserOperationLog(user.ID, "user.profile.update_password", user.ID, nil)
	return nil
}

func (s *UserService) ResetUserPasswordByEmail(email, code, newPassword, ip, deviceID string) error {
	email = strings.ToLower(strings.TrimSpace(email))
	code = strings.TrimSpace(code)
	newPassword = strings.TrimSpace(newPassword)
	if email == "" || code == "" || newPassword == "" {
		return fmt.Errorf("email, verification code and new password are required")
	}
	if len(newPassword) < 8 {
		return fmt.Errorf("new password must be at least 8 characters")
	}

	attempt := userAttemptAuditContext{
		Kind:       "email_code_verify",
		Identifier: email,
		IP:         strings.TrimSpace(ip),
		DeviceID:   strings.TrimSpace(deviceID),
	}
	if err := s.checkUserAttempt(attempt); err != nil {
		return err
	}
	user, err := s.deps.Store.FindUserByEmail(email)
	if err != nil {
		if limitErr := s.failUserAttempt(attempt, "user_not_found"); limitErr != nil {
			return limitErr
		}
		return fmt.Errorf("invalid or expired verification code")
	}
	attempt.User = &user
	verification, err := s.deps.Store.GetEmailVerificationCode(email, "reset_password", code)
	if err != nil {
		if limitErr := s.failUserAttempt(attempt, "invalid_code"); limitErr != nil {
			return limitErr
		}
		return fmt.Errorf("invalid or expired verification code")
	}
	if err := s.deps.Store.ConsumeEmailVerificationCode(verification.ID); err != nil {
		return err
	}
	if user.Password != "" && security.VerifyPassword(newPassword, user.Password) {
		return fmt.Errorf("new password must be different from current password")
	}
	if err := s.enforceSecurityOperationRisk(user, ip, deviceID, "reset_password"); err != nil {
		return err
	}

	passwordHash, err := security.HashPassword(newPassword)
	if err != nil {
		return err
	}
	user.Password = passwordHash
	if err := s.InvalidateAuthForSecurityEvent(&user); err != nil {
		return err
	}
	s.resetUserAttempt(attempt)
	s.audit.Record(user.ID, user.Role, "user.password.reset_by_email", user.ID, map[string]any{
		"email": email,
	})
	s.deps.AppendUserOperationLog(user.ID, "user.password.reset_by_email", user.ID, map[string]any{
		"email": email,
	})
	return nil
}

func (s *UserService) GetUserAvatarURL(userID string) (string, error) {
	values, err := s.deps.Store.GetSettings(templateutil.UserAvatarSettingKey(userID))
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(values[templateutil.UserAvatarSettingKey(userID)]), nil
}

func (s *UserService) UpdateUserAvatarURL(userID, avatarURL string) error {
	settingKey := templateutil.UserAvatarSettingKey(userID)
	values, err := s.deps.Store.GetSettings(settingKey)
	if err != nil {
		return err
	}
	currentAvatarURL := strings.TrimSpace(values[settingKey])
	avatarURL = strings.TrimSpace(avatarURL)
	if err := s.deps.Store.UpsertSettings(map[string]string{settingKey: avatarURL}); err != nil {
		return err
	}
	appurl.RemoveReplacedUploadedFile(currentAvatarURL, avatarURL)
	s.deps.AppendUserOperationLog(userID, "user.profile.update_avatar", userID, map[string]any{
		"previous_avatar_url": currentAvatarURL,
		"avatar_url":          avatarURL,
	})
	return nil
}

func (s *UserService) RequestUserDeletion(userID, currentPassword, emailCode, phoneCode, ip, deviceID string) (domain.User, error) {
	currentPassword = strings.TrimSpace(currentPassword)
	emailCode = strings.TrimSpace(emailCode)
	phoneCode = strings.TrimSpace(phoneCode)
	if currentPassword == "" {
		return domain.User{}, fmt.Errorf("current password is required")
	}
	user, err := s.deps.Store.GetUser(userID)
	if err != nil {
		return domain.User{}, err
	}
	if err := s.VerifyCurrentPassword(user, currentPassword, ip, deviceID); err != nil {
		return domain.User{}, err
	}
	email := strings.ToLower(strings.TrimSpace(user.Email))
	if email == "" {
		return domain.User{}, fmt.Errorf("email is not bound")
	}
	if emailCode == "" {
		return domain.User{}, fmt.Errorf("email verification code is required")
	}
	emailAttempt := userAttemptAuditContext{
		Kind:       "email_code_verify",
		Identifier: user.ID,
		IP:         strings.TrimSpace(ip),
		DeviceID:   strings.TrimSpace(deviceID),
		User:       &user,
	}
	if err := s.checkUserAttempt(emailAttempt); err != nil {
		return domain.User{}, err
	}
	emailVerification, err := s.deps.Store.GetEmailVerificationCode(email, "delete_account", emailCode)
	if err != nil {
		if limitErr := s.failUserAttempt(emailAttempt, "invalid_code"); limitErr != nil {
			return domain.User{}, limitErr
		}
		return domain.User{}, fmt.Errorf("invalid or expired email verification code")
	}
	if err := s.deps.Store.ConsumeEmailVerificationCode(emailVerification.ID); err != nil {
		return domain.User{}, err
	}
	s.resetUserAttempt(emailAttempt)
	phone := strings.TrimSpace(user.Phone)
	if phone != "" {
		if phoneCode == "" {
			return domain.User{}, fmt.Errorf("phone verification code is required")
		}
		smsAttempt := userAttemptAuditContext{
			Kind:       "sms_code_verify",
			Identifier: user.ID,
			IP:         strings.TrimSpace(ip),
			DeviceID:   strings.TrimSpace(deviceID),
			User:       &user,
		}
		if err := s.checkUserAttempt(smsAttempt); err != nil {
			return domain.User{}, err
		}
		phoneVerification, err := s.deps.Store.GetSMSVerificationCode(phone, "delete_account", phoneCode)
		if err != nil {
			if limitErr := s.failUserAttempt(smsAttempt, "invalid_code"); limitErr != nil {
				return domain.User{}, limitErr
			}
			return domain.User{}, fmt.Errorf("invalid or expired phone verification code")
		}
		if err := s.deps.Store.ConsumeSMSVerificationCode(phoneVerification.ID); err != nil {
			return domain.User{}, err
		}
		s.resetUserAttempt(smsAttempt)
	}
	if err := s.enforceSecurityOperationRisk(user, ip, deviceID, "delete_account"); err != nil {
		return domain.User{}, err
	}
	now := time.Now().UTC()
	deletionAt := now.Add(appdefaults.AccountDeletionGracePeriod)
	user.DeletionRequestedAt = &now
	user.DeletionScheduledAt = &deletionAt
	if err := s.InvalidateAuthForSecurityEvent(&user); err != nil {
		return domain.User{}, err
	}
	s.audit.Record(user.ID, user.Role, "user.account.deletion_requested", user.ID, map[string]any{
		"deletion_scheduled_at": deletionAt,
	})
	s.deps.AppendUserOperationLog(user.ID, "user.account.deletion_requested", user.ID, map[string]any{
		"deletion_scheduled_at": deletionAt,
	})
	return user, nil
}

func (s *UserService) CleanupExpiredDeletionRequests() error {
	users, err := s.deps.Store.ListUsersPendingDeletion(time.Now().UTC())
	if err != nil {
		return err
	}
	for _, user := range users {
		if err := s.deps.Store.DeleteUser(user.ID); err != nil {
			return err
		}
	}
	return nil
}

func (s *UserService) ExportUserDataCSV(userID, currentPassword, ip, deviceID string) ([]byte, string, error) {
	currentPassword = strings.TrimSpace(currentPassword)
	if currentPassword == "" {
		return nil, "", fmt.Errorf("current password is required")
	}

	user, err := s.deps.Store.GetUser(userID)
	if err != nil {
		return nil, "", err
	}
	if err := s.VerifyCurrentPassword(user, currentPassword, ip, deviceID); err != nil {
		return nil, "", err
	}
	if err := s.enforceSecurityOperationRisk(user, ip, deviceID, "export_user_data"); err != nil {
		return nil, "", err
	}

	consents := s.deps.Store.ListConsentsByUser(userID)
	avatarURL, err := s.GetUserAvatarURL(userID)
	if err != nil {
		return nil, "", err
	}
	buffer := &bytes.Buffer{}
	buffer.WriteString("\uFEFF")
	writer := csv.NewWriter(buffer)

	rows := [][]string{
		{"section", "item_key", "item_label", "value", "extra"},
		{"profile", "id", "User ID", user.ID, ""},
		{"profile", "display_name", "Display Name", user.DisplayName, ""},
		{"profile", "gender", "Gender", user.Gender, ""},
		{"profile", "preferred_locale", "Preferred Locale", user.PreferredLocale, ""},
		{"profile", "avatar_url", "Avatar URL", avatarURL, ""},
		{"profile", "email", "Email", user.Email, ""},
		{"profile", "phone", "Phone Number", user.Phone, ""},
		{"profile", "country", "Registration Country", user.Country, ""},
		{"profile", "created_at", "Registered At", user.CreatedAt.Format(time.RFC3339), ""},
	}

	for _, consent := range consents {
		rows = append(rows, []string{
			"consent",
			consent.ID,
			consent.AppName,
			consent.ClientID,
			fmt.Sprintf("authorized_at=%s;scopes=%s", consent.CreatedAt.Format(time.RFC3339), strings.Join(consent.Scopes, "|")),
		})
	}
	sanitizeCSVRows(rows)

	if err := writer.WriteAll(rows); err != nil {
		return nil, "", err
	}
	if err := writer.Error(); err != nil {
		return nil, "", err
	}

	s.audit.Record(user.ID, user.Role, "user.privacy.export_data", user.ID, map[string]any{
		"consent_count": len(consents),
	})
	s.deps.AppendUserOperationLog(user.ID, "user.privacy.export_data", user.ID, map[string]any{
		"consent_count": len(consents),
	})

	fileName := fmt.Sprintf("user-data-%s-%s.csv", user.ID, time.Now().UTC().Format("20060102150405"))
	return buffer.Bytes(), fileName, nil
}

func sanitizeCSVRows(rows [][]string) {
	for rowIndex := range rows {
		for cellIndex := range rows[rowIndex] {
			rows[rowIndex][cellIndex] = sanitizeCSVCell(rows[rowIndex][cellIndex])
		}
	}
}

func sanitizeCSVCell(value string) string {
	trimmed := strings.TrimLeftFunc(value, unicode.IsSpace)
	if trimmed == "" {
		return value
	}
	switch trimmed[0] {
	case '=', '+', '-', '@':
		return "'" + value
	default:
		return value
	}
}
