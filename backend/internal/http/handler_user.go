package http

import (
	"errors"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/gin-gonic/gin"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/service"
)

func (s *Server) handleSendProfileSMSCode(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	var req smsCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	cooldownSeconds, err := s.services.User.SendPhoneVerificationCode(user.ID, req.Phone, req.Purpose)
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

func (s *Server) handleMe(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	avatarURL, err := s.services.User.GetUserAvatarURL(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	announcementEnabled, announcementContent, err := s.services.User.GetUserAnnouncement(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"user": buildUserResponse(user, avatarURL, announcementEnabled, announcementContent)})
}

func (s *Server) handleListPasskeys(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	items, err := s.services.Passkey.ListPasskeys(user.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": items})
}

func (s *Server) handlePreparePasskeyRegistration(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	deviceID := s.ensureDeviceIDCookie(c)
	var req passkeyRegisterOptionsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result, err := s.services.Passkey.PrepareRegistration(user.ID, req.CurrentPassword, req.CurrentMFACode, c.ClientIP(), deviceID)
	if err != nil {
		if writeSecurityFlowError(c, err) {
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}

func (s *Server) handleCompletePasskeyRegistration(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	deviceID := s.ensureDeviceIDCookie(c)
	var req passkeyRegisterVerifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	item, err := s.services.Passkey.CompleteRegistration(user.ID, req.ChallengeToken, req.Credential, req.Name, req.CurrentPassword, req.CurrentMFACode, c.ClientIP(), deviceID)
	if err != nil {
		if writeSecurityFlowError(c, err) {
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"item": item})
}

func (s *Server) handleDeletePasskey(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	deviceID := s.ensureDeviceIDCookie(c)
	var req deletePasskeyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := s.services.Passkey.DeletePasskey(user.ID, c.Param("id"), req.CurrentPassword, req.CurrentMFACode, c.ClientIP(), deviceID); err != nil {
		if writeSecurityFlowError(c, err) {
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func (s *Server) handleUpdateProfile(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	deviceID := s.ensureDeviceIDCookie(c)
	var req updateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	updatedUser := user
	authInvalidated := false
	var err error
	if strings.TrimSpace(req.DisplayName) != "" {
		updatedUser, err = s.services.User.UpdateUserDisplayName(updatedUser.ID, req.DisplayName)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	}
	if req.Gender != nil {
		updatedUser, err = s.services.User.UpdateUserGender(updatedUser.ID, *req.Gender)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	}
	if strings.TrimSpace(req.Email) != "" {
		updatedUser, err = s.services.User.UpdateUserEmail(updatedUser.ID, req.Email, req.Code, req.CurrentPassword, c.ClientIP(), deviceID)
		if err != nil {
			if writeSecurityFlowError(c, err) {
				return
			}
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		authInvalidated = true
	}
	if strings.TrimSpace(req.Phone) != "" {
		updatedUser, err = s.services.User.UpdateUserPhone(updatedUser.ID, req.Phone, req.Code, req.CurrentPhoneCode, req.CurrentPassword, c.ClientIP(), deviceID)
		if err != nil {
			if writeSecurityFlowError(c, err) {
				return
			}
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		authInvalidated = true
	}
	if req.PreferredLocale != nil {
		updatedUser, err = s.services.User.UpdateUserPreferredLocale(updatedUser.ID, *req.PreferredLocale)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	}
	if strings.TrimSpace(req.DisplayName) == "" &&
		req.Gender == nil &&
		strings.TrimSpace(req.Email) == "" &&
		strings.TrimSpace(req.Phone) == "" &&
		req.PreferredLocale == nil &&
		strings.TrimSpace(req.Code) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no profile changes provided"})
		return
	}
	avatarURL, err := s.services.User.GetUserAvatarURL(updatedUser.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	announcementEnabled, announcementContent, err := s.services.User.GetUserAnnouncement(updatedUser.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if authInvalidated {
		s.clearSessionCookie(c)
	}
	c.JSON(http.StatusOK, gin.H{"user": buildUserResponse(updatedUser, avatarURL, announcementEnabled, announcementContent)})
}

func (s *Server) handleUpdateMFA(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	deviceID := s.ensureDeviceIDCookie(c)
	var req updateMFARequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	updatedUser, err := s.services.User.UpdateUserMFA(user.ID, req.Enabled, req.Method, req.CurrentPassword, req.CurrentMFACode, c.ClientIP(), deviceID)
	if err != nil {
		if writeSecurityFlowError(c, err) {
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	avatarURL, err := s.services.User.GetUserAvatarURL(updatedUser.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	announcementEnabled, announcementContent, err := s.services.User.GetUserAnnouncement(updatedUser.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	s.clearSessionCookie(c)
	c.JSON(http.StatusOK, gin.H{"user": buildUserResponse(updatedUser, avatarURL, announcementEnabled, announcementContent)})
}

func (s *Server) handleSendCurrentMFACode(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	deviceID := s.ensureDeviceIDCookie(c)
	var req currentMFACodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	cooldownSeconds, method, err := s.services.User.SendCurrentMFACode(user.ID, req.CurrentPassword, c.ClientIP(), deviceID)
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

func (s *Server) handleUploadUserAvatar(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	avatarURL, err := s.storeUploadedImage(c, "file", "user-avatar")
	if err != nil {
		if errors.Is(err, http.ErrMissingFile) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "missing avatar file"})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	targetPath := strings.TrimPrefix(avatarURL, "/")
	if err := s.services.User.UpdateUserAvatarURL(user.ID, avatarURL); err != nil {
		_ = os.Remove(targetPath)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": uploadSiteLogoResponse{URL: avatarURL}})
}

func (s *Server) handleUpdatePassword(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	deviceID := s.ensureDeviceIDCookie(c)
	var req updatePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := s.services.User.UpdateUserPassword(user.ID, req.CurrentPassword, req.NewPassword, c.ClientIP(), deviceID); err != nil {
		if writeSecurityFlowError(c, err) {
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	s.clearSessionCookie(c)
	c.JSON(http.StatusOK, gin.H{"updated": true})
}

func (s *Server) handleRequestAccountDeletion(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	deviceID := s.ensureDeviceIDCookie(c)
	var req requestAccountDeletionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	updatedUser, err := s.services.User.RequestUserDeletion(user.ID, req.CurrentPassword, req.EmailCode, req.PhoneCode, c.ClientIP(), deviceID)
	if err != nil {
		if writeSecurityFlowError(c, err) {
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	s.clearSessionCookie(c)
	c.JSON(http.StatusOK, gin.H{
		"scheduled":             true,
		"deletion_requested_at": updatedUser.DeletionRequestedAt,
		"deletion_scheduled_at": updatedUser.DeletionScheduledAt,
		"grace_period_days":     7,
	})
}

func (s *Server) handleExportUserData(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	deviceID := s.ensureDeviceIDCookie(c)
	var req exportUserDataRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	content, fileName, err := s.services.User.ExportUserDataCSV(user.ID, req.CurrentPassword, c.ClientIP(), deviceID)
	if err != nil {
		if writeSecurityFlowError(c, err) {
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.Header("Content-Type", "text/csv; charset=utf-8")
	c.Header("Content-Disposition", "attachment; filename*=UTF-8''"+url.QueryEscape(fileName))
	c.Data(http.StatusOK, "text/csv; charset=utf-8", content)
}

func (s *Server) handleConsents(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	c.JSON(http.StatusOK, gin.H{"items": s.services.Consent.ListConsents(user.ID)})
}

func (s *Server) handleRevokeConsent(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	if err := s.services.Consent.RevokeConsent(user.ID, c.Param("id")); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

func (s *Server) handleBatchRevokeConsents(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	var req batchConsentsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := s.services.Consent.BatchRevokeConsents(user.ID, req.ConsentIDs); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"revoked": true})
}
