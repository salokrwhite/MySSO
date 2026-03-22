package service

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/security"
	"mysso/backend/internal/store"
)

type AdminService struct {
	deps  *serviceDeps
	audit *AuditService
}

type CreateUserInput struct {
	Email        string
	DisplayName  string
	Password     string
	Role         domain.Role
	Status       domain.UserStatus
	FreezeReason string
	Country      string
}

type UpdateUserInput struct {
	Email        string
	DisplayName  string
	Phone        string
	Password     string
	Role         domain.Role
	Status       domain.UserStatus
	FreezeReason string
	Country      string
	Gender       *string
}

type AdminPasskeyLogs struct {
	Passkeys               []domain.Passkey
	RegistrationChallenges []domain.PasskeyRegistrationChallenge
	LoginChallenges        []domain.PasskeyLoginChallenge
	UsageLogs              []domain.PasskeyUsageLog
}

type AdminAuthorizedApp struct {
	ID        string
	ClientID  string
	AppName   string
	IconURL   string
	Scopes    []string
	CreatedAt time.Time
	RevokedAt time.Time
}

type UserOperationLogListResult struct {
	Items    []domain.UserOperationLog
	Total    int
	Page     int
	PageSize int
}

type UserListResult struct {
	Items    []domain.User
	Total    int
	Page     int
	PageSize int
}

type UserSecurityPolicyView struct {
	ForcePhoneBindingNextLogin  bool     `json:"force_phone_binding_next_login"`
	ForceMFAEnrollmentNextLogin bool     `json:"force_mfa_enrollment_next_login"`
	LoginStepUpMode             string   `json:"login_step_up_mode"`
	HasEmail                    bool     `json:"has_email"`
	HasPhone                    bool     `json:"has_phone"`
	AvailableMFAMethods         []string `json:"available_mfa_methods"`
}

type UpdateUserSecurityPolicyInput struct {
	ForcePhoneBindingNextLogin  bool
	ForceMFAEnrollmentNextLogin bool
	LoginStepUpMode             domain.LoginStepUpMode
}

func (s *AdminService) UpdateUserAnnouncement(adminID, userID string, enabled bool, content string) error {
	user, err := s.deps.store.GetUser(userID)
	if err != nil {
		return err
	}
	content = strings.TrimSpace(content)
	if enabled && content == "" {
		return fmt.Errorf("announcement content is required")
	}
	if err := s.deps.store.UpsertSettings(map[string]string{
		domain.UserAnnouncementEnabledKey(userID): strconv.FormatBool(enabled),
		domain.UserAnnouncementContentKey(userID): content,
	}); err != nil {
		return err
	}
	s.audit.Record(adminID, domain.RoleAdmin, "admin.user.announcement.update", userID, map[string]any{
		"email":   user.Email,
		"enabled": enabled,
		"content": content,
	})
	return nil
}

func (s *AdminService) CreateUser(adminID string, input CreateUserInput) (domain.User, error) {
	email := strings.ToLower(strings.TrimSpace(input.Email))
	displayName := strings.TrimSpace(input.DisplayName)
	password := strings.TrimSpace(input.Password)
	country := strings.ToUpper(strings.TrimSpace(input.Country))
	if country == "" {
		country = "CN"
	}
	if email == "" || password == "" {
		return domain.User{}, fmt.Errorf("email and password are required")
	}
	if input.Role != domain.RoleAdmin && input.Role != domain.RoleDeveloper && input.Role != domain.RoleUser {
		return domain.User{}, fmt.Errorf("unsupported role")
	}
	if input.Status != domain.UserActive && input.Status != domain.UserFrozen {
		return domain.User{}, fmt.Errorf("unsupported status")
	}
	if _, err := s.deps.store.FindUserByEmail(email); err == nil {
		return domain.User{}, fmt.Errorf("user already exists")
	}
	if displayName == "" {
		displayName = deriveAdminDisplayName(email)
	}
	freezeReason := normalizeFreezeReason(input.FreezeReason)

	passwordHash, err := security.HashPassword(password)
	if err != nil {
		return domain.User{}, err
	}

	now := time.Now().UTC()
	user := domain.User{
		ID:           uuid.NewString(),
		Country:      country,
		Email:        email,
		DisplayName:  displayName,
		Password:     passwordHash,
		Role:         input.Role,
		Status:       input.Status,
		FreezeReason: freezeReason,
		MFAEnabled:   false,
		MFAMethod:    "",
		MFASecret:    "",
		CreatedAt:    now,
	}
	if err := s.deps.store.CreateUser(user); err != nil {
		return domain.User{}, err
	}
	s.audit.Record(adminID, domain.RoleAdmin, "admin.user.create", user.ID, map[string]any{
		"email":         user.Email,
		"display_name":  user.DisplayName,
		"role":          user.Role,
		"status":        user.Status,
		"freeze_reason": user.FreezeReason,
	})
	return user, nil
}

