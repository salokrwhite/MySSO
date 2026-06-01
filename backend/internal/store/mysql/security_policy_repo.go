package mysql

import (
	"database/sql"
	"strings"
	"time"

	"mysso/backend/internal/domain"
)

func (s *MySQLStore) GetUserSecurityPolicy(userID string) (domain.UserSecurityPolicy, error) {
	row := s.db.QueryRow(`
		SELECT user_id,
			force_phone_binding_next_login,
			force_mfa_enrollment_next_login,
			login_step_up_mode,
			phone_binding_risk_mode,
			phone_binding_risk_required,
			phone_binding_risk_login_count,
			created_at,
			updated_at
		FROM user_security_policies
		WHERE user_id = ?
		LIMIT 1
	`, userID)
	var item domain.UserSecurityPolicy
	var loginStepUpMode string
	if err := row.Scan(
		&item.UserID,
		&item.ForcePhoneBindingNextLogin,
		&item.ForceMFAEnrollmentNextLogin,
		&loginStepUpMode,
		&item.PhoneBindingRiskMode,
		&item.PhoneBindingRiskRequired,
		&item.PhoneBindingRiskLoginCount,
		&item.CreatedAt,
		&item.UpdatedAt,
	); err != nil {
		if err == sql.ErrNoRows {
			return domain.UserSecurityPolicy{}, ErrNotFound
		}
		return domain.UserSecurityPolicy{}, err
	}
	item.LoginStepUpMode = domain.LoginStepUpMode(loginStepUpMode)
	if item.LoginStepUpMode == "" {
		item.LoginStepUpMode = domain.LoginStepUpModeNone
	}
	return item, nil
}

func (s *MySQLStore) UpsertUserSecurityPolicy(policy domain.UserSecurityPolicy) error {
	if policy.LoginStepUpMode == "" {
		policy.LoginStepUpMode = domain.LoginStepUpModeNone
	}
	_, err := s.db.Exec(`
		INSERT INTO user_security_policies (
			user_id,
			force_phone_binding_next_login,
			force_mfa_enrollment_next_login,
			login_step_up_mode,
			phone_binding_risk_mode,
			phone_binding_risk_required,
			phone_binding_risk_login_count,
			created_at,
			updated_at
		)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
			force_phone_binding_next_login = VALUES(force_phone_binding_next_login),
			force_mfa_enrollment_next_login = VALUES(force_mfa_enrollment_next_login),
			login_step_up_mode = VALUES(login_step_up_mode),
			phone_binding_risk_mode = VALUES(phone_binding_risk_mode),
			phone_binding_risk_required = VALUES(phone_binding_risk_required),
			phone_binding_risk_login_count = VALUES(phone_binding_risk_login_count),
			updated_at = VALUES(updated_at)
	`, policy.UserID, policy.ForcePhoneBindingNextLogin, policy.ForceMFAEnrollmentNextLogin, string(policy.LoginStepUpMode), policy.PhoneBindingRiskMode, policy.PhoneBindingRiskRequired, policy.PhoneBindingRiskLoginCount, policy.CreatedAt, policy.UpdatedAt)
	return err
}

func (s *MySQLStore) UpdatePhoneBindingRiskState(userID, mode string, required bool, loginCount int) error {
	if loginCount < 0 {
		loginCount = 0
	}
	now := time.Now().UTC()
	_, err := s.db.Exec(`
		INSERT INTO user_security_policies (
			user_id,
			force_phone_binding_next_login,
			force_mfa_enrollment_next_login,
			login_step_up_mode,
			phone_binding_risk_mode,
			phone_binding_risk_required,
			phone_binding_risk_login_count,
			created_at,
			updated_at
		)
		VALUES (?, 0, 0, 'none', ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
			phone_binding_risk_mode = VALUES(phone_binding_risk_mode),
			phone_binding_risk_required = VALUES(phone_binding_risk_required),
			phone_binding_risk_login_count = VALUES(phone_binding_risk_login_count),
			updated_at = VALUES(updated_at)
	`, userID, strings.TrimSpace(mode), required, loginCount, now, now)
	return err
}

func (s *MySQLStore) DeleteUserSecurityPolicy(userID string) error {
	_, err := s.db.Exec(`DELETE FROM user_security_policies WHERE user_id = ?`, userID)
	return err
}

