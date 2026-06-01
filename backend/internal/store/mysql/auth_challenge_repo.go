package mysql

import (
	"database/sql"
	"encoding/json"
	"fmt"
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

func (s *MySQLStore) saveAuthChallenge(challenge domain.AuthChallenge) error {
	_, err := s.db.Exec(`
		INSERT INTO auth_challenges (
			token, challenge_type, user_id, channel, target, acr, payload_json, expires_at, consumed_at, created_at
		)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, challenge.Token, challenge.ChallengeType, challenge.UserID, challenge.Channel, challenge.Target, challenge.ACR, nullableJSON(challenge.PayloadJSON), challenge.ExpiresAt, nullableTime(challenge.ConsumedAt), challenge.CreatedAt)
	return err
}

func (s *MySQLStore) getAuthChallenge(token, challengeType string, requireUnconsumed bool) (domain.AuthChallenge, error) {
	query := `
		SELECT token, challenge_type, user_id, channel, target, acr, COALESCE(CAST(payload_json AS CHAR), ''), expires_at, consumed_at, created_at
		FROM auth_challenges
		WHERE token = ? AND challenge_type = ? AND expires_at >= UTC_TIMESTAMP()
	`
	if requireUnconsumed {
		query += ` AND consumed_at IS NULL`
	}
	query += ` LIMIT 1`

	row := s.db.QueryRow(query, token, challengeType)
	var item domain.AuthChallenge
	if err := row.Scan(&item.Token, &item.ChallengeType, &item.UserID, &item.Channel, &item.Target, &item.ACR, &item.PayloadJSON, &item.ExpiresAt, &item.ConsumedAt, &item.CreatedAt); err != nil {
		if err == sql.ErrNoRows {
			return domain.AuthChallenge{}, ErrNotFound
		}
		return domain.AuthChallenge{}, err
	}
	return item, nil
}

func (s *MySQLStore) deleteAuthChallenge(token, challengeType string) error {
	_, err := s.db.Exec(`DELETE FROM auth_challenges WHERE token = ? AND challenge_type = ?`, token, challengeType)
	return err
}

func (s *MySQLStore) deleteAuthChallenges(tokens []string, challengeType string) error {
	if len(tokens) == 0 {
		return nil
	}
	placeholders := make([]string, len(tokens))
	args := make([]any, 0, len(tokens)+1)
	args = append(args, challengeType)
	for i, token := range tokens {
		placeholders[i] = "?"
		args = append(args, token)
	}
	_, err := s.db.Exec(
		fmt.Sprintf("DELETE FROM auth_challenges WHERE challenge_type = ? AND token IN (%s)", strings.Join(placeholders, ",")),
		args...,
	)
	return err
}

func (s *MySQLStore) listAuthChallenges(challengeType string, limit int) ([]domain.AuthChallenge, error) {
	if limit <= 0 {
		limit = 1000
	}
	rows, err := s.db.Query(`
		SELECT token, challenge_type, user_id, channel, target, acr, COALESCE(CAST(payload_json AS CHAR), ''), expires_at, consumed_at, created_at
		FROM auth_challenges
		WHERE challenge_type = ?
		ORDER BY created_at DESC
		LIMIT ?
	`, challengeType, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]domain.AuthChallenge, 0)
	for rows.Next() {
		var item domain.AuthChallenge
		if err := rows.Scan(&item.Token, &item.ChallengeType, &item.UserID, &item.Channel, &item.Target, &item.ACR, &item.PayloadJSON, &item.ExpiresAt, &item.ConsumedAt, &item.CreatedAt); err != nil {
			continue
		}
		items = append(items, item)
	}
	return items, nil
}

func (s *MySQLStore) consumeAuthChallenge(token, challengeType string, consumedAt time.Time) error {
	result, err := s.db.Exec(`
		UPDATE auth_challenges
		SET consumed_at = ?
		WHERE token = ? AND challenge_type = ? AND consumed_at IS NULL AND expires_at >= UTC_TIMESTAMP()
	`, consumedAt, token, challengeType)
	if err != nil {
		return err
	}
	affected, _ := result.RowsAffected()
	if affected == 0 {
		return ErrNotFound
	}
	return nil
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

func nullableJSON(value string) any {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	return value
}
