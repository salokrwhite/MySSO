package memory

import (
	"slices"
	"strings"
	"time"

	"mysso/backend/internal/domain"
)

func appUserKey(appID, userID string) string {
	return strings.TrimSpace(appID) + ":" + strings.TrimSpace(userID)
}

func (s *MemoryStore) ListDeveloperGroups(ownerUserID string) ([]domain.DeveloperGroup, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	items := make([]domain.DeveloperGroup, 0)
	for _, group := range s.developerGroups {
		if group.OwnerUserID == ownerUserID {
			items = append(items, group)
		}
	}
	slices.SortFunc(items, func(a, b domain.DeveloperGroup) int {
		return strings.Compare(a.Name, b.Name)
	})
	return items, nil
}

func (s *MemoryStore) GetDeveloperGroup(id string) (domain.DeveloperGroup, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	group, ok := s.developerGroups[id]
	if !ok {
		return domain.DeveloperGroup{}, ErrNotFound
	}
	return group, nil
}

func (s *MemoryStore) CreateDeveloperGroup(group domain.DeveloperGroup) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.developerGroups[group.ID] = group
	if _, ok := s.developerGroupMembers[group.ID]; !ok {
		s.developerGroupMembers[group.ID] = map[string]struct{}{}
	}
	return nil
}

func (s *MemoryStore) UpdateDeveloperGroup(group domain.DeveloperGroup) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.developerGroups[group.ID]; !ok {
		return ErrNotFound
	}
	s.developerGroups[group.ID] = group
	return nil
}

func (s *MemoryStore) DeleteDeveloperGroup(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.developerGroups, id)
	delete(s.developerGroupMembers, id)
	for appID, bindings := range s.appGroupBindings {
		delete(bindings, id)
		if len(bindings) == 0 {
			delete(s.appGroupBindings, appID)
		}
	}
	return nil
}

func (s *MemoryStore) ListDeveloperGroupMembers(groupID string) ([]string, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	set := s.developerGroupMembers[groupID]
	items := make([]string, 0, len(set))
	for userID := range set {
		items = append(items, userID)
	}
	slices.Sort(items)
	return items, nil
}

func (s *MemoryStore) AddDeveloperGroupMember(groupID, userID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.developerGroupMembers[groupID]; !ok {
		s.developerGroupMembers[groupID] = map[string]struct{}{}
	}
	s.developerGroupMembers[groupID][userID] = struct{}{}
	return nil
}

func (s *MemoryStore) RemoveDeveloperGroupMember(groupID, userID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if members, ok := s.developerGroupMembers[groupID]; ok {
		delete(members, userID)
	}
	return nil
}

func (s *MemoryStore) ListUserGroupsByOwner(ownerUserID, userID string) ([]domain.DeveloperGroup, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	items := make([]domain.DeveloperGroup, 0)
	for groupID, group := range s.developerGroups {
		if group.OwnerUserID != ownerUserID {
			continue
		}
		if members, ok := s.developerGroupMembers[groupID]; ok {
			if _, ok := members[userID]; ok {
				items = append(items, group)
			}
		}
	}
	slices.SortFunc(items, func(a, b domain.DeveloperGroup) int {
		return strings.Compare(a.Name, b.Name)
	})
	return items, nil
}

func (s *MemoryStore) ListAppGroupBindings(appID string) ([]domain.AppGroupBinding, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	bindings := s.appGroupBindings[appID]
	items := make([]domain.AppGroupBinding, 0, len(bindings))
	for _, binding := range bindings {
		if group, ok := s.developerGroups[binding.GroupID]; ok {
			binding.GroupName = group.Name
		}
		items = append(items, binding)
	}
	slices.SortFunc(items, func(a, b domain.AppGroupBinding) int {
		return strings.Compare(a.GroupName, b.GroupName)
	})
	return items, nil
}

