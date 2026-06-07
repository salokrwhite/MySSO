package http

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"mysso/backend/internal/captcha"
	"mysso/backend/internal/domain"
)

type captchaContext struct {
	Flow    string
	Purpose string
	Target  string
}

type captchaProof struct {
	Ticket    string
	Answer    string
	Challenge string
	Sign      string
}

func (s *Server) requireCaptchaForCodeSend(c *gin.Context, ctx captchaContext, proof captchaProof) bool {
	if s == nil || s.services == nil || s.services.Settings == nil || s.captchaService == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "service unavailable"})
		return false
	}
	settings := s.services.Settings.GetCaptchaSettings()
	if !settings.Enabled {
		return true
	}
	req, ok := s.buildCaptchaChallengeRequest(c, ctx)
	if !ok || !s.captchaService.Verify(proof.Ticket, proof.Answer, proof.Challenge, proof.Sign, req) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":            "captcha is invalid or expired",
			"captcha_required": true,
		})
		return false
	}
	return true
}

func (s *Server) buildCaptchaChallengeRequest(c *gin.Context, ctx captchaContext) (captcha.ChallengeRequest, bool) {
	flow := normalizeCaptchaToken(ctx.Flow)
	purpose := normalizeCaptchaToken(ctx.Purpose)
	target := normalizeCaptchaTarget(ctx.Target)
	if !isAllowedCaptchaContext(flow, purpose) || target == "" {
		return captcha.ChallengeRequest{}, false
	}
	subject := "public"
	if raw, ok := c.Get("user"); ok {
		if user, ok := raw.(domain.User); ok && strings.TrimSpace(user.ID) != "" {
			subject = "user:" + strings.TrimSpace(user.ID)
		}
	} else if s != nil && s.services != nil && s.services.Auth != nil {
		if sessionToken := s.extractSessionToken(c); sessionToken != "" {
			if user, _, err := s.services.Auth.CurrentUser(sessionToken); err == nil && strings.TrimSpace(user.ID) != "" {
				subject = "user:" + strings.TrimSpace(user.ID)
			}
		}
	}
	return captcha.ChallengeRequest{
		Flow:    flow,
		Purpose: purpose,
		Target:  target,
		Subject: subject,
		IP:      c.ClientIP(),
	}, true
}

func normalizeCaptchaToken(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

func normalizeCaptchaTarget(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

func isAllowedCaptchaContext(flow, purpose string) bool {
	switch flow {
	case "email_code":
		switch purpose {
		case "login", "register", "reset_password", "change_email", "delete_account":
			return true
		}
	case "sms_code":
		switch purpose {
		case "login", "change_phone", "verify_current_phone", "delete_account":
			return true
		}
	case "mfa_login":
		return purpose == "mfa_login"
	case "password_login_mfa":
		return purpose == "mfa_login"
	case "login_step_up":
		return purpose == "login_step_up"
	case "login_mfa_enrollment":
		return purpose == "login_mfa_enrollment"
	case "phone_binding":
		return purpose == "risk_phone_binding"
	case "current_mfa":
		return purpose == "mfa_login"
	case "password_login_risk":
		return purpose == "risk_login"
	}
	return false
}

func writeCaptchaChallengeError(c *gin.Context) {
	c.JSON(http.StatusBadRequest, gin.H{
		"error":            "captcha challenge is invalid or expired",
		"captcha_required": true,
	})
}

func (s *Server) allowCaptchaRate(c *gin.Context, scope string, limit int) bool {
	if limit <= 0 {
		return true
	}
	allowed, retryAfter := s.rateLimiter.allow("captcha:"+scope+":"+c.ClientIP(), limit, time.Minute, time.Now().UTC())
	if !allowed {
		c.JSON(http.StatusTooManyRequests, gin.H{
			"error":               "captcha request rate limit exceeded",
			"retry_after_seconds": int(retryAfter.Seconds()),
		})
		return false
	}
	return true
}
