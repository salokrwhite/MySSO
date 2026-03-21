package store

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
	s.mfaChallenges[challenge.Token] = challenge
	return nil
}

func (s *MemoryStore) GetMFALoginChallenge(token string) (domain.MFALoginChallenge, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	challenge, ok := s.mfaChallenges[token]
	if !ok {
		return domain.MFALoginChallenge{}, ErrNotFound
	}
	return challenge, nil
}

func (s *MemoryStore) DeleteMFALoginChallenge(token string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.mfaChallenges[token]; !ok {
		return ErrNotFound
	}
	delete(s.mfaChallenges, token)
	return nil
}

func (s *MemoryStore) SaveDeletionLoginChallenge(challenge domain.DeletionLoginChallenge) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.deletionLoginChallenges[challenge.Token] = challenge
	return nil
}

func (s *MemoryStore) GetDeletionLoginChallenge(token string) (domain.DeletionLoginChallenge, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	challenge, ok := s.deletionLoginChallenges[token]
	if !ok || challenge.ExpiresAt.Before(time.Now().UTC()) {
		return domain.DeletionLoginChallenge{}, ErrNotFound
	}
	return challenge, nil
}

func (s *MemoryStore) DeleteDeletionLoginChallenge(token string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.deletionLoginChallenges[token]; !ok {
		return ErrNotFound
	}
	delete(s.deletionLoginChallenges, token)
	return nil
}
