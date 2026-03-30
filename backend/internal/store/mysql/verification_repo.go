package mysql

import (
	"database/sql"

	"mysso/backend/internal/domain"
)

func (s *MySQLStore) SaveEmailVerificationCode(code domain.EmailVerificationCode) error {
	_, err := s.db.Exec(`
		INSERT INTO email_verification_codes (id, email, country, purpose, code, expires_at, consumed, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`, code.ID, code.Email, code.Country, code.Purpose, code.Code, code.ExpiresAt, code.Consumed, code.CreatedAt)
	return err
}

func (s *MySQLStore) GetEmailVerificationCode(email, purpose, code string) (domain.EmailVerificationCode, error) {
	row := s.db.QueryRow(`
		SELECT id, email, country, purpose, code, expires_at, consumed, created_at
		FROM email_verification_codes
		WHERE email = ? AND purpose = ? AND code = ? AND consumed = 0 AND expires_at >= UTC_TIMESTAMP()
		ORDER BY created_at DESC
		LIMIT 1
	`, email, purpose, code)
	var item domain.EmailVerificationCode
	if err := row.Scan(&item.ID, &item.Email, &item.Country, &item.Purpose, &item.Code, &item.ExpiresAt, &item.Consumed, &item.CreatedAt); err != nil {
		if err == sql.ErrNoRows {
			return domain.EmailVerificationCode{}, ErrNotFound
		}
		return domain.EmailVerificationCode{}, err
	}
	return item, nil
}

func (s *MySQLStore) GetLatestEmailVerificationCode(email, purpose string) (domain.EmailVerificationCode, error) {
	row := s.db.QueryRow(`
		SELECT id, email, country, purpose, code, expires_at, consumed, created_at
		FROM email_verification_codes
		WHERE email = ? AND purpose = ?
		ORDER BY created_at DESC
		LIMIT 1
	`, email, purpose)
	var item domain.EmailVerificationCode
	if err := row.Scan(&item.ID, &item.Email, &item.Country, &item.Purpose, &item.Code, &item.ExpiresAt, &item.Consumed, &item.CreatedAt); err != nil {
		if err == sql.ErrNoRows {
			return domain.EmailVerificationCode{}, ErrNotFound
		}
		return domain.EmailVerificationCode{}, err
	}
	return item, nil
}

func (s *MySQLStore) ConsumeEmailVerificationCode(id string) error {
	_, err := s.db.Exec(`UPDATE email_verification_codes SET consumed = 1 WHERE id = ?`, id)
	return err
}

func (s *MySQLStore) SaveSMSVerificationCode(code domain.SMSVerificationCode) error {
	_, err := s.db.Exec(`
		INSERT INTO sms_verification_codes (id, phone, purpose, code, expires_at, consumed, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`, code.ID, code.Phone, code.Purpose, code.Code, code.ExpiresAt, code.Consumed, code.CreatedAt)
	return err
}

func (s *MySQLStore) GetSMSVerificationCode(phone, purpose, code string) (domain.SMSVerificationCode, error) {
	row := s.db.QueryRow(`
		SELECT id, phone, purpose, code, expires_at, consumed, created_at
		FROM sms_verification_codes
		WHERE phone = ? AND purpose = ? AND code = ? AND consumed = 0 AND expires_at >= UTC_TIMESTAMP()
		ORDER BY created_at DESC
		LIMIT 1
	`, phone, purpose, code)
	var item domain.SMSVerificationCode
	if err := row.Scan(&item.ID, &item.Phone, &item.Purpose, &item.Code, &item.ExpiresAt, &item.Consumed, &item.CreatedAt); err != nil {
		if err == sql.ErrNoRows {
			return domain.SMSVerificationCode{}, ErrNotFound
		}
		return domain.SMSVerificationCode{}, err
	}
	return item, nil
}

func (s *MySQLStore) GetLatestSMSVerificationCode(phone, purpose string) (domain.SMSVerificationCode, error) {
	row := s.db.QueryRow(`
		SELECT id, phone, purpose, code, expires_at, consumed, created_at
		FROM sms_verification_codes
		WHERE phone = ? AND purpose = ?
		ORDER BY created_at DESC
		LIMIT 1
	`, phone, purpose)
	var item domain.SMSVerificationCode
	if err := row.Scan(&item.ID, &item.Phone, &item.Purpose, &item.Code, &item.ExpiresAt, &item.Consumed, &item.CreatedAt); err != nil {
		if err == sql.ErrNoRows {
			return domain.SMSVerificationCode{}, ErrNotFound
		}
		return domain.SMSVerificationCode{}, err
	}
	return item, nil
}

func (s *MySQLStore) ConsumeSMSVerificationCode(id string) error {
	_, err := s.db.Exec(`UPDATE sms_verification_codes SET consumed = 1 WHERE id = ?`, id)
	return err
}

func (s *MySQLStore) SaveMFALoginChallenge(challenge domain.MFALoginChallenge) error {
	_, err := s.db.Exec(`
		INSERT INTO mfa_login_challenges (token, user_id, method, target, expires_at, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, challenge.Token, challenge.UserID, challenge.Method, challenge.Target, challenge.ExpiresAt, challenge.CreatedAt)
	return err
}

func (s *MySQLStore) GetMFALoginChallenge(token string) (domain.MFALoginChallenge, error) {
	row := s.db.QueryRow(`
		SELECT token, user_id, method, target, expires_at, created_at
		FROM mfa_login_challenges
		WHERE token = ? AND expires_at >= UTC_TIMESTAMP()
		LIMIT 1
	`, token)
	var item domain.MFALoginChallenge
	if err := row.Scan(&item.Token, &item.UserID, &item.Method, &item.Target, &item.ExpiresAt, &item.CreatedAt); err != nil {
		if err == sql.ErrNoRows {
			return domain.MFALoginChallenge{}, ErrNotFound
		}
		return domain.MFALoginChallenge{}, err
	}
	return item, nil
}

func (s *MySQLStore) DeleteMFALoginChallenge(token string) error {
	_, err := s.db.Exec(`DELETE FROM mfa_login_challenges WHERE token = ?`, token)
	return err
}

func (s *MySQLStore) SaveDeletionLoginChallenge(challenge domain.DeletionLoginChallenge) error {
	_, err := s.db.Exec(`
		INSERT INTO deletion_login_challenges (token, user_id, acr, deletion_scheduled_at, expires_at, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, challenge.Token, challenge.UserID, challenge.ACR, challenge.DeletionScheduledAt, challenge.ExpiresAt, challenge.CreatedAt)
	return err
}

func (s *MySQLStore) GetDeletionLoginChallenge(token string) (domain.DeletionLoginChallenge, error) {
	row := s.db.QueryRow(`
		SELECT token, user_id, acr, deletion_scheduled_at, expires_at, created_at
		FROM deletion_login_challenges
		WHERE token = ? AND expires_at >= UTC_TIMESTAMP()
		LIMIT 1
	`, token)
	var item domain.DeletionLoginChallenge
	if err := row.Scan(&item.Token, &item.UserID, &item.ACR, &item.DeletionScheduledAt, &item.ExpiresAt, &item.CreatedAt); err != nil {
		if err == sql.ErrNoRows {
			return domain.DeletionLoginChallenge{}, ErrNotFound
		}
		return domain.DeletionLoginChallenge{}, err
	}
	return item, nil
}

func (s *MySQLStore) DeleteDeletionLoginChallenge(token string) error {
	_, err := s.db.Exec(`DELETE FROM deletion_login_challenges WHERE token = ?`, token)
	return err
}
