package mysql

import (
	"time"

	"mysso/backend/internal/domain"
)

func (s *MySQLStore) SavePhoneBindingChallenge(challenge domain.PhoneBindingChallenge) error {
	return s.saveAuthChallenge(domain.AuthChallenge{
		Token:         challenge.Token,
		ChallengeType: authChallengeTypePhoneBinding,
		UserID:        challenge.UserID,
		Target:        challenge.Reason,
		ACR:           challenge.ACR,
		ExpiresAt:     challenge.ExpiresAt,
		CreatedAt:     challenge.CreatedAt,
	})
}

func (s *MySQLStore) GetPhoneBindingChallenge(token string) (domain.PhoneBindingChallenge, error) {
	item, err := s.getAuthChallenge(token, authChallengeTypePhoneBinding, true)
	if err != nil {
		return domain.PhoneBindingChallenge{}, err
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

func (s *MySQLStore) DeletePhoneBindingChallenge(token string) error {
	return s.deleteAuthChallenge(token, authChallengeTypePhoneBinding)
}

func (s *MySQLStore) ConsumePhoneBindingChallenge(token string, consumedAt time.Time) error {
	return s.consumeAuthChallenge(token, authChallengeTypePhoneBinding, consumedAt)
}
