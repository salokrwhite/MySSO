package store

import (
	"database/sql"
	"time"

	"mysso/backend/internal/domain"
)

type sqlRowQuerier interface {
	QueryRow(query string, args ...any) *sql.Row
}

func (s *MySQLStore) SaveAuthorizationCode(code domain.AuthorizationCode) {
	_, _ = s.db.Exec(`
		INSERT INTO authorization_codes (code, user_id, client_id, redirect_uri, scopes, code_challenge, code_challenge_method, nonce, state, auth_time, acr, expires_at, used)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, code.Code, code.UserID, code.ClientID, code.RedirectURI, mustJSON(code.Scopes), code.CodeChallenge, code.CodeChallengeMeth, code.Nonce, code.State, nullableTime(&code.AuthTime), code.ACR, code.ExpiresAt, code.Used)
}

func scanAuthorizationCode(scanner interface{ Scan(dest ...any) error }) (domain.AuthorizationCode, error) {
	var item domain.AuthorizationCode
	var scopes string
	var authTime sql.NullTime
	if err := scanner.Scan(&item.Code, &item.UserID, &item.ClientID, &item.RedirectURI, &scopes, &item.CodeChallenge, &item.CodeChallengeMeth, &item.Nonce, &item.State, &authTime, &item.ACR, &item.ExpiresAt, &item.Used); err != nil {
		if err == sql.ErrNoRows {
			return domain.AuthorizationCode{}, ErrNotFound
		}
		return domain.AuthorizationCode{}, err
	}
	item.Scopes = parseStringSlice(scopes)
	if authTime.Valid {
		item.AuthTime = authTime.Time
	}
	return item, nil
}

func getAuthorizationCode(q sqlRowQuerier, query string, args ...any) (domain.AuthorizationCode, error) {
	row := q.QueryRow(query, args...)
	return scanAuthorizationCode(row)
}

func (s *MySQLStore) ConsumeAuthorizationCode(value, clientID, redirectURI, expectedCodeChallenge string) (domain.AuthorizationCode, error) {
	tx, err := s.db.Begin()
	if err != nil {
		return domain.AuthorizationCode{}, err
	}
	defer func() { _ = tx.Rollback() }()

	result, err := tx.Exec(`
		UPDATE authorization_codes
		SET used = 1
		WHERE code = ? AND used = 0 AND expires_at >= UTC_TIMESTAMP() AND client_id = ? AND redirect_uri = ? AND (code_challenge = '' OR code_challenge = ?)
	`, value, clientID, redirectURI, expectedCodeChallenge)
	if err != nil {
		return domain.AuthorizationCode{}, err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return domain.AuthorizationCode{}, err
	}
	if rowsAffected != 1 {
		code, err := getAuthorizationCode(tx, `
			SELECT code, user_id, client_id, redirect_uri, scopes, code_challenge, code_challenge_method, nonce, state, auth_time, acr, expires_at, used
			FROM authorization_codes WHERE code = ?
		`, value)
		if err != nil {
			if err == ErrNotFound {
				return domain.AuthorizationCode{}, ErrNotFound
			}
			return domain.AuthorizationCode{}, err
		}
		if code.Used || code.ExpiresAt.Before(time.Now().UTC()) {
			return domain.AuthorizationCode{}, ErrAuthorizationCodeUnavailable
		}
		if code.ClientID != clientID || code.RedirectURI != redirectURI {
			return domain.AuthorizationCode{}, ErrAuthorizationCodeRequestMismatch
		}
		if code.CodeChallenge != "" && code.CodeChallenge != expectedCodeChallenge {
			return domain.AuthorizationCode{}, ErrAuthorizationCodePKCEMismatch
		}
		return domain.AuthorizationCode{}, ErrAuthorizationCodeUnavailable
	}

	code, err := getAuthorizationCode(tx, `
		SELECT code, user_id, client_id, redirect_uri, scopes, code_challenge, code_challenge_method, nonce, state, auth_time, acr, expires_at, used
		FROM authorization_codes WHERE code = ?
	`, value)
	if err != nil {
		return domain.AuthorizationCode{}, err
	}
	if err := tx.Commit(); err != nil {
		return domain.AuthorizationCode{}, err
	}
	return code, nil
}

func (s *MySQLStore) SaveConsent(consent domain.Consent) {
	_, _ = s.db.Exec(`
		INSERT INTO consents (id, user_id, client_id, scopes, created_at, revoked_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, consent.ID, consent.UserID, consent.ClientID, mustJSON(consent.Scopes), consent.CreatedAt, nullableTime(&consent.RevokedAt))
}

func (s *MySQLStore) ListConsentsByUser(userID string) []domain.Consent {
	rows, err := s.db.Query(`
		SELECT c.id, c.user_id, c.client_id, a.name, a.icon_url, c.scopes, c.created_at, c.revoked_at
		FROM consents c
		LEFT JOIN client_apps a ON c.client_id = a.client_id
		WHERE c.user_id = ? AND c.revoked_at IS NULL ORDER BY c.created_at DESC
	`, userID)
	if err != nil {
		return []domain.Consent{}
	}
	defer rows.Close()

	items := []domain.Consent{}
	for rows.Next() {
		var item domain.Consent
		var scopes string
		var revokedAt sql.NullTime
		if err := rows.Scan(&item.ID, &item.UserID, &item.ClientID, &item.AppName, &item.IconURL, &scopes, &item.CreatedAt, &revokedAt); err == nil {
			item.Scopes = parseStringSlice(scopes)
			if revokedAt.Valid {
				item.RevokedAt = revokedAt.Time
			}
			items = append(items, item)
		}
	}
	return items
}

func (s *MySQLStore) RevokeConsent(id string) error {
	_, err := s.db.Exec(`UPDATE consents SET revoked_at = UTC_TIMESTAMP() WHERE id = ?`, id)
	return err
}

func (s *MySQLStore) SaveRefreshToken(token domain.RefreshToken) {
	_, _ = s.db.Exec(`
		INSERT INTO refresh_tokens (token, user_id, client_id, scopes, rotated_from_token, replaced_by_token, created_at, expires_at, revoked, revoked_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, token.Token, token.UserID, token.ClientID, mustJSON(token.Scopes), token.RotatedFrom, token.ReplacedByToken, token.CreatedAt, token.ExpiresAt, token.Revoked, nullableTime(token.RevokedAt))
}

func scanRefreshToken(scanner interface{ Scan(dest ...any) error }) (domain.RefreshToken, error) {
	var item domain.RefreshToken
	var scopes string
	var revokedAt sql.NullTime
	if err := scanner.Scan(&item.Token, &item.UserID, &item.ClientID, &scopes, &item.RotatedFrom, &item.ReplacedByToken, &item.CreatedAt, &item.ExpiresAt, &item.Revoked, &revokedAt); err != nil {
		if err == sql.ErrNoRows {
			return domain.RefreshToken{}, ErrNotFound
		}
		return domain.RefreshToken{}, err
	}
	item.Scopes = parseStringSlice(scopes)
	if revokedAt.Valid {
		t := revokedAt.Time
		item.RevokedAt = &t
	}
	return item, nil
}

func getRefreshToken(q sqlRowQuerier, query, value string) (domain.RefreshToken, error) {
	row := q.QueryRow(query, value)
	return scanRefreshToken(row)
}

func (s *MySQLStore) RotateRefreshToken(oldToken, expectedClientID string, next domain.RefreshToken) (domain.RefreshToken, error) {
	tx, err := s.db.Begin()
	if err != nil {
		return domain.RefreshToken{}, err
	}
	defer func() { _ = tx.Rollback() }()

	current, err := getRefreshToken(tx, `
		SELECT token, user_id, client_id, scopes, rotated_from_token, replaced_by_token, created_at, expires_at, revoked, revoked_at
		FROM refresh_tokens WHERE token = ? FOR UPDATE
	`, oldToken)
	if err != nil {
		return domain.RefreshToken{}, err
	}
	if current.ClientID != expectedClientID {
		return current, ErrRefreshTokenClientMismatch
	}
	if current.Revoked {
		if current.ReplacedByToken != "" {
			return current, ErrRefreshTokenReuseDetected
		}
		return current, ErrRefreshTokenRevoked
	}
	if current.ExpiresAt.Before(time.Now().UTC()) {
		return current, ErrRefreshTokenExpired
	}
	next.UserID = current.UserID
	next.ClientID = current.ClientID
	next.Scopes = current.Scopes
	next.RotatedFrom = current.Token

	result, err := tx.Exec(`
		UPDATE refresh_tokens
		SET revoked = 1, revoked_at = UTC_TIMESTAMP(), replaced_by_token = ?
		WHERE token = ? AND revoked = 0 AND expires_at >= UTC_TIMESTAMP()
	`, next.Token, oldToken)
	if err != nil {
		return domain.RefreshToken{}, err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return domain.RefreshToken{}, err
	}
	if rowsAffected != 1 {
		latest, err := getRefreshToken(tx, `
			SELECT token, user_id, client_id, scopes, rotated_from_token, replaced_by_token, created_at, expires_at, revoked, revoked_at
			FROM refresh_tokens WHERE token = ? FOR UPDATE
		`, oldToken)
		if err != nil {
			return domain.RefreshToken{}, err
		}
		if latest.Revoked {
			if latest.ReplacedByToken != "" {
				return latest, ErrRefreshTokenReuseDetected
			}
			return latest, ErrRefreshTokenRevoked
		}
		if latest.ExpiresAt.Before(time.Now().UTC()) {
			return latest, ErrRefreshTokenExpired
		}
		return latest, ErrRefreshTokenRevoked
	}

	if _, err := tx.Exec(`
		INSERT INTO refresh_tokens (token, user_id, client_id, scopes, rotated_from_token, replaced_by_token, created_at, expires_at, revoked, revoked_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, next.Token, next.UserID, next.ClientID, mustJSON(next.Scopes), next.RotatedFrom, next.ReplacedByToken, next.CreatedAt, next.ExpiresAt, next.Revoked, nullableTime(next.RevokedAt)); err != nil {
		return domain.RefreshToken{}, err
	}
	if err := tx.Commit(); err != nil {
		return domain.RefreshToken{}, err
	}
	return current, nil
}

func (s *MySQLStore) GetRefreshToken(value string) (domain.RefreshToken, error) {
	return getRefreshToken(s.db, `
		SELECT token, user_id, client_id, scopes, rotated_from_token, replaced_by_token, created_at, expires_at, revoked, revoked_at
		FROM refresh_tokens WHERE token = ?
	`, value)
}

func (s *MySQLStore) RevokeRefreshToken(value string) error {
	_, err := s.db.Exec(`UPDATE refresh_tokens SET revoked = 1, revoked_at = UTC_TIMESTAMP() WHERE token = ?`, value)
	return err
}

func (s *MySQLStore) RevokeRefreshTokensByUser(userID string) error {
	_, err := s.db.Exec(`
		UPDATE refresh_tokens
		SET revoked = 1, revoked_at = UTC_TIMESTAMP()
		WHERE user_id = ? AND revoked = 0
	`, userID)
	return err
}

func (s *MySQLStore) RevokeRefreshTokensByUserClient(userID, clientID string) error {
	_, err := s.db.Exec(`
		UPDATE refresh_tokens
		SET revoked = 1, revoked_at = UTC_TIMESTAMP()
		WHERE user_id = ? AND client_id = ? AND revoked = 0
	`, userID, clientID)
	return err
}
