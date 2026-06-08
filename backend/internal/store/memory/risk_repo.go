package memory

import (
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/store"
)

func (s *MemoryStore) InsertRiskEvent(event domain.RiskEvent) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if event.ID == "" {
		event.ID = uuid.NewString()
	}
	if event.CreatedAt.IsZero() {
		event.CreatedAt = time.Now().UTC()
	}
	s.riskEvents = append(s.riskEvents, event)
	return nil
}

func (s *MemoryStore) ListRiskEvents(page, pageSize int, userID, eventType, level string) ([]domain.RiskEvent, int, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}
	filtered := make([]domain.RiskEvent, 0, len(s.riskEvents))
	for _, event := range s.riskEvents {
		if user, ok := s.users[event.UserID]; ok {
			if user.Role == domain.RoleAdmin {
				continue
			}
			event.Email = user.Email
			event.DisplayName = user.DisplayName
		}
		if userID != "" && event.UserID != userID {
			continue
		}
		if eventType != "" && event.EventType != eventType {
			continue
		}
		if level != "" && event.RiskLevel != level {
			continue
		}
		filtered = append(filtered, event)
	}
	sort.Slice(filtered, func(i, j int) bool { return filtered[i].CreatedAt.After(filtered[j].CreatedAt) })
	total := len(filtered)
	start := (page - 1) * pageSize
	if start >= total {
		return []domain.RiskEvent{}, total, nil
	}
	end := start + pageSize
	if end > total {
		end = total
	}
	return append([]domain.RiskEvent{}, filtered[start:end]...), total, nil
}

func (s *MemoryStore) ListRiskAccountSummaries(page, pageSize int, userID, level string, mediumThreshold, highThreshold, criticalThreshold, scoreWindowDays, failedLoginScoreWeight, failedLoginScoreCap int) ([]domain.RiskAccountSummary, int, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}
	if pageSize > 200 {
		pageSize = 200
	}
	userID = strings.TrimSpace(userID)
	level = strings.TrimSpace(level)
	if scoreWindowDays <= 0 {
		scoreWindowDays = 30
	}
	if scoreWindowDays > 365 {
		scoreWindowDays = 365
	}
	if failedLoginScoreWeight < 0 {
		failedLoginScoreWeight = 0
	}
	if failedLoginScoreCap < 0 {
		failedLoginScoreCap = 0
	}
	windowStart := time.Now().UTC().AddDate(0, 0, -scoreWindowDays)

	summaries := make(map[string]*domain.RiskAccountSummary, len(s.users))
	devices := make(map[string]map[string]struct{})
	failureCounts := make(map[string]int)
	for _, user := range s.users {
		if user.Role == domain.RoleAdmin {
			continue
		}
		if userID != "" && user.ID != userID {
			continue
		}
		summary := &domain.RiskAccountSummary{
			UserID:       user.ID,
			Email:        user.Email,
			DisplayName:  user.DisplayName,
			Role:         user.Role,
			Status:       user.Status,
			Phone:        user.Phone,
			MFAEnabled:   user.MFAEnabled,
			LastLoginAt:  user.LastLoginAt,
			LastDeviceIP: user.LastDeviceIP,
			CreatedAt:    user.CreatedAt,
			RiskLevel:    "none",
		}
		summaries[user.ID] = summary
		devices[user.ID] = map[string]struct{}{}
	}

	for _, profile := range s.deviceProfiles {
		summary := summaries[profile.UserID]
		if summary == nil {
			continue
		}
		if profile.DeviceFingerprint == "__account__" {
			summary.FalsePositiveUntil = profile.MitigatedUntil
			summary.FalsePositiveNote = profile.TrustReason
			continue
		}
		if profile.TrustedUntil != nil && (summary.TrustedUntil == nil || profile.TrustedUntil.After(*summary.TrustedUntil)) {
			summary.TrustedUntil = profile.TrustedUntil
		}
		if profile.MitigatedUntil != nil && (summary.MitigatedUntil == nil || profile.MitigatedUntil.After(*summary.MitigatedUntil)) {
			summary.MitigatedUntil = profile.MitigatedUntil
		}
	}

	for _, event := range s.riskEvents {
		summary := summaries[event.UserID]
		if summary == nil {
			continue
		}
		if event.CreatedAt.Before(windowStart) {
			continue
		}
		summary.EventCount++
		if event.RiskScore > summary.ComprehensiveScore {
			summary.ComprehensiveScore = event.RiskScore
		}
		switch event.EventType {
		case "login", "login_success", "login_allowed":
			if event.ActionTaken == "allow" {
				summary.LoginSuccessCount++
			}
		case "login_failed", "login_blocked":
			failureCounts[event.UserID]++
			summary.LoginFailureCount++
		}
		switch event.ActionTaken {
		case "block":
			summary.BlockedCount++
		case "step_up":
			summary.StepUpCount++
		case "captcha":
			summary.CaptchaCount++
		}
		if event.DeviceFingerprint != "" {
			devices[event.UserID][event.DeviceFingerprint] = struct{}{}
		}
		if summary.LastEventAt == nil || event.CreatedAt.After(*summary.LastEventAt) {
			t := event.CreatedAt
			summary.LastEventAt = &t
			summary.LastEventType = event.EventType
			summary.LastActionTaken = event.ActionTaken
			summary.LastIPAddress = event.IPAddress
			summary.LastIPCountry = event.IPCountry
			summary.LastIPRegion = event.IPRegion
			summary.LastIPCity = event.IPCity
			summary.LastClientType = event.ClientType
		}
	}

	items := make([]domain.RiskAccountSummary, 0, len(summaries))
	for id, summary := range summaries {
		failureScore := failureCounts[id] * failedLoginScoreWeight
		if failedLoginScoreCap >= 0 && failureScore > failedLoginScoreCap {
			failureScore = failedLoginScoreCap
		}
		if failureScore > summary.ComprehensiveScore {
			summary.ComprehensiveScore = failureScore
		}
		summary.RiskLevel = riskLevelFromScore(summary.ComprehensiveScore, summary.EventCount, mediumThreshold, highThreshold, criticalThreshold)
		summary.DeviceCount = len(devices[id])
		if level != "" && summary.RiskLevel != level {
			continue
		}
		items = append(items, *summary)
	}
	sort.Slice(items, func(i, j int) bool {
		if items[i].ComprehensiveScore != items[j].ComprehensiveScore {
			return items[i].ComprehensiveScore > items[j].ComprehensiveScore
		}
		left := items[i].CreatedAt
		if items[i].LastEventAt != nil {
			left = *items[i].LastEventAt
		}
		right := items[j].CreatedAt
		if items[j].LastEventAt != nil {
			right = *items[j].LastEventAt
		}
		return left.After(right)
	})
	total := len(items)
	start := (page - 1) * pageSize
	if start >= total {
		return []domain.RiskAccountSummary{}, total, nil
	}
	end := start + pageSize
	if end > total {
		end = total
	}
	return append([]domain.RiskAccountSummary{}, items[start:end]...), total, nil
}

