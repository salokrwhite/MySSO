package memory

import (
	"strings"
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

func (s *MemoryStore) UpdatePhoneBindingRiskState(userID, mode string, required bool, loginCount int) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	policy, ok := s.userSecurityPolicies[userID]
	now := time.Now().UTC()
	if !ok {
		policy = domain.UserSecurityPolicy{
			UserID:          userID,
			LoginStepUpMode: domain.LoginStepUpModeNone,
			CreatedAt:       now,
		}
	}
	if loginCount < 0 {
		loginCount = 0
	}
	policy.PhoneBindingRiskMode = strings.TrimSpace(mode)
	policy.PhoneBindingRiskRequired = required
	policy.PhoneBindingRiskLoginCount = loginCount
	policy.UpdatedAt = now
	s.userSecurityPolicies[userID] = policy
	return nil
}

func (s *MemoryStore) DeleteUserSecurityPolicy(userID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.userSecurityPolicies, userID)
	return nil
}

func (s *MemoryStore) SaveLoginStepUpChallenge(challenge domain.LoginStepUpChallenge) error {
	payload, err := authChallengePayload(struct {
		EffectiveMode  string `json:"effective_mode"`
		EmailTarget    string `json:"email_target"`
		PhoneTarget    string `json:"phone_target"`
		RiskClientJSON string `json:"risk_client_json,omitempty"`
	}{
		EffectiveMode:  string(challenge.EffectiveMode),
		EmailTarget:    challenge.EmailTarget,
		PhoneTarget:    challenge.PhoneTarget,
		RiskClientJSON: challenge.RiskClientJSON,
	})
	if err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.saveAuthChallengeLocked(domain.AuthChallenge{
		Token:         challenge.Token,
		ChallengeType: authChallengeTypeLoginStepUp,
		UserID:        challenge.UserID,
		Channel:       challenge.LoginMethod,
		ACR:           challenge.ACR,
		PayloadJSON:   payload,
		ExpiresAt:     challenge.ExpiresAt,
		CreatedAt:     challenge.CreatedAt,
	})
	return nil
}

func (s *MemoryStore) GetLoginStepUpChallenge(token string) (domain.LoginStepUpChallenge, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	item, err := s.getAuthChallengeLocked(token, authChallengeTypeLoginStepUp, true)
	if err != nil {
		return domain.LoginStepUpChallenge{}, ErrNotFound
	}
	payload, err := parseAuthChallengePayload[struct {
		EffectiveMode  string `json:"effective_mode"`
		EmailTarget    string `json:"email_target"`
		PhoneTarget    string `json:"phone_target"`
		RiskClientJSON string `json:"risk_client_json,omitempty"`
	}](item.PayloadJSON)
	if err != nil {
		return domain.LoginStepUpChallenge{}, err
	}
	effectiveMode := domain.LoginStepUpMode(payload.EffectiveMode)
	if effectiveMode == "" {
		effectiveMode = domain.LoginStepUpModeNone
	}
	return domain.LoginStepUpChallenge{
		Token:          item.Token,
		UserID:         item.UserID,
		LoginMethod:    item.Channel,
		ACR:            item.ACR,
		EffectiveMode:  effectiveMode,
		EmailTarget:    payload.EmailTarget,
		PhoneTarget:    payload.PhoneTarget,
		RiskClientJSON: payload.RiskClientJSON,
		ExpiresAt:      item.ExpiresAt,
		CreatedAt:      item.CreatedAt,
	}, nil
}

func (s *MemoryStore) DeleteLoginStepUpChallenge(token string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.deleteAuthChallengeLocked(token, authChallengeTypeLoginStepUp)
}

func (s *MemoryStore) ConsumeLoginStepUpChallenge(token string, consumedAt time.Time) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.consumeAuthChallengeLocked(token, authChallengeTypeLoginStepUp, consumedAt)
}

func (s *MemoryStore) SaveLoginMFAEnrollmentChallenge(challenge domain.LoginMFAEnrollmentChallenge) error {
	payload, err := authChallengePayload(struct {
		RiskClientJSON      string `json:"risk_client_json,omitempty"`
		RiskStepUpSatisfied bool   `json:"risk_step_up_satisfied,omitempty"`
	}{RiskClientJSON: challenge.RiskClientJSON, RiskStepUpSatisfied: challenge.RiskStepUpSatisfied})
	if err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.saveAuthChallengeLocked(domain.AuthChallenge{
		Token:         challenge.Token,
		ChallengeType: authChallengeTypeLoginMFAEnrollment,
		UserID:        challenge.UserID,
		Channel:       challenge.LoginMethod,
		ACR:           challenge.ACR,
		PayloadJSON:   payload,
		ExpiresAt:     challenge.ExpiresAt,
		CreatedAt:     challenge.CreatedAt,
	})
	return nil
}

func (s *MemoryStore) GetLoginMFAEnrollmentChallenge(token string) (domain.LoginMFAEnrollmentChallenge, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	item, err := s.getAuthChallengeLocked(token, authChallengeTypeLoginMFAEnrollment, true)
	if err != nil {
		return domain.LoginMFAEnrollmentChallenge{}, ErrNotFound
	}
	payload, err := parseAuthChallengePayload[struct {
		RiskClientJSON      string `json:"risk_client_json,omitempty"`
		RiskStepUpSatisfied bool   `json:"risk_step_up_satisfied,omitempty"`
	}](item.PayloadJSON)
	if err != nil {
		return domain.LoginMFAEnrollmentChallenge{}, err
	}
	return domain.LoginMFAEnrollmentChallenge{
		Token:               item.Token,
		UserID:              item.UserID,
		LoginMethod:         item.Channel,
		ACR:                 item.ACR,
		RiskClientJSON:      payload.RiskClientJSON,
		RiskStepUpSatisfied: payload.RiskStepUpSatisfied,
		ExpiresAt:           item.ExpiresAt,
		CreatedAt:           item.CreatedAt,
	}, nil
}

func (s *MemoryStore) DeleteLoginMFAEnrollmentChallenge(token string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.deleteAuthChallengeLocked(token, authChallengeTypeLoginMFAEnrollment)
}

func (s *MemoryStore) ConsumeLoginMFAEnrollmentChallenge(token string, consumedAt time.Time) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.consumeAuthChallengeLocked(token, authChallengeTypeLoginMFAEnrollment, consumedAt)
}
