package http

import (
	"errors"
	"net/http"
	"net/url"
	"strings"

	"github.com/gin-gonic/gin"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/service"
)

func writeLoginFlowResponse(c *gin.Context, s *Server, result service.PasswordLoginResult) {
	if result.RequiresMFA {
		c.JSON(http.StatusOK, gin.H{
			"requires_mfa":    true,
			"challenge_token": result.ChallengeToken,
			"mfa_method":      result.MFAMethod,
			"masked_target":   result.MaskedTarget,
		})
		return
	}
	if result.RequiresDeletionConfirmation {
		c.JSON(http.StatusOK, gin.H{
			"requires_deletion_confirmation": true,
			"deletion_challenge_token":       result.DeletionChallengeToken,
			"deletion_scheduled_at":          result.DeletionScheduledAt,
			"user":                           result.User,
		})
		return
	}
	if result.RequiresPhoneBinding {
		c.JSON(http.StatusOK, gin.H{
			"requires_phone_binding":        true,
			"phone_binding_challenge_token": result.PhoneBindingChallengeToken,
			"phone_binding_reason":          result.PhoneBindingReason,
			"user":                          result.User,
		})
		return
	}
	if result.RequiresStepUpVerification {
		c.JSON(http.StatusOK, gin.H{
			"requires_step_up_verification": true,
			"step_up_challenge_token":       result.StepUpChallengeToken,
			"step_up_mode":                  result.StepUpMode,
			"masked_email_target":           result.MaskedEmailTarget,
			"masked_phone_target":           result.MaskedPhoneTarget,
			"user":                          result.User,
		})
		return
	}
	if result.RequiresMFAEnrollmentSetup {
		c.JSON(http.StatusOK, gin.H{
			"requires_mfa_enrollment_setup":  true,
			"mfa_enrollment_challenge_token": result.MFAEnrollmentChallengeToken,
			"available_mfa_methods":          result.AvailableMFAMethods,
			"user":                           result.User,
		})
		return
	}
	s.setSessionCookie(c, result.Session.Token, result.Session.ExpiresAt)
	c.JSON(http.StatusOK, gin.H{"user": result.User})
}

func (s *Server) handleLogin(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	deviceID := s.ensureDeviceIDCookie(c)
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result, err := s.services.Auth.StartPasswordLogin(req.Email, req.Password, c.ClientIP(), deviceID)
	if err != nil {
		if writeSecurityFlowError(c, err) {
			return
		}
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	writeLoginFlowResponse(c, s, result)
}

func (s *Server) handlePreparePasskeyLogin(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	result, err := s.services.Passkey.PrepareLogin()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}

func (s *Server) handleCompletePasskeyLogin(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	deviceID := s.ensureDeviceIDCookie(c)
	var req passkeyVerifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result, err := s.services.Passkey.CompleteLogin(req.ChallengeToken, req.Credential, c.ClientIP(), deviceID, c.Request.UserAgent())
	if err != nil {
		if writeSecurityFlowError(c, err) {
			return
		}
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	writeLoginFlowResponse(c, s, result)
}

func (s *Server) handleOTPLogin(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	deviceID := s.ensureDeviceIDCookie(c)
	var req otpRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result, err := s.services.Auth.LoginWithOTP(req.Email, req.OTP, c.ClientIP(), deviceID)
	if err != nil {
		if writeSecurityFlowError(c, err) {
			return
		}
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	writeLoginFlowResponse(c, s, result)
}

func (s *Server) handleSMSLogin(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	deviceID := s.ensureDeviceIDCookie(c)
	var req smsLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result, err := s.services.Auth.LoginWithPhoneOTP(req.Phone, req.OTP, c.ClientIP(), deviceID)
	if err != nil {
		if writeSecurityFlowError(c, err) {
			return
		}
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	writeLoginFlowResponse(c, s, result)
}

func (s *Server) handleSendEmailCode(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	var req emailCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	cooldownSeconds, err := s.services.Auth.SendPublicEmailVerificationCode(req.Email, req.Country, req.Purpose, req.ChallengeToken, req.CaptchaToken, c.ClientIP(), c.Request.UserAgent())
	if err != nil {
		var cooldownErr *service.VerificationCooldownError
		if errors.As(err, &cooldownErr) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":               err.Error(),
				"retry_after_seconds": cooldownErr.RetryAfterSeconds,
				"cooldown_seconds":    cooldownSeconds,
			})
			return
		}
		if writeSecurityFlowError(c, err) {
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"sent": true, "cooldown_seconds": cooldownSeconds})
}

func (s *Server) handleSendChallenge(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	var req sendChallengeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result, err := s.services.Auth.CreatePublicSendChallenge(req.Purpose, req.Channel, req.Target, c.ClientIP(), c.Request.UserAgent())
	if err != nil {
		if writeSecurityFlowError(c, err) {
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"challenge_token":  result.ChallengeToken,
		"expires_in":       result.ExpiresIn,
		"captcha_required": result.CaptchaRequired,
	})
}

func (s *Server) handleSendMFAChallenge(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	deviceID := s.ensureDeviceIDCookie(c)
	var req mfaChallengeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	cooldownSeconds, method, err := s.services.Auth.SendPasswordLoginMFAChallenge(req.Email, req.Password, c.ClientIP(), deviceID)
	if err != nil {
		var cooldownErr *service.VerificationCooldownError
		if errors.As(err, &cooldownErr) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":               err.Error(),
				"retry_after_seconds": cooldownErr.RetryAfterSeconds,
				"cooldown_seconds":    cooldownSeconds,
				"method":              method,
			})
			return
		}
		if writeSecurityFlowError(c, err) {
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"sent": true, "cooldown_seconds": cooldownSeconds, "method": method})
}

