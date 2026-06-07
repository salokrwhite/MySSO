package http

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"mysso/backend/internal/domain"
)

const qrLoginPollCookieName = "mysso_qr_poll"

func (s *Server) handleCreateQRLoginChallenge(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	if ok, retryAfter := s.rateLimiter.allow("qr-login:create:"+c.ClientIP(), 30, time.Minute, time.Now().UTC()); !ok {
		c.Header("Retry-After", retryAfter.Truncate(time.Second).String())
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "too many qr login requests"})
		return
	}
	result, err := s.services.Auth.CreateQRLoginChallenge(c.ClientIP(), c.GetHeader("User-Agent"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	s.setQRLoginPollCookie(c, result.PollNonce, result.ExpiresAt)
	c.JSON(http.StatusOK, gin.H{
		"challenge_token": result.ChallengeToken,
		"scan_token":      result.ScanToken,
		"expires_at":      result.ExpiresAt,
	})
}

func (s *Server) handleGetQRLoginStatus(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	pollNonce, err := c.Cookie(qrLoginPollCookieName)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "qr login challenge expired or invalid"})
		return
	}
	result, err := s.services.Auth.GetQRLoginStatus(c.Param("challenge_token"), pollNonce)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	response := gin.H{
		"status":     result.Status,
		"expires_at": result.ExpiresAt,
	}
	if result.Status == domain.QRLoginStatusConfirmed {
		s.clearQRLoginPollCookie(c)
		if result.Flow.User.ID != "" {
			flowPayload, hasSession := buildLoginFlowPayload(result.Flow)
			for key, value := range flowPayload {
				response[key] = value
			}
			if hasSession {
				s.setSessionCookie(c, result.Flow.Session.Token, result.Flow.Session.ExpiresAt)
			}
		} else if result.Session.Token != "" {
			s.setSessionCookie(c, result.Session.Token, result.Session.ExpiresAt)
			response["user"] = result.User
		}
	}
	if result.Status == domain.QRLoginStatusCancelled {
		s.clearQRLoginPollCookie(c)
	}
	c.JSON(http.StatusOK, response)
}

func (s *Server) setQRLoginPollCookie(c *gin.Context, nonce string, expiresAt time.Time) {
	maxAge := int(time.Until(expiresAt).Seconds())
	if maxAge < 1 {
		maxAge = 1
	}
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(qrLoginPollCookieName, nonce, maxAge, "/api/auth/qr-login", "", s.shouldUseSecureSessionCookie(c), true)
}

func (s *Server) clearQRLoginPollCookie(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(qrLoginPollCookieName, "", -1, "/api/auth/qr-login", "", s.shouldUseSecureSessionCookie(c), true)
}

func (s *Server) handleScanQRLogin(c *gin.Context) {
	var req qrLoginScanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result, err := s.services.Auth.ScanQRLogin(req.ScanToken, s.extractSessionToken(c))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"status":     result.Status,
		"expires_at": result.ExpiresAt,
		"user":       result.User,
	})
}

func (s *Server) handleConfirmQRLogin(c *gin.Context) {
	var req qrLoginConfirmRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result, err := s.services.Auth.ConfirmQRLogin(req.ScanToken, s.extractSessionToken(c), c.ClientIP(), c.GetHeader("User-Agent"), req.Confirm, deviceBindingInput(req.DeviceKeyID, req.DevicePublicKey))
	if err != nil {
		if writeSecurityFlowError(c, err) {
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"status":     result.Status,
		"expires_at": result.ExpiresAt,
		"user":       result.User,
	})
}
