package mysql

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"mysso/backend/internal/domain"
)

func scanPasskey(scanner interface{ Scan(dest ...any) error }) (domain.Passkey, error) {
	var item domain.Passkey
	var lastUsedAt sql.NullTime
	var transportsJSON string
	if err := scanner.Scan(
		&item.ID,
		&item.UserID,
		&item.Name,
		&item.CredentialID,
		&item.CredentialJSON,
		&item.SignCount,
		&item.AAGUID,
		&transportsJSON,
		&lastUsedAt,
		&item.CreatedAt,
		&item.UpdatedAt,
	); err != nil {
		if err == sql.ErrNoRows {
			return domain.Passkey{}, ErrNotFound
		}
		return domain.Passkey{}, err
	}
	if lastUsedAt.Valid {
		t := lastUsedAt.Time
		item.LastUsedAt = &t
	}
	if transportsJSON != "" {
		_ = json.Unmarshal([]byte(transportsJSON), &item.Transports)
	}
	return item, nil
}

func (s *MySQLStore) ListPasskeysByUser(userID string) ([]domain.Passkey, error) {
	rows, err := s.db.Query(`
		SELECT id, user_id, name, credential_id, credential_json, sign_count, aaguid, transports_json, last_used_at, created_at, updated_at
		FROM passkeys
		WHERE user_id = ?
		ORDER BY created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]domain.Passkey, 0)
	for rows.Next() {
		item, scanErr := scanPasskey(rows)
		if scanErr != nil {
			return nil, scanErr
		}
		items = append(items, item)
	}
	return items, nil
}

func (s *MySQLStore) ListAllPasskeys() []domain.Passkey {
	rows, err := s.db.Query(`
		SELECT id, user_id, name, credential_id, credential_json, sign_count, aaguid, transports_json, last_used_at, created_at, updated_at
		FROM passkeys
		ORDER BY created_at DESC
		LIMIT 1000
	`)
	if err != nil {
		return nil
	}
	defer rows.Close()

	items := make([]domain.Passkey, 0)
	for rows.Next() {
		item, scanErr := scanPasskey(rows)
		if scanErr != nil {
			continue
		}
		items = append(items, item)
	}
	return items
}

func (s *MySQLStore) GetPasskeyByID(id string) (domain.Passkey, error) {
	return scanPasskey(s.db.QueryRow(`
		SELECT id, user_id, name, credential_id, credential_json, sign_count, aaguid, transports_json, last_used_at, created_at, updated_at
		FROM passkeys WHERE id = ?
	`, id))
}

func (s *MySQLStore) GetPasskeyByCredentialID(credentialID string) (domain.Passkey, error) {
	return scanPasskey(s.db.QueryRow(`
		SELECT id, user_id, name, credential_id, credential_json, sign_count, aaguid, transports_json, last_used_at, created_at, updated_at
		FROM passkeys WHERE credential_id = ?
	`, credentialID))
}

func (s *MySQLStore) CreatePasskey(passkey domain.Passkey) error {
	transportsJSON, _ := json.Marshal(passkey.Transports)
	_, err := s.db.Exec(`
		INSERT INTO passkeys (id, user_id, name, credential_id, credential_json, sign_count, aaguid, transports_json, last_used_at, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, passkey.ID, passkey.UserID, passkey.Name, passkey.CredentialID, passkey.CredentialJSON, passkey.SignCount, passkey.AAGUID, string(transportsJSON), nullableTime(passkey.LastUsedAt), passkey.CreatedAt, passkey.UpdatedAt)
	return err
}

func (s *MySQLStore) UpdatePasskeyUsage(passkeyID string, signCount uint32, lastUsedAt time.Time, credentialJSON string) error {
	_, err := s.db.Exec(`
		UPDATE passkeys
		SET sign_count = ?, last_used_at = ?, credential_json = ?, updated_at = UTC_TIMESTAMP()
		WHERE id = ?
	`, signCount, lastUsedAt, credentialJSON, passkeyID)
	return err
}

func (s *MySQLStore) DeletePasskey(userID, passkeyID string) error {
	result, err := s.db.Exec(`DELETE FROM passkeys WHERE id = ? AND user_id = ?`, passkeyID, userID)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *MySQLStore) DeletePasskeys(ids []string) error {
	if len(ids) == 0 {
		return nil
	}
	placeholders := make([]string, len(ids))
	args := make([]any, 0, len(ids))
	for i, id := range ids {
		placeholders[i] = "?"
		args = append(args, id)
	}
	_, err := s.db.Exec(
		fmt.Sprintf("DELETE FROM passkeys WHERE id IN (%s)", strings.Join(placeholders, ",")),
		args...,
	)
	return err
}

func (s *MySQLStore) SavePasskeyRegistrationChallenge(challenge domain.PasskeyRegistrationChallenge) error {
	return s.saveAuthChallenge(domain.AuthChallenge{
		Token:         challenge.Token,
		ChallengeType: authChallengeTypePasskeyRegistration,
		UserID:        challenge.UserID,
		PayloadJSON:   challenge.SessionDataJSON,
		ExpiresAt:     challenge.ExpiresAt,
		CreatedAt:     challenge.CreatedAt,
	})
}

func (s *MySQLStore) GetPasskeyRegistrationChallenge(token string) (domain.PasskeyRegistrationChallenge, error) {
	item, err := s.getAuthChallenge(token, authChallengeTypePasskeyRegistration, true)
	if err != nil {
		return domain.PasskeyRegistrationChallenge{}, err
	}
	return domain.PasskeyRegistrationChallenge{
		Token:           item.Token,
		UserID:          item.UserID,
		SessionDataJSON: item.PayloadJSON,
		ExpiresAt:       item.ExpiresAt,
		CreatedAt:       item.CreatedAt,
	}, nil
}

func (s *MySQLStore) DeletePasskeyRegistrationChallenge(token string) error {
	return s.deleteAuthChallenge(token, authChallengeTypePasskeyRegistration)
}

func (s *MySQLStore) ConsumePasskeyRegistrationChallenge(token string, consumedAt time.Time) error {
	return s.consumeAuthChallenge(token, authChallengeTypePasskeyRegistration, consumedAt)
}

func (s *MySQLStore) ListPasskeyRegistrationChallenges() []domain.PasskeyRegistrationChallenge {
	rows, err := s.listAuthChallenges(authChallengeTypePasskeyRegistration, 1000)
	if err != nil {
		return nil
	}
	items := make([]domain.PasskeyRegistrationChallenge, 0, len(rows))
	for _, row := range rows {
		items = append(items, domain.PasskeyRegistrationChallenge{
			Token:           row.Token,
			UserID:          row.UserID,
			SessionDataJSON: row.PayloadJSON,
			ExpiresAt:       row.ExpiresAt,
			CreatedAt:       row.CreatedAt,
		})
	}
	return items
}

func (s *MySQLStore) DeletePasskeyRegistrationChallenges(tokens []string) error {
	return s.deleteAuthChallenges(tokens, authChallengeTypePasskeyRegistration)
}

func (s *MySQLStore) SavePasskeyLoginChallenge(challenge domain.PasskeyLoginChallenge) error {
	return s.saveAuthChallenge(domain.AuthChallenge{
		Token:         challenge.Token,
		ChallengeType: authChallengeTypePasskeyLogin,
		PayloadJSON:   challenge.SessionDataJSON,
		ExpiresAt:     challenge.ExpiresAt,
		CreatedAt:     challenge.CreatedAt,
	})
}

func (s *MySQLStore) GetPasskeyLoginChallenge(token string) (domain.PasskeyLoginChallenge, error) {
	item, err := s.getAuthChallenge(token, authChallengeTypePasskeyLogin, true)
	if err != nil {
		return domain.PasskeyLoginChallenge{}, err
	}
	return domain.PasskeyLoginChallenge{
		Token:           item.Token,
		SessionDataJSON: item.PayloadJSON,
		ExpiresAt:       item.ExpiresAt,
		CreatedAt:       item.CreatedAt,
	}, nil
}

func (s *MySQLStore) DeletePasskeyLoginChallenge(token string) error {
	return s.deleteAuthChallenge(token, authChallengeTypePasskeyLogin)
}

func (s *MySQLStore) ConsumePasskeyLoginChallenge(token string, consumedAt time.Time) error {
	return s.consumeAuthChallenge(token, authChallengeTypePasskeyLogin, consumedAt)
}

func (s *MySQLStore) ListPasskeyLoginChallenges() []domain.PasskeyLoginChallenge {
	rows, err := s.listAuthChallenges(authChallengeTypePasskeyLogin, 1000)
	if err != nil {
		return nil
	}
	items := make([]domain.PasskeyLoginChallenge, 0, len(rows))
	for _, row := range rows {
		items = append(items, domain.PasskeyLoginChallenge{
			Token:           row.Token,
			SessionDataJSON: row.PayloadJSON,
			ExpiresAt:       row.ExpiresAt,
			CreatedAt:       row.CreatedAt,
		})
	}
	return items
}

func (s *MySQLStore) DeletePasskeyLoginChallenges(tokens []string) error {
	return s.deleteAuthChallenges(tokens, authChallengeTypePasskeyLogin)
}

func (s *MySQLStore) AppendPasskeyUsageLog(log domain.PasskeyUsageLog) error {
	_, err := s.db.Exec(`
		INSERT INTO passkey_usage_logs (id, user_id, passkey_id, credential_id, event_type, source_ip, user_agent, result, failure_reason, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, log.ID, log.UserID, log.PasskeyID, log.CredentialID, log.EventType, log.SourceIP, log.UserAgent, log.Result, log.FailureReason, log.CreatedAt)
	return err
}

func (s *MySQLStore) ListPasskeyUsageLogs() []domain.PasskeyUsageLog {
	rows, err := s.db.Query(`
		SELECT id, user_id, passkey_id, credential_id, event_type, source_ip, user_agent, result, failure_reason, created_at
		FROM passkey_usage_logs
		ORDER BY created_at DESC
		LIMIT 1000
	`)
	if err != nil {
		return nil
	}
	defer rows.Close()

	items := make([]domain.PasskeyUsageLog, 0)
	for rows.Next() {
		var item domain.PasskeyUsageLog
		if err := rows.Scan(&item.ID, &item.UserID, &item.PasskeyID, &item.CredentialID, &item.EventType, &item.SourceIP, &item.UserAgent, &item.Result, &item.FailureReason, &item.CreatedAt); err != nil {
			continue
		}
		items = append(items, item)
	}
	return items
}

func (s *MySQLStore) ListPasskeyUsageLogsByUser(userID string) []domain.PasskeyUsageLog {
	rows, err := s.db.Query(`
		SELECT id, user_id, passkey_id, credential_id, event_type, source_ip, user_agent, result, failure_reason, created_at
		FROM passkey_usage_logs
		WHERE user_id = ?
		ORDER BY created_at DESC
		LIMIT 1000
	`, userID)
	if err != nil {
		return nil
	}
	defer rows.Close()

	items := make([]domain.PasskeyUsageLog, 0)
	for rows.Next() {
		var item domain.PasskeyUsageLog
		if err := rows.Scan(&item.ID, &item.UserID, &item.PasskeyID, &item.CredentialID, &item.EventType, &item.SourceIP, &item.UserAgent, &item.Result, &item.FailureReason, &item.CreatedAt); err != nil {
			continue
		}
		items = append(items, item)
	}
	return items
}

func (s *MySQLStore) DeletePasskeyUsageLogs(ids []string) error {
	if len(ids) == 0 {
		return nil
	}
	placeholders := make([]string, len(ids))
	args := make([]any, 0, len(ids))
	for i, id := range ids {
		placeholders[i] = "?"
		args = append(args, id)
	}
	_, err := s.db.Exec(
		fmt.Sprintf("DELETE FROM passkey_usage_logs WHERE id IN (%s)", strings.Join(placeholders, ",")),
		args...,
	)
	return err
}
