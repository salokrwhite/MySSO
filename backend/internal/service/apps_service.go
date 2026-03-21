package service

import (
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/security"
)

type AppsService struct {
	deps  *serviceDeps
	audit *AuditService
}

type DeveloperAnalyticsSummary struct {
	AuthorizationSuccessRate int `json:"authorization_success_rate"`
	ActiveIntegrationRate    int `json:"active_integration_rate"`
	NeedsAttentionRate       int `json:"needs_attention_rate"`
}

type DeveloperAnalyticsAppItem struct {
	ID                 string `json:"id"`
	Name               string `json:"name"`
	Status             string `json:"status"`
	AuthorizationCount int    `json:"authorization_count"`
	TokenExchangeCount int    `json:"token_exchange_count"`
	ActiveUserCount    int    `json:"active_user_count"`
	SuccessRate        int    `json:"success_rate"`
}

type DeveloperAnalyticsResult struct {
	Summary DeveloperAnalyticsSummary   `json:"summary"`
	Apps    []DeveloperAnalyticsAppItem `json:"apps"`
}

func (s *AppsService) CreateDeveloperApp(
	ownerID,
	name,
	iconURL,
	description,
	frontChannelLogoutURI string,
	redirectURIs,
	postLogoutRedirectURIs,
	scopes []string,
) (domain.ClientApp, error) {
	scopes, err := s.validateRequestedScopes(scopes, true)
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
	now := time.Now().UTC()
	app := domain.ClientApp{
		ID:                     uuid.NewString(),
		Name:                   strings.TrimSpace(name),
		IconURL:                strings.TrimSpace(iconURL),
		OwnerUserID:            ownerID,
		ClientID:               "app_" + strings.ReplaceAll(uuid.NewString(), "-", ""),
		ClientSecret:           "",
		RedirectURIs:           redirectURIs,
		PostLogoutRedirectURIs: postLogoutRedirectURIs,
		FrontChannelLogoutURI:  strings.TrimSpace(frontChannelLogoutURI),
		Scopes:                 scopes,
		Status:                 domain.AppPending,
		Description:            strings.TrimSpace(description),
		CreatedAt:              now,
		UpdatedAt:              now,
	}
	app = s.deps.store.CreateApp(app)
	s.audit.Record(ownerID, domain.RoleDeveloper, "developer.app.create", app.ID, buildAppCreateAuditDetail(app))
	return app, nil
}

func (s *AppsService) UpdateDeveloperApp(
	actorID,
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
	if app.OwnerUserID != actorID {
		return domain.ClientApp{}, ErrForbidden
	}
	scopes, err = s.validateRequestedScopes(scopes, true)
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
	removeReplacedUploadedFile(app.IconURL, iconURL)
	app.Name = strings.TrimSpace(name)
	app.IconURL = strings.TrimSpace(iconURL)
	app.Description = strings.TrimSpace(description)
	app.RedirectURIs = redirectURIs
	app.PostLogoutRedirectURIs = postLogoutRedirectURIs
	app.FrontChannelLogoutURI = strings.TrimSpace(frontChannelLogoutURI)
	app.Scopes = scopes
	app.Status = domain.AppPending
	app.ReviewComment = ""
	app.UpdatedAt = time.Now().UTC()
	if err := s.deps.store.UpdateApp(app); err != nil {
		return domain.ClientApp{}, err
	}
	s.audit.Record(actorID, domain.RoleDeveloper, "developer.app.update", app.ID, map[string]any{
		"changes": buildAppChangeDetails(before, app),
	})
	return app, nil
}

func (s *AppsService) ResetAppSecret(actorID, appID string) (domain.ClientApp, error) {
	app, err := s.deps.store.GetApp(appID)
	if err != nil {
		return domain.ClientApp{}, err
	}
	if app.OwnerUserID != actorID {
		return domain.ClientApp{}, ErrForbidden
	}
	if app.Status != domain.AppApproved {
		return domain.ClientApp{}, ErrAppSecretRequiresApproval
	}
	action := "developer.app.reset_secret"
	if !app.HasClientSecret {
		action = "developer.app.create_secret"
	}
	app.ClientSecret = "sec_" + strings.ReplaceAll(uuid.NewString(), "-", "")
	app.HasClientSecret = true
	app.UpdatedAt = time.Now().UTC()
	if err := s.deps.store.UpdateApp(app); err != nil {
		return domain.ClientApp{}, err
	}
	s.audit.Record(actorID, domain.RoleDeveloper, action, app.ID, nil)
	return app, nil
}

func (s *AppsService) MigrateLegacyClientSecrets() error {
	for _, app := range s.deps.store.ListApps() {
		secret := strings.TrimSpace(app.ClientSecret)
		if secret == "" || security.LooksLikeBcryptHash(secret) {
			continue
		}
		if err := s.deps.store.UpdateApp(app); err != nil {
			return err
		}
	}
	return nil
}