func (s *Server) handleCompleteMFALogin(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	deviceID := s.ensureDeviceIDCookie(c)
	var req completeMFALoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result, err := s.services.Auth.CompletePasswordLoginMFA(req.ChallengeToken, req.OTP, c.ClientIP(), deviceID)
	if err != nil {
		if writeSecurityFlowError(c, err) {
			return
		}
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	writeLoginFlowResponse(c, s, result)
}

func (s *Server) handleConfirmDeletionLogin(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	s.ensureDeviceIDCookie(c)
	var req confirmDeletionLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result, err := s.services.Auth.ConfirmDeletionLogin(req.ChallengeToken, c.ClientIP())
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	writeLoginFlowResponse(c, s, result)
}

func (s *Server) handleResendMFALogin(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	deviceID := s.ensureDeviceIDCookie(c)
	var req resendMFALoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	cooldownSeconds, method, maskedTarget, err := s.services.Auth.ResendPasswordLoginMFAChallenge(req.ChallengeToken, c.ClientIP(), deviceID)
	if err != nil {
		var cooldownErr *service.VerificationCooldownError
		if errors.As(err, &cooldownErr) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":               err.Error(),
				"retry_after_seconds": cooldownErr.RetryAfterSeconds,
				"cooldown_seconds":    cooldownSeconds,
				"method":              method,
				"masked_target":       maskedTarget,
			})
			return
		}
		if writeSecurityFlowError(c, err) {
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"sent": true, "cooldown_seconds": cooldownSeconds, "method": method, "masked_target": maskedTarget})
}

func (s *Server) handleSendSMSCode(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	var req smsCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	cooldownSeconds, err := s.services.Auth.SendPublicSMSVerificationCode(req.Phone, req.Purpose, req.ChallengeToken, req.CaptchaToken, c.ClientIP(), c.Request.UserAgent())
	if err != nil {
		var cooldownErr *service.VerificationCooldownError
		if errors.As(err, &cooldownErr) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":               err.Error(),
				"retry_after_seconds": cooldownErr.RetryAfterSeconds,
				"cooldown_seconds":    cooldownSeconds,
			})
			return
		}
		if writeSecurityFlowError(c, err) {
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"sent": true, "cooldown_seconds": cooldownSeconds})
}

func writeSecurityFlowError(c *gin.Context, err error) bool {
	return false
}

func (s *Server) handleRegister(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	deviceID := s.ensureDeviceIDCookie(c)
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := s.services.Auth.Register(service.RegisterInput{
		Country:  req.Country,
		Email:    req.Email,
		Code:     req.Code,
		Password: req.Password,
		Role:     domain.RoleUser,
		IP:       c.ClientIP(),
		DeviceID: deviceID,
	})
	if err != nil {
		if writeSecurityFlowError(c, err) {
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"created":                       true,
		"user":                          result.User,
		"requires_phone_binding":        result.RequiresPhoneBinding,
		"phone_binding_challenge_token": result.PhoneBindingChallengeToken,
		"phone_binding_reason":          result.PhoneBindingReason,
	})
}

