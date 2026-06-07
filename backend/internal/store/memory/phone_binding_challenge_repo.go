package memory

import (
	"time"

	"mysso/backend/internal/domain"
)

func (s *MemoryStore) SavePhoneBindingChallenge(challenge domain.PhoneBindingChallenge) error {
	payload, err := authChallengePayload(struct {
		RiskClientJSON string `json:"risk_client_json,omitempty"`
	}{RiskClientJSON: challenge.RiskClientJSON})
	if err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	s.saveAuthChallengeLocked(domain.AuthChallenge{
		Token:         challenge.Token,
		ChallengeType: authChallengeTypePhoneBinding,
		UserID:        challenge.UserID,
		Target:        challenge.Reason,
		ACR:           challenge.ACR,
		PayloadJSON:   payload,
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
	payload, err := parseAuthChallengePayload[struct {
		RiskClientJSON string `json:"risk_client_json,omitempty"`
	}](item.PayloadJSON)
	if err != nil {
		return domain.PhoneBindingChallenge{}, err
	}
	return domain.PhoneBindingChallenge{
		Token:          item.Token,
		UserID:         item.UserID,
		Reason:         item.Target,
		ACR:            item.ACR,
		RiskClientJSON: payload.RiskClientJSON,
		ExpiresAt:      item.ExpiresAt,
		CreatedAt:      item.CreatedAt,
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