func (s *MemoryStore) DeleteRiskEvents(startAt, endAt *time.Time) (int64, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	filtered := s.riskEvents[:0]
	var deleted int64
	for _, event := range s.riskEvents {
		if startAt != nil && event.CreatedAt.Before(*startAt) {
			filtered = append(filtered, event)
			continue
		}
		if endAt != nil && event.CreatedAt.After(*endAt) {
			filtered = append(filtered, event)
			continue
		}
		deleted++
	}
	s.riskEvents = filtered
	return deleted, nil
}

func riskLevelFromScore(score, eventCount, mediumThreshold, highThreshold, criticalThreshold int) string {
	switch {
	case score >= criticalThreshold:
		return "critical"
	case score >= highThreshold:
		return "high"
	case score >= mediumThreshold:
		return "medium"
	case score > 0:
		return "low"
	default:
		return "none"
	}
}

func (s *MemoryStore) CountRiskEventsSince(eventType, identifierHash, ip string, since time.Time) (int, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	count := 0
	for _, event := range s.riskEvents {
		if event.EventType != eventType || event.CreatedAt.Before(since) {
			continue
		}
		if ip != "" && event.IPAddress != ip {
			continue
		}
		if identifierHash != "" && event.IdentifierHash != identifierHash {
			continue
		}
		count++
	}
	return count, nil
}

func (s *MemoryStore) UpsertDeviceProfile(profile domain.DeviceProfile) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if profile.ID == "" {
		profile.ID = uuid.NewString()
	}
	if profile.FirstSeenAt.IsZero() {
		profile.FirstSeenAt = time.Now().UTC()
	}
	if profile.LastSeenAt.IsZero() {
		profile.LastSeenAt = time.Now().UTC()
	}
	key := profile.UserID + "\x00" + profile.DeviceFingerprint
	if existing, ok := s.deviceProfiles[key]; ok {
		profile.ID = existing.ID
		profile.FirstIP = existing.FirstIP
		profile.FirstSeenAt = existing.FirstSeenAt
		profile.TrustedUntil = existing.TrustedUntil
		profile.MitigatedUntil = existing.MitigatedUntil
		profile.TrustReason = existing.TrustReason
		profile.TrustUpdatedBy = existing.TrustUpdatedBy
	}
	s.deviceProfiles[key] = profile
	return nil
}

func (s *MemoryStore) GetDeviceProfile(userID, fingerprint string) (domain.DeviceProfile, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	profile, ok := s.deviceProfiles[userID+"\x00"+fingerprint]
	if !ok {
		return domain.DeviceProfile{}, store.ErrNotFound
	}
	return profile, nil
}

