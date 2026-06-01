package memory

import (
	"slices"
	"strings"
	"time"

	"mysso/backend/internal/domain"
)

func (s *MemoryStore) ListPasskeysByUser(userID string) ([]domain.Passkey, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	items := make([]domain.Passkey, 0)
	for _, passkey := range s.passkeys {
		if passkey.UserID == userID {
			items = append(items, passkey)
		}
	}
	return items, nil
}

func (s *MemoryStore) ListAllPasskeys() []domain.Passkey {
	s.mu.RLock()
	defer s.mu.RUnlock()

	items := make([]domain.Passkey, 0, len(s.passkeys))
	for _, passkey := range s.passkeys {
		items = append(items, passkey)
	}
	slices.SortFunc(items, func(a, b domain.Passkey) int {
		if a.CreatedAt.Equal(b.CreatedAt) {
			return strings.Compare(b.ID, a.ID)
		}
		if a.CreatedAt.After(b.CreatedAt) {
			return -1
		}
		return 1
	})
	return items
}

func (s *MemoryStore) GetPasskeyByID(id string) (domain.Passkey, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	passkey, ok := s.passkeys[id]
	if !ok {
		return domain.Passkey{}, ErrNotFound
	}
	return passkey, nil
}

func (s *MemoryStore) GetPasskeyByCredentialID(credentialID string) (domain.Passkey, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	target := strings.TrimSpace(credentialID)
	for _, passkey := range s.passkeys {
		if passkey.CredentialID == target {
			return passkey, nil
		}
	}
	return domain.Passkey{}, ErrNotFound
}

func (s *MemoryStore) CreatePasskey(passkey domain.Passkey) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for _, existing := range s.passkeys {
		if existing.CredentialID == passkey.CredentialID {
			return ErrAuthorizationCodeRequestMismatch
		}
	}
	s.passkeys[passkey.ID] = passkey
	return nil
}

func (s *MemoryStore) UpdatePasskeyUsage(passkeyID string, signCount uint32, lastUsedAt time.Time, credentialJSON string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	passkey, ok := s.passkeys[passkeyID]
	if !ok {
		return ErrNotFound
	}
	passkey.SignCount = signCount
	passkey.LastUsedAt = &lastUsedAt
	if strings.TrimSpace(credentialJSON) != "" {
		passkey.CredentialJSON = credentialJSON
	}
	passkey.UpdatedAt = time.Now().UTC()
	s.passkeys[passkeyID] = passkey
	return nil
}

func (s *MemoryStore) DeletePasskey(userID, passkeyID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	passkey, ok := s.passkeys[passkeyID]
	if !ok || passkey.UserID != userID {
		return ErrNotFound
	}
	delete(s.passkeys, passkeyID)
	return nil
}

func (s *MemoryStore) DeletePasskeys(ids []string) error {
	if len(ids) == 0 {
		return nil
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	idSet := make(map[string]struct{}, len(ids))
	for _, id := range ids {
		idSet[id] = struct{}{}
	}
	for id := range idSet {
		delete(s.passkeys, id)
	}
	return nil
}

func (s *MemoryStore) SavePasskeyRegistrationChallenge(challenge domain.PasskeyRegistrationChallenge) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.saveAuthChallengeLocked(domain.AuthChallenge{
		Token:         challenge.Token,
		ChallengeType: authChallengeTypePasskeyRegistration,
		UserID:        challenge.UserID,
		PayloadJSON:   challenge.SessionDataJSON,
		ExpiresAt:     challenge.ExpiresAt,
		CreatedAt:     challenge.CreatedAt,
	})
	return nil
}

func (s *MemoryStore) GetPasskeyRegistrationChallenge(token string) (domain.PasskeyRegistrationChallenge, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	item, err := s.getAuthChallengeLocked(token, authChallengeTypePasskeyRegistration, true)
	if err != nil {
		return domain.PasskeyRegistrationChallenge{}, ErrNotFound
	}
	return domain.PasskeyRegistrationChallenge{
		Token:           item.Token,
		UserID:          item.UserID,
		SessionDataJSON: item.PayloadJSON,
		ExpiresAt:       item.ExpiresAt,
		CreatedAt:       item.CreatedAt,
	}, nil
}

func (s *MemoryStore) DeletePasskeyRegistrationChallenge(token string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.deleteAuthChallengeLocked(token, authChallengeTypePasskeyRegistration)
}

func (s *MemoryStore) ConsumePasskeyRegistrationChallenge(token string, consumedAt time.Time) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.consumeAuthChallengeLocked(token, authChallengeTypePasskeyRegistration, consumedAt)
}

