package memory

import (
	"strings"
	"time"

	"mysso/backend/internal/domain"
)

func (s *MemoryStore) SaveEmailVerificationCode(code domain.EmailVerificationCode) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.emailCodes[code.ID] = code
	return nil
}

func (s *MemoryStore) GetEmailVerificationCode(email, purpose, code string) (domain.EmailVerificationCode, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, item := range s.emailCodes {
		if strings.EqualFold(item.Email, email) && item.Purpose == purpose && item.Code == code && !item.Consumed && item.ExpiresAt.After(time.Now().UTC()) {
			return item, nil
		}
	}
	return domain.EmailVerificationCode{}, ErrNotFound
}

func (s *MemoryStore) GetLatestEmailVerificationCode(email, purpose string) (domain.EmailVerificationCode, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var latest domain.EmailVerificationCode
	found := false
	for _, item := range s.emailCodes {
		if strings.EqualFold(item.Email, email) && item.Purpose == purpose {
			if !found || item.CreatedAt.After(latest.CreatedAt) {
				latest = item
				found = true
			}
		}
	}
	if !found {
		return domain.EmailVerificationCode{}, ErrNotFound
	}
	return latest, nil
}

func (s *MemoryStore) ConsumeEmailVerificationCode(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	item, ok := s.emailCodes[id]
	if !ok {
		return ErrNotFound
	}
	item.Consumed = true
	s.emailCodes[id] = item
	return nil
}

func (s *MemoryStore) SaveSMSVerificationCode(code domain.SMSVerificationCode) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.smsCodes[code.ID] = code
	return nil
}

func (s *MemoryStore) GetSMSVerificationCode(phone, purpose, code string) (domain.SMSVerificationCode, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, item := range s.smsCodes {
		if strings.TrimSpace(item.Phone) == strings.TrimSpace(phone) &&
			item.Purpose == purpose &&
			item.Code == code &&
			!item.Consumed &&
			item.ExpiresAt.After(time.Now().UTC()) {
			return item, nil
		}
	}
	return domain.SMSVerificationCode{}, ErrNotFound
}

func (s *MemoryStore) GetLatestSMSVerificationCode(phone, purpose string) (domain.SMSVerificationCode, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var latest domain.SMSVerificationCode
	found := false
	for _, item := range s.smsCodes {
		if strings.TrimSpace(item.Phone) == strings.TrimSpace(phone) && item.Purpose == purpose {
			if !found || item.CreatedAt.After(latest.CreatedAt) {
				latest = item
				found = true
			}
		}
	}
	if !found {
		return domain.SMSVerificationCode{}, ErrNotFound
	}
	return latest, nil
}

func (s *MemoryStore) ConsumeSMSVerificationCode(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	item, ok := s.smsCodes[id]
	if !ok {
		return ErrNotFound
	}
	item.Consumed = true
	s.smsCodes[id] = item
	return nil
}

func (s *MemoryStore) SaveMFALoginChallenge(challenge domain.MFALoginChallenge) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.saveAuthChallengeLocked(domain.AuthChallenge{
		Token:         challenge.Token,
		ChallengeType: authChallengeTypeMFA,
		UserID:        challenge.UserID,
		Channel:       challenge.Method,
		Target:        challenge.Target,
		ExpiresAt:     challenge.ExpiresAt,
		CreatedAt:     challenge.CreatedAt,
	})
	return nil
}

func (s *MemoryStore) GetMFALoginChallenge(token string) (domain.MFALoginChallenge, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	item, err := s.getAuthChallengeLocked(token, authChallengeTypeMFA, true)
	if err != nil {
		return domain.MFALoginChallenge{}, ErrNotFound
	}
	return domain.MFALoginChallenge{
		Token:     item.Token,
		UserID:    item.UserID,
		Method:    item.Channel,
		Target:    item.Target,
		ExpiresAt: item.ExpiresAt,
		CreatedAt: item.CreatedAt,
	}, nil
}

func (s *MemoryStore) DeleteMFALoginChallenge(token string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.deleteAuthChallengeLocked(token, authChallengeTypeMFA)
}

func (s *MemoryStore) ConsumeMFALoginChallenge(token string, consumedAt time.Time) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.consumeAuthChallengeLocked(token, authChallengeTypeMFA, consumedAt)
}

func (s *MemoryStore) SaveDeletionLoginChallenge(challenge domain.DeletionLoginChallenge) error {
	payload, err := authChallengePayload(struct {
		DeletionScheduledAt time.Time `json:"deletion_scheduled_at"`
	}{DeletionScheduledAt: challenge.DeletionScheduledAt})
	if err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.saveAuthChallengeLocked(domain.AuthChallenge{
		Token:         challenge.Token,
		ChallengeType: authChallengeTypeDeletionLogin,
		UserID:        challenge.UserID,
		ACR:           challenge.ACR,
		PayloadJSON:   payload,
		ExpiresAt:     challenge.ExpiresAt,
		CreatedAt:     challenge.CreatedAt,
	})
	return nil
}

func (s *MemoryStore) GetDeletionLoginChallenge(token string) (domain.DeletionLoginChallenge, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	item, err := s.getAuthChallengeLocked(token, authChallengeTypeDeletionLogin, true)
	if err != nil {
		return domain.DeletionLoginChallenge{}, ErrNotFound
	}
	payload, err := parseAuthChallengePayload[struct {
		DeletionScheduledAt time.Time `json:"deletion_scheduled_at"`
	}](item.PayloadJSON)
	if err != nil {
		return domain.DeletionLoginChallenge{}, err
	}
	return domain.DeletionLoginChallenge{
		Token:               item.Token,
		UserID:              item.UserID,
		ACR:                 item.ACR,
		DeletionScheduledAt: payload.DeletionScheduledAt,
		ExpiresAt:           item.ExpiresAt,
		CreatedAt:           item.CreatedAt,
	}, nil
}

func (s *MemoryStore) DeleteDeletionLoginChallenge(token string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.deleteAuthChallengeLocked(token, authChallengeTypeDeletionLogin)
}

func (s *MemoryStore) ConsumeDeletionLoginChallenge(token string, consumedAt time.Time) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.consumeAuthChallengeLocked(token, authChallengeTypeDeletionLogin, consumedAt)
}
