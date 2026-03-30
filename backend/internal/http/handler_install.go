package http

import (
	"net"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"mysso/backend/internal/config"
	installsvc "mysso/backend/internal/install"
	"mysso/backend/internal/service"
	storemysql "mysso/backend/internal/store/mysql"
)

func (s *Server) handleInstallStatus(c *gin.Context) {
	c.JSON(http.StatusOK, s.installer.Status())
}

func (s *Server) handleInstallValidateDB(c *gin.Context) {
	if !s.requireInstallAccess(c) {
		return
	}
	var req installValidateDBRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	err := s.installer.ValidateDB(toInstallDBConfig(req.DB.Driver, req.DB.Host, req.DB.Port, req.DB.Name, req.DB.User, req.DB.Password, req.DB.Charset))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func (s *Server) handleInstallComplete(c *gin.Context) {
	if !s.requireInstallAccess(c) {
		return
	}
	var req installCompleteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	payload := installsvc.CompleteRequest{
		DB:               toInstallDBConfig(req.DB.Driver, req.DB.Host, req.DB.Port, req.DB.Name, req.DB.User, req.DB.Password, req.DB.Charset),
		PublicBaseURL:    req.PublicBaseURL,
		FrontendBaseURL:  req.FrontendBaseURL,
		Issuer:           req.Issuer,
		AdminEmail:       req.AdminEmail,
		AdminDisplayName: req.AdminDisplayName,
		AdminPassword:    req.AdminPassword,
	}
	if err := s.installer.Complete(payload); err != nil {
		status := http.StatusBadRequest
		if err == installsvc.ErrAlreadyInstalled {
			status = http.StatusConflict
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}
	db, err := storemysql.Open(payload.DB)
	if err != nil {
		c.JSON(http.StatusCreated, gin.H{"installed": true, "reload_required": true})
		return
	}
	runtimeCfg := config.Default()
	if err := installsvc.ApplyRuntimeSettings(db, &runtimeCfg); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	runtimeCfg.DB = payload.DB
	s.cfg = runtimeCfg
	s.installer = installsvc.NewService(s.cfg)
	services, err := service.NewServices(runtimeCfg, storemysql.NewStore(db))
	if err != nil {
		c.JSON(http.StatusCreated, gin.H{
			"installed":       true,
			"reload_required": true,
			"message":         "installation completed, restart the service to load runtime configuration",
		})
		return
	}
	s.services = services
	s.startCleanupWorker()
	c.JSON(http.StatusCreated, gin.H{"installed": true})
}

func (s *Server) requireInstallAccess(c *gin.Context) bool {
	if s.installer.Status().Installed {
		c.AbortWithStatus(http.StatusNotFound)
		return false
	}
	if !s.cfg.Install.Enabled {
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "installation endpoints are disabled"})
		return false
	}
	if !s.cfg.Install.AllowRemote && !isLoopbackRemoteAddr(c.Request.RemoteAddr) {
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "installation is restricted to local access"})
		return false
	}
	return true
}

func isLoopbackRemoteAddr(remoteAddr string) bool {
	host, _, err := net.SplitHostPort(strings.TrimSpace(remoteAddr))
	if err != nil {
		host = strings.TrimSpace(remoteAddr)
	}
	ip := net.ParseIP(host)
	return ip != nil && ip.IsLoopback()
}
