package http

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/service"
)

func (s *Server) handleUsers(c *gin.Context) {
	page, _ := strconv.Atoi(strings.TrimSpace(c.Query("page")))
	pageSize, _ := strconv.Atoi(strings.TrimSpace(c.Query("page_size")))
	emailKeyword := strings.TrimSpace(c.Query("email_keyword"))
	statusFilter := strings.TrimSpace(c.Query("status"))

	usePagination := page > 0 || pageSize > 0 || emailKeyword != "" || statusFilter != ""
	users := make([]domain.User, 0)
	total := 0
	currentPage := 1
	currentPageSize := 0
	if usePagination {
		result, err := s.services.Admin.ListUsersPaginated(page, pageSize, emailKeyword, statusFilter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		users = result.Items
		total = result.Total
		currentPage = result.Page
		currentPageSize = result.PageSize
	} else {
		users = s.services.Admin.ListUsers()
		total = len(users)
		currentPageSize = total
	}
	items := make([]gin.H, 0, len(users))
	for _, user := range users {
		enabled, content, err := s.services.Admin.GetUserAnnouncement(user.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		passkeys, err := s.services.Admin.ListUserPasskeys(user.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		authorizedAppsData := s.services.Admin.ListUserAuthorizedApps(user.ID)
		securityPolicy, err := s.services.Admin.GetUserSecurityPolicy(user.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		authorizedApps := make([]gin.H, 0, len(authorizedAppsData))
		for _, consent := range authorizedAppsData {
			authorizedApps = append(authorizedApps, gin.H{
				"id":         consent.ID,
				"client_id":  consent.ClientID,
				"app_name":   consent.AppName,
				"icon_url":   consent.IconURL,
				"scopes":     consent.Scopes,
				"created_at": consent.CreatedAt,
				"revoked_at": consent.RevokedAt,
			})
		}
		items = append(items, gin.H{
			"id":                            user.ID,
			"country":                       user.Country,
			"preferred_locale":              user.PreferredLocale,
			"email":                         user.Email,
			"display_name":                  user.DisplayName,
			"phone":                         user.Phone,
			"last_device_ip":                user.LastDeviceIP,
			"gender":                        user.Gender,
			"role":                          user.Role,
			"status":                        user.Status,
			"freeze_reason":                 user.FreezeReason,
			"mfa_enabled":                   user.MFAEnabled,
			"passkey_count":                 len(passkeys),
			"passkey_enabled":               len(passkeys) > 0,
			"authorized_app_count":          len(authorizedAppsData),
			"authorized_apps":               authorizedApps,
			"created_at":                    user.CreatedAt,
			"deletion_requested_at":         user.DeletionRequestedAt,
			"deletion_scheduled_at":         user.DeletionScheduledAt,
			"personal_announcement_enabled": enabled,
			"personal_announcement_content": content,
			"security_policy":               securityPolicy,
		})
	}
	c.JSON(http.StatusOK, gin.H{
		"items":     items,
		"total":     total,
		"page":      currentPage,
		"page_size": currentPageSize,
	})
}

func (s *Server) handleAdminDashboardSummary(c *gin.Context) {
	result, err := s.services.Admin.GetDashboardSummary()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"total_users":   result.TotalUsers,
			"active_users":  result.ActiveUsers,
			"pending_apps":  result.PendingApps,
			"approved_apps": result.ApprovedApps,
			"audit_logs":    result.AuditLogs,
			"policies":      result.Policies,
		},
	})
}

func (s *Server) handleCreateUser(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	var req createAdminUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	user, err := s.services.Admin.CreateUser(admin.ID, service.CreateUserInput{
		Email:        req.Email,
		DisplayName:  req.DisplayName,
		Password:     req.Password,
		Role:         domain.Role(req.Role),
		Status:       domain.UserStatus(req.Status),
		FreezeReason: req.FreezeReason,
		Country:      req.Country,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, user)
}

func (s *Server) handleUpdateUser(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	var req updateAdminUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	user, err := s.services.Admin.UpdateUser(admin.ID, c.Param("id"), service.UpdateUserInput{
		Email:        req.Email,
		DisplayName:  req.DisplayName,
		Phone:        req.Phone,
		Password:     req.Password,
		Role:         domain.Role(req.Role),
		Status:       domain.UserStatus(req.Status),
		FreezeReason: req.FreezeReason,
		Country:      req.Country,
		Gender:       req.Gender,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, user)
}

func (s *Server) handleFreezeUser(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	var req freezeUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	user, err := s.services.Admin.FreezeUser(admin.ID, c.Param("id"), req.Frozen, req.Reason)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, user)
}

func (s *Server) handleBatchFreezeUsers(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	var req batchFreezeUsersRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := s.services.Admin.BatchFreezeUsers(admin.ID, req.UserIDs, req.Frozen, req.Reason); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"updated": true})
}

