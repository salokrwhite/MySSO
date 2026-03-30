package mysql

import (
	"database/sql"

	"mysso/backend/internal/domain"
)

func (s *MySQLStore) SavePhoneBindingChallenge(challenge domain.PhoneBindingChallenge) error {
	_, err := s.db.Exec(`
		INSERT INTO phone_binding_challenges (token, user_id, reason, acr, expires_at, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, challenge.Token, challenge.UserID, challenge.Reason, challenge.ACR, challenge.ExpiresAt, challenge.CreatedAt)
	return err
}

func (s *MySQLStore) GetPhoneBindingChallenge(token string) (domain.PhoneBindingChallenge, error) {
	var challenge domain.PhoneBindingChallenge
	err := s.db.QueryRow(`
		SELECT token, user_id, reason, acr, expires_at, created_at
		FROM phone_binding_challenges
		WHERE token = ? AND expires_at > UTC_TIMESTAMP()
	`, token).Scan(&challenge.Token, &challenge.UserID, &challenge.Reason, &challenge.ACR, &challenge.ExpiresAt, &challenge.CreatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return domain.PhoneBindingChallenge{}, ErrNotFound
		}
		return domain.PhoneBindingChallenge{}, err
	}
	return challenge, nil
}

func (s *MySQLStore) DeletePhoneBindingChallenge(token string) error {
	_, err := s.db.Exec(`DELETE FROM phone_binding_challenges WHERE token = ?`, token)
	return err
}
