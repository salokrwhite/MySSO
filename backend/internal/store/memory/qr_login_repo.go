package memory

import (
	"encoding/json"
	"strings"
	"time"

	"mysso/backend/internal/domain"
)

const authChallengeTypeQRLogin = "qr_login"

type qrLoginPayload struct {
	UserEmail       string `json:"user_email,omitempty"`
	UserDisplayName string `json:"user_display_name,omitempty"`
	UserRole        string `json:"user_role,omitempty"`
	SessionToken    string `json:"session_token,omitempty"`
	IP              string `json:"ip,omitempty"`
	UserAgent       string `json:"user_agent,omitempty"`
}

func (s *MemoryStore) SaveQRLoginChallenge(challenge domain.QRLoginChallenge) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	challenge.ChallengeToken = strings.TrimSpace(challenge.ChallengeToken)
	challenge.ScanToken = strings.TrimSpace(challenge.ScanToken)
	if challenge.ChallengeToken == "" || challenge.ScanToken == "" {
		return ErrNotFound
	}
	payload, err := qrLoginPayloadJSON(challenge)
	if err != nil {
		return err
	}
	updatedAt := challenge.UpdatedAt
	s.authChallenges[challenge.ChallengeToken] = domain.AuthChallenge{
		Token:         challenge.ChallengeToken,
		ChallengeType: authChallengeTypeQRLogin,
		LookupToken:   challenge.ScanToken,
		Status:        string(challenge.Status),
		UserID:        challenge.UserID,
		Channel:       "qr",
		ACR:           "urn:mysso:acr:qr-login",
		PayloadJSON:   payload,
		ExpiresAt:     challenge.ExpiresAt,
		CreatedAt:     challenge.CreatedAt,
		UpdatedAt:     &updatedAt,
	}
	return nil
}

func (s *MemoryStore) GetQRLoginChallengeByChallengeToken(token string) (domain.QRLoginChallenge, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	item, ok := s.authChallenges[strings.TrimSpace(token)]
	if !ok || item.ChallengeType != authChallengeTypeQRLogin || item.ExpiresAt.Before(time.Now().UTC()) {
		return domain.QRLoginChallenge{}, ErrNotFound
	}
	return authChallengeToQRLoginChallenge(item), nil
}

func (s *MemoryStore) GetQRLoginChallengeByScanToken(token string) (domain.QRLoginChallenge, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	scanToken := strings.TrimSpace(token)
	for _, item := range s.authChallenges {
		if item.ChallengeType != authChallengeTypeQRLogin || item.LookupToken != scanToken || item.ExpiresAt.Before(time.Now().UTC()) {
			continue
		}
		return authChallengeToQRLoginChallenge(item), nil
	}
	return domain.QRLoginChallenge{}, ErrNotFound
}

func (s *MemoryStore) UpdateQRLoginChallenge(challenge domain.QRLoginChallenge) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	existing, ok := s.authChallenges[strings.TrimSpace(challenge.ChallengeToken)]
	if !ok || existing.ChallengeType != authChallengeTypeQRLogin {
		return ErrNotFound
	}
	if existing.ExpiresAt.Before(time.Now().UTC()) {
		return ErrNotFound
	}
	if strings.TrimSpace(challenge.ScanToken) == "" {
		challenge.ScanToken = existing.LookupToken
	}
	payload, err := qrLoginPayloadJSON(challenge)
	if err != nil {
		return err
	}
	updatedAt := challenge.UpdatedAt
	existing.LookupToken = challenge.ScanToken
	existing.Status = string(challenge.Status)
	existing.UserID = challenge.UserID
	existing.PayloadJSON = payload
	existing.UpdatedAt = &updatedAt
	s.authChallenges[challenge.ChallengeToken] = existing
	return nil
}

func (s *MemoryStore) ClaimPendingQRLoginChallenge(challenge domain.QRLoginChallenge) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	scanToken := strings.TrimSpace(challenge.ScanToken)
	now := time.Now().UTC()
	for token, existing := range s.authChallenges {
		if existing.ChallengeType != authChallengeTypeQRLogin ||
			existing.LookupToken != scanToken ||
			existing.Status != string(domain.QRLoginStatusPending) ||
			existing.ExpiresAt.Before(now) {
			continue
		}
		if strings.TrimSpace(challenge.ChallengeToken) == "" {
			challenge.ChallengeToken = existing.Token
		}
		if strings.TrimSpace(challenge.ScanToken) == "" {
			challenge.ScanToken = existing.LookupToken
		}
		payload, err := qrLoginPayloadJSON(challenge)
		if err != nil {
			return err
		}
		updatedAt := challenge.UpdatedAt
		existing.Status = string(challenge.Status)
		existing.UserID = challenge.UserID
		existing.PayloadJSON = payload
		existing.UpdatedAt = &updatedAt
		s.authChallenges[token] = existing
		return nil
	}
	return ErrNotFound
}

func (s *MemoryStore) DeleteQRLoginChallenge(challengeToken string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	item, ok := s.authChallenges[strings.TrimSpace(challengeToken)]
	if !ok || item.ChallengeType != authChallengeTypeQRLogin {
		return ErrNotFound
	}
	delete(s.authChallenges, item.Token)
	return nil
}

func qrLoginPayloadJSON(challenge domain.QRLoginChallenge) (string, error) {
	payload := qrLoginPayload{
		UserEmail:       challenge.UserEmail,
		UserDisplayName: challenge.UserDisplayName,
		UserRole:        string(challenge.UserRole),
		SessionToken:    challenge.SessionToken,
		IP:              challenge.IP,
		UserAgent:       challenge.UserAgent,
	}
	data, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

func authChallengeToQRLoginChallenge(item domain.AuthChallenge) domain.QRLoginChallenge {
	challenge := domain.QRLoginChallenge{
		ChallengeToken: item.Token,
		ScanToken:      item.LookupToken,
		Status:         domain.QRLoginStatus(item.Status),
		UserID:         item.UserID,
		ExpiresAt:      item.ExpiresAt,
		CreatedAt:      item.CreatedAt,
	}
	if item.UpdatedAt != nil {
		challenge.UpdatedAt = *item.UpdatedAt
	}
	if strings.TrimSpace(item.PayloadJSON) == "" {
		return challenge
	}
	var payload qrLoginPayload
	if err := json.Unmarshal([]byte(item.PayloadJSON), &payload); err != nil {
		return challenge
	}
	challenge.UserEmail = payload.UserEmail
	challenge.UserDisplayName = payload.UserDisplayName
	challenge.UserRole = domain.Role(payload.UserRole)
	challenge.SessionToken = payload.SessionToken
	challenge.IP = payload.IP
	challenge.UserAgent = payload.UserAgent
	return challenge
}