func (s *MemoryStore) ReplaceAppGroupBindings(appID string, groupIDs []string, createdAt time.Time) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	next := map[string]domain.AppGroupBinding{}
	for _, groupID := range groupIDs {
		groupID = strings.TrimSpace(groupID)
		if groupID == "" {
			continue
		}
		next[groupID] = domain.AppGroupBinding{
			AppID:     appID,
			GroupID:   groupID,
			CreatedAt: createdAt,
		}
	}
	s.appGroupBindings[appID] = next
	return nil
}

func (s *MemoryStore) ListAppIDsByGroup(groupID string) ([]string, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	items := make([]string, 0)
	for appID, bindings := range s.appGroupBindings {
		if _, ok := bindings[groupID]; ok {
			items = append(items, appID)
		}
	}
	slices.Sort(items)
	return items, nil
}

func memoryMaskManagedUserPhone(phone string) string {
	phone = strings.TrimSpace(phone)
	if len(phone) < 7 {
		return phone
	}
	return phone[:3] + "****" + phone[len(phone)-4:]
}

func (s *MemoryStore) HasManagedUser(ownerUserID, userID string) (bool, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	userID = strings.TrimSpace(userID)
	for _, app := range s.apps {
		if app.OwnerUserID != ownerUserID {
			continue
		}
		for _, consent := range s.consents {
			if consent.ClientID == app.ClientID && consent.UserID == userID {
				return true, nil
			}
		}
	}
	return false, nil
}

func (s *MemoryStore) ListManagedUsersPaginated(ownerUserID string, page, pageSize int, appID, emailKeyword string, groupIDs []string, now time.Time) ([]domain.DeveloperManagedUser, int, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	ownerApps := make([]domain.ClientApp, 0)
	for _, app := range s.apps {
		if app.OwnerUserID != ownerUserID {
			continue
		}
		if strings.TrimSpace(appID) != "" && app.ID != appID {
			continue
		}
		ownerApps = append(ownerApps, app)
	}
	appByClientID := map[string]domain.ClientApp{}
	for _, app := range ownerApps {
		appByClientID[app.ClientID] = app
	}
	userByID := map[string]*domain.DeveloperManagedUser{}
	for _, consent := range s.consents {
		app, ok := appByClientID[consent.ClientID]
		if !ok {
			continue
		}
		account, ok := s.users[consent.UserID]
		if !ok {
			continue
		}
		keyword := strings.ToLower(strings.TrimSpace(emailKeyword))
		if keyword != "" && !strings.Contains(strings.ToLower(strings.TrimSpace(account.Email)), keyword) {
			continue
		}
		item, ok := userByID[account.ID]
		if !ok {
			item = &domain.DeveloperManagedUser{
				UserID:           account.ID,
				DisplayName:      strings.TrimSpace(account.DisplayName),
				MaskedEmail:      strings.TrimSpace(account.Email),
				MaskedPhone:      memoryMaskManagedUserPhone(account.Phone),
				AuthorizedApps:   []domain.DeveloperManagedUserAuthorizedApp{},
				GroupIDs:         []string{},
				GroupNames:       []string{},
				AppBans:          []domain.AppUserBan{},
				LastAuthorizedAt: consent.CreatedAt,
			}
			userByID[account.ID] = item
		}
		if consent.CreatedAt.After(item.LastAuthorizedAt) {
			item.LastAuthorizedAt = consent.CreatedAt
		}
		foundApp := false
		for index := range item.AuthorizedApps {
			if item.AuthorizedApps[index].AppID == app.ID {
				foundApp = true
				if consent.CreatedAt.After(item.AuthorizedApps[index].LastAuthorizedAt) {
					item.AuthorizedApps[index].LastAuthorizedAt = consent.CreatedAt
				}
				break
			}
		}
		if !foundApp {
			item.AuthorizedApps = append(item.AuthorizedApps, domain.DeveloperManagedUserAuthorizedApp{
				AppID:            app.ID,
				ClientID:         app.ClientID,
				AppName:          app.Name,
				LastAuthorizedAt: consent.CreatedAt,
			})
		}
	}

	groupFilter := map[string]struct{}{}
	for _, groupID := range groupIDs {
		groupID = strings.TrimSpace(groupID)
		if groupID != "" {
			groupFilter[groupID] = struct{}{}
		}
	}
	items := make([]domain.DeveloperManagedUser, 0, len(userByID))
	for _, item := range userByID {
		matchesGroupFilter := len(groupFilter) == 0
		for groupID, group := range s.developerGroups {
			if group.OwnerUserID != ownerUserID {
				continue
			}
			if members, ok := s.developerGroupMembers[groupID]; ok {
				if _, ok := members[item.UserID]; ok {
					item.GroupIDs = append(item.GroupIDs, group.ID)
					item.GroupNames = append(item.GroupNames, group.Name)
					if _, ok := groupFilter[group.ID]; ok {
						matchesGroupFilter = true
					}
				}
			}
		}
		if !matchesGroupFilter {
			continue
		}
		slices.Sort(item.GroupNames)
		for _, app := range ownerApps {
			ban, ok := s.appUserBans[appUserKey(app.ID, item.UserID)]
			if !ok {
				continue
			}
			if ban.ExpiresAt != nil && !ban.ExpiresAt.After(now) {
				continue
			}
			item.AppBans = append(item.AppBans, ban)
		}
		slices.SortFunc(item.AuthorizedApps, func(a, b domain.DeveloperManagedUserAuthorizedApp) int {
			if a.LastAuthorizedAt.Equal(b.LastAuthorizedAt) {
				return strings.Compare(a.AppID, b.AppID)
			}
			if a.LastAuthorizedAt.After(b.LastAuthorizedAt) {
				return -1
			}
			return 1
		})
		items = append(items, *item)
	}
	slices.SortFunc(items, func(a, b domain.DeveloperManagedUser) int {
		if a.LastAuthorizedAt.Equal(b.LastAuthorizedAt) {
			return strings.Compare(a.UserID, b.UserID)
		}
		if a.LastAuthorizedAt.After(b.LastAuthorizedAt) {
			return -1
		}
		return 1
	})
	total := len(items)
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}
	start := (page - 1) * pageSize
	if start >= total {
		return []domain.DeveloperManagedUser{}, total, nil
	}
	end := start + pageSize
	if end > total {
		end = total
	}
	return items[start:end], total, nil
}