func (s *Server) handleBatchDeleteUsers(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	var req batchUsersRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := s.services.Admin.DeleteUsers(admin.ID, req.UserIDs); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func (s *Server) handleUpdateUserAnnouncement(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	var req updateUserAnnouncementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := s.services.Admin.UpdateUserAnnouncement(admin.ID, c.Param("id"), req.Enabled, req.Content); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"updated": true})
}

func (s *Server) handleGetUserSecurityPolicy(c *gin.Context) {
	result, err := s.services.Admin.GetUserSecurityPolicy(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}

func (s *Server) handleUpdateUserSecurityPolicy(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	var req updateUserSecurityPolicyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result, err := s.services.Admin.UpdateUserSecurityPolicy(admin.ID, c.Param("id"), service.UpdateUserSecurityPolicyInput{
		ForcePhoneBindingNextLogin:  req.ForcePhoneBindingNextLogin,
		ForceMFAEnrollmentNextLogin: req.ForceMFAEnrollmentNextLogin,
		LoginStepUpMode:             domain.LoginStepUpMode(req.LoginStepUpMode),
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}

func parseOptionalRFC3339(value string) (*time.Time, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil, nil
	}
	parsed, err := time.Parse(time.RFC3339, value)
	if err != nil {
		return nil, err
	}
	return &parsed, nil
}

func (s *Server) handleUserOperationLogs(c *gin.Context) {
	page, _ := strconv.Atoi(strings.TrimSpace(c.Query("page")))
	pageSize, _ := strconv.Atoi(strings.TrimSpace(c.Query("page_size")))
	result, err := s.services.Admin.ListUserOperationLogs(c.Param("id"), page, pageSize)
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

func (s *Server) handleDeleteUserOperationLogs(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	var req deleteUserOperationLogsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	startAt, err := parseOptionalRFC3339(req.StartAt)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid start_at"})
		return
	}
	endAt, err := parseOptionalRFC3339(req.EndAt)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid end_at"})
		return
	}
	deleted, err := s.services.Admin.DeleteUserOperationLogs(admin.ID, c.Param("id"), req.DeleteAll, startAt, endAt)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": deleted})
}

func (s *Server) handleReviewApp(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	var req reviewAppRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	app, err := s.services.Apps.ReviewApp(admin.ID, c.Param("id"), req.Approved, req.Comment)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, app)
}

func (s *Server) handleUpdateAdminApp(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	var req createAppRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	app, err := s.services.Admin.UpdateApp(
		admin.ID,
		c.Param("id"),
		req.Name,
		req.IconURL,
		req.Description,
		req.FrontChannelLogoutURI,
		req.RedirectURIs,
		req.PostLogoutRedirectURIs,
		req.Scopes,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, app)
}

func (s *Server) handleUploadAdminAppIcon(c *gin.Context) {
	s.handleUploadDeveloperAppIcon(c)
}

func (s *Server) handleDeleteApp(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	if err := s.services.Admin.DeleteApp(admin.ID, c.Param("id")); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func (s *Server) handleBatchDeleteApps(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	var req batchAppsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := s.services.Admin.DeleteApps(admin.ID, req.AppIDs); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func (s *Server) handleAuditLogs(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"items": s.services.Admin.ListAuditLogs()})
}

func (s *Server) handleRiskLogs(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"items": s.services.Admin.ListRateLimitEvents()})
}

