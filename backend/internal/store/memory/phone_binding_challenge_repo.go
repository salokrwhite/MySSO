package memory

import (
	"time"

	"mysso/backend/internal/domain"
)

func (s *MemoryStore) SavePhoneBindingChallenge(challenge domain.PhoneBindingChallenge) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.phoneBindingChallenges[challenge.Token] = challenge
	return nil
}

func (s *MemoryStore) GetPhoneBindingChallenge(token string) (domain.PhoneBindingChallenge, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	challenge, ok := s.phoneBindingChallenges[token]
	if !ok || challenge.ExpiresAt.Before(time.Now().UTC()) {
		return domain.PhoneBindingChallenge{}, ErrNotFound
	}
	return challenge, nil
}

func (s *MemoryStore) DeletePhoneBindingChallenge(token string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	delete(s.phoneBindingChallenges, token)
	return nil
}
