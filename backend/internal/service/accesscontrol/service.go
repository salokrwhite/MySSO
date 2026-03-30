package accesscontrol

import (
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/service/audit"
	"mysso/backend/internal/service/common/deps"
	"mysso/backend/internal/store"
)

const (
	ConsentAccessStatusNormal     = "normal"
	ConsentAccessStatusRestricted = "restricted"
	ConsentAccessStatusBanned     = "banned"
)

type Service struct {
	deps  *deps.Deps
	audit *audit.Service
}

func New(dependencies *deps.Deps, auditService *audit.Service) *Service {
	return &Service{deps: dependencies, audit: auditService}
}

type DeveloperGroupView struct {
	domain.DeveloperGroup
	MemberCount   int      `json:"member_count"`
	BoundAppIDs   []string `json:"bound_app_ids"`
	BoundAppCount int      `json:"bound_app_count"`
}

type AppAccessView struct {
	AppID         string   `json:"app_id"`
	ClientID      string   `json:"client_id"`
	Name          string   `json:"name"`
	Status        string   `json:"status"`
	BoundGroupIDs []string `json:"bound_group_ids"`
}

type ManagedUserListResult struct {
	Items    []domain.DeveloperManagedUser
	Total    int
	Page     int
	PageSize int
}

type DeveloperAccessLogListResult struct {
	Items    []domain.DeveloperAccessLog
	Total    int
	Page     int
	PageSize int
}

type managedUserSummary struct {
	UserID           string
	LastAuthorizedAt time.Time
	AuthorizedApps   []domain.DeveloperManagedUserAuthorizedApp
}

func effectiveAppAccessVersion(item domain.AppUserAccessVersion) int {
	if item.Version <= 0 {
		return 1
	}
	return item.Version
}

func (s *Service) GetCurrentAppAccessVersion(appID, userID string) int {
	item, err := s.deps.Store.GetAppUserAccessVersion(appID, userID)
	if err != nil {
		return 1
	}
	return effectiveAppAccessVersion(item)
}

func (s *Service) EvaluateUserAppAccess(app domain.ClientApp, userID string, now time.Time) (string, string, *time.Time, *time.Time, error) {
	if ban, err := s.deps.Store.GetActiveAppUserBan(app.ID, userID, now); err == nil {
		restrictedAt := ban.UpdatedAt
		return ConsentAccessStatusBanned, strings.TrimSpace(ban.Reason), &restrictedAt, ban.ExpiresAt, nil
	} else if err != store.ErrNotFound {
		return "", "", nil, nil, err
	}

	bindings, err := s.deps.Store.ListAppGroupBindings(app.ID)
	if err != nil {
		return "", "", nil, nil, err
	}
	if len(bindings) == 0 {
		return ConsentAccessStatusNormal, "", nil, nil, nil
	}

	groups, err := s.deps.Store.ListUserGroupsByOwner(app.OwnerUserID, userID)
	if err != nil {
		return "", "", nil, nil, err
	}
	groupSet := make(map[string]struct{}, len(groups))
	for _, group := range groups {
		groupSet[group.ID] = struct{}{}
	}
	for _, binding := range bindings {
		if _, ok := groupSet[binding.GroupID]; ok {
			return ConsentAccessStatusNormal, "", nil, nil, nil
		}
	}
	restrictedAt := now
	return ConsentAccessStatusRestricted, "", &restrictedAt, nil, nil
}

func (s *Service) EnsureAppAccessAllowed(clientID, userID string, now time.Time) error {
	app, err := s.deps.Store.FindAppByClientID(clientID)
	if err != nil {
		return err
	}
	status, reason, _, _, err := s.EvaluateUserAppAccess(app, userID, now)
	if err != nil {
		return err
	}
	switch status {
	case ConsentAccessStatusBanned:
		if reason != "" {
			return fmt.Errorf("application access banned: %s", reason)
		}
		return fmt.Errorf("application access banned")
	case ConsentAccessStatusRestricted:
		return fmt.Errorf("application access restricted")
	default:
		return nil
	}
}

