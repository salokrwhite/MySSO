package mysql

import (
	"database/sql"
	"encoding/json"
	"strings"

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

func (s *MySQLStore) SaveQRLoginChallenge(challenge domain.QRLoginChallenge) error {
	payload, err := qrLoginPayloadJSON(challenge)
	if err != nil {
		return err
	}
	_, err = s.db.Exec(`
		INSERT INTO auth_challenges (
			token, challenge_type, lookup_token, status, user_id, channel, target, acr,
			payload_json, expires_at, consumed_at, created_at, updated_at
		)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, challenge.ChallengeToken, authChallengeTypeQRLogin, challenge.ScanToken, challenge.Status, challenge.UserID, "qr", "", "urn:mysso:acr:qr-login",
		nullableJSON(payload), challenge.ExpiresAt, nil, challenge.CreatedAt, challenge.UpdatedAt)
	return err
}

func (s *MySQLStore) GetQRLoginChallengeByChallengeToken(token string) (domain.QRLoginChallenge, error) {
	return s.getQRLoginChallenge("token", token)
}

func (s *MySQLStore) GetQRLoginChallengeByScanToken(token string) (domain.QRLoginChallenge, error) {
	return s.getQRLoginChallenge("lookup_token", token)
}

func (s *MySQLStore) getQRLoginChallenge(column, token string) (domain.QRLoginChallenge, error) {
	if column != "token" && column != "lookup_token" {
		return domain.QRLoginChallenge{}, ErrNotFound
	}
	row := s.db.QueryRow(`
		SELECT token, lookup_token, status, user_id, COALESCE(CAST(payload_json AS CHAR), ''),
			expires_at, created_at, updated_at
		FROM auth_challenges
		WHERE `+column+` = ? AND challenge_type = ? AND expires_at >= UTC_TIMESTAMP()
		LIMIT 1
	`, strings.TrimSpace(token), authChallengeTypeQRLogin)

	var item domain.QRLoginChallenge
	var status string
	var payload string
	var scanToken sql.NullString
	var updatedAt sql.NullTime
	if err := row.Scan(&item.ChallengeToken, &scanToken, &status, &item.UserID, &payload, &item.ExpiresAt, &item.CreatedAt, &updatedAt); err != nil {
		if err == sql.ErrNoRows {
			return domain.QRLoginChallenge{}, ErrNotFound
		}
		return domain.QRLoginChallenge{}, err
	}
	if scanToken.Valid {
		item.ScanToken = scanToken.String
	}
	item.Status = domain.QRLoginStatus(status)
	if updatedAt.Valid {
		item.UpdatedAt = updatedAt.Time
	}
	applyQRLoginPayload(&item, payload)
	return item, nil
}

func (s *MySQLStore) UpdateQRLoginChallenge(challenge domain.QRLoginChallenge) error {
	payload, err := qrLoginPayloadJSON(challenge)
	if err != nil {
		return err
	}
	result, err := s.db.Exec(`
		UPDATE auth_challenges
		SET status = ?, user_id = ?, payload_json = ?, updated_at = ?
		WHERE token = ? AND challenge_type = ? AND expires_at >= UTC_TIMESTAMP()
	`, challenge.Status, challenge.UserID, nullableJSON(payload), challenge.UpdatedAt, challenge.ChallengeToken, authChallengeTypeQRLogin)
	if err != nil {
		return err
	}
	affected, _ := result.RowsAffected()
	if affected == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *MySQLStore) DeleteQRLoginChallenge(challengeToken string) error {
	_, err := s.db.Exec(`DELETE FROM auth_challenges WHERE token = ? AND challenge_type = ?`, strings.TrimSpace(challengeToken), authChallengeTypeQRLogin)
	return err
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

func applyQRLoginPayload(challenge *domain.QRLoginChallenge, payloadJSON string) {
	if strings.TrimSpace(payloadJSON) == "" {
		return
	}
	var payload qrLoginPayload
	if err := json.Unmarshal([]byte(payloadJSON), &payload); err != nil {
		return
	}
	challenge.UserEmail = payload.UserEmail
	challenge.UserDisplayName = payload.UserDisplayName
	challenge.UserRole = domain.Role(payload.UserRole)
	challenge.SessionToken = payload.SessionToken
	challenge.IP = payload.IP
	challenge.UserAgent = payload.UserAgent
}