func (s *Server) handleSendPhoneBindingCode(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	var req phoneBindingCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	cooldownSeconds, err := s.services.Auth.SendPhoneBindingVerificationCode(req.ChallengeToken, req.Phone)
	if err != nil {
		var cooldownErr *service.VerificationCooldownError
		if errors.As(err, &cooldownErr) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":               err.Error(),
				"retry_after_seconds": cooldownErr.RetryAfterSeconds,
				"cooldown_seconds":    cooldownSeconds,
			})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"sent": true, "cooldown_seconds": cooldownSeconds})
}

func (s *Server) handleCompletePhoneBinding(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	deviceID := s.ensureDeviceIDCookie(c)
	var req completePhoneBindingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result, err := s.services.Auth.CompletePhoneBinding(req.ChallengeToken, req.Phone, req.Code, c.ClientIP(), deviceID)
	if err != nil {
		if writeSecurityFlowError(c, err) {
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	writeLoginFlowResponse(c, s, result)
}

func (s *Server) handleSendLoginStepUpCode(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	var req sendLoginStepUpCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	cooldownSeconds, maskedTarget, err := s.services.Auth.SendLoginStepUpCode(req.ChallengeToken, req.Channel)
	if err != nil {
		var cooldownErr *service.VerificationCooldownError
		if errors.As(err, &cooldownErr) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":               err.Error(),
				"retry_after_seconds": cooldownErr.RetryAfterSeconds,
				"cooldown_seconds":    cooldownSeconds,
				"masked_target":       maskedTarget,
			})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"sent": true, "cooldown_seconds": cooldownSeconds, "masked_target": maskedTarget})
}

func (s *Server) handleCompleteLoginStepUp(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	var req completeLoginStepUpRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result, err := s.services.Auth.CompleteLoginStepUp(req.ChallengeToken, req.EmailOTP, req.SMSOTP, c.ClientIP())
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	writeLoginFlowResponse(c, s, result)
}

func (s *Server) handleCompleteLoginMFAEnrollment(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	var req completeLoginMFAEnrollmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result, err := s.services.Auth.CompleteForcedMFAEnrollment(req.ChallengeToken, req.Method, c.ClientIP())
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	writeLoginFlowResponse(c, s, result)
}

func (s *Server) handleResetPassword(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	deviceID := s.ensureDeviceIDCookie(c)
	var req resetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := s.services.User.ResetUserPasswordByEmail(req.Email, req.Code, req.NewPassword, c.ClientIP(), deviceID); err != nil {
		if writeSecurityFlowError(c, err) {
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"updated": true})
}

func (s *Server) handleLogout(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	if s.rejectCrossSiteUnsafeRequest(c) {
		return
	}
	sessionToken := s.extractSessionToken(c)
	if sessionToken != "" {
		_ = s.services.Auth.Logout(sessionToken)
	}
	s.clearSessionCookie(c)
	c.JSON(http.StatusOK, gin.H{"logged_out": true})
}

func (s *Server) handleBrowserLogout(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	returnTo := strings.TrimSpace(c.Query("return_to"))
	if returnTo != "" && s.isAllowedLegacyLogoutReturnTo(returnTo) {
		result, err := s.services.OAuth.Logout(s.extractSessionToken(c), "", "", "", "")
		if err == nil {
			result.PostLogoutRedirectURI = returnTo
			s.clearSessionCookie(c)
			c.Redirect(http.StatusFound, s.buildLogoutBridgeURL(result))
			return
		}
	}
	s.handleOIDCLogout(c)
}

func (s *Server) isAllowedLegacyLogoutReturnTo(target string) bool {
	target = strings.TrimSpace(target)
	if target == "" {
		return false
	}
	if strings.HasPrefix(target, "/") && !strings.HasPrefix(target, "//") {
		return true
	}
	parsedTarget, err := url.Parse(target)
	if err != nil {
		return false
	}
	allowedOrigins := []string{strings.TrimRight(s.cfg.HTTP.PublicBase, "/")}
	if s.services != nil && s.services.Settings != nil {
		if settings, err := s.services.Settings.GetSystemSettings(); err == nil && strings.TrimSpace(settings.FrontendBaseURL) != "" {
			allowedOrigins = append(allowedOrigins, strings.TrimRight(strings.TrimSpace(settings.FrontendBaseURL), "/"))
		}
	}
	for _, origin := range allowedOrigins {
		parsedOrigin, err := url.Parse(origin)
		if err == nil && strings.EqualFold(parsedOrigin.Scheme, parsedTarget.Scheme) && strings.EqualFold(parsedOrigin.Host, parsedTarget.Host) {
			return true
		}
	}
	return false
}