func (s *Service) DecorateConsents(userID string, items []domain.Consent) []domain.Consent {
	now := time.Now().UTC()
	result := make([]domain.Consent, 0, len(items))
	for _, item := range items {
		app, err := s.deps.Store.FindAppByClientID(item.ClientID)
		if err != nil {
			item.AccessStatus = ConsentAccessStatusRestricted
			result = append(result, item)
			continue
		}
		status, reason, restrictedAt, expiresAt, err := s.EvaluateUserAppAccess(app, userID, now)
		if err == nil {
			item.AccessStatus = status
			item.RestrictionReason = reason
			item.RestrictedAt = restrictedAt
			item.RestrictionExpires = expiresAt
		}
		result = append(result, item)
	}
	return result
}

func (s *Service) assertDeveloperOwnsApp(ownerUserID, appID string) (domain.ClientApp, error) {
	app, err := s.deps.Store.GetApp(appID)
	if err != nil {
		return domain.ClientApp{}, err
	}
	if app.OwnerUserID != ownerUserID {
		return domain.ClientApp{}, fmt.Errorf("forbidden")
	}
	return app, nil
}

func (s *Service) assertDeveloperOwnsGroups(ownerUserID string, groupIDs []string) error {
	for _, groupID := range groupIDs {
		if strings.TrimSpace(groupID) == "" {
			continue
		}
		group, err := s.deps.Store.GetDeveloperGroup(groupID)
		if err != nil {
			return err
		}
		if group.OwnerUserID != ownerUserID {
			return fmt.Errorf("forbidden")
		}
	}
	return nil
}

func (s *Service) ListDeveloperGroups(ownerUserID string) ([]DeveloperGroupView, error) {
	groups, err := s.deps.Store.ListDeveloperGroups(ownerUserID)
	if err != nil {
		return nil, err
	}
	items := make([]DeveloperGroupView, 0, len(groups))
	for _, group := range groups {
		members, err := s.deps.Store.ListDeveloperGroupMembers(group.ID)
		if err != nil {
			return nil, err
		}
		appIDs, err := s.deps.Store.ListAppIDsByGroup(group.ID)
		if err != nil {
			return nil, err
		}
		items = append(items, DeveloperGroupView{
			DeveloperGroup: group,
			MemberCount:    len(members),
			BoundAppIDs:    appIDs,
			BoundAppCount:  len(appIDs),
		})
	}
	return items, nil
}