func (s *MySQLStore) SaveLoginStepUpChallenge(challenge domain.LoginStepUpChallenge) error {
	payload, err := authChallengePayload(struct {
		EffectiveMode string `json:"effective_mode"`
		EmailTarget   string `json:"email_target"`
		PhoneTarget   string `json:"phone_target"`
	}{
		EffectiveMode: string(challenge.EffectiveMode),
		EmailTarget:   challenge.EmailTarget,
		PhoneTarget:   challenge.PhoneTarget,
	})
	if err != nil {
		return err
	}
	return s.saveAuthChallenge(domain.AuthChallenge{
		Token:         challenge.Token,
		ChallengeType: authChallengeTypeLoginStepUp,
		UserID:        challenge.UserID,
		Channel:       challenge.LoginMethod,
		ACR:           challenge.ACR,
		PayloadJSON:   payload,
		ExpiresAt:     challenge.ExpiresAt,
		CreatedAt:     challenge.CreatedAt,
	})
}

func (s *MySQLStore) GetLoginStepUpChallenge(token string) (domain.LoginStepUpChallenge, error) {
	item, err := s.getAuthChallenge(token, authChallengeTypeLoginStepUp, true)
	if err != nil {
		return domain.LoginStepUpChallenge{}, err
	}
	payload, err := parseAuthChallengePayload[struct {
		EffectiveMode string `json:"effective_mode"`
		EmailTarget   string `json:"email_target"`
		PhoneTarget   string `json:"phone_target"`
	}](item.PayloadJSON)
	if err != nil {
		return domain.LoginStepUpChallenge{}, err
	}
	effectiveMode := domain.LoginStepUpMode(payload.EffectiveMode)
	if effectiveMode == "" {
		effectiveMode = domain.LoginStepUpModeNone
	}
	return domain.LoginStepUpChallenge{
		Token:         item.Token,
		UserID:        item.UserID,
		LoginMethod:   item.Channel,
		ACR:           item.ACR,
		EffectiveMode: effectiveMode,
		EmailTarget:   payload.EmailTarget,
		PhoneTarget:   payload.PhoneTarget,
		ExpiresAt:     item.ExpiresAt,
		CreatedAt:     item.CreatedAt,
	}, nil
}

func (s *MySQLStore) DeleteLoginStepUpChallenge(token string) error {
	return s.deleteAuthChallenge(token, authChallengeTypeLoginStepUp)
}

func (s *MySQLStore) ConsumeLoginStepUpChallenge(token string, consumedAt time.Time) error {
	return s.consumeAuthChallenge(token, authChallengeTypeLoginStepUp, consumedAt)
}

func (s *MySQLStore) SaveLoginMFAEnrollmentChallenge(challenge domain.LoginMFAEnrollmentChallenge) error {
	return s.saveAuthChallenge(domain.AuthChallenge{
		Token:         challenge.Token,
		ChallengeType: authChallengeTypeLoginMFAEnrollment,
		UserID:        challenge.UserID,
		Channel:       challenge.LoginMethod,
		ACR:           challenge.ACR,
		ExpiresAt:     challenge.ExpiresAt,
		CreatedAt:     challenge.CreatedAt,
	})
}

func (s *MySQLStore) GetLoginMFAEnrollmentChallenge(token string) (domain.LoginMFAEnrollmentChallenge, error) {
	item, err := s.getAuthChallenge(token, authChallengeTypeLoginMFAEnrollment, true)
	if err != nil {
		return domain.LoginMFAEnrollmentChallenge{}, err
	}
	return domain.LoginMFAEnrollmentChallenge{
		Token:       item.Token,
		UserID:      item.UserID,
		LoginMethod: item.Channel,
		ACR:         item.ACR,
		ExpiresAt:   item.ExpiresAt,
		CreatedAt:   item.CreatedAt,
	}, nil
}

func (s *MySQLStore) DeleteLoginMFAEnrollmentChallenge(token string) error {
	return s.deleteAuthChallenge(token, authChallengeTypeLoginMFAEnrollment)
}

func (s *MySQLStore) ConsumeLoginMFAEnrollmentChallenge(token string, consumedAt time.Time) error {
	return s.consumeAuthChallenge(token, authChallengeTypeLoginMFAEnrollment, consumedAt)
}