func (s *AdminService) GetUserAnnouncement(userID string) (bool, string, error) {
	values, err := s.deps.store.GetSettings(domain.UserAnnouncementEnabledKey(userID), domain.UserAnnouncementContentKey(userID))
	if err != nil {
		return false, "", err
	}
	return fallbackBoolSetting(values[domain.UserAnnouncementEnabledKey(userID)], false), strings.TrimSpace(values[domain.UserAnnouncementContentKey(userID)]), nil
}

func (s *AdminService) UpdateUser(adminID, userID string, input UpdateUserInput) (domain.User, error) {
	user, err := s.deps.store.GetUser(userID)
	if err != nil {
		return domain.User{}, err
	}

	email := strings.ToLower(strings.TrimSpace(input.Email))
	displayName := strings.TrimSpace(input.DisplayName)
	phone := strings.TrimSpace(input.Phone)
	password := strings.TrimSpace(input.Password)
	country := strings.ToUpper(strings.TrimSpace(input.Country))
	gender := strings.TrimSpace(user.Gender)

	if input.Gender != nil {
		gender = strings.TrimSpace(*input.Gender)
	}

	if email == "" {
		return domain.User{}, fmt.Errorf("email is required")
	}
	if displayName == "" {
		displayName = deriveAdminDisplayName(email)
	}
	if country == "" {
		country = "CN"
	}
	freezeReason := normalizeFreezeReason(input.FreezeReason)
	if input.Role != domain.RoleAdmin && input.Role != domain.RoleDeveloper && input.Role != domain.RoleUser {
		return domain.User{}, fmt.Errorf("unsupported role")
	}
	if input.Status != domain.UserActive && input.Status != domain.UserFrozen && input.Status != domain.UserPending {
		return domain.User{}, fmt.Errorf("unsupported status")
	}
	if existingUser, err := s.deps.store.FindUserByEmail(email); err == nil && existingUser.ID != user.ID {
		return domain.User{}, fmt.Errorf("user already exists")
	}
	if phone != "" {
		if existingUser, err := s.deps.store.FindUserByPhone(phone); err == nil && existingUser.ID != user.ID {
			return domain.User{}, fmt.Errorf("phone already bound")
		}
	}
	if password != "" && len(password) < 8 {
		return domain.User{}, fmt.Errorf("password must be at least 8 characters")
	}
	if user.Role == domain.RoleAdmin {
		if input.Role != domain.RoleAdmin {
			return domain.User{}, fmt.Errorf("admin accounts cannot be reassigned here")
		}
		if input.Status != domain.UserActive {
			return domain.User{}, fmt.Errorf("admin accounts cannot be frozen here")
		}
	}

	before := user
	user.Email = email
	user.DisplayName = displayName
	user.Phone = phone
	user.Role = input.Role
	user.Status = input.Status
	user.FreezeReason = freezeReason
	user.Country = country
	user.Gender = gender
	if user.Status != domain.UserFrozen {
		user.FreezeReason = ""
	}
	passwordUpdated := false
	if password != "" {
		passwordHash, hashErr := security.HashPassword(password)
		if hashErr != nil {
			return domain.User{}, hashErr
		}
		user.Password = passwordHash
		passwordUpdated = true
	}

	requiresAuthInvalidation := passwordUpdated || (before.Status == domain.UserActive && user.Status != domain.UserActive)
	if requiresAuthInvalidation {
		user.AuthVersion++
		err = s.deps.store.UpdateUserAndInvalidateAuth(user)
	} else {
		err = s.deps.store.UpdateUser(user)
	}
	if err != nil {
		return domain.User{}, err
	}
	s.audit.Record(adminID, domain.RoleAdmin, "admin.user.update", user.ID, map[string]any{
		"changes": map[string]any{
			"email":         [2]string{before.Email, user.Email},
			"display_name":  [2]string{before.DisplayName, user.DisplayName},
			"phone":         [2]string{before.Phone, user.Phone},
			"role":          [2]domain.Role{before.Role, user.Role},
			"status":        [2]domain.UserStatus{before.Status, user.Status},
			"freeze_reason": [2]string{before.FreezeReason, user.FreezeReason},
			"country":       [2]string{before.Country, user.Country},
			"gender":        [2]string{before.Gender, user.Gender},
			"password":      passwordUpdated,
		},
	})
	return user, nil
}

