package store

import (
	"database/sql"

	"mysso/backend/internal/domain"
)

func (s *MySQLStore) GetUserSecurityPolicy(userID string) (domain.UserSecurityPolicy, error) {
	row := s.db.QueryRow(`
		SELECT user_id, force_phone_binding_next_login, force_mfa_enrollment_next_login, login_step_up_mode, created_at, updated_at
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
			created_at,
			updated_at
		)
		VALUES (?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
			force_phone_binding_next_login = VALUES(force_phone_binding_next_login),
			force_mfa_enrollment_next_login = VALUES(force_mfa_enrollment_next_login),
			login_step_up_mode = VALUES(login_step_up_mode),
			updated_at = VALUES(updated_at)
	`, policy.UserID, policy.ForcePhoneBindingNextLogin, policy.ForceMFAEnrollmentNextLogin, string(policy.LoginStepUpMode), policy.CreatedAt, policy.UpdatedAt)
	return err
}

func (s *MySQLStore) DeleteUserSecurityPolicy(userID string) error {
	_, err := s.db.Exec(`DELETE FROM user_security_policies WHERE user_id = ?`, userID)
	return err
}

func (s *MySQLStore) SaveLoginStepUpChallenge(challenge domain.LoginStepUpChallenge) error {
	_, err := s.db.Exec(`
		INSERT INTO login_step_up_challenges (
			token, user_id, login_method, acr, effective_mode, email_target, phone_target, expires_at, created_at
		)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, challenge.Token, challenge.UserID, challenge.LoginMethod, challenge.ACR, string(challenge.EffectiveMode), challenge.EmailTarget, challenge.PhoneTarget, challenge.ExpiresAt, challenge.CreatedAt)
	return err
}

func (s *MySQLStore) GetLoginStepUpChallenge(token string) (domain.LoginStepUpChallenge, error) {
	row := s.db.QueryRow(`
		SELECT token, user_id, login_method, acr, effective_mode, email_target, phone_target, expires_at, created_at
		FROM login_step_up_challenges
		WHERE token = ? AND expires_at >= UTC_TIMESTAMP()
		LIMIT 1
	`, token)
	var item domain.LoginStepUpChallenge
	var effectiveMode string
	if err := row.Scan(&item.Token, &item.UserID, &item.LoginMethod, &item.ACR, &effectiveMode, &item.EmailTarget, &item.PhoneTarget, &item.ExpiresAt, &item.CreatedAt); err != nil {
		if err == sql.ErrNoRows {
			return domain.LoginStepUpChallenge{}, ErrNotFound
		}
		return domain.LoginStepUpChallenge{}, err
	}
	item.EffectiveMode = domain.LoginStepUpMode(effectiveMode)
	if item.EffectiveMode == "" {
		item.EffectiveMode = domain.LoginStepUpModeNone
	}
	return item, nil
}

func (s *MySQLStore) DeleteLoginStepUpChallenge(token string) error {
	_, err := s.db.Exec(`DELETE FROM login_step_up_challenges WHERE token = ?`, token)
	return err
}

func (s *MySQLStore) SaveLoginMFAEnrollmentChallenge(challenge domain.LoginMFAEnrollmentChallenge) error {
	_, err := s.db.Exec(`
		INSERT INTO login_mfa_enrollment_challenges (token, user_id, login_method, acr, expires_at, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, challenge.Token, challenge.UserID, challenge.LoginMethod, challenge.ACR, challenge.ExpiresAt, challenge.CreatedAt)
	return err
}

func (s *MySQLStore) GetLoginMFAEnrollmentChallenge(token string) (domain.LoginMFAEnrollmentChallenge, error) {
	row := s.db.QueryRow(`
		SELECT token, user_id, login_method, acr, expires_at, created_at
		FROM login_mfa_enrollment_challenges
		WHERE token = ? AND expires_at >= UTC_TIMESTAMP()
		LIMIT 1
	`, token)
	var item domain.LoginMFAEnrollmentChallenge
	if err := row.Scan(&item.Token, &item.UserID, &item.LoginMethod, &item.ACR, &item.ExpiresAt, &item.CreatedAt); err != nil {
		if err == sql.ErrNoRows {
			return domain.LoginMFAEnrollmentChallenge{}, ErrNotFound
		}
		return domain.LoginMFAEnrollmentChallenge{}, err
	}
	return item, nil
}

func (s *MySQLStore) DeleteLoginMFAEnrollmentChallenge(token string) error {
	_, err := s.db.Exec(`DELETE FROM login_mfa_enrollment_challenges WHERE token = ?`, token)
	return err
}
