package memory

import (
	"errors"
	"sort"
	"strings"
	"time"

	"mysso/backend/internal/domain"
)

func (s *MemoryStore) FindUserByEmail(email string) (domain.User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	id, ok := s.usersByEmail[strings.ToLower(email)]
	if !ok {
		return domain.User{}, ErrNotFound
	}
	return s.users[id], nil
}

func (s *MemoryStore) CreateUser(user domain.User) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	emailKey := strings.ToLower(strings.TrimSpace(user.Email))
	if _, exists := s.usersByEmail[emailKey]; exists {
		return errors.New("user already exists")
	}
	if user.AuthVersion < 1 {
		user.AuthVersion = 1
	}
	s.users[user.ID] = user
	s.usersByEmail[emailKey] = user.ID
	return nil
}

func (s *MemoryStore) FindUserByPhone(phone string) (domain.User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	target := strings.TrimSpace(phone)
	for _, user := range s.users {
		if strings.TrimSpace(user.Phone) == target && target != "" {
			return user, nil
		}
	}
	return domain.User{}, ErrNotFound
}

func (s *MemoryStore) GetUser(id string) (domain.User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	user, ok := s.users[id]
	if !ok {
		return domain.User{}, ErrNotFound
	}
	return user, nil
}

func (s *MemoryStore) ListUsers() []domain.User {
	s.mu.RLock()
	defer s.mu.RUnlock()

	users := make([]domain.User, 0, len(s.users))
	for _, user := range s.users {
		users = append(users, user)
	}
	return users
}

func (s *MemoryStore) ListUsersPaginated(page, pageSize int, emailKeyword, statusFilter, userID string) ([]domain.User, int, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}

	normalizedKeyword := strings.ToLower(strings.TrimSpace(emailKeyword))
	normalizedStatus := strings.ToLower(strings.TrimSpace(statusFilter))
	normalizedUserID := strings.TrimSpace(userID)
	filtered := make([]domain.User, 0, len(s.users))
	for _, user := range s.users {
		if normalizedUserID != "" && user.ID != normalizedUserID {
			continue
		}
		if normalizedKeyword != "" && !strings.Contains(strings.ToLower(user.Email), normalizedKeyword) {
			continue
		}
		if normalizedStatus != "" && normalizedStatus != "all" {
			if normalizedStatus == "deleting" {
				if user.DeletionScheduledAt == nil {
					continue
				}
			} else if string(user.Status) != normalizedStatus || user.DeletionScheduledAt != nil {
				continue
			}
		}
		filtered = append(filtered, user)
	}

	sort.Slice(filtered, func(i, j int) bool {
		return filtered[i].CreatedAt.After(filtered[j].CreatedAt)
	})

	total := len(filtered)
	start := (page - 1) * pageSize
	if start >= total {
		return []domain.User{}, total, nil
	}
	end := start + pageSize
	if end > total {
		end = total
	}
	items := make([]domain.User, end-start)
	copy(items, filtered[start:end])
	return items, total, nil
}

func (s *MemoryStore) CountUsers(statusFilter string) (int, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	normalizedStatus := strings.ToLower(strings.TrimSpace(statusFilter))
	if normalizedStatus == "" || normalizedStatus == "all" {
		return len(s.users), nil
	}

	total := 0
	for _, user := range s.users {
		if normalizedStatus == "deleting" {
			if user.DeletionScheduledAt != nil {
				total++
			}
			continue
		}
		if string(user.Status) == normalizedStatus && user.DeletionScheduledAt == nil {
			total++
		}
	}
	return total, nil
}

func (s *MemoryStore) UpdateUser(user domain.User) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	current, ok := s.users[user.ID]
	if !ok {
		return ErrNotFound
	}
	emailKey := strings.ToLower(strings.TrimSpace(user.Email))
	if existingID, exists := s.usersByEmail[emailKey]; exists && existingID != user.ID {
		return errors.New("user already exists")
	}
	if user.AuthVersion < 1 {
		user.AuthVersion = 1
	}
	delete(s.usersByEmail, strings.ToLower(strings.TrimSpace(current.Email)))
	s.users[user.ID] = user
	s.usersByEmail[emailKey] = user.ID
	return nil
}

func (s *MemoryStore) UpdateUserAndInvalidateAuth(user domain.User) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	current, ok := s.users[user.ID]
	if !ok {
		return ErrNotFound
	}
	emailKey := strings.ToLower(strings.TrimSpace(user.Email))
	if existingID, exists := s.usersByEmail[emailKey]; exists && existingID != user.ID {
		return errors.New("user already exists")
	}
	if user.AuthVersion < 1 {
		user.AuthVersion = 1
	}
	delete(s.usersByEmail, strings.ToLower(strings.TrimSpace(current.Email)))
	s.users[user.ID] = user
	s.usersByEmail[emailKey] = user.ID

	for token, session := range s.sessions {
		if session.UserID == user.ID {
			delete(s.sessions, token)
		}
	}
	now := time.Now().UTC()
	for tokenValue, token := range s.refreshTokens {
		if token.UserID == user.ID && !token.Revoked {
			token.Revoked = true
			token.RevokedAt = &now
			s.refreshTokens[tokenValue] = token
		}
	}
	for token, challenge := range s.mfaChallenges {
		if challenge.UserID == user.ID {
			delete(s.mfaChallenges, token)
		}
	}
	for token, challenge := range s.phoneBindingChallenges {
		if challenge.UserID == user.ID {
			delete(s.phoneBindingChallenges, token)
		}
	}
	for token, challenge := range s.loginStepUpChallenges {
		if challenge.UserID == user.ID {
			delete(s.loginStepUpChallenges, token)
		}
	}
	for token, challenge := range s.mfaEnrollmentChallenges {
		if challenge.UserID == user.ID {
			delete(s.mfaEnrollmentChallenges, token)
		}
	}
	for token, challenge := range s.deletionLoginChallenges {
		if challenge.UserID == user.ID {
			delete(s.deletionLoginChallenges, token)
		}
	}
	for codeValue, code := range s.authCodes {
		if code.UserID == user.ID {
			delete(s.authCodes, codeValue)
		}
	}
	for codeID, code := range s.emailCodes {
		if strings.EqualFold(code.Email, current.Email) || strings.EqualFold(code.Email, user.Email) {
			delete(s.emailCodes, codeID)
		}
	}
	for codeID, code := range s.smsCodes {
		if strings.TrimSpace(code.Phone) == strings.TrimSpace(current.Phone) || strings.TrimSpace(code.Phone) == strings.TrimSpace(user.Phone) {
			delete(s.smsCodes, codeID)
		}
	}
	return nil
}

