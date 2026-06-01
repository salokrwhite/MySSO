package memory

import (
	"time"

	"mysso/backend/internal/domain"
)

func (s *MemoryStore) SavePhoneBindingChallenge(challenge domain.PhoneBindingChallenge) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.saveAuthChallengeLocked(domain.AuthChallenge{
		Token:         challenge.Token,
		ChallengeType: authChallengeTypePhoneBinding,
		UserID:        challenge.UserID,
		Target:        challenge.Reason,
		ACR:           challenge.ACR,
		ExpiresAt:     challenge.ExpiresAt,
		CreatedAt:     challenge.CreatedAt,
	})
	return nil
}

func (s *MemoryStore) GetPhoneBindingChallenge(token string) (domain.PhoneBindingChallenge, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	item, err := s.getAuthChallengeLocked(token, authChallengeTypePhoneBinding, true)
	if err != nil {
		return domain.PhoneBindingChallenge{}, ErrNotFound
	}
	return domain.PhoneBindingChallenge{
		Token:     item.Token,
		UserID:    item.UserID,
		Reason:    item.Target,
		ACR:       item.ACR,
		ExpiresAt: item.ExpiresAt,
		CreatedAt: item.CreatedAt,
	}, nil
}

func (s *MemoryStore) DeletePhoneBindingChallenge(token string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	return s.deleteAuthChallengeLocked(token, authChallengeTypePhoneBinding)
}

func (s *MemoryStore) ConsumePhoneBindingChallenge(token string, consumedAt time.Time) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	return s.consumeAuthChallengeLocked(token, authChallengeTypePhoneBinding, consumedAt)
}