func (s *AppsService) MigrateAppOAuthURLs() error {
	for _, app := range s.deps.store.ListApps() {
		sanitizedRedirects, sanitizedPostLogout, sanitizedFrontChannel := sanitizeStoredAppOAuthURLs(
			app.RedirectURIs,
			app.PostLogoutRedirectURIs,
			app.FrontChannelLogoutURI,
		)
		if stringSlicesEqual(app.RedirectURIs, sanitizedRedirects) &&
			stringSlicesEqual(app.PostLogoutRedirectURIs, sanitizedPostLogout) &&
			strings.TrimSpace(app.FrontChannelLogoutURI) == sanitizedFrontChannel {
			continue
		}
		app.RedirectURIs = sanitizedRedirects
		app.PostLogoutRedirectURIs = sanitizedPostLogout
		app.FrontChannelLogoutURI = sanitizedFrontChannel
		app.UpdatedAt = time.Now().UTC()
		if err := s.deps.store.UpdateApp(app); err != nil {
			return err
		}
	}
	return nil
}

func (s *AppsService) DeleteDeveloperApp(actorID, appID string) error {
	app, err := s.deps.store.GetApp(appID)
	if err != nil {
		return err
	}
	if app.OwnerUserID != actorID {
		return ErrForbidden
	}
	removeReplacedUploadedFile(app.IconURL, "")
	if err := s.deps.store.DeleteApp(appID); err != nil {
		return err
	}
	s.audit.Record(actorID, domain.RoleDeveloper, "developer.app.delete", appID, map[string]any{
		"name":      app.Name,
		"client_id": app.ClientID,
	})
	return nil
}

func (s *AppsService) ReviewApp(adminID, appID string, approved bool, comment string) (domain.ClientApp, error) {
	app, err := s.deps.store.GetApp(appID)
	if err != nil {
		return domain.ClientApp{}, err
	}
	if approved {
		app.Status = domain.AppApproved
	} else {
		app.Status = domain.AppRejected
	}
	app.ReviewComment = comment
	app.UpdatedAt = time.Now().UTC()
	if err := s.deps.store.UpdateApp(app); err != nil {
		return domain.ClientApp{}, err
	}
	action := "admin.app.reject"
	if approved {
		action = "admin.app.approve"
	}
	s.audit.Record(adminID, domain.RoleAdmin, action, app.ID, map[string]any{"comment": comment})
	return app, nil
}

func (s *AppsService) ListDeveloperApps(ownerID string) []domain.ClientApp {
	return s.deps.store.ListAppsByOwner(ownerID)
}

func (s *AppsService) ListApps() []domain.ClientApp {
	return s.deps.store.ListApps()
}

func (s *AppsService) GetAppByClientID(clientID string) (domain.ClientApp, error) {
	return s.deps.store.FindAppByClientID(strings.TrimSpace(clientID))
}

func (s *AppsService) ListDeveloperSelectableScopes() []domain.ScopeDefinition {
	items := listScopeDefinitionsWithFallback(s.deps.store)
	filtered := make([]domain.ScopeDefinition, 0, len(items))
	for _, item := range items {
		if item.Enabled && item.DeveloperSelectable {
			filtered = append(filtered, item)
		}
	}
	return filtered
}

func (s *AppsService) ListEnabledScopes() []domain.ScopeDefinition {
	items := listScopeDefinitionsWithFallback(s.deps.store)
	filtered := make([]domain.ScopeDefinition, 0, len(items))
	for _, item := range items {
		if item.Enabled {
			filtered = append(filtered, item)
		}
	}
	return filtered
}

func (s *AppsService) ListDeveloperAuditLogs(ownerID string) []domain.AuditLog {
	apps := s.deps.store.ListAppsByOwner(ownerID)
	visibleTargets := make(map[string]struct{}, len(apps))
	for _, app := range apps {
		visibleTargets[app.ID] = struct{}{}
	}

	logs := s.deps.store.ListAudit()
	filtered := make([]domain.AuditLog, 0, len(logs))
	for _, log := range logs {
		if log.ActorID == ownerID {
			filtered = append(filtered, log)
			continue
		}
		if _, ok := visibleTargets[log.TargetID]; ok {
			filtered = append(filtered, log)
		}
	}
	return filtered
}

func (s *AppsService) DeleteDeveloperAuditLogs(ownerID string, logIDs []string) error {
	if len(logIDs) == 0 {
		return fmt.Errorf("no audit logs selected")
	}
	visibleLogs := s.ListDeveloperAuditLogs(ownerID)
	visibleLogIDs := make(map[string]struct{}, len(visibleLogs))
	for _, log := range visibleLogs {
		visibleLogIDs[log.ID] = struct{}{}
	}
	for _, logID := range logIDs {
		if _, ok := visibleLogIDs[logID]; !ok {
			return ErrForbidden
		}
	}
	return s.deps.store.DeleteAuditLogs(logIDs)
}

