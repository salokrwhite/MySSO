package http

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/service"
)

func (s *Server) handleDeveloperApps(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	c.JSON(http.StatusOK, gin.H{"items": s.services.Apps.ListDeveloperApps(user.ID)})
}

func (s *Server) handleDeveloperAuditLogs(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	c.JSON(http.StatusOK, gin.H{"items": s.services.Apps.ListDeveloperAuditLogs(user.ID)})
}

func (s *Server) handleDeveloperAnalytics(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	c.JSON(http.StatusOK, gin.H{"data": s.services.Apps.GetDeveloperAnalytics(user.ID)})
}

func (s *Server) handleDeveloperScopes(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"items": s.services.Apps.ListDeveloperSelectableScopes()})
}

func (s *Server) handleCreateApp(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	var req createAppRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	app, err := s.services.Apps.CreateDeveloperApp(
		user.ID,
		req.Name,
		req.IconURL,
		req.Description,
		req.FrontChannelLogoutURI,
		req.AllowGetSessionLogout,
		req.RedirectURIs,
		req.PostLogoutRedirectURIs,
		req.Scopes,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, app)
}

func (s *Server) handleUpdateDeveloperApp(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	var req createAppRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	app, err := s.services.Apps.UpdateDeveloperApp(
		user.ID,
		c.Param("id"),
		req.Name,
		req.IconURL,
		req.Description,
		req.FrontChannelLogoutURI,
		req.AllowGetSessionLogout,
		req.RedirectURIs,
		req.PostLogoutRedirectURIs,
		req.Scopes,
	)
	if err != nil {
		if err == service.ErrForbidden {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, app)
}

func (s *Server) handleUploadDeveloperAppIcon(c *gin.Context) {
	url, err := s.storeUploadedImage(c, "file", "app-icon")
	if err != nil {
		if errors.Is(err, http.ErrMissingFile) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "missing icon file"})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": uploadSiteLogoResponse{URL: url}})
}

func (s *Server) handleResetSecret(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	app, err := s.services.Apps.ResetAppSecret(user.ID, c.Param("id"))
	if err != nil {
		if err == service.ErrForbidden {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"id":                        app.ID,
		"name":                      app.Name,
		"icon_url":                  app.IconURL,
		"client_id":                 app.ClientID,
		"client_secret":             app.ClientSecret,
		"has_client_secret":         true,
		"redirect_uris":             app.RedirectURIs,
		"post_logout_redirect_uris": app.PostLogoutRedirectURIs,
		"frontchannel_logout_uri":   app.FrontChannelLogoutURI,
		"allow_get_session_logout":  app.AllowGetSessionLogout,
		"scopes":                    app.Scopes,
		"status":                    app.Status,
		"description":               app.Description,
		"review_comment":            app.ReviewComment,
	})
}

func (s *Server) handleDeleteDeveloperApp(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	if err := s.services.Apps.DeleteDeveloperApp(user.ID, c.Param("id")); err != nil {
		if err == service.ErrForbidden {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func (s *Server) handleBatchDeleteDeveloperAuditLogs(c *gin.Context) {
	user := c.MustGet("user").(domain.User)
	var req batchAuditLogsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := s.services.Apps.DeleteDeveloperAuditLogs(user.ID, req.LogIDs); err != nil {
		if err == service.ErrForbidden {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func (s *Server) handleAdminApps(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"items": s.services.Apps.ListApps()})
}

func (s *Server) handlePublicAppByClientID(c *gin.Context) {
	clientID := strings.TrimSpace(c.Param("client_id"))
	if clientID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing client_id"})
		return
	}
	app, err := s.services.Apps.GetAppByClientID(clientID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "application not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"id":                        app.ID,
			"client_id":                 app.ClientID,
			"name":                      app.Name,
			"icon_url":                  app.IconURL,
			"description":               app.Description,
			"post_logout_redirect_uris": app.PostLogoutRedirectURIs,
			"frontchannel_logout_uri":   app.FrontChannelLogoutURI,
		},
	})
}