func (s *AdminService) FreezeUser(adminID, userID string, frozen bool, reason string) (domain.User, error) {
	user, err := s.deps.store.GetUser(userID)
	if err != nil {
		return domain.User{}, err
	}
	if user.Role == domain.RoleAdmin {
		return domain.User{}, fmt.Errorf("admin accounts cannot be modified here")
	}
	beforeStatus := user.Status
	beforeReason := user.FreezeReason
	if frozen {
		user.Status = domain.UserFrozen
		user.FreezeReason = normalizeFreezeReason(reason)
	} else {
		user.Status = domain.UserActive
		user.FreezeReason = ""
	}
	requiresAuthInvalidation := beforeStatus == domain.UserActive && user.Status != domain.UserActive
	if requiresAuthInvalidation {
		user.AuthVersion++
		err = s.deps.store.UpdateUserAndInvalidateAuth(user)
	} else {
		err = s.deps.store.UpdateUser(user)
	}
	if err != nil {
		return domain.User{}, err
	}
	action := "admin.user.unfreeze"
	if frozen {
		action = "admin.user.freeze"
	}
	s.audit.Record(adminID, domain.RoleAdmin, action, user.ID, map[string]any{
		"status_before": beforeStatus,
		"status_after":  user.Status,
		"reason_before": beforeReason,
		"reason_after":  user.FreezeReason,
	})
	return user, nil
}

func (s *AdminService) BatchFreezeUsers(adminID string, userIDs []string, frozen bool, reason string) error {
	if len(userIDs) == 0 {
		return fmt.Errorf("no users selected")
	}
	for _, userID := range userIDs {
		if _, err := s.FreezeUser(adminID, userID, frozen, reason); err != nil {
			return err
		}
	}
	return nil
}

func normalizeFreezeReason(value string) string {
	value = strings.TrimSpace(value)
	if len([]rune(value)) > 500 {
		value = string([]rune(value)[:500])
	}
	return value
}

func (s *AdminService) DeleteUsers(adminID string, userIDs []string) error {
	if len(userIDs) == 0 {
		return fmt.Errorf("no users selected")
	}
	for _, userID := range userIDs {
		user, err := s.deps.store.GetUser(userID)
		if err != nil {
			return err
		}
		if user.Role == domain.RoleAdmin {
			return fmt.Errorf("admin accounts cannot be deleted here")
		}
		if err := s.deps.store.DeleteUser(userID); err != nil {
			return err
		}
		s.audit.Record(adminID, domain.RoleAdmin, "admin.user.delete", userID, map[string]any{"email": user.Email})
	}
	return nil
}