func (s *Service) CreateDeveloperGroup(ownerUserID, actorID, name, description string) (domain.DeveloperGroup, error) {
	name = strings.TrimSpace(name)
	description = strings.TrimSpace(description)
	if name == "" {
		return domain.DeveloperGroup{}, fmt.Errorf("group name is required")
	}
	now := time.Now().UTC()
	group := domain.DeveloperGroup{
		ID:          uuid.NewString(),
		OwnerUserID: ownerUserID,
		Name:        name,
		Description: description,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	if err := s.deps.Store.CreateDeveloperGroup(group); err != nil {
		return domain.DeveloperGroup{}, err
	}
	s.recordDeveloperAccessLog(ownerUserID, actorID, "developer.group.create", "group", group.ID, "", "", group.ID, map[string]any{
		"name":        group.Name,
		"description": group.Description,
	})
	return group, nil
}

func (s *Service) UpdateDeveloperGroup(ownerUserID, actorID, groupID, name, description string) (domain.DeveloperGroup, error) {
	group, err := s.deps.Store.GetDeveloperGroup(groupID)
	if err != nil {
		return domain.DeveloperGroup{}, err
	}
	if group.OwnerUserID != ownerUserID {
		return domain.DeveloperGroup{}, fmt.Errorf("forbidden")
	}
	group.Name = strings.TrimSpace(name)
	group.Description = strings.TrimSpace(description)
	group.UpdatedAt = time.Now().UTC()
	if group.Name == "" {
		return domain.DeveloperGroup{}, fmt.Errorf("group name is required")
	}
	if err := s.deps.Store.UpdateDeveloperGroup(group); err != nil {
		return domain.DeveloperGroup{}, err
	}
	s.recordDeveloperAccessLog(ownerUserID, actorID, "developer.group.update", "group", group.ID, "", "", group.ID, map[string]any{
		"name":        group.Name,
		"description": group.Description,
	})
	return group, nil
}

func (s *Service) DeleteDeveloperGroup(ownerUserID, actorID, groupID string) error {
	group, err := s.deps.Store.GetDeveloperGroup(groupID)
	if err != nil {
		return err
	}
	if group.OwnerUserID != ownerUserID {
		return fmt.Errorf("forbidden")
	}
	if err := s.deps.Store.DeleteDeveloperGroup(groupID); err != nil {
		return err
	}
	s.recordDeveloperAccessLog(ownerUserID, actorID, "developer.group.delete", "group", groupID, "", "", groupID, map[string]any{
		"name": group.Name,
	})
	return nil
}

func (s *Service) ListManagedUsers(ownerUserID string) ([]domain.DeveloperManagedUser, error) {
	summaries, apps, err := s.buildManagedUserSummaries(ownerUserID, "")
	if err != nil {
		return nil, err
	}
	now := time.Now().UTC()
	items := make([]domain.DeveloperManagedUser, 0, len(summaries))
	for _, summary := range summaries {
		account, err := s.deps.Store.GetUser(summary.UserID)
		if err != nil {
			continue
		}
		item := domain.DeveloperManagedUser{
			UserID:           account.ID,
			DisplayName:      strings.TrimSpace(account.DisplayName),
			MaskedEmail:      strings.TrimSpace(account.Email),
			MaskedPhone:      maskPhone(account.Phone),
			LastAuthorizedAt: summary.LastAuthorizedAt,
			AuthorizedApps:   summary.AuthorizedApps,
			GroupIDs:         []string{},
			GroupNames:       []string{},
			AppBans:          []domain.AppUserBan{},
		}
		groups, err := s.deps.Store.ListUserGroupsByOwner(ownerUserID, summary.UserID)
		if err != nil {
			return nil, err
		}
		for _, group := range groups {
			item.GroupIDs = append(item.GroupIDs, group.ID)
			item.GroupNames = append(item.GroupNames, group.Name)
		}
		sort.Strings(item.GroupNames)
		for _, app := range apps {
			if ban, err := s.deps.Store.GetActiveAppUserBan(app.ID, summary.UserID, now); err == nil {
				item.AppBans = append(item.AppBans, ban)
			}
		}
		items = append(items, item)
	}
	return items, nil
}

func normalizeManagedUserPagination(page, pageSize int) (int, int) {
	if page <= 0 {
		page = 1
	}
	switch pageSize {
	case 10, 20, 50, 100:
	default:
		pageSize = 10
	}
	return page, pageSize
}

func normalizeAccessLogPagination(page, pageSize int) (int, int) {
	if page <= 0 {
		page = 1
	}
	switch pageSize {
	case 10, 20, 50, 100:
	default:
		pageSize = 10
	}
	return page, pageSize
}

func (s *Service) buildManagedUserSummaries(ownerUserID, appID string) ([]managedUserSummary, []domain.ClientApp, error) {
	apps := s.deps.Store.ListAppsByOwner(ownerUserID)
	relevantApps := apps
	if strings.TrimSpace(appID) != "" {
		app, err := s.assertDeveloperOwnsApp(ownerUserID, appID)
		if err != nil {
			return nil, nil, err
		}
		relevantApps = []domain.ClientApp{app}
	}

	userByID := map[string]*managedUserSummary{}
	for _, app := range relevantApps {
		consents, err := s.deps.Store.ListConsentsByClientID(app.ClientID, true)
		if err != nil {
			return nil, nil, err
		}
		for _, consent := range consents {
			user, ok := userByID[consent.UserID]
			if !ok {
				user = &managedUserSummary{UserID: consent.UserID}
				userByID[consent.UserID] = user
			}
			if consent.CreatedAt.After(user.LastAuthorizedAt) {
				user.LastAuthorizedAt = consent.CreatedAt
			}
			updated := false
			for index := range user.AuthorizedApps {
				if user.AuthorizedApps[index].AppID == app.ID {
					if consent.CreatedAt.After(user.AuthorizedApps[index].LastAuthorizedAt) {
						user.AuthorizedApps[index].LastAuthorizedAt = consent.CreatedAt
					}
					updated = true
					break
				}
			}
			if !updated {
				user.AuthorizedApps = append(user.AuthorizedApps, domain.DeveloperManagedUserAuthorizedApp{
					AppID:            app.ID,
					ClientID:         app.ClientID,
					AppName:          app.Name,
					LastAuthorizedAt: consent.CreatedAt,
				})
			}
		}
	}

	items := make([]managedUserSummary, 0, len(userByID))
	for _, item := range userByID {
		sort.Slice(item.AuthorizedApps, func(i, j int) bool {
			return item.AuthorizedApps[i].LastAuthorizedAt.After(item.AuthorizedApps[j].LastAuthorizedAt)
		})
		items = append(items, *item)
	}
	sort.Slice(items, func(i, j int) bool {
		return items[i].LastAuthorizedAt.After(items[j].LastAuthorizedAt)
	})
	return items, apps, nil
}

func (s *Service) ListManagedUsersPaginated(ownerUserID string, page, pageSize int, appID, emailKeyword string) (ManagedUserListResult, error) {
	page, pageSize = normalizeManagedUserPagination(page, pageSize)
	summaries, allApps, err := s.buildManagedUserSummaries(ownerUserID, appID)
	if err != nil {
		return ManagedUserListResult{}, err
	}
	emailKeyword = strings.ToLower(strings.TrimSpace(emailKeyword))
	if emailKeyword != "" {
		filtered := make([]managedUserSummary, 0, len(summaries))
		for _, summary := range summaries {
			account, err := s.deps.Store.GetUser(summary.UserID)
			if err != nil {
				continue
			}
			if strings.Contains(strings.ToLower(strings.TrimSpace(account.Email)), emailKeyword) {
				filtered = append(filtered, summary)
			}
		}
		summaries = filtered
	}
	total := len(summaries)
	start := (page - 1) * pageSize
	if start > total {
		start = total
	}
	end := start + pageSize
	if end > total {
		end = total
	}
	pageSummaries := summaries[start:end]
	now := time.Now().UTC()
	items := make([]domain.DeveloperManagedUser, 0, len(pageSummaries))
	for _, summary := range pageSummaries {
		account, err := s.deps.Store.GetUser(summary.UserID)
		if err != nil {
			continue
		}
		item := domain.DeveloperManagedUser{
			UserID:           account.ID,
			DisplayName:      strings.TrimSpace(account.DisplayName),
			MaskedEmail:      strings.TrimSpace(account.Email),
			MaskedPhone:      maskPhone(account.Phone),
			LastAuthorizedAt: summary.LastAuthorizedAt,
			AuthorizedApps:   summary.AuthorizedApps,
			GroupIDs:         []string{},
			GroupNames:       []string{},
			AppBans:          []domain.AppUserBan{},
		}
		groups, err := s.deps.Store.ListUserGroupsByOwner(ownerUserID, summary.UserID)
		if err != nil {
			return ManagedUserListResult{}, err
		}
		for _, group := range groups {
			item.GroupIDs = append(item.GroupIDs, group.ID)
			item.GroupNames = append(item.GroupNames, group.Name)
		}
		sort.Strings(item.GroupNames)
		for _, app := range allApps {
			if strings.TrimSpace(appID) != "" && app.ID != appID {
				continue
			}
			if ban, err := s.deps.Store.GetActiveAppUserBan(app.ID, summary.UserID, now); err == nil {
				item.AppBans = append(item.AppBans, ban)
			}
		}
		items = append(items, item)
	}
	return ManagedUserListResult{
		Items:    items,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

func (s *Service) ensureManagedUserVisible(ownerUserID, userID string) error {
	users, err := s.ListManagedUsers(ownerUserID)
	if err != nil {
		return err
	}
	for _, item := range users {
		if item.UserID == userID {
			return nil
		}
	}
	return fmt.Errorf("managed user not found")
}

func (s *Service) UpdateManagedUserGroups(ownerUserID, actorID, userID string, groupIDs []string) error {
	if err := s.ensureManagedUserVisible(ownerUserID, userID); err != nil {
		return err
	}
	if err := s.assertDeveloperOwnsGroups(ownerUserID, groupIDs); err != nil {
		return err
	}
	groups, err := s.deps.Store.ListDeveloperGroups(ownerUserID)
	if err != nil {
		return err
	}
	selected := map[string]struct{}{}
	for _, groupID := range groupIDs {
		groupID = strings.TrimSpace(groupID)
		if groupID != "" {
			selected[groupID] = struct{}{}
		}
	}
	affectedAppIDs := map[string]struct{}{}
	for _, group := range groups {
		appIDs, err := s.deps.Store.ListAppIDsByGroup(group.ID)
		if err != nil {
			return err
		}
		for _, appID := range appIDs {
			affectedAppIDs[appID] = struct{}{}
		}
		members, err := s.deps.Store.ListDeveloperGroupMembers(group.ID)
		if err != nil {
			return err
		}
		inGroup := false
		for _, memberID := range members {
			if memberID == userID {
				inGroup = true
				break
			}
		}
		_, shouldBeInGroup := selected[group.ID]
		if shouldBeInGroup && !inGroup {
			if err := s.deps.Store.AddDeveloperGroupMember(group.ID, userID); err != nil {
				return err
			}
		}
		if !shouldBeInGroup && inGroup {
			if err := s.deps.Store.RemoveDeveloperGroupMember(group.ID, userID); err != nil {
				return err
			}
		}
	}
	now := time.Now().UTC()
	for appID := range affectedAppIDs {
		if _, err := s.deps.Store.BumpAppUserAccessVersion(appID, userID, now); err != nil {
			return err
		}
		app, err := s.deps.Store.GetApp(appID)
		if err == nil {
			_ = s.deps.Store.RevokeRefreshTokensByUserClient(userID, app.ClientID)
		}
	}
	s.recordDeveloperAccessLog(ownerUserID, actorID, "developer.user.groups.update", "user", userID, "", userID, "", map[string]any{
		"group_ids": groupIDs,
	})
	return nil
}

func (s *Service) BatchUpdateManagedUserGroups(ownerUserID, actorID string, userIDs, groupIDs []string) error {
	if len(userIDs) == 0 {
		return fmt.Errorf("no managed users selected")
	}
	normalizedUserIDs := make([]string, 0, len(userIDs))
	userSet := make(map[string]struct{}, len(userIDs))
	for _, userID := range userIDs {
		userID = strings.TrimSpace(userID)
		if userID == "" {
			continue
		}
		if _, exists := userSet[userID]; exists {
			continue
		}
		userSet[userID] = struct{}{}
		normalizedUserIDs = append(normalizedUserIDs, userID)
	}
	if len(normalizedUserIDs) == 0 {
		return fmt.Errorf("no managed users selected")
	}
	for _, userID := range normalizedUserIDs {
		if err := s.UpdateManagedUserGroups(ownerUserID, actorID, userID, groupIDs); err != nil {
			return err
		}
	}
	s.recordDeveloperAccessLog(ownerUserID, actorID, "developer.user.groups.batch_update", "user_batch", "", "", "", "", map[string]any{
		"user_ids":   normalizedUserIDs,
		"group_ids":  groupIDs,
		"user_count": len(normalizedUserIDs),
	})
	return nil
}

func (s *Service) listManagedUserIDsForApp(ownerUserID, appID string) ([]string, error) {
	app, err := s.assertDeveloperOwnsApp(ownerUserID, appID)
	if err != nil {
		return nil, err
	}
	consents, err := s.deps.Store.ListConsentsByClientID(app.ClientID, true)
	if err != nil {
		return nil, err
	}
	userSet := make(map[string]struct{}, len(consents))
	for _, consent := range consents {
		userID := strings.TrimSpace(consent.UserID)
		if userID == "" {
			continue
		}
		userSet[userID] = struct{}{}
	}
	items := make([]string, 0, len(userSet))
	for userID := range userSet {
		items = append(items, userID)
	}
	sort.Strings(items)
	return items, nil
}

func (s *Service) ListAppAccessViews(ownerUserID string) ([]AppAccessView, error) {
	apps := s.deps.Store.ListAppsByOwner(ownerUserID)
	items := make([]AppAccessView, 0, len(apps))
	for _, app := range apps {
		bindings, err := s.deps.Store.ListAppGroupBindings(app.ID)
		if err != nil {
			return nil, err
		}
		groupIDs := make([]string, 0, len(bindings))
		for _, binding := range bindings {
			groupIDs = append(groupIDs, binding.GroupID)
		}
		sort.Strings(groupIDs)
		items = append(items, AppAccessView{
			AppID:         app.ID,
			ClientID:      app.ClientID,
			Name:          app.Name,
			Status:        string(app.Status),
			BoundGroupIDs: groupIDs,
		})
	}
	return items, nil
}

func (s *Service) UpdateAppBindings(ownerUserID, actorID, appID string, groupIDs []string) error {
	app, err := s.assertDeveloperOwnsApp(ownerUserID, appID)
	if err != nil {
		return err
	}
	if err := s.assertDeveloperOwnsGroups(ownerUserID, groupIDs); err != nil {
		return err
	}
	now := time.Now().UTC()
	if err := s.deps.Store.ReplaceAppGroupBindings(appID, groupIDs, now); err != nil {
		return err
	}
	managedUserIDs, err := s.listManagedUserIDsForApp(ownerUserID, appID)
	if err != nil {
		return err
	}
	for _, userID := range managedUserIDs {
		if _, err := s.deps.Store.BumpAppUserAccessVersion(appID, userID, now); err != nil {
			return err
		}
		if err := s.deps.Store.RevokeRefreshTokensByUserClient(userID, app.ClientID); err != nil {
			return err
		}
	}
	s.recordDeveloperAccessLog(ownerUserID, actorID, "developer.app.group_bindings.update", "app", appID, appID, "", "", map[string]any{
		"group_ids": groupIDs,
		"client_id": app.ClientID,
	})
	return nil
}

func (s *Service) BanAppUser(ownerUserID, actorID, appID, userID, reason string, expiresAt *time.Time) (domain.AppUserBan, error) {
	app, err := s.assertDeveloperOwnsApp(ownerUserID, appID)
	if err != nil {
		return domain.AppUserBan{}, err
	}
	if err := s.ensureManagedUserVisible(ownerUserID, userID); err != nil {
		return domain.AppUserBan{}, err
	}
	now := time.Now().UTC()
	ban := domain.AppUserBan{
		ID:        uuid.NewString(),
		AppID:     appID,
		UserID:    userID,
		Reason:    strings.TrimSpace(reason),
		ExpiresAt: expiresAt,
		CreatedAt: now,
		UpdatedAt: now,
	}
	if err := s.deps.Store.CreateOrUpdateAppUserBan(ban); err != nil {
		return domain.AppUserBan{}, err
	}
	if _, err := s.deps.Store.BumpAppUserAccessVersion(appID, userID, now); err != nil {
		return domain.AppUserBan{}, err
	}
	if err := s.deps.Store.RevokeRefreshTokensByUserClient(userID, app.ClientID); err != nil {
		return domain.AppUserBan{}, err
	}
	s.recordDeveloperAccessLog(ownerUserID, actorID, "developer.app.user_ban.create", "ban", ban.ID, appID, userID, "", map[string]any{
		"reason":     ban.Reason,
		"expires_at": ban.ExpiresAt,
		"client_id":  app.ClientID,
	})
	return ban, nil
}

func (s *Service) UnbanAppUser(ownerUserID, actorID, appID, userID string) error {
	app, err := s.assertDeveloperOwnsApp(ownerUserID, appID)
	if err != nil {
		return err
	}
	now := time.Now().UTC()
	if err := s.deps.Store.DeleteAppUserBan(appID, userID); err != nil {
		return err
	}
	if _, err := s.deps.Store.BumpAppUserAccessVersion(appID, userID, now); err != nil {
		return err
	}
	if err := s.deps.Store.RevokeRefreshTokensByUserClient(userID, app.ClientID); err != nil {
		return err
	}
	s.recordDeveloperAccessLog(ownerUserID, actorID, "developer.app.user_ban.delete", "ban", appID+":"+userID, appID, userID, "", map[string]any{
		"client_id": app.ClientID,
	})
	return nil
}

func (s *Service) ListDeveloperAccessLogs(ownerUserID string) ([]domain.DeveloperAccessLog, error) {
	return s.deps.Store.ListDeveloperAccessLogs(ownerUserID, false)
}

func (s *Service) ListDeveloperAccessLogsPaginated(ownerUserID string, page, pageSize int) (DeveloperAccessLogListResult, error) {
	page, pageSize = normalizeAccessLogPagination(page, pageSize)
	items, total, err := s.deps.Store.ListDeveloperAccessLogsPaginated(ownerUserID, false, page, pageSize)
	if err != nil {
		return DeveloperAccessLogListResult{}, err
	}
	return DeveloperAccessLogListResult{
		Items:    items,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

func (s *Service) ListAllDeveloperAccessLogs() ([]domain.DeveloperAccessLog, error) {
	return s.deps.Store.ListAllDeveloperAccessLogs(true)
}

func (s *Service) SoftDeleteDeveloperAccessLogs(ownerUserID string, ids []string) error {
	if len(ids) == 0 {
		return fmt.Errorf("no access logs selected")
	}
	return s.deps.Store.SoftDeleteDeveloperAccessLogs(ownerUserID, ids, time.Now().UTC())
}

func (s *Service) HardDeleteDeveloperAccessLogs(ids []string) error {
	if len(ids) == 0 {
		return fmt.Errorf("no access logs selected")
	}
	return s.deps.Store.HardDeleteDeveloperAccessLogs(ids)
}

func (s *Service) recordDeveloperAccessLog(ownerUserID, actorID, action, targetType, targetID, appID, userID, groupID string, detail map[string]any) {
	_ = s.deps.Store.AppendDeveloperAccessLog(domain.DeveloperAccessLog{
		ID:          uuid.NewString(),
		OwnerUserID: ownerUserID,
		ActorID:     actorID,
		Action:      action,
		TargetType:  targetType,
		TargetID:    targetID,
		AppID:       appID,
		UserID:      userID,
		GroupID:     groupID,
		Detail:      detail,
		CreatedAt:   time.Now().UTC(),
	})
	s.audit.Record(actorID, domain.RoleDeveloper, action, targetID, detail)
}

func maskEmail(email string) string {
	email = strings.TrimSpace(email)
	if email == "" {
		return ""
	}
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return email
	}
	name := parts[0]
	if len(name) <= 2 {
		return name[:1] + "***@" + parts[1]
	}
	return name[:1] + strings.Repeat("*", len(name)-2) + name[len(name)-1:] + "@" + parts[1]
}

func maskPhone(phone string) string {
	phone = strings.TrimSpace(phone)
	if len(phone) < 7 {
		return phone
	}
	return phone[:3] + "****" + phone[len(phone)-4:]
}
