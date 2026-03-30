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
