package http

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"mysso/backend/internal/domain"
)

func (s *Server) handleDeveloperGroups(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	items, err := s.services.AccessControl.ListDeveloperGroups(user.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": items})
}

func (s *Server) handleCreateDeveloperGroup(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	var req developerGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	item, err := s.services.AccessControl.CreateDeveloperGroup(user.ID, user.ID, req.Name, req.Description)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"item": item})
}

func (s *Server) handleUpdateDeveloperGroup(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	var req developerGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	item, err := s.services.AccessControl.UpdateDeveloperGroup(user.ID, user.ID, c.Param("id"), req.Name, req.Description)
	if err != nil {
		status := http.StatusBadRequest
		if strings.Contains(err.Error(), "forbidden") {
			status = http.StatusForbidden
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"item": item})
}

func (s *Server) handleDeleteDeveloperGroup(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	if err := s.services.AccessControl.DeleteDeveloperGroup(user.ID, user.ID, c.Param("id")); err != nil {
		status := http.StatusBadRequest
		if strings.Contains(err.Error(), "forbidden") {
			status = http.StatusForbidden
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func (s *Server) handleDeveloperManagedUsers(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	page, _ := strconv.Atoi(strings.TrimSpace(c.Query("page")))
	pageSize, _ := strconv.Atoi(strings.TrimSpace(c.Query("page_size")))
	appID := strings.TrimSpace(c.Query("app_id"))
	emailKeyword := strings.TrimSpace(c.Query("email_keyword"))
	result, err := s.services.AccessControl.ListManagedUsersPaginated(user.ID, page, pageSize, appID, emailKeyword)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"items":     result.Items,
		"total":     result.Total,
		"page":      result.Page,
		"page_size": result.PageSize,
	})
}

func (s *Server) handleUpdateDeveloperManagedUserGroups(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	var req developerManagedUserGroupsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := s.services.AccessControl.UpdateManagedUserGroups(user.ID, user.ID, c.Param("user_id"), req.GroupIDs); err != nil {
		status := http.StatusBadRequest
		if strings.Contains(err.Error(), "forbidden") {
			status = http.StatusForbidden
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"updated": true})
}

func (s *Server) handleBatchUpdateDeveloperManagedUserGroups(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	var req batchDeveloperManagedUserGroupsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := s.services.AccessControl.BatchUpdateManagedUserGroups(user.ID, user.ID, req.UserIDs, req.GroupIDs); err != nil {
		status := http.StatusBadRequest
		if strings.Contains(err.Error(), "forbidden") {
			status = http.StatusForbidden
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"updated": true})
}

func (s *Server) handleDeveloperAccessApps(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	items, err := s.services.AccessControl.ListAppAccessViews(user.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": items})
}

func (s *Server) handleUpdateDeveloperAppBindings(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	var req developerAppBindingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := s.services.AccessControl.UpdateAppBindings(user.ID, user.ID, c.Param("id"), req.GroupIDs); err != nil {
		status := http.StatusBadRequest
		if strings.Contains(err.Error(), "forbidden") {
			status = http.StatusForbidden
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"updated": true})
}

func (s *Server) handleCreateDeveloperAppBan(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	var req developerAppBanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var expiresAt *time.Time
	if strings.TrimSpace(req.ExpiresAt) != "" {
		parsed, err := time.Parse(time.RFC3339, strings.TrimSpace(req.ExpiresAt))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid expires_at"})
			return
		}
		expiresAt = &parsed
	}
	item, err := s.services.AccessControl.BanAppUser(user.ID, user.ID, c.Param("id"), req.UserID, req.Reason, expiresAt)
	if err != nil {
		status := http.StatusBadRequest
		if strings.Contains(err.Error(), "forbidden") {
			status = http.StatusForbidden
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"item": item})
}

func (s *Server) handleDeleteDeveloperAppBan(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	if err := s.services.AccessControl.UnbanAppUser(user.ID, user.ID, c.Param("id"), c.Param("user_id")); err != nil {
		status := http.StatusBadRequest
		if strings.Contains(err.Error(), "forbidden") {
			status = http.StatusForbidden
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func (s *Server) handleDeveloperAccessLogs(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	page, _ := strconv.Atoi(strings.TrimSpace(c.Query("page")))
	pageSize, _ := strconv.Atoi(strings.TrimSpace(c.Query("page_size")))
	result, err := s.services.AccessControl.ListDeveloperAccessLogsPaginated(user.ID, page, pageSize)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"items":     result.Items,
		"total":     result.Total,
		"page":      result.Page,
		"page_size": result.PageSize,
	})
}

func (s *Server) handleBatchDeleteDeveloperAccessLogs(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	var req batchDeveloperAccessLogsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := s.services.AccessControl.SoftDeleteDeveloperAccessLogs(user.ID, req.LogIDs); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func (s *Server) handleAdminHardDeleteDeveloperAccessLogs(c *gin.Context) {
	var req batchDeveloperAccessLogsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := s.services.AccessControl.HardDeleteDeveloperAccessLogs(req.LogIDs); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func (s *Server) handleAdminDeveloperAccessLogs(c *gin.Context) {
	page, _ := strconv.Atoi(strings.TrimSpace(c.Query("page")))
	pageSize, _ := strconv.Atoi(strings.TrimSpace(c.Query("page_size")))
	if page <= 0 && pageSize <= 0 {
		items, err := s.services.AccessControl.ListAllDeveloperAccessLogs()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"items": items})
		return
	}
	result, err := s.services.AccessControl.ListAllDeveloperAccessLogsPaginated(page, pageSize)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"items":     result.Items,
		"total":     result.Total,
		"page":      result.Page,
		"page_size": result.PageSize,
	})
}
