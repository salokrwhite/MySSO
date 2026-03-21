package http

import (
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"

	"mysso/backend/internal/config"
	"mysso/backend/internal/domain"
	installsvc "mysso/backend/internal/install"
	"mysso/backend/internal/service"
	"mysso/backend/internal/store"
)

type Server struct {
	engine            *gin.Engine
	cfg               config.Config
	services          *service.Services
	installer         *installsvc.Service
	cleanupWorkerOnce sync.Once
}

const sessionCookieName = "mysso_session"

func NewServer(cfg config.Config) (*Server, error) {
	installer := installsvc.NewService(cfg)
	status := installer.Status()
	if err := cfg.ValidateInstallSecurity(status.Installed); err != nil {
		return nil, err
	}
	var services *service.Services
	if status.Installed {
		if err := cfg.ValidateInstalledSecrets(); err != nil {
			return nil, err
		}
		db, err := store.OpenMySQL(cfg.DB)
		if err == nil {
			if err := installsvc.ApplyRuntimeSettings(db, &cfg); err != nil {
				return nil, err
			}
			services, err = service.NewServices(cfg, store.NewMySQLStore(db))
			if err != nil {
				return nil, err
			}
			installer = installsvc.NewService(cfg)
		}
	}
	engine := gin.Default()
	engine.MaxMultipartMemory = maxUploadImageBytes + maxUploadMultipartOverhead
	server := &Server{
		engine:    engine,
		cfg:       cfg,
		services:  services,
		installer: installer,
	}
	_ = os.MkdirAll("uploads", 0755)
	engine.Use(func(c *gin.Context) {
		applySecurityHeaders(c)
		origin := c.GetHeader("Origin")
		if server.isAllowedOrigin(origin) {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
			c.Writer.Header().Set("Vary", "Origin")
		}
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})
	server.startCleanupWorker()
	server.registerRoutes()
	return server, nil
}

func applySecurityHeaders(c *gin.Context) {
	headers := c.Writer.Header()
	headers.Set("X-Frame-Options", "DENY")
	headers.Set("X-Content-Type-Options", "nosniff")
	headers.Set("Referrer-Policy", "strict-origin-when-cross-origin")
	headers.Set("Content-Security-Policy", "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'")
}

func (s *Server) Run() error { return s.engine.Run(s.cfg.HTTP.Addr) }

