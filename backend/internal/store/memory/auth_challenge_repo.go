package memory

import (
	"encoding/json"
	"slices"
	"strings"
	"time"

	"mysso/backend/internal/domain"
)

const (
	authChallengeTypeMFA                 = "mfa_login"
	authChallengeTypeDeletionLogin       = "deletion_login"
	authChallengeTypePasskeyRegistration = "passkey_registration"
	authChallengeTypePasskeyLogin        = "passkey_login"
	authChallengeTypePhoneBinding        = "phone_binding"
	authChallengeTypeLoginStepUp         = "login_step_up"
	authChallengeTypeLoginMFAEnrollment  = "login_mfa_enrollment"
)

func (s *MemoryStore) saveAuthChallengeLocked(challenge domain.AuthChallenge) {
	s.authChallenges[challenge.Token] = challenge
}

func (s *MemoryStore) getAuthChallengeLocked(token, challengeType string, requireUnconsumed bool) (domain.AuthChallenge, error) {
	item, ok := s.authChallenges[strings.TrimSpace(token)]
	if !ok || item.ChallengeType != challengeType || item.ExpiresAt.Before(time.Now().UTC()) {
		return domain.AuthChallenge{}, ErrNotFound
	}
	if requireUnconsumed && item.ConsumedAt != nil {
		return domain.AuthChallenge{}, ErrNotFound
	}
	return item, nil
}

func (s *MemoryStore) deleteAuthChallengeLocked(token, challengeType string) error {
	item, ok := s.authChallenges[token]
	if !ok || item.ChallengeType != challengeType {
		return ErrNotFound
	}
	delete(s.authChallenges, token)
	return nil
}

func (s *MemoryStore) consumeAuthChallengeLocked(token, challengeType string, consumedAt time.Time) error {
	item, err := s.getAuthChallengeLocked(token, challengeType, true)
	if err != nil {
		return err
	}
	item.ConsumedAt = &consumedAt
	s.authChallenges[strings.TrimSpace(token)] = item
	return nil
}

func (s *MemoryStore) listAuthChallengesLocked(challengeType string) []domain.AuthChallenge {
	items := make([]domain.AuthChallenge, 0)
	for _, item := range s.authChallenges {
		if item.ChallengeType == challengeType {
			items = append(items, item)
		}
	}
	slices.SortFunc(items, func(a, b domain.AuthChallenge) int {
		if a.CreatedAt.Equal(b.CreatedAt) {
			return strings.Compare(b.Token, a.Token)
		}
		if a.CreatedAt.After(b.CreatedAt) {
			return -1
		}
		return 1
	})
	return items
}

func authChallengePayload(value any) (string, error) {
	data, err := json.Marshal(value)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

func parseAuthChallengePayload[T any](payload string) (T, error) {
	var value T
	if strings.TrimSpace(payload) == "" {
		return value, nil
	}
	if err := json.Unmarshal([]byte(payload), &value); err != nil {
		return value, err
	}
	return value, nil
}