func (s *Server) handlePasskeyLogs(c *gin.Context) {
	passkeyLogs := s.services.Admin.ListPasskeyLogs()
	users := s.services.Admin.ListUsers()
	userEmailByID := make(map[string]string, len(users))
	for _, user := range users {
		userEmailByID[user.ID] = user.Email
	}

	passkeys := make([]gin.H, 0, len(passkeyLogs.Passkeys))
	for _, item := range passkeyLogs.Passkeys {
		passkeys = append(passkeys, gin.H{
			"id":              item.ID,
			"user_id":         item.UserID,
			"user_email":      userEmailByID[item.UserID],
			"name":            item.Name,
			"credential_id":   item.CredentialID,
			"credential_json": item.CredentialJSON,
			"sign_count":      item.SignCount,
			"aaguid":          item.AAGUID,
			"transports":      item.Transports,
			"last_used_at":    item.LastUsedAt,
			"created_at":      item.CreatedAt,
			"updated_at":      item.UpdatedAt,
		})
	}

	registrationChallenges := make([]gin.H, 0, len(passkeyLogs.RegistrationChallenges))
	for _, item := range passkeyLogs.RegistrationChallenges {
		registrationChallenges = append(registrationChallenges, gin.H{
			"token":             item.Token,
			"user_id":           item.UserID,
			"user_email":        userEmailByID[item.UserID],
			"session_data_json": item.SessionDataJSON,
			"expires_at":        item.ExpiresAt,
			"created_at":        item.CreatedAt,
		})
	}

	loginChallenges := make([]gin.H, 0, len(passkeyLogs.LoginChallenges))
	for _, item := range passkeyLogs.LoginChallenges {
		loginChallenges = append(loginChallenges, gin.H{
			"token":             item.Token,
			"session_data_json": item.SessionDataJSON,
			"expires_at":        item.ExpiresAt,
			"created_at":        item.CreatedAt,
		})
	}

	usageLogs := make([]gin.H, 0, len(passkeyLogs.UsageLogs))
	for _, item := range passkeyLogs.UsageLogs {
		usageLogs = append(usageLogs, gin.H{
			"id":             item.ID,
			"user_id":        item.UserID,
			"user_email":     userEmailByID[item.UserID],
			"passkey_id":     item.PasskeyID,
			"credential_id":  item.CredentialID,
			"event_type":     item.EventType,
			"source_ip":      item.SourceIP,
			"user_agent":     item.UserAgent,
			"result":         item.Result,
			"failure_reason": item.FailureReason,
			"created_at":     item.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"passkeys":                passkeys,
		"registration_challenges": registrationChallenges,
		"login_challenges":        loginChallenges,
		"usage_logs":              usageLogs,
	})
}

func (s *Server) handleEmailSendLogs(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"items": s.services.Admin.ListEmailSendLogs()})
}

func (s *Server) handlePhoneSendLogs(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"items": s.services.Admin.ListPhoneSendLogs()})
}

func (s *Server) handleBatchDeleteEmailSendLogs(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	var req batchSendLogsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := s.services.Admin.DeleteEmailSendLogs(admin.ID, req.LogIDs); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func (s *Server) handleBatchDeletePhoneSendLogs(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	var req batchSendLogsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := s.services.Admin.DeletePhoneSendLogs(admin.ID, req.LogIDs); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func (s *Server) handleBatchDeleteAuditLogs(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	var req batchAuditLogsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := s.services.Admin.DeleteAuditLogs(admin.ID, req.LogIDs); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func (s *Server) handleBatchDeleteRiskLogs(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	var req batchAuditLogsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := s.services.Admin.DeleteRateLimitEvents(admin.ID, req.LogIDs); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func (s *Server) handleBatchDeletePasskeyLogs(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	var req batchPasskeyLogsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := s.services.Admin.DeletePasskeyLogs(admin.ID, req.Table, req.RecordIDs); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func (s *Server) handleGatewayPolicies(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"items": s.services.Admin.ListGatewayPolicies()})
}

func (s *Server) handleAdminScopes(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"items": s.services.Admin.ListScopes()})
}

func (s *Server) handleUpsertScope(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	var req upsertScopeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	key := c.Param("key")
	if key == "" {
		key = req.Key
	}
	scope, err := s.services.Admin.UpsertScope(admin.ID, domain.ScopeDefinition{
		Key:                 key,
		DisplayName:         req.DisplayName,
		Description:         req.Description,
		Enabled:             req.Enabled,
		DeveloperSelectable: req.DeveloperSelectable,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, scope)
}

func (s *Server) handleDeleteScope(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	if err := s.services.Admin.DeleteScope(admin.ID, c.Param("key")); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}