func (s *MemoryStore) ListPasskeyRegistrationChallenges() []domain.PasskeyRegistrationChallenge {
	s.mu.RLock()
	defer s.mu.RUnlock()

	rows := s.listAuthChallengesLocked(authChallengeTypePasskeyRegistration)
	items := make([]domain.PasskeyRegistrationChallenge, 0, len(rows))
	for _, row := range rows {
		items = append(items, domain.PasskeyRegistrationChallenge{
			Token:           row.Token,
			UserID:          row.UserID,
			SessionDataJSON: row.PayloadJSON,
			ExpiresAt:       row.ExpiresAt,
			CreatedAt:       row.CreatedAt,
		})
	}
	return items
}

func (s *MemoryStore) DeletePasskeyRegistrationChallenges(tokens []string) error {
	if len(tokens) == 0 {
		return nil
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	for _, token := range tokens {
		item, ok := s.authChallenges[token]
		if ok && item.ChallengeType == authChallengeTypePasskeyRegistration {
			delete(s.authChallenges, token)
		}
	}
	return nil
}

func (s *MemoryStore) SavePasskeyLoginChallenge(challenge domain.PasskeyLoginChallenge) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.saveAuthChallengeLocked(domain.AuthChallenge{
		Token:         challenge.Token,
		ChallengeType: authChallengeTypePasskeyLogin,
		PayloadJSON:   challenge.SessionDataJSON,
		ExpiresAt:     challenge.ExpiresAt,
		CreatedAt:     challenge.CreatedAt,
	})
	return nil
}

func (s *MemoryStore) GetPasskeyLoginChallenge(token string) (domain.PasskeyLoginChallenge, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	item, err := s.getAuthChallengeLocked(token, authChallengeTypePasskeyLogin, true)
	if err != nil {
		return domain.PasskeyLoginChallenge{}, ErrNotFound
	}
	return domain.PasskeyLoginChallenge{
		Token:           item.Token,
		SessionDataJSON: item.PayloadJSON,
		ExpiresAt:       item.ExpiresAt,
		CreatedAt:       item.CreatedAt,
	}, nil
}

func (s *MemoryStore) DeletePasskeyLoginChallenge(token string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.deleteAuthChallengeLocked(token, authChallengeTypePasskeyLogin)
}

func (s *MemoryStore) ConsumePasskeyLoginChallenge(token string, consumedAt time.Time) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.consumeAuthChallengeLocked(token, authChallengeTypePasskeyLogin, consumedAt)
}

func (s *MemoryStore) ListPasskeyLoginChallenges() []domain.PasskeyLoginChallenge {
	s.mu.RLock()
	defer s.mu.RUnlock()

	rows := s.listAuthChallengesLocked(authChallengeTypePasskeyLogin)
	items := make([]domain.PasskeyLoginChallenge, 0, len(rows))
	for _, row := range rows {
		items = append(items, domain.PasskeyLoginChallenge{
			Token:           row.Token,
			SessionDataJSON: row.PayloadJSON,
			ExpiresAt:       row.ExpiresAt,
			CreatedAt:       row.CreatedAt,
		})
	}
	return items
}

func (s *MemoryStore) DeletePasskeyLoginChallenges(tokens []string) error {
	if len(tokens) == 0 {
		return nil
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	for _, token := range tokens {
		item, ok := s.authChallenges[token]
		if ok && item.ChallengeType == authChallengeTypePasskeyLogin {
			delete(s.authChallenges, token)
		}
	}
	return nil
}

func (s *MemoryStore) AppendPasskeyUsageLog(log domain.PasskeyUsageLog) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.passkeyUsageLogs = append([]domain.PasskeyUsageLog{log}, s.passkeyUsageLogs...)
	return nil
}

func (s *MemoryStore) ListPasskeyUsageLogs() []domain.PasskeyUsageLog {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return slices.Clone(s.passkeyUsageLogs)
}

func (s *MemoryStore) ListPasskeyUsageLogsByUser(userID string) []domain.PasskeyUsageLog {
	s.mu.RLock()
	defer s.mu.RUnlock()

	items := make([]domain.PasskeyUsageLog, 0)
	for _, item := range s.passkeyUsageLogs {
		if item.UserID == userID {
			items = append(items, item)
		}
	}
	return items
}

func (s *MemoryStore) DeletePasskeyUsageLogs(ids []string) error {
	if len(ids) == 0 {
		return nil
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	idSet := make(map[string]struct{}, len(ids))
	for _, id := range ids {
		idSet[id] = struct{}{}
	}
	filtered := s.passkeyUsageLogs[:0]
	for _, item := range s.passkeyUsageLogs {
		if _, shouldDelete := idSet[item.ID]; shouldDelete {
			continue
		}
		filtered = append(filtered, item)
	}
	s.passkeyUsageLogs = filtered
	return nil
}