func (s *MemoryStore) CountUserDevicesSince(userID string, since time.Time) (int, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	count := 0
	for _, profile := range s.deviceProfiles {
		if profile.UserID == userID && profile.DeviceFingerprint != "__account__" && !profile.LastSeenAt.Before(since) {
			count++
		}
	}
	return count, nil
}

func (s *MemoryStore) TrustDevice(userID, fingerprint, reason, updatedBy string, trustedUntil, mitigatedUntil *time.Time) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	fingerprint = strings.TrimSpace(fingerprint)
	if fingerprint == "" {
		return nil
	}
	now := time.Now().UTC()
	key := strings.TrimSpace(userID) + "\x00" + fingerprint
	profile := s.deviceProfiles[key]
	if profile.ID == "" {
		profile.ID = uuid.NewString()
		profile.UserID = strings.TrimSpace(userID)
		profile.DeviceFingerprint = fingerprint
		profile.FirstSeenAt = now
	}
	profile.LastSeenAt = now
	profile.TrustedUntil = trustedUntil
	profile.MitigatedUntil = mitigatedUntil
	profile.TrustReason = strings.TrimSpace(reason)
	profile.TrustUpdatedBy = strings.TrimSpace(updatedBy)
	s.deviceProfiles[key] = profile
	return nil
}

func (s *MemoryStore) ClearUserRiskProfile(userID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	filtered := s.riskEvents[:0]
	for _, event := range s.riskEvents {
		if event.UserID != strings.TrimSpace(userID) {
			filtered = append(filtered, event)
		}
	}
	s.riskEvents = filtered
	return nil
}

func (s *MemoryStore) SetUserRiskFalsePositive(userID, note string, until time.Time) error {
	return s.TrustDevice(userID, "__account__", strings.TrimSpace(note), "", nil, &until)
}

func (s *MemoryStore) GetUserRiskFalsePositiveUntil(userID string, now time.Time) (*time.Time, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	profile := s.deviceProfiles[strings.TrimSpace(userID)+"\x00__account__"]
	if profile.MitigatedUntil == nil || !profile.MitigatedUntil.After(now) {
		return nil, nil
	}
	return profile.MitigatedUntil, nil
}

func (s *MemoryStore) InsertLoginHistory(history domain.LoginHistory) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if history.ID == "" {
		history.ID = uuid.NewString()
	}
	if history.CreatedAt.IsZero() {
		history.CreatedAt = time.Now().UTC()
	}
	s.loginHistory = append(s.loginHistory, history)
	return nil
}

func (s *MemoryStore) GetLastLoginHistory(userID string) (domain.LoginHistory, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var found domain.LoginHistory
	ok := false
	for _, history := range s.loginHistory {
		if history.UserID == userID && history.Success && (!ok || history.CreatedAt.After(found.CreatedAt)) {
			found = history
			ok = true
		}
	}
	if !ok {
		return domain.LoginHistory{}, store.ErrNotFound
	}
	return found, nil
}

func (s *MemoryStore) CountFailedLogins(identifierHash, ip string, since time.Time) (int, error) {
	return s.CountRiskEventsSince("login_failed", identifierHash, ip, since)
}

func (s *MemoryStore) AddIPBlacklist(entry domain.IPBlacklistEntry) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if entry.ID == "" {
		entry.ID = uuid.NewString()
	}
	if entry.CreatedAt.IsZero() {
		entry.CreatedAt = time.Now().UTC()
	}
	s.ipBlacklist[strings.TrimSpace(entry.IPAddress)] = entry
	return nil
}

func (s *MemoryStore) RemoveIPBlacklist(ip string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.ipBlacklist, strings.TrimSpace(ip))
	return nil
}

func (s *MemoryStore) IsIPBlacklisted(ip string, now time.Time) (domain.IPBlacklistEntry, bool, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	entry, ok := s.ipBlacklist[strings.TrimSpace(ip)]
	if !ok || (entry.ExpiresAt != nil && !entry.ExpiresAt.After(now)) {
		return domain.IPBlacklistEntry{}, false, nil
	}
	return entry, true, nil
}

func (s *MemoryStore) ListIPBlacklist() ([]domain.IPBlacklistEntry, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	items := make([]domain.IPBlacklistEntry, 0, len(s.ipBlacklist))
	for _, item := range s.ipBlacklist {
		items = append(items, item)
	}
	sort.Slice(items, func(i, j int) bool { return items[i].CreatedAt.After(items[j].CreatedAt) })
	return items, nil
}

func (s *MemoryStore) CountRiskEventsByLevel(since time.Time) (map[string]int, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := map[string]int{}
	for _, event := range s.riskEvents {
		if !event.CreatedAt.Before(since) {
			result[event.RiskLevel]++
		}
	}
	return result, nil
}