func (s *AdminService) DeleteApp(adminID, appID string) error {
	app, err := s.deps.store.GetApp(appID)
	if err != nil {
		return err
	}
	if err := s.deps.store.DeleteApp(appID); err != nil {
		return err
	}
	s.audit.Record(adminID, domain.RoleAdmin, "admin.app.delete", appID, map[string]any{
		"name":      app.Name,
		"client_id": app.ClientID,
	})
	return nil
}

func (s *AdminService) UpdateApp(
	adminID,
	appID,
	name,
	iconURL,
	description,
	frontChannelLogoutURI string,
	redirectURIs,
	postLogoutRedirectURIs,
	scopes []string,
) (domain.ClientApp, error) {
	app, err := s.deps.store.GetApp(appID)
	if err != nil {
		return domain.ClientApp{}, err
	}
	scopes, err = (&AppsService{deps: s.deps, audit: s.audit}).validateRequestedScopes(scopes, false)
	if err != nil {
		return domain.ClientApp{}, err
	}
	redirectURIs, postLogoutRedirectURIs, frontChannelLogoutURI, err = normalizeAppOAuthURLs(
		redirectURIs,
		postLogoutRedirectURIs,
		frontChannelLogoutURI,
	)
	if err != nil {
		return domain.ClientApp{}, err
	}
	before := app
	app.Name = strings.TrimSpace(name)
	removeReplacedUploadedFile(app.IconURL, iconURL)
	app.IconURL = strings.TrimSpace(iconURL)
	app.Description = strings.TrimSpace(description)
	app.RedirectURIs = redirectURIs
	app.PostLogoutRedirectURIs = postLogoutRedirectURIs
	app.FrontChannelLogoutURI = strings.TrimSpace(frontChannelLogoutURI)
	app.Scopes = scopes
	app.UpdatedAt = time.Now().UTC()
	if err := s.deps.store.UpdateApp(app); err != nil {
		return domain.ClientApp{}, err
	}
	s.audit.Record(adminID, domain.RoleAdmin, "admin.app.update", app.ID, map[string]any{
		"changes": buildAppChangeDetails(before, app),
	})
	return app, nil
}

func (s *AdminService) DeleteApps(adminID string, appIDs []string) error {
	if len(appIDs) == 0 {
		return fmt.Errorf("no apps selected")
	}
	for _, appID := range appIDs {
		if err := s.DeleteApp(adminID, appID); err != nil {
			return err
		}
	}
	return nil
}

func (s *AdminService) ListUsers() []domain.User {
	return s.deps.store.ListUsers()
}

func (s *AdminService) ListUsersPaginated(page, pageSize int, emailKeyword, statusFilter string) (UserListResult, error) {
	page, pageSize = normalizePagination(page, pageSize)
	items, total, err := s.deps.store.ListUsersPaginated(page, pageSize, emailKeyword, statusFilter)
	if err != nil {
		return UserListResult{}, err
	}
	return UserListResult{
		Items:    items,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

func (s *AdminService) ListUserPasskeys(userID string) ([]domain.Passkey, error) {
	return s.deps.store.ListPasskeysByUser(userID)
}

func (s *AdminService) ListUserAuthorizedApps(userID string) []AdminAuthorizedApp {
	consents := s.deps.store.ListConsentsByUser(userID)
	items := make([]AdminAuthorizedApp, 0, len(consents))
	for _, consent := range consents {
		items = append(items, AdminAuthorizedApp{
			ID:        consent.ID,
			ClientID:  consent.ClientID,
			AppName:   consent.AppName,
			IconURL:   consent.IconURL,
			Scopes:    consent.Scopes,
			CreatedAt: consent.CreatedAt,
			RevokedAt: consent.RevokedAt,
		})
	}
	return items
}

func normalizePagination(page, pageSize int) (int, int) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}
	if pageSize > 200 {
		pageSize = 200
	}
	return page, pageSize
}

