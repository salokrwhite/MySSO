package http

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"mysso/backend/internal/domain"
)

type addIPBlacklistRequest struct {
	IPAddress string `json:"ip_address"`
	Reason    string `json:"reason"`
	ExpiresAt string `json:"expires_at"`
}

type markRiskFalsePositiveRequest struct {
	Note  string `json:"note"`
	Hours int    `json:"hours"`
}

type deleteRiskEventsRequest struct {
	DeleteAll bool   `json:"delete_all"`
	StartAt   string `json:"start_at"`
	EndAt     string `json:"end_at"`
}

func (s *Server) handleAdminRiskEvents(c *gin.Context) {
	page := queryInt(c, "page", 1)
	pageSize := clampPageSize(queryInt(c, "page_size", 20))
	events, total, err := s.services.Risk.ListRiskEvents(page, pageSize, strings.TrimSpace(c.Query("user_id")), strings.TrimSpace(c.Query("event_type")), strings.TrimSpace(c.Query("level")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": events, "total": total, "page": page, "page_size": pageSize})
}

func (s *Server) handleAdminDeleteRiskEvents(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	var req deleteRiskEventsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.DeleteAll && (strings.TrimSpace(req.StartAt) != "" || strings.TrimSpace(req.EndAt) != "") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "start_at and end_at must be empty when delete_all is true"})
		return
	}
	var startAt *time.Time
	var endAt *time.Time
	if !req.DeleteAll {
		start, err := parseOptionalRiskTime(req.StartAt)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "start_at must be RFC3339"})
			return
		}
		end, err := parseOptionalRiskTime(req.EndAt)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "end_at must be RFC3339"})
			return
		}
		startAt = start
		endAt = end
	}
	deleted, err := s.services.Risk.DeleteRiskEvents(req.DeleteAll, startAt, endAt)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	s.services.Audit.Record(admin.ID, admin.Role, "admin.risk.events.delete", "", map[string]any{
		"delete_all": req.DeleteAll,
		"start_at":   req.StartAt,
		"end_at":     req.EndAt,
		"deleted":    deleted,
	})
	c.JSON(http.StatusOK, gin.H{"deleted": deleted})
}

func (s *Server) handleAdminRiskAccountSummaries(c *gin.Context) {
	page := queryInt(c, "page", 1)
	pageSize := clampPageSize(queryInt(c, "page_size", 20))
	items, total, err := s.services.Risk.ListRiskAccountSummaries(page, pageSize, strings.TrimSpace(c.Query("user_id")), strings.TrimSpace(c.Query("level")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": items, "total": total, "page": page, "page_size": pageSize})
}

func (s *Server) handleAdminRiskStats(c *gin.Context) {
	stats, err := s.services.Risk.Stats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": stats})
}

func (s *Server) handleAdminClearUserRiskProfile(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	userID := strings.TrimSpace(c.Param("user_id"))
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}
	if !s.ensureRiskTargetUser(c, userID) {
		return
	}
	mitigatedUntil, err := s.services.Risk.ClearUserRiskProfile(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	detail := map[string]any{"mitigation_enabled": mitigatedUntil != nil}
	if mitigatedUntil != nil {
		detail["mitigated_until"] = mitigatedUntil.Format(time.RFC3339)
	}
	s.services.Audit.Record(admin.ID, admin.Role, "admin.risk.profile.clear", userID, detail)
	c.JSON(http.StatusOK, gin.H{"updated": true, "mitigated_until": mitigatedUntil})
}

func (s *Server) handleAdminMarkUserRiskFalsePositive(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	userID := strings.TrimSpace(c.Param("user_id"))
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}
	if !s.ensureRiskTargetUser(c, userID) {
		return
	}
	var req markRiskFalsePositiveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := s.services.Risk.MarkUserRiskFalsePositive(userID, req.Note, req.Hours); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	s.services.Audit.Record(admin.ID, admin.Role, "admin.risk.profile.false_positive", userID, map[string]any{"hours": req.Hours, "note": strings.TrimSpace(req.Note)})
	c.JSON(http.StatusOK, gin.H{"updated": true})
}

func (s *Server) ensureRiskTargetUser(c *gin.Context, userID string) bool {
	if err := s.services.Risk.ValidateUserRiskTarget(userID); err != nil {
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return false
		}
		if strings.Contains(err.Error(), "administrator") {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return false
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return false
	}
	return true
}

func (s *Server) handleAdminIPBlacklist(c *gin.Context) {
	items, err := s.services.Risk.ListIPBlacklist()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": items})
}

func (s *Server) handleAdminAddIPBlacklist(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	var req addIPBlacklistRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ip := strings.TrimSpace(req.IPAddress)
	if ip == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ip address is required"})
		return
	}
	var expiresAt *time.Time
	if raw := strings.TrimSpace(req.ExpiresAt); raw != "" {
		parsed, err := time.Parse(time.RFC3339, raw)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "expires_at must be RFC3339"})
			return
		}
		expiresAt = &parsed
	}
	if err := s.services.Risk.AddIPBlacklist(domain.IPBlacklistEntry{
		ID:        uuid.NewString(),
		IPAddress: ip,
		Reason:    strings.TrimSpace(req.Reason),
		CreatedBy: admin.ID,
		CreatedAt: time.Now().UTC(),
		ExpiresAt: expiresAt,
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	s.services.Audit.Record(admin.ID, admin.Role, "admin.risk.ip_blacklist.add", ip, map[string]any{"reason": req.Reason})
	c.JSON(http.StatusOK, gin.H{"updated": true})
}

func (s *Server) handleAdminRemoveIPBlacklist(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	ip := strings.TrimSpace(c.Param("ip"))
	if err := s.services.Risk.RemoveIPBlacklist(ip); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	s.services.Audit.Record(admin.ID, admin.Role, "admin.risk.ip_blacklist.remove", ip, nil)
	c.JSON(http.StatusOK, gin.H{"updated": true})
}

func parseOptionalRiskTime(raw string) (*time.Time, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil, nil
	}
	parsed, err := time.Parse(time.RFC3339, raw)
	if err != nil {
		return nil, err
	}
	return &parsed, nil
}

func queryInt(c *gin.Context, key string, fallback int) int {
	value, err := strconv.Atoi(strings.TrimSpace(c.Query(key)))
	if err != nil {
		return fallback
	}
	return value
}

func clampPageSize(value int) int {
	if value < 1 {
		return 20
	}
	if value > 200 {
		return 200
	}
	return value
}
