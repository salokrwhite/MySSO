package memory

import (
	"time"

	"mysso/backend/internal/domain"
)

func (s *MemoryStore) GetUserSecurityPolicy(userID string) (domain.UserSecurityPolicy, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	policy, ok := s.userSecurityPolicies[userID]
	if !ok {
		return domain.UserSecurityPolicy{
			UserID:          userID,
			LoginStepUpMode: domain.LoginStepUpModeNone,
		}, ErrNotFound
	}
	return policy, nil
}

func (s *MemoryStore) UpsertUserSecurityPolicy(policy domain.UserSecurityPolicy) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	current, ok := s.userSecurityPolicies[policy.UserID]
	if ok {
		policy.CreatedAt = current.CreatedAt
	} else if policy.CreatedAt.IsZero() {
		policy.CreatedAt = time.Now().UTC()
	}
	if policy.UpdatedAt.IsZero() {
		policy.UpdatedAt = time.Now().UTC()
	}
	if policy.LoginStepUpMode == "" {
		policy.LoginStepUpMode = domain.LoginStepUpModeNone
	}
	s.userSecurityPolicies[policy.UserID] = policy
	return nil
}

func (s *MemoryStore) DeleteUserSecurityPolicy(userID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.userSecurityPolicies, userID)
	return nil
}

func (s *MemoryStore) SaveLoginStepUpChallenge(challenge domain.LoginStepUpChallenge) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.loginStepUpChallenges[challenge.Token] = challenge
	return nil
}

func (s *MemoryStore) GetLoginStepUpChallenge(token string) (domain.LoginStepUpChallenge, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	challenge, ok := s.loginStepUpChallenges[token]
	if !ok || challenge.ExpiresAt.Before(time.Now().UTC()) {
		return domain.LoginStepUpChallenge{}, ErrNotFound
	}
	return challenge, nil
}

func (s *MemoryStore) DeleteLoginStepUpChallenge(token string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.loginStepUpChallenges, token)
	return nil
}

func (s *MemoryStore) SaveLoginMFAEnrollmentChallenge(challenge domain.LoginMFAEnrollmentChallenge) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.mfaEnrollmentChallenges[challenge.Token] = challenge
	return nil
}

func (s *MemoryStore) GetLoginMFAEnrollmentChallenge(token string) (domain.LoginMFAEnrollmentChallenge, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	challenge, ok := s.mfaEnrollmentChallenges[token]
	if !ok || challenge.ExpiresAt.Before(time.Now().UTC()) {
		return domain.LoginMFAEnrollmentChallenge{}, ErrNotFound
	}
	return challenge, nil
}

func (s *MemoryStore) DeleteLoginMFAEnrollmentChallenge(token string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.mfaEnrollmentChallenges, token)
	return nil
}
