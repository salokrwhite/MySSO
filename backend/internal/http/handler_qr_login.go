package http

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"mysso/backend/internal/domain"
)

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
	result, err := s.services.Auth.GetQRLoginStatus(c.Param("challenge_token"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	response := gin.H{
		"status":     result.Status,
		"expires_at": result.ExpiresAt,
	}
	if result.Status == domain.QRLoginStatusConfirmed && result.Session.Token != "" {
		s.setSessionCookie(c, result.Session.Token, result.Session.ExpiresAt)
		response["user"] = result.User
	}
	c.JSON(http.StatusOK, response)
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
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"status":     result.Status,
		"expires_at": result.ExpiresAt,
		"user":       result.User,
	})
}