func (s *AdminService) ListUserOperationLogs(userID string, page, pageSize int) (UserOperationLogListResult, error) {
	if _, err := s.deps.store.GetUser(userID); err != nil {
		return UserOperationLogListResult{}, err
	}
	page, pageSize = normalizePagination(page, pageSize)
	items, total, err := s.deps.store.ListUserOperationLogs(userID, page, pageSize)
	if err != nil {
		return UserOperationLogListResult{}, err
	}
	return UserOperationLogListResult{
		Items:    items,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

func (s *AdminService) DeleteUserOperationLogs(adminID, userID string, deleteAll bool, startAt, endAt *time.Time) (int64, error) {
	if _, err := s.deps.store.GetUser(userID); err != nil {
		return 0, err
	}
	if !deleteAll && startAt == nil && endAt == nil {
		return 0, fmt.Errorf("delete range is required")
	}
	if deleteAll {
		startAt = nil
		endAt = nil
	}
	if startAt != nil && endAt != nil && startAt.After(*endAt) {
		return 0, fmt.Errorf("start time must be before end time")
	}
	deleted, err := s.deps.store.DeleteUserOperationLogs(userID, startAt, endAt)
	if err != nil {
		return 0, err
	}
	s.audit.Record(adminID, domain.RoleAdmin, "admin.user_operation_log.delete", userID, map[string]any{
		"delete_all": deleteAll,
		"deleted":    deleted,
		"start_at":   startAt,
		"end_at":     endAt,
	})
	return deleted, nil
}

func (s *AdminService) GetUserSecurityPolicy(userID string) (UserSecurityPolicyView, error) {
	user, err := s.deps.store.GetUser(userID)
	if err != nil {
		return UserSecurityPolicyView{}, err
	}
	policy, err := s.deps.store.GetUserSecurityPolicy(userID)
	if err != nil {
		if err != store.ErrNotFound {
			return UserSecurityPolicyView{}, err
		}
		policy = defaultUserSecurityPolicy(userID)
	}
	return UserSecurityPolicyView{
		ForcePhoneBindingNextLogin:  policy.ForcePhoneBindingNextLogin,
		ForceMFAEnrollmentNextLogin: policy.ForceMFAEnrollmentNextLogin,
		LoginStepUpMode:             string(policy.LoginStepUpMode),
		HasEmail:                    strings.TrimSpace(user.Email) != "",
		HasPhone:                    strings.TrimSpace(user.Phone) != "",
		AvailableMFAMethods:         availableMFAEnrollmentMethods(user),
	}, nil
}

func (s *AdminService) UpdateUserSecurityPolicy(adminID, userID string, input UpdateUserSecurityPolicyInput) (UserSecurityPolicyView, error) {
	user, err := s.deps.store.GetUser(userID)
	if err != nil {
		return UserSecurityPolicyView{}, err
	}
	if user.Role == domain.RoleAdmin && input.ForceMFAEnrollmentNextLogin {
		return UserSecurityPolicyView{}, fmt.Errorf("mfa is disabled for admin accounts")
	}
	switch input.LoginStepUpMode {
	case "", domain.LoginStepUpModeNone:
		input.LoginStepUpMode = domain.LoginStepUpModeNone
	case domain.LoginStepUpModeEmail, domain.LoginStepUpModeSMS, domain.LoginStepUpModeEmailAndSMS:
	default:
		return UserSecurityPolicyView{}, fmt.Errorf("unsupported login step-up mode")
	}
	current, err := s.deps.store.GetUserSecurityPolicy(userID)
	if err != nil {
		if err != store.ErrNotFound {
			return UserSecurityPolicyView{}, err
		}
		current = defaultUserSecurityPolicy(userID)
	}
	current.ForcePhoneBindingNextLogin = input.ForcePhoneBindingNextLogin
	current.ForceMFAEnrollmentNextLogin = input.ForceMFAEnrollmentNextLogin
	current.LoginStepUpMode = input.LoginStepUpMode
	current.UpdatedAt = time.Now().UTC()
	if err := s.deps.store.UpsertUserSecurityPolicy(current); err != nil {
		return UserSecurityPolicyView{}, err
	}
	detail := map[string]any{
		"force_phone_binding_next_login":  current.ForcePhoneBindingNextLogin,
		"force_mfa_enrollment_next_login": current.ForceMFAEnrollmentNextLogin,
		"login_step_up_mode":              current.LoginStepUpMode,
	}
	s.audit.Record(adminID, domain.RoleAdmin, "admin.user.security_policy.update", userID, detail)
	s.deps.appendUserOperationLog(userID, "admin.user.security_policy.update", userID, detail)
	return UserSecurityPolicyView{
		ForcePhoneBindingNextLogin:  current.ForcePhoneBindingNextLogin,
		ForceMFAEnrollmentNextLogin: current.ForceMFAEnrollmentNextLogin,
		LoginStepUpMode:             string(current.LoginStepUpMode),
		HasEmail:                    strings.TrimSpace(user.Email) != "",
		HasPhone:                    strings.TrimSpace(user.Phone) != "",
		AvailableMFAMethods:         availableMFAEnrollmentMethods(user),
	}, nil
}

func (s *AdminService) ListAuditLogs() []domain.AuditLog {
	return s.deps.store.ListAudit()
}

func (s *AdminService) ListEmailSendLogs() []domain.EmailSendLog {
	return s.deps.store.ListEmailSendLogs()
}

func (s *AdminService) ListPhoneSendLogs() []domain.PhoneSendLog {
	return s.deps.store.ListPhoneSendLogs()
}

func (s *AdminService) ListRateLimitEvents() []domain.RateLimitEvent {
	return s.deps.store.ListRateLimitEvents()
}

func (s *AdminService) ListPasskeyLogs() AdminPasskeyLogs {
	return AdminPasskeyLogs{
		Passkeys:               s.deps.store.ListAllPasskeys(),
		RegistrationChallenges: s.deps.store.ListPasskeyRegistrationChallenges(),
		LoginChallenges:        s.deps.store.ListPasskeyLoginChallenges(),
		UsageLogs:              s.deps.store.ListPasskeyUsageLogs(),
	}
}

func (s *AdminService) DeleteRateLimitEvents(adminID string, logIDs []string) error {
	if len(logIDs) == 0 {
		return fmt.Errorf("no risk logs selected")
	}
	if err := s.deps.store.DeleteRateLimitEvents(logIDs); err != nil {
		return err
	}
	s.audit.Record(adminID, domain.RoleAdmin, "admin.risk_log.batch_delete", "", map[string]any{
		"count":   len(logIDs),
		"log_ids": logIDs,
	})
	return nil
}

func (s *AdminService) DeletePasskeyLogs(adminID, table string, recordIDs []string) error {
	if len(recordIDs) == 0 {
		return fmt.Errorf("no passkey records selected")
	}
	targetTable := strings.TrimSpace(table)
	var err error
	var action string
	switch targetTable {
	case "passkeys":
		err = s.deps.store.DeletePasskeys(recordIDs)
		action = "admin.passkey.passkeys.batch_delete"
	case "passkey_registration_challenges":
		err = s.deps.store.DeletePasskeyRegistrationChallenges(recordIDs)
		action = "admin.passkey.registration_challenge.batch_delete"
	case "passkey_login_challenges":
		err = s.deps.store.DeletePasskeyLoginChallenges(recordIDs)
		action = "admin.passkey.login_challenge.batch_delete"
	case "passkey_usage_logs":
		err = s.deps.store.DeletePasskeyUsageLogs(recordIDs)
		action = "admin.passkey.usage_log.batch_delete"
	default:
		return fmt.Errorf("unsupported passkey table")
	}
	if err != nil {
		return err
	}
	s.audit.Record(adminID, domain.RoleAdmin, action, "", map[string]any{
		"table":      targetTable,
		"count":      len(recordIDs),
		"record_ids": recordIDs,
	})
	return nil
}

func (s *AdminService) DeleteEmailSendLogs(adminID string, logIDs []string) error {
	if len(logIDs) == 0 {
		return fmt.Errorf("no email send logs selected")
	}
	if err := s.deps.store.DeleteEmailSendLogs(logIDs); err != nil {
		return err
	}
	s.audit.Record(adminID, domain.RoleAdmin, "admin.email_send_log.batch_delete", "", map[string]any{
		"count":   len(logIDs),
		"log_ids": logIDs,
	})
	return nil
}

func (s *AdminService) DeletePhoneSendLogs(adminID string, logIDs []string) error {
	if len(logIDs) == 0 {
		return fmt.Errorf("no phone send logs selected")
	}
	if err := s.deps.store.DeletePhoneSendLogs(logIDs); err != nil {
		return err
	}
	s.audit.Record(adminID, domain.RoleAdmin, "admin.phone_send_log.batch_delete", "", map[string]any{
		"count":   len(logIDs),
		"log_ids": logIDs,
	})
	return nil
}

func (s *AdminService) DeleteAuditLogs(adminID string, logIDs []string) error {
	if len(logIDs) == 0 {
		return fmt.Errorf("no audit logs selected")
	}
	if err := s.deps.store.DeleteAuditLogs(logIDs); err != nil {
		return err
	}
	s.audit.Record(adminID, domain.RoleAdmin, "admin.audit_log.batch_delete", "", map[string]any{
		"count":   len(logIDs),
		"log_ids": logIDs,
	})
	return nil
}

func (s *AdminService) ListGatewayPolicies() []domain.GatewayPolicy {
	return s.deps.store.ListPolicies()
}

func (s *AdminService) ListScopes() []domain.ScopeDefinition {
	return listScopeDefinitionsWithFallback(s.deps.store)
}

func (s *AdminService) UpsertScope(adminID string, input domain.ScopeDefinition) (domain.ScopeDefinition, error) {
	var existing *domain.ScopeDefinition
	current, err := s.deps.store.GetScope(strings.ToLower(strings.TrimSpace(input.Key)))
	if err == nil {
		existing = &current
	}
	scope, err := normalizeScopeDefinition(input, existing)
	if err != nil {
		return domain.ScopeDefinition{}, err
	}
	if err := s.deps.store.UpsertScope(scope); err != nil {
		return domain.ScopeDefinition{}, err
	}
	action := "admin.scope.create"
	if existing != nil {
		action = "admin.scope.update"
	}
	s.audit.Record(adminID, domain.RoleAdmin, action, scope.Key, map[string]any{
		"display_name":         scope.DisplayName,
		"description":          scope.Description,
		"enabled":              scope.Enabled,
		"developer_selectable": scope.DeveloperSelectable,
		"system":               scope.System,
	})
	return scope, nil
}

func (s *AdminService) DeleteScope(adminID, key string) error {
	key = strings.ToLower(strings.TrimSpace(key))
	scope, err := s.deps.store.GetScope(key)
	if err != nil {
		return err
	}
	if scope.System {
		return fmt.Errorf("system scope cannot be deleted")
	}
	count, err := s.deps.store.CountAppsByScope(key)
	if err != nil {
		return err
	}
	if count > 0 {
		return fmt.Errorf("scope is already assigned to %d app(s)", count)
	}
	if err := s.deps.store.DeleteScope(key); err != nil {
		return err
	}
	s.audit.Record(adminID, domain.RoleAdmin, "admin.scope.delete", key, map[string]any{
		"display_name": scope.DisplayName,
	})
	return nil
}

func deriveAdminDisplayName(email string) string {
	parts := strings.Split(strings.TrimSpace(email), "@")
	if len(parts) == 0 || parts[0] == "" {
		return "New User"
	}
	return parts[0]
}
