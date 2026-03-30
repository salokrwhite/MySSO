package user

import (
	"fmt"
	"strings"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/security"
	"mysso/backend/internal/service/common/authutil"
)

func AllowsAuthenticatedAccess(user domain.User) bool {
	return authutil.AllowsAuthenticatedAccess(user)
}

func (s *UserService) VerifyCurrentPassword(user domain.User, currentPassword, ip, deviceID string) error {
	currentPassword = strings.TrimSpace(currentPassword)
	if currentPassword == "" {
		return fmt.Errorf("current password is required")
	}

	attempt := userAttemptAuditContext{
		Kind:       "password_reauth",
		Identifier: user.ID,
		IP:         strings.TrimSpace(ip),
		DeviceID:   strings.TrimSpace(deviceID),
		User:       &user,
	}
	if err := s.checkUserAttempt(attempt); err != nil {
		return err
	}
	if !security.VerifyPassword(currentPassword, user.Password) {
		if limitErr := s.failUserAttempt(attempt, "invalid_password"); limitErr != nil {
			return limitErr
		}
		return fmt.Errorf("current password is incorrect")
	}
	s.resetUserAttempt(attempt)
	return nil
}

func (s *UserService) VerifyCurrentMFA(user domain.User, currentMFACode, ip, deviceID string) error {
	if !authutil.EffectiveUserMFAEnabled(user) {
		return nil
	}
	currentMFACode = strings.TrimSpace(currentMFACode)
	if currentMFACode == "" {
		return fmt.Errorf("current mfa code is required")
	}

	attempt := userAttemptAuditContext{
		Kind:       "mfa_reauth",
		Identifier: user.ID,
		IP:         strings.TrimSpace(ip),
		DeviceID:   strings.TrimSpace(deviceID),
		User:       &user,
	}
	if err := s.checkUserAttempt(attempt); err != nil {
		return err
	}

	var err error
	switch authutil.EffectiveUserMFAMethod(user) {
	case "email":
		var verification domain.EmailVerificationCode
		verification, err = s.deps.Store.GetEmailVerificationCode(strings.TrimSpace(user.Email), "mfa_login", currentMFACode)
		if err == nil {
			err = s.deps.Store.ConsumeEmailVerificationCode(verification.ID)
		}
	case "sms":
		var verification domain.SMSVerificationCode
		verification, err = s.deps.Store.GetSMSVerificationCode(strings.TrimSpace(user.Phone), "mfa_login", currentMFACode)
		if err == nil {
			err = s.deps.Store.ConsumeSMSVerificationCode(verification.ID)
		}
	default:
		if strings.TrimSpace(user.MFASecret) == "" || strings.TrimSpace(user.MFASecret) != currentMFACode {
			err = fmt.Errorf("invalid current mfa code")
		}
	}
	if err != nil {
		if limitErr := s.failUserAttempt(attempt, "invalid_code"); limitErr != nil {
			return limitErr
		}
		return fmt.Errorf("invalid current mfa code")
	}
	s.resetUserAttempt(attempt)
	return nil
}

func (s *UserService) InvalidateAuthForSecurityEvent(user *domain.User) error {
	if user == nil {
		return fmt.Errorf("user is required")
	}
	user.AuthVersion++
	return s.deps.Store.UpdateUserAndInvalidateAuth(*user)
}
