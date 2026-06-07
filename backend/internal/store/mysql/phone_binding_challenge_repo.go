package mysql

import (
	"time"

	"mysso/backend/internal/domain"
)

func (s *MySQLStore) SavePhoneBindingChallenge(challenge domain.PhoneBindingChallenge) error {
	payload, err := authChallengePayload(struct {
		RiskClientJSON string `json:"risk_client_json,omitempty"`
	}{RiskClientJSON: challenge.RiskClientJSON})
	if err != nil {
		return err
	}
	return s.saveAuthChallenge(domain.AuthChallenge{
		Token:         challenge.Token,
		ChallengeType: authChallengeTypePhoneBinding,
		UserID:        challenge.UserID,
		Target:        challenge.Reason,
		ACR:           challenge.ACR,
		PayloadJSON:   payload,
		ExpiresAt:     challenge.ExpiresAt,
		CreatedAt:     challenge.CreatedAt,
	})
}

func (s *MySQLStore) GetPhoneBindingChallenge(token string) (domain.PhoneBindingChallenge, error) {
	item, err := s.getAuthChallenge(token, authChallengeTypePhoneBinding, true)
	if err != nil {
		return domain.PhoneBindingChallenge{}, err
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

func (s *MySQLStore) DeletePhoneBindingChallenge(token string) error {
	return s.deleteAuthChallenge(token, authChallengeTypePhoneBinding)
}

func (s *MySQLStore) ConsumePhoneBindingChallenge(token string, consumedAt time.Time) error {
	return s.consumeAuthChallenge(token, authChallengeTypePhoneBinding, consumedAt)
}
