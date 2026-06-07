package http

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"mysso/backend/internal/domain"
	riskservice "mysso/backend/internal/service/risk"
)

func (s *Server) requireDeveloperRiskAllowed(c *gin.Context, user domain.User, operation string) bool {
	if s == nil || s.services == nil || s.services.Risk == nil || user.Role == domain.RoleAdmin {
		return true
	}
	clientRisk := getClientRisk(c)
	deviceID := s.ensureDeviceIDCookie(c)
	assessment, err := s.services.Risk.AssessSecurityOperation(user, c.ClientIP(), deviceID, operation)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "risk assessment failed"})
		return false
	}
	if assessment.Action == riskservice.ActionAllow {
		return true
	}
	s.services.Risk.RecordLogin(user.ID, c.ClientIP(), "", riskservice.ClientInfo{
		ClientType:  clientRisk.ClientType,
		Fingerprint: strings.TrimSpace(deviceID),
		Signals:     []string{operation},
		UserAgent:   c.Request.UserAgent(),
	}, assessment, false)
	c.JSON(http.StatusForbidden, gin.H{
		"error":       "access_denied",
		"risk_action": assessment.Action,
		"risk_level":  assessment.Level,
		"risk_score":  assessment.Score,
	})
	return false
}
