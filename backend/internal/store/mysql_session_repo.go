package store

import (
	"database/sql"

	"mysso/backend/internal/domain"
)

func (s *MySQLStore) CreateSession(session domain.Session) {
	_, _ = s.db.Exec(`
		INSERT INTO sessions (token, user_id, role, authenticated_at, acr, expires_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, session.Token, session.UserID, session.Role, session.AuthenticatedAt, session.ACR, session.ExpiresAt)
}

func (s *MySQLStore) GetSession(token string) (domain.Session, error) {
	row := s.db.QueryRow(`SELECT token, user_id, role, authenticated_at, acr, expires_at FROM sessions WHERE token = ?`, token)
	var item domain.Session
	var authenticatedAt sql.NullTime
	if err := row.Scan(&item.Token, &item.UserID, &item.Role, &authenticatedAt, &item.ACR, &item.ExpiresAt); err != nil {
		if err == sql.ErrNoRows {
			return domain.Session{}, ErrNotFound
		}
		return domain.Session{}, err
	}
	if authenticatedAt.Valid {
		item.AuthenticatedAt = authenticatedAt.Time
	}
	return item, nil
}

func (s *MySQLStore) DeleteSession(token string) error {
	result, err := s.db.Exec(`DELETE FROM sessions WHERE token = ?`, token)
	if err != nil {
		return err
	}
	if affected, _ := result.RowsAffected(); affected == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *MySQLStore) DeleteSessionsByUser(userID string) error {
	_, err := s.db.Exec(`DELETE FROM sessions WHERE user_id = ?`, userID)
	return err
}
