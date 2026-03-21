package service

import (
	"fmt"
	"strings"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/security"
)

func userAllowsAuthenticatedAccess(user domain.User) bool {
	return user.Status == domain.UserActive
}

func (s *UserService) verifyCurrentPassword(user domain.User, currentPassword, ip, deviceID string) error {
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

func (s *UserService) verifyCurrentMFA(user domain.User, currentMFACode, ip, deviceID string) error {
	if !effectiveUserMFAEnabled(user) {
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
	switch effectiveUserMFAMethod(user) {
	case "email":
		var verification domain.EmailVerificationCode
		verification, err = s.deps.store.GetEmailVerificationCode(strings.TrimSpace(user.Email), "mfa_login", currentMFACode)
		if err == nil {
			err = s.deps.store.ConsumeEmailVerificationCode(verification.ID)
		}
	case "sms":
		var verification domain.SMSVerificationCode
		verification, err = s.deps.store.GetSMSVerificationCode(strings.TrimSpace(user.Phone), "mfa_login", currentMFACode)
		if err == nil {
			err = s.deps.store.ConsumeSMSVerificationCode(verification.ID)
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

func (s *UserService) invalidateAuthForSecurityEvent(user *domain.User) error {
	if user == nil {
		return fmt.Errorf("user is required")
	}
	user.AuthVersion++
	return s.deps.store.UpdateUserAndInvalidateAuth(*user)
}