func (s *MemoryStore) CreateOrUpdateAppUserBan(ban domain.AppUserBan) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.appUserBans[appUserKey(ban.AppID, ban.UserID)] = ban
	return nil
}

func (s *MemoryStore) GetActiveAppUserBan(appID, userID string, now time.Time) (domain.AppUserBan, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	ban, ok := s.appUserBans[appUserKey(appID, userID)]
	if !ok {
		return domain.AppUserBan{}, ErrNotFound
	}
	if ban.ExpiresAt != nil && ban.ExpiresAt.Before(now) {
		return domain.AppUserBan{}, ErrNotFound
	}
	return ban, nil
}

func (s *MemoryStore) ListAppUserBans(appID string, includeExpired bool, now time.Time) ([]domain.AppUserBan, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	items := make([]domain.AppUserBan, 0)
	for _, ban := range s.appUserBans {
		if ban.AppID != appID {
			continue
		}
		if !includeExpired && ban.ExpiresAt != nil && ban.ExpiresAt.Before(now) {
			continue
		}
		items = append(items, ban)
	}
	slices.SortFunc(items, func(a, b domain.AppUserBan) int {
		if a.UpdatedAt.Equal(b.UpdatedAt) {
			return strings.Compare(a.UserID, b.UserID)
		}
		if a.UpdatedAt.After(b.UpdatedAt) {
			return -1
		}
		return 1
	})
	return items, nil
}

func (s *MemoryStore) DeleteAppUserBan(appID, userID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.appUserBans, appUserKey(appID, userID))
	return nil
}

func (s *MemoryStore) GetAppUserAccessVersion(appID, userID string) (domain.AppUserAccessVersion, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	item, ok := s.appUserAccessVersions[appUserKey(appID, userID)]
	if !ok {
		return domain.AppUserAccessVersion{}, ErrNotFound
	}
	return item, nil
}