func (s *AppsService) GetDeveloperAnalytics(ownerID string) DeveloperAnalyticsResult {
	apps := s.deps.store.ListAppsByOwner(ownerID)
	if len(apps) == 0 {
		return DeveloperAnalyticsResult{
			Summary: DeveloperAnalyticsSummary{},
			Apps:    []DeveloperAnalyticsAppItem{},
		}
	}

	appByClientID := make(map[string]domain.ClientApp, len(apps))
	for _, app := range apps {
		appByClientID[app.ClientID] = app
	}

	type appMetrics struct {
		authorizeCount int
		tokenCount     int
		activeUsers    map[string]struct{}
	}

	metricsByClientID := make(map[string]*appMetrics, len(apps))
	for clientID := range appByClientID {
		metricsByClientID[clientID] = &appMetrics{activeUsers: map[string]struct{}{}}
	}

	for _, log := range s.deps.store.ListAudit() {
		metrics := metricsByClientID[log.TargetID]
		if metrics == nil {
			continue
		}
		switch log.Action {
		case "oauth.authorize":
			metrics.authorizeCount++
			if strings.TrimSpace(log.ActorID) != "" {
				metrics.activeUsers[log.ActorID] = struct{}{}
			}
		case "oauth.token":
			grantType, _ := log.Detail["grant_type"].(string)
			if grantType == "authorization_code" {
				metrics.tokenCount++
				if strings.TrimSpace(log.ActorID) != "" {
					metrics.activeUsers[log.ActorID] = struct{}{}
				}
			}
		}
	}

	items := make([]DeveloperAnalyticsAppItem, 0, len(apps))
	totalAuthorizeCount := 0
	totalTokenCount := 0
	activeApprovedApps := 0
	needsAttentionApps := 0
	approvedApps := 0

	for _, app := range apps {
		metrics := metricsByClientID[app.ClientID]
		successRate := 0
		if metrics.authorizeCount > 0 {
			successRate = int(float64(metrics.tokenCount) / float64(metrics.authorizeCount) * 100)
		}
		if successRate > 100 {
			successRate = 100
		}

		if app.Status == domain.AppApproved {
			approvedApps++
			if metrics.authorizeCount > 0 || metrics.tokenCount > 0 {
				activeApprovedApps++
			}
		}
		if app.Status != domain.AppApproved || (metrics.authorizeCount > 0 && successRate < 60) {
			needsAttentionApps++
		}

		totalAuthorizeCount += metrics.authorizeCount
		totalTokenCount += metrics.tokenCount
		items = append(items, DeveloperAnalyticsAppItem{
			ID:                 app.ID,
			Name:               app.Name,
			Status:             string(app.Status),
			AuthorizationCount: metrics.authorizeCount,
			TokenExchangeCount: metrics.tokenCount,
			ActiveUserCount:    len(metrics.activeUsers),
			SuccessRate:        successRate,
		})
	}

	sort.Slice(items, func(left, right int) bool {
		if items[left].AuthorizationCount == items[right].AuthorizationCount {
			return items[left].Name < items[right].Name
		}
		return items[left].AuthorizationCount > items[right].AuthorizationCount
	})

	successRate := 0
	if totalAuthorizeCount > 0 {
		successRate = int(float64(totalTokenCount) / float64(totalAuthorizeCount) * 100)
		if successRate > 100 {
			successRate = 100
		}
	}

	activeIntegrationRate := 0
	if approvedApps > 0 {
		activeIntegrationRate = int(float64(activeApprovedApps) / float64(approvedApps) * 100)
	}

	needsAttentionRate := int(float64(needsAttentionApps) / float64(len(apps)) * 100)

	return DeveloperAnalyticsResult{
		Summary: DeveloperAnalyticsSummary{
			AuthorizationSuccessRate: successRate,
			ActiveIntegrationRate:    activeIntegrationRate,
			NeedsAttentionRate:       needsAttentionRate,
		},
		Apps: items,
	}
}

func (s *AppsService) validateRequestedScopes(scopes []string, developerOnly bool) ([]string, error) {
	normalized := normalizeScopeList(scopes)
	if len(normalized) == 0 {
		return nil, fmt.Errorf("at least one scope is required")
	}
	definitions := listScopeDefinitionsWithFallback(s.deps.store)
	scopeMap := make(map[string]domain.ScopeDefinition, len(definitions))
	for _, item := range definitions {
		scopeMap[item.Key] = item
	}
	for _, item := range normalized {
		definition, ok := scopeMap[item]
		if !ok {
			return nil, fmt.Errorf("scope %s is not defined", item)
		}
		if !definition.Enabled {
			return nil, fmt.Errorf("scope %s is disabled", item)
		}
		if developerOnly && !definition.DeveloperSelectable {
			return nil, fmt.Errorf("scope %s is restricted by administrator", item)
		}
	}
	if !contains(normalized, "openid") {
		return nil, fmt.Errorf("openid scope is required")
	}
	return normalized, nil
}