func (s *MemoryStore) DeleteUser(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	user, ok := s.users[id]
	if !ok {
		return ErrNotFound
	}
	delete(s.users, id)
	delete(s.usersByEmail, strings.ToLower(user.Email))

	for token, session := range s.sessions {
		if session.UserID == id {
			delete(s.sessions, token)
		}
	}
	for codeID, code := range s.emailCodes {
		if strings.EqualFold(code.Email, user.Email) {
			delete(s.emailCodes, codeID)
		}
	}
	for codeID, code := range s.smsCodes {
		if strings.TrimSpace(code.Phone) == strings.TrimSpace(user.Phone) {
			delete(s.smsCodes, codeID)
		}
	}
	for token, challenge := range s.mfaChallenges {
		if challenge.UserID == id {
			delete(s.mfaChallenges, token)
		}
	}
	for token, challenge := range s.phoneBindingChallenges {
		if challenge.UserID == id {
			delete(s.phoneBindingChallenges, token)
		}
	}
	for token, challenge := range s.loginStepUpChallenges {
		if challenge.UserID == id {
			delete(s.loginStepUpChallenges, token)
		}
	}
	for token, challenge := range s.mfaEnrollmentChallenges {
		if challenge.UserID == id {
			delete(s.mfaEnrollmentChallenges, token)
		}
	}
	for token, challenge := range s.deletionLoginChallenges {
		if challenge.UserID == id {
			delete(s.deletionLoginChallenges, token)
		}
	}
	for passkeyID, passkey := range s.passkeys {
		if passkey.UserID == id {
			delete(s.passkeys, passkeyID)
		}
	}
	for token, challenge := range s.passkeyRegChallenges {
		if challenge.UserID == id {
			delete(s.passkeyRegChallenges, token)
		}
	}
	filteredPasskeyUsageLogs := s.passkeyUsageLogs[:0]
	for _, log := range s.passkeyUsageLogs {
		if log.UserID == id {
			continue
		}
		filteredPasskeyUsageLogs = append(filteredPasskeyUsageLogs, log)
	}
	s.passkeyUsageLogs = filteredPasskeyUsageLogs
	for codeValue, code := range s.authCodes {
		if code.UserID == id {
			delete(s.authCodes, codeValue)
		}
	}
	for consentID, consent := range s.consents {
		if consent.UserID == id {
			delete(s.consents, consentID)
		}
	}
	for tokenValue, token := range s.refreshTokens {
		if token.UserID == id {
			delete(s.refreshTokens, tokenValue)
		}
	}
	ownedAppIDs := map[string]struct{}{}
	for appID, app := range s.apps {
		if app.OwnerUserID == id {
			ownedAppIDs[appID] = struct{}{}
			delete(s.appsByClientID, app.ClientID)
			delete(s.apps, appID)
		}
	}
	filteredAuditLogs := s.auditLogs[:0]
	for _, log := range s.auditLogs {
		if log.ActorID == id || log.TargetID == id {
			continue
		}
		if _, ownedAppExists := ownedAppIDs[log.TargetID]; ownedAppExists {
			continue
		}
		filteredAuditLogs = append(filteredAuditLogs, log)
	}
	s.auditLogs = filteredAuditLogs
	filteredOperationLogs := s.userOperationLogs[:0]
	for _, log := range s.userOperationLogs {
		if log.UserID == id {
			continue
		}
		filteredOperationLogs = append(filteredOperationLogs, log)
	}
	s.userOperationLogs = filteredOperationLogs
	delete(s.settings, "user_avatar_"+id)
	delete(s.settings, domain.UserAnnouncementEnabledKey(id))
	delete(s.settings, domain.UserAnnouncementContentKey(id))
	delete(s.settings, domain.UserRiskPhoneBindingModeKey(id))
	delete(s.settings, domain.UserRiskPhoneBindingRequiredKey(id))
	delete(s.settings, domain.UserRiskPhoneBindingLoginCountKey(id))
	delete(s.userSecurityPolicies, id)
	return nil
}

func (s *MemoryStore) ListUsersPendingDeletion(before time.Time) ([]domain.User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	items := make([]domain.User, 0)
	for _, user := range s.users {
		if user.DeletionScheduledAt != nil && !user.DeletionScheduledAt.After(before) {
			items = append(items, user)
		}
	}
	return items, nil
}