func (s *MemoryStore) BumpAppUserAccessVersion(appID, userID string, updatedAt time.Time) (domain.AppUserAccessVersion, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	key := appUserKey(appID, userID)
	item, ok := s.appUserAccessVersions[key]
	if !ok {
		item = domain.AppUserAccessVersion{
			AppID:   appID,
			UserID:  userID,
			Version: 2,
		}
	} else {
		item.Version++
	}
	item.UpdatedAt = updatedAt
	s.appUserAccessVersions[key] = item
	return item, nil
}

func (s *MemoryStore) AppendDeveloperAccessLog(log domain.DeveloperAccessLog) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.developerAccessLogs = append([]domain.DeveloperAccessLog{log}, s.developerAccessLogs...)
	return nil
}

func (s *MemoryStore) ListDeveloperAccessLogs(ownerUserID string, includeDeleted bool) ([]domain.DeveloperAccessLog, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	items := make([]domain.DeveloperAccessLog, 0)
	for _, log := range s.developerAccessLogs {
		if log.OwnerUserID != ownerUserID {
			continue
		}
		if !includeDeleted && log.DeletedAt != nil {
			continue
		}
		items = append(items, log)
	}
	return items, nil
}

func (s *MemoryStore) ListDeveloperAccessLogsPaginated(ownerUserID string, includeDeleted bool, page, pageSize int) ([]domain.DeveloperAccessLog, int, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	items := make([]domain.DeveloperAccessLog, 0)
	for _, log := range s.developerAccessLogs {
		if log.OwnerUserID != ownerUserID {
			continue
		}
		if !includeDeleted && log.DeletedAt != nil {
			continue
		}
		items = append(items, log)
	}
	total := len(items)
	start := (page - 1) * pageSize
	if start > total {
		start = total
	}
	if start < 0 {
		start = 0
	}
	end := start + pageSize
	if end > total {
		end = total
	}
	return items[start:end], total, nil
}

func (s *MemoryStore) ListAllDeveloperAccessLogs(includeDeleted bool) ([]domain.DeveloperAccessLog, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	items := make([]domain.DeveloperAccessLog, 0, len(s.developerAccessLogs))
	for _, log := range s.developerAccessLogs {
		if !includeDeleted && log.DeletedAt != nil {
			continue
		}
		items = append(items, log)
	}
	return items, nil
}

func (s *MemoryStore) ListAllDeveloperAccessLogsPaginated(includeDeleted bool, page, pageSize int) ([]domain.DeveloperAccessLog, int, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}
	items := make([]domain.DeveloperAccessLog, 0, len(s.developerAccessLogs))
	for _, log := range s.developerAccessLogs {
		if !includeDeleted && log.DeletedAt != nil {
			continue
		}
		items = append(items, log)
	}
	total := len(items)
	start := (page - 1) * pageSize
	if start >= total {
		return []domain.DeveloperAccessLog{}, total, nil
	}
	if start < 0 {
		start = 0
	}
	end := start + pageSize
	if end > total {
		end = total
	}
	return append([]domain.DeveloperAccessLog{}, items[start:end]...), total, nil
}

func (s *MemoryStore) SoftDeleteDeveloperAccessLogs(ownerUserID string, ids []string, deletedAt time.Time) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	idSet := map[string]struct{}{}
	for _, id := range ids {
		idSet[id] = struct{}{}
	}
	for index, log := range s.developerAccessLogs {
		if log.OwnerUserID != ownerUserID {
			continue
		}
		if _, ok := idSet[log.ID]; !ok {
			continue
		}
		log.DeletedAt = &deletedAt
		s.developerAccessLogs[index] = log
	}
	return nil
}

func (s *MemoryStore) HardDeleteDeveloperAccessLogs(ids []string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	idSet := map[string]struct{}{}
	for _, id := range ids {
		idSet[id] = struct{}{}
	}
	filtered := s.developerAccessLogs[:0]
	for _, log := range s.developerAccessLogs {
		if _, ok := idSet[log.ID]; ok {
			continue
		}
		filtered = append(filtered, log)
	}
	s.developerAccessLogs = filtered
	return nil
}
