package mysql

import (
	"encoding/json"
	"time"

	"mysso/backend/internal/domain"
)

type requestChallengePayload struct {
	IPHash        string `json:"ip_hash"`
	UAHash        string `json:"ua_hash"`
	TargetHash    string `json:"target_hash"`
	CaptchaPassed bool   `json:"-"`
}

func (p *requestChallengePayload) UnmarshalJSON(data []byte) error {
	var raw struct {
		IPHash        string          `json:"ip_hash"`
		UAHash        string          `json:"ua_hash"`
		TargetHash    string          `json:"target_hash"`
		CaptchaPassed json.RawMessage `json:"captcha_passed"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}
	p.IPHash = raw.IPHash
	p.UAHash = raw.UAHash
	p.TargetHash = raw.TargetHash
	if len(raw.CaptchaPassed) > 0 {
		var asBool bool
		if err := json.Unmarshal(raw.CaptchaPassed, &asBool); err == nil {
			p.CaptchaPassed = asBool
			return nil
		}
		var asInt int
		if err := json.Unmarshal(raw.CaptchaPassed, &asInt); err == nil {
			p.CaptchaPassed = asInt != 0
		}
	}
	return nil
}

func (s *MySQLStore) SaveRequestChallenge(challenge domain.RequestChallenge) error {
	payload, err := authChallengePayload(struct {
		IPHash        string `json:"ip_hash"`
		UAHash        string `json:"ua_hash"`
		TargetHash    string `json:"target_hash"`
		CaptchaPassed bool   `json:"captcha_passed"`
	}{
		IPHash:        challenge.IPHash,
		UAHash:        challenge.UAHash,
		TargetHash:    challenge.TargetHash,
		CaptchaPassed: challenge.CaptchaPassed,
	})
	if err != nil {
		return err
	}
	return s.saveAuthChallenge(domain.AuthChallenge{
		Token:         challenge.Token,
		ChallengeType: authChallengeTypeRequest,
		Channel:       challenge.Channel,
		Target:        challenge.Purpose,
		PayloadJSON:   payload,
		ExpiresAt:     challenge.ExpiresAt,
		ConsumedAt:    challenge.ConsumedAt,
		CreatedAt:     challenge.CreatedAt,
	})
}

func (s *MySQLStore) GetRequestChallenge(token string) (domain.RequestChallenge, error) {
	item, err := s.getAuthChallenge(token, authChallengeTypeRequest, true)
	if err != nil {
		return domain.RequestChallenge{}, err
	}
	payload, err := parseAuthChallengePayload[requestChallengePayload](item.PayloadJSON)
	if err != nil {
		return domain.RequestChallenge{}, err
	}
	return domain.RequestChallenge{
		Token:         item.Token,
		Purpose:       item.Target,
		Channel:       item.Channel,
		IPHash:        payload.IPHash,
		UAHash:        payload.UAHash,
		TargetHash:    payload.TargetHash,
		CaptchaPassed: payload.CaptchaPassed,
		ExpiresAt:     item.ExpiresAt,
		ConsumedAt:    item.ConsumedAt,
		CreatedAt:     item.CreatedAt,
	}, nil
}

func (s *MySQLStore) ConsumeRequestChallenge(token string, consumedAt time.Time) error {
	return s.consumeAuthChallenge(token, authChallengeTypeRequest, consumedAt)
}
