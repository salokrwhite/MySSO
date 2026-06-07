package mysql

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"time"

	"mysso/backend/internal/domain"
)

func (s *MySQLStore) SaveEmailVerificationCode(code domain.EmailVerificationCode) error {
	_, err := s.db.Exec(`
		INSERT INTO verification_codes (id, channel, target, country, purpose, code, expires_at, consumed, created_at)
		VALUES (?, 'email', ?, ?, ?, ?, ?, ?, ?)
	`, code.ID, code.Email, code.Country, code.Purpose, code.Code, code.ExpiresAt, code.Consumed, code.CreatedAt)
	return err
}

func (s *MySQLStore) SaveEmailVerificationCodeWithinDailyLimit(code domain.EmailVerificationCode, startAt, endAt time.Time, limit int) (bool, error) {
	return s.saveVerificationCodeWithinDailyLimit(
		"email",
		code.Email,
		code.Country,
		code.Purpose,
		code.Code,
		code.ID,
		code.ExpiresAt,
		code.Consumed,
		code.CreatedAt,
		startAt,
		endAt,
		limit,
	)
}

func (s *MySQLStore) CountEmailVerificationCodes(email string, startAt, endAt time.Time) (int, error) {
	var count int
	err := s.db.QueryRow(`
		SELECT COUNT(*)
		FROM verification_codes
		WHERE channel = 'email' AND target = ? AND created_at >= ? AND created_at < ?
	`, email, startAt, endAt).Scan(&count)
	return count, err
}

