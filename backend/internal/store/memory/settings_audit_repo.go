package memory

import (
	"slices"
	"sort"
	"time"

	"mysso/backend/internal/domain"
)

func (s *MemoryStore) AppendAudit(log domain.AuditLog) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.auditLogs = append([]domain.AuditLog{log}, s.auditLogs...)
}

func (s *MemoryStore) ListAudit() []domain.AuditLog {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return slices.Clone(s.auditLogs)
}

func (s *MemoryStore) ListAuditPaginated(page, pageSize int) ([]domain.AuditLog, int, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}
	total := len(s.auditLogs)
	start := (page - 1) * pageSize
	if start >= total {
		return []domain.AuditLog{}, total, nil
	}
	end := start + pageSize
	if end > total {
		end = total
	}
	return slices.Clone(s.auditLogs[start:end]), total, nil
}

func (s *MemoryStore) CountAuditLogs() (int, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return len(s.auditLogs), nil
}

func (s *MemoryStore) ListAuditByTarget(targetID string) []domain.AuditLog {
	s.mu.RLock()
	defer s.mu.RUnlock()
	items := []domain.AuditLog{}
	for _, log := range s.auditLogs {
		if log.TargetID == targetID {
			items = append(items, log)
		}
	}
	sort.Slice(items, func(i, j int) bool {
		return items[i].CreatedAt.After(items[j].CreatedAt)
	})
	return items
}

func (s *MemoryStore) DeleteAuditLogs(ids []string) error {
	if len(ids) == 0 {
		return nil
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	idSet := make(map[string]struct{}, len(ids))
	for _, id := range ids {
		idSet[id] = struct{}{}
	}

	filtered := s.auditLogs[:0]
	for _, log := range s.auditLogs {
		if _, shouldDelete := idSet[log.ID]; shouldDelete {
			continue
		}
		filtered = append(filtered, log)
	}
	s.auditLogs = filtered
	return nil
}

func (s *MemoryStore) DeleteAuditLogsByTarget(targetID string, startAt, endAt *time.Time) (int64, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	filtered := s.auditLogs[:0]
	var deleted int64
	for _, log := range s.auditLogs {
		if log.TargetID != targetID {
			filtered = append(filtered, log)
			continue
		}
		if startAt != nil && log.CreatedAt.Before(*startAt) {
			filtered = append(filtered, log)
			continue
		}
		if endAt != nil && log.CreatedAt.After(*endAt) {
			filtered = append(filtered, log)
			continue
		}
		deleted++
	}
	s.auditLogs = filtered
	return deleted, nil
}

func (s *MemoryStore) AppendUserOperationLog(log domain.UserOperationLog) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.userOperationLogs = append([]domain.UserOperationLog{log}, s.userOperationLogs...)
}

func (s *MemoryStore) ListUserOperationLogs(userID string, page, pageSize int) ([]domain.UserOperationLog, int, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	filtered := make([]domain.UserOperationLog, 0)
	for _, log := range s.userOperationLogs {
		if log.UserID == userID {
			filtered = append(filtered, log)
		}
	}

	total := len(filtered)
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}
	start := (page - 1) * pageSize
	if start >= total {
		return []domain.UserOperationLog{}, total, nil
	}
	end := start + pageSize
	if end > total {
		end = total
	}
	return slices.Clone(filtered[start:end]), total, nil
}

func (s *MemoryStore) DeleteUserOperationLogs(userID string, startAt, endAt *time.Time) (int64, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	filtered := s.userOperationLogs[:0]
	var deleted int64
	for _, log := range s.userOperationLogs {
		if log.UserID != userID {
			filtered = append(filtered, log)
			continue
		}
		if startAt != nil && log.CreatedAt.Before(*startAt) {
			filtered = append(filtered, log)
			continue
		}
		if endAt != nil && log.CreatedAt.After(*endAt) {
			filtered = append(filtered, log)
			continue
		}
		deleted++
	}
	s.userOperationLogs = filtered
	return deleted, nil
}

func (s *MemoryStore) AppendEmailSendLog(log domain.EmailSendLog) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.emailSendLogs = append([]domain.EmailSendLog{log}, s.emailSendLogs...)
}

func (s *MemoryStore) ListEmailSendLogs() []domain.EmailSendLog {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return slices.Clone(s.emailSendLogs)
}

func (s *MemoryStore) DeleteEmailSendLogs(ids []string) error {
	if len(ids) == 0 {
		return nil
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	idSet := make(map[string]struct{}, len(ids))
	for _, id := range ids {
		idSet[id] = struct{}{}
	}

	filtered := s.emailSendLogs[:0]
	for _, log := range s.emailSendLogs {
		if _, shouldDelete := idSet[log.ID]; shouldDelete {
			continue
		}
		filtered = append(filtered, log)
	}
	s.emailSendLogs = filtered
	return nil
}

func (s *MemoryStore) AppendPhoneSendLog(log domain.PhoneSendLog) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.phoneSendLogs = append([]domain.PhoneSendLog{log}, s.phoneSendLogs...)
}

func (s *MemoryStore) ListPhoneSendLogs() []domain.PhoneSendLog {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return slices.Clone(s.phoneSendLogs)
}

func (s *MemoryStore) DeletePhoneSendLogs(ids []string) error {
	if len(ids) == 0 {
		return nil
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	idSet := make(map[string]struct{}, len(ids))
	for _, id := range ids {
		idSet[id] = struct{}{}
	}

	filtered := s.phoneSendLogs[:0]
	for _, log := range s.phoneSendLogs {
		if _, shouldDelete := idSet[log.ID]; shouldDelete {
			continue
		}
		filtered = append(filtered, log)
	}
	s.phoneSendLogs = filtered
	return nil
}

func (s *MemoryStore) ListPolicies() []domain.GatewayPolicy {
	s.mu.RLock()
	defer s.mu.RUnlock()
	policies := make([]domain.GatewayPolicy, 0, len(s.policies))
	for _, policy := range s.policies {
		policies = append(policies, policy)
	}
	return policies
}

func (s *MemoryStore) CountPolicies() (int, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return len(s.policies), nil
}

func (s *MemoryStore) GetSettings(keys ...string) (map[string]string, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := map[string]string{}
	if len(keys) == 0 {
		for key, value := range s.settings {
			result[key] = value
		}
		return result, nil
	}
	for _, key := range keys {
		if value, ok := s.settings[key]; ok {
			result[key] = value
		}
	}
	return result, nil
}

func (s *MemoryStore) UpsertSettings(values map[string]string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for key, value := range values {
		s.settings[key] = value
	}
	return nil
}