func (s *Server) registerRoutes() {
	s.engine.Static("/uploads", "./uploads")
	s.engine.GET("/healthz", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"status": "ok"}) })
	s.engine.GET("/.well-known/openid-configuration", func(c *gin.Context) {
		if !s.requireInstalled(c) {
			return
		}
		c.JSON(http.StatusOK, s.services.OAuth.Discovery())
	})
	s.engine.GET("/.well-known/jwks.json", func(c *gin.Context) {
		if !s.requireInstalled(c) {
			return
		}
		c.JSON(http.StatusOK, s.services.OAuth.JWKS())
	})
	s.engine.GET("/oauth2/authorize", s.handleAuthorize)
	s.engine.GET("/oauth2/logout", s.handleOIDCLogout)
	s.engine.POST("/oauth2/logout", s.handleOIDCLogout)
	s.engine.POST("/logout", s.handleBrowserLogout)
	s.engine.POST("/oauth2/token", s.handleToken)
	s.engine.POST("/oauth2/revoke", s.handleRevoke)
	s.engine.GET("/oauth2/userinfo", s.handleUserInfo)

	api := s.engine.Group("/api")
	api.GET("/public/settings", s.handlePublicSettings)
	api.GET("/public/scopes", s.handlePublicScopes)
	api.GET("/public/apps/:client_id", s.handlePublicAppByClientID)
	api.GET("/install/status", s.handleInstallStatus)
	api.POST("/install/validate-db", s.handleInstallValidateDB)
	api.POST("/install/complete", s.handleInstallComplete)
	api.POST("/auth/login", s.handleLogin)
	api.POST("/auth/passkey/login/options", s.handlePreparePasskeyLogin)
	api.POST("/auth/passkey/login/verify", s.handleCompletePasskeyLogin)
	api.POST("/auth/login-mfa", s.handleCompleteMFALogin)
	api.POST("/auth/login-mfa/resend", s.handleResendMFALogin)
	api.POST("/auth/login-step-up/code", s.handleSendLoginStepUpCode)
	api.POST("/auth/login-step-up/complete", s.handleCompleteLoginStepUp)
	api.POST("/auth/login-mfa-enrollment/complete", s.handleCompleteLoginMFAEnrollment)
	api.POST("/auth/deletion-login/confirm", s.handleConfirmDeletionLogin)
	api.POST("/auth/login-otp", s.handleOTPLogin)
	api.POST("/auth/login-sms", s.handleSMSLogin)
	api.POST("/auth/mfa-code", s.handleSendMFAChallenge)
	api.POST("/auth/send-challenge", s.handleSendChallenge)
	api.POST("/auth/email-code", s.handleSendEmailCode)
	api.POST("/auth/sms-code", s.handleSendSMSCode)
	api.POST("/auth/phone-binding/code", s.handleSendPhoneBindingCode)
	api.POST("/auth/phone-binding/complete", s.handleCompletePhoneBinding)
	api.POST("/auth/reset-password", s.handleResetPassword)
	api.POST("/auth/logout", s.handleLogout)
	api.POST("/auth/oidc-exchange", s.handleFirstPartyTokenExchange)
	api.POST("/auth/oidc-refresh", s.handleFirstPartyRefresh)
	api.POST("/auth/authorize", s.requireSession(), s.handleSessionAuthorize)
	api.POST("/auth/register", s.handleRegister)
	api.GET("/me", s.requireSession(), s.handleMe)
	api.GET("/me/passkeys", s.requireSession(), s.handleListPasskeys)
	api.POST("/me/passkeys/register/options", s.requireSession(), s.handlePreparePasskeyRegistration)
	api.POST("/me/passkeys/register/verify", s.requireSession(), s.handleCompletePasskeyRegistration)
	api.DELETE("/me/passkeys/:id", s.requireSession(), s.handleDeletePasskey)
	api.POST("/me/phone-code", s.requireSession(), s.handleSendProfileSMSCode)
	api.POST("/me/mfa/code", s.requireSession(), s.handleSendCurrentMFACode)
	api.PUT("/me/profile", s.requireSession(), s.handleUpdateProfile)
	api.PUT("/me/mfa", s.requireSession(), s.handleUpdateMFA)
	api.PUT("/me/password", s.requireSession(), s.handleUpdatePassword)
	api.POST("/me/delete-account", s.requireSession(), s.handleRequestAccountDeletion)
	api.POST("/me/export-data", s.requireSession(), s.handleExportUserData)
	api.POST("/me/avatar", s.requireSession(), s.handleUploadUserAvatar)
	api.GET("/consents", s.requireSession(), s.handleConsents)
	api.POST("/consents/:id/revoke", s.requireSession(), s.handleRevokeConsent)
	api.POST("/consents/batch-revoke", s.requireSession(), s.handleBatchRevokeConsents)
	api.POST("/gateway/introspect", s.handleIntrospect)
	api.GET("/gateway/protected", s.requireBearerScope("gateway.read"), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "protected resource granted", "claims": c.MustGet("claims")})
	})

	dev := api.Group("/developer", s.requireSession(), s.requireRole(domain.RoleDeveloper))
	dev.GET("/apps", s.handleDeveloperApps)
	dev.GET("/scopes", s.handleDeveloperScopes)
	dev.GET("/audit-logs", s.handleDeveloperAuditLogs)
	dev.GET("/analytics", s.handleDeveloperAnalytics)
	dev.POST("/apps", s.handleCreateApp)
	dev.POST("/apps/icon", s.handleUploadDeveloperAppIcon)
	dev.PUT("/apps/:id", s.handleUpdateDeveloperApp)
	dev.POST("/apps/:id/reset-secret", s.handleResetSecret)
	dev.DELETE("/apps/:id", s.handleDeleteDeveloperApp)
	dev.POST("/audit-logs/batch-delete", s.handleBatchDeleteDeveloperAuditLogs)

	admin := api.Group("/admin", s.requireSession(), s.requireRole(domain.RoleAdmin))
	admin.GET("/users", s.handleUsers)
	admin.POST("/users", s.handleCreateUser)
	admin.PUT("/users/:id", s.handleUpdateUser)
	admin.GET("/users/:id/security-policy", s.handleGetUserSecurityPolicy)
	admin.PUT("/users/:id/security-policy", s.handleUpdateUserSecurityPolicy)
	admin.GET("/users/:id/operation-logs", s.handleUserOperationLogs)
	admin.POST("/users/:id/operation-logs/delete", s.handleDeleteUserOperationLogs)
	admin.POST("/users/:id/freeze", s.handleFreezeUser)
	admin.POST("/users/:id/announcement", s.handleUpdateUserAnnouncement)
	admin.POST("/users/batch-freeze", s.handleBatchFreezeUsers)
	admin.POST("/users/batch-delete", s.handleBatchDeleteUsers)
	admin.GET("/apps", s.handleAdminApps)
	admin.POST("/apps/icon", s.handleUploadAdminAppIcon)
	admin.PUT("/apps/:id", s.handleUpdateAdminApp)
	admin.POST("/apps/:id/review", s.handleReviewApp)
	admin.DELETE("/apps/:id", s.handleDeleteApp)
	admin.POST("/apps/batch-delete", s.handleBatchDeleteApps)
	admin.GET("/audit-logs", s.handleAuditLogs)
	admin.GET("/risk-logs", s.handleRiskLogs)
	admin.GET("/passkey-logs", s.handlePasskeyLogs)
	admin.GET("/send-logs/emails", s.handleEmailSendLogs)
	admin.GET("/send-logs/phones", s.handlePhoneSendLogs)
	admin.POST("/risk-logs/batch-delete", s.handleBatchDeleteRiskLogs)
	admin.POST("/passkey-logs/batch-delete", s.handleBatchDeletePasskeyLogs)
	admin.POST("/send-logs/emails/batch-delete", s.handleBatchDeleteEmailSendLogs)
	admin.POST("/send-logs/phones/batch-delete", s.handleBatchDeletePhoneSendLogs)
	admin.POST("/audit-logs/batch-delete", s.handleBatchDeleteAuditLogs)
	admin.GET("/gateway-policies", s.handleGatewayPolicies)
	admin.GET("/scopes", s.handleAdminScopes)
	admin.POST("/scopes", s.handleUpsertScope)
	admin.PUT("/scopes/:key", s.handleUpsertScope)
	admin.DELETE("/scopes/:key", s.handleDeleteScope)
	admin.GET("/system-settings", s.handleGetSystemSettings)
	admin.PUT("/system-settings", s.handleUpdateSystemSettings)
	admin.POST("/system-settings/site-logo", s.handleUploadSiteLogo)
	admin.POST("/system-settings/test-email", s.handleSendTestEmail)
	admin.POST("/system-settings/test-sms", s.handleSendTestSMS)
}