func (s *MySQLStore) GetEmailVerificationCode(email, purpose, code string) (domain.EmailVerificationCode, error) {
	row := s.db.QueryRow(`
		SELECT id, target, country, purpose, code, expires_at, consumed, created_at
		FROM verification_codes
		WHERE channel = 'email' AND target = ? AND purpose = ? AND code = ? AND consumed = 0 AND expires_at >= UTC_TIMESTAMP()
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
		SELECT id, target, country, purpose, code, expires_at, consumed, created_at
		FROM verification_codes
		WHERE channel = 'email' AND target = ? AND purpose = ?
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
	_, err := s.db.Exec(`UPDATE verification_codes SET consumed = 1 WHERE id = ? AND channel = 'email'`, id)
	return err
}

func (s *MySQLStore) SaveSMSVerificationCode(code domain.SMSVerificationCode) error {
	_, err := s.db.Exec(`
		INSERT INTO verification_codes (id, channel, target, country, purpose, code, expires_at, consumed, created_at)
		VALUES (?, 'sms', ?, '', ?, ?, ?, ?, ?)
	`, code.ID, code.Phone, code.Purpose, code.Code, code.ExpiresAt, code.Consumed, code.CreatedAt)
	return err
}

func (s *MySQLStore) SaveSMSVerificationCodeWithinDailyLimit(code domain.SMSVerificationCode, startAt, endAt time.Time, limit int) (bool, error) {
	return s.saveVerificationCodeWithinDailyLimit(
		"sms",
		code.Phone,
		"",
		code.Purpose,
		code.Code,
		code.ID,
		code.ExpiresAt,
		code.Consumed,
		code.CreatedAt,
		startAt,
		endAt,
		limit,
	)
}

func (s *MySQLStore) saveVerificationCodeWithinDailyLimit(channel, target, country, purpose, verificationCode, id string, expiresAt time.Time, consumed bool, createdAt, startAt, endAt time.Time, limit int) (bool, error) {
	if limit <= 0 {
		_, err := s.db.Exec(`
			INSERT INTO verification_codes (id, channel, target, country, purpose, code, expires_at, consumed, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		`, id, channel, target, country, purpose, verificationCode, expiresAt, consumed, createdAt)
		return err == nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()
	conn, err := s.db.Conn(ctx)
	if err != nil {
		return false, err
	}
	defer conn.Close()

	lockName := verificationDailyLimitLockName(channel, target, startAt)
	acquired, err := acquireMySQLLock(ctx, conn, lockName, 5)
	if err != nil {
		return false, err
	}
	if !acquired {
		return false, fmt.Errorf("verification daily limit lock timeout")
	}
	defer releaseMySQLLock(ctx, conn, lockName)

	var count int
	if err := conn.QueryRowContext(ctx, `
		SELECT COUNT(*)
		FROM verification_codes
		WHERE channel = ? AND target = ? AND created_at >= ? AND created_at < ?
	`, channel, target, startAt, endAt).Scan(&count); err != nil {
		return false, err
	}
	if count >= limit {
		return false, nil
	}
	if _, err := conn.ExecContext(ctx, `
		INSERT INTO verification_codes (id, channel, target, country, purpose, code, expires_at, consumed, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, id, channel, target, country, purpose, verificationCode, expiresAt, consumed, createdAt); err != nil {
		return false, err
	}
	return true, nil
}

func acquireMySQLLock(ctx context.Context, conn *sql.Conn, name string, timeoutSeconds int) (bool, error) {
	var acquired sql.NullInt64
	if err := conn.QueryRowContext(ctx, `SELECT GET_LOCK(?, ?)`, name, timeoutSeconds).Scan(&acquired); err != nil {
		return false, err
	}
	return acquired.Valid && acquired.Int64 == 1, nil
}

func releaseMySQLLock(ctx context.Context, conn *sql.Conn, name string) {
	_, _ = conn.ExecContext(ctx, `SELECT RELEASE_LOCK(?)`, name)
}

func verificationDailyLimitLockName(channel, target string, startAt time.Time) string {
	sum := sha256.Sum256([]byte(channel + ":" + target + ":" + startAt.Format("20060102")))
	return fmt.Sprintf("mysso:vcode:%s:%s", channel, hex.EncodeToString(sum[:])[:32])
}

func (s *MySQLStore) CountSMSVerificationCodes(phone string, startAt, endAt time.Time) (int, error) {
	var count int
	err := s.db.QueryRow(`
		SELECT COUNT(*)
		FROM verification_codes
		WHERE channel = 'sms' AND target = ? AND created_at >= ? AND created_at < ?
	`, phone, startAt, endAt).Scan(&count)
	return count, err
}

func (s *MySQLStore) GetSMSVerificationCode(phone, purpose, code string) (domain.SMSVerificationCode, error) {
	row := s.db.QueryRow(`
		SELECT id, target, purpose, code, expires_at, consumed, created_at
		FROM verification_codes
		WHERE channel = 'sms' AND target = ? AND purpose = ? AND code = ? AND consumed = 0 AND expires_at >= UTC_TIMESTAMP()
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
		SELECT id, target, purpose, code, expires_at, consumed, created_at
		FROM verification_codes
		WHERE channel = 'sms' AND target = ? AND purpose = ?
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
	_, err := s.db.Exec(`UPDATE verification_codes SET consumed = 1 WHERE id = ? AND channel = 'sms'`, id)
	return err
}

func (s *MySQLStore) SaveMFALoginChallenge(challenge domain.MFALoginChallenge) error {
	payload, err := authChallengePayload(struct {
		RiskClientJSON string `json:"risk_client_json,omitempty"`
	}{RiskClientJSON: challenge.RiskClientJSON})
	if err != nil {
		return err
	}
	return s.saveAuthChallenge(domain.AuthChallenge{
		Token:         challenge.Token,
		ChallengeType: authChallengeTypeMFA,
		UserID:        challenge.UserID,
		Channel:       challenge.Method,
		Target:        challenge.Target,
		PayloadJSON:   payload,
		ExpiresAt:     challenge.ExpiresAt,
		CreatedAt:     challenge.CreatedAt,
	})
}

func (s *MySQLStore) GetMFALoginChallenge(token string) (domain.MFALoginChallenge, error) {
	item, err := s.getAuthChallenge(token, authChallengeTypeMFA, true)
	if err != nil {
		return domain.MFALoginChallenge{}, err
	}
	payload, err := parseAuthChallengePayload[struct {
		RiskClientJSON string `json:"risk_client_json,omitempty"`
	}](item.PayloadJSON)
	if err != nil {
		return domain.MFALoginChallenge{}, err
	}
	return domain.MFALoginChallenge{
		Token:          item.Token,
		UserID:         item.UserID,
		Method:         item.Channel,
		Target:         item.Target,
		RiskClientJSON: payload.RiskClientJSON,
		ExpiresAt:      item.ExpiresAt,
		CreatedAt:      item.CreatedAt,
	}, nil
}

func (s *MySQLStore) DeleteMFALoginChallenge(token string) error {
	return s.deleteAuthChallenge(token, authChallengeTypeMFA)
}

func (s *MySQLStore) ConsumeMFALoginChallenge(token string, consumedAt time.Time) error {
	return s.consumeAuthChallenge(token, authChallengeTypeMFA, consumedAt)
}

func (s *MySQLStore) SaveDeletionLoginChallenge(challenge domain.DeletionLoginChallenge) error {
	payload, err := authChallengePayload(struct {
		DeletionScheduledAt time.Time `json:"deletion_scheduled_at"`
		RiskClientJSON      string    `json:"risk_client_json,omitempty"`
	}{DeletionScheduledAt: challenge.DeletionScheduledAt, RiskClientJSON: challenge.RiskClientJSON})
	if err != nil {
		return err
	}
	return s.saveAuthChallenge(domain.AuthChallenge{
		Token:         challenge.Token,
		ChallengeType: authChallengeTypeDeletionLogin,
		UserID:        challenge.UserID,
		ACR:           challenge.ACR,
		PayloadJSON:   payload,
		ExpiresAt:     challenge.ExpiresAt,
		CreatedAt:     challenge.CreatedAt,
	})
}

func (s *MySQLStore) GetDeletionLoginChallenge(token string) (domain.DeletionLoginChallenge, error) {
	item, err := s.getAuthChallenge(token, authChallengeTypeDeletionLogin, true)
	if err != nil {
		return domain.DeletionLoginChallenge{}, err
	}
	payload, err := parseAuthChallengePayload[struct {
		DeletionScheduledAt time.Time `json:"deletion_scheduled_at"`
		RiskClientJSON      string    `json:"risk_client_json,omitempty"`
	}](item.PayloadJSON)
	if err != nil {
		return domain.DeletionLoginChallenge{}, err
	}
	return domain.DeletionLoginChallenge{
		Token:               item.Token,
		UserID:              item.UserID,
		ACR:                 item.ACR,
		RiskClientJSON:      payload.RiskClientJSON,
		DeletionScheduledAt: payload.DeletionScheduledAt,
		ExpiresAt:           item.ExpiresAt,
		CreatedAt:           item.CreatedAt,
	}, nil
}

func (s *MySQLStore) DeleteDeletionLoginChallenge(token string) error {
	return s.deleteAuthChallenge(token, authChallengeTypeDeletionLogin)
}

func (s *MySQLStore) ConsumeDeletionLoginChallenge(token string, consumedAt time.Time) error {
	return s.consumeAuthChallenge(token, authChallengeTypeDeletionLogin, consumedAt)
}