func (s *Server) startCleanupWorker() {
	if s.services == nil {
		return
	}
	s.cleanupWorkerOnce.Do(func() {
		go func() {
			ticker := time.NewTicker(time.Minute)
			defer ticker.Stop()
			for range ticker.C {
				if s.services != nil {
					_ = s.services.User.CleanupRuntimeData()
					_ = s.services.User.CleanupExpiredDeletionRequests()
				}
			}
		}()
	})
}

func (s *Server) requireInstalled(c *gin.Context) bool {
	if s.services != nil {
		return true
	}
	c.AbortWithStatusJSON(http.StatusServiceUnavailable, gin.H{
		"error": "system not installed",
		"code":  "system_not_installed",
	})
	return false
}

func (s *Server) isAllowedOrigin(origin string) bool {
	if strings.TrimSpace(origin) == "" {
		return false
	}

	parsedOrigin, err := url.Parse(origin)
	if err != nil {
		return false
	}

	host := parsedOrigin.Hostname()
	if host == "localhost" || host == "127.0.0.1" {
		return true
	}

	normalizedOrigin := strings.TrimRight(origin, "/")
	for _, allowed := range s.allowedOrigins() {
		if normalizedOrigin == allowed {
			return true
		}
	}

	return false
}

func (s *Server) allowedOrigins() []string {
	candidates := []string{
		strings.TrimSpace(s.cfg.HTTP.FrontendBase),
		strings.TrimSpace(s.cfg.HTTP.PublicBase),
	}

	if s.services != nil && s.services.Settings != nil {
		if settings, err := s.services.Settings.GetSystemSettings(); err == nil {
			candidates = append(candidates,
				strings.TrimSpace(settings.FrontendBaseURL),
			)
		}
	}

	allowed := make([]string, 0, len(candidates))
	seen := make(map[string]struct{}, len(candidates))
	for _, candidate := range candidates {
		candidate = strings.TrimRight(strings.TrimSpace(candidate), "/")
		if candidate == "" {
			continue
		}
		if _, err := url.Parse(candidate); err != nil {
			continue
		}
		if _, ok := seen[candidate]; ok {
			continue
		}
		seen[candidate] = struct{}{}
		allowed = append(allowed, candidate)
	}
	return allowed
}

func (s *Server) isAllowedRequestSource(raw string) bool {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return false
	}
	parsed, err := url.Parse(raw)
	if err != nil {
		return false
	}
	origin := parsed.Scheme + "://" + parsed.Host
	for _, allowed := range s.allowedOrigins() {
		if strings.EqualFold(origin, allowed) {
			return true
		}
	}
	return false
}

func (s *Server) rejectCrossSiteUnsafeRequest(c *gin.Context) bool {
	switch strings.ToUpper(strings.TrimSpace(c.Request.Method)) {
	case http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete:
	default:
		return false
	}

	if strings.EqualFold(strings.TrimSpace(c.GetHeader("Sec-Fetch-Site")), "cross-site") {
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "cross-site request forbidden"})
		return true
	}

	origin := strings.TrimSpace(c.GetHeader("Origin"))
	if origin != "" && !s.isAllowedRequestSource(origin) {
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "cross-site request forbidden"})
		return true
	}

	referer := strings.TrimSpace(c.GetHeader("Referer"))
	if referer != "" && !s.isAllowedRequestSource(referer) {
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "cross-site request forbidden"})
		return true
	}

	return false
}

func (s *Server) requireSession() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !s.requireInstalled(c) {
			return
		}
		sessionToken := s.extractSessionToken(c)
		if sessionToken == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing session token"})
			return
		}
		user, session, err := s.services.Auth.CurrentUser(sessionToken)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		c.Set("user", user)
		c.Set("session", session)
		c.Next()
	}
}

func (s *Server) requireRole(role domain.Role) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !s.requireInstalled(c) {
			return
		}
		user := c.MustGet("user").(domain.User)
		if user.Role != role {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}
		c.Next()
	}
}

func (s *Server) requireBearerScope(scope string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !s.requireInstalled(c) {
			return
		}
		auth := c.GetHeader("Authorization")
		if !strings.HasPrefix(auth, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing bearer token"})
			return
		}
		claims, err := s.services.OAuth.ValidateAccessTokenClaims(strings.TrimPrefix(auth, "Bearer "))
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid bearer token"})
			return
		}
		if !hasScope(claims, scope) {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "insufficient scope"})
			return
		}
		c.Set("claims", claims)
		c.Next()
	}
}

func (s *Server) extractSessionToken(c *gin.Context) string {
	if cookie, err := c.Cookie(sessionCookieName); err == nil {
		return strings.TrimSpace(cookie)
	}
	return ""
}

func hasScope(claims map[string]any, requiredScope string) bool {
	requiredScope = strings.TrimSpace(requiredScope)
	if requiredScope == "" {
		return false
	}
	scopeString, _ := claims["scope"].(string)
	for _, item := range strings.Fields(scopeString) {
		if item == requiredScope {
			return true
		}
	}
	return false
}

func (s *Server) shouldUseSecureSessionCookie(c *gin.Context) bool {
	if c.Request.TLS != nil || strings.EqualFold(strings.TrimSpace(c.GetHeader("X-Forwarded-Proto")), "https") {
		return true
	}
	targets := []string{strings.TrimSpace(s.cfg.HTTP.PublicBase)}
	if s.services != nil && s.services.Settings != nil {
		if settings, err := s.services.Settings.GetSystemSettings(); err == nil {
			targets = append(targets, strings.TrimSpace(settings.FrontendBaseURL))
		}
	}
	for _, target := range targets {
		if target == "" {
			continue
		}
		parsed, err := url.Parse(target)
		if err == nil && strings.EqualFold(parsed.Scheme, "https") {
			return true
		}
	}
	return false
}

func (s *Server) setSessionCookie(c *gin.Context, token string, expiresAt time.Time) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(sessionCookieName, token, 0, "/", "", s.shouldUseSecureSessionCookie(c), true)
}

func (s *Server) clearSessionCookie(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(sessionCookieName, "", -1, "/", "", s.shouldUseSecureSessionCookie(c), true)
}
