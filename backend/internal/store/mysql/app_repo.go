package mysql

import (
	"database/sql"
	"fmt"
	"strings"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/security"
)

func (s *MySQLStore) ListAppsByOwner(ownerID string) []domain.ClientApp {
	return s.listApps(`WHERE owner_user_id = ?`, ownerID)
}

func (s *MySQLStore) ListApps() []domain.ClientApp {
	return s.listApps("", nil)
}

func (s *MySQLStore) CountApps(status string) (int, error) {
	query := "SELECT COUNT(*) FROM client_apps"
	args := make([]any, 0, 1)
	normalizedStatus := strings.TrimSpace(status)
	if normalizedStatus != "" {
		query += " WHERE status = ?"
		args = append(args, normalizedStatus)
	}
	var total int
	if err := s.db.QueryRow(query, args...).Scan(&total); err != nil {
		return 0, err
	}
	return total, nil
}

func (s *MySQLStore) CreateApp(app domain.ClientApp) domain.ClientApp {
	app.HasClientSecret = strings.TrimSpace(app.ClientSecret) != ""
	_, _ = s.db.Exec(`
		INSERT INTO client_apps (id, owner_user_id, name, icon_url, client_id, client_secret, description, frontchannel_logout_uri, status, review_comment, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, app.ID, app.OwnerUserID, app.Name, app.IconURL, app.ClientID, app.ClientSecret, app.Description, app.FrontChannelLogoutURI, app.Status, app.ReviewComment, app.CreatedAt, app.UpdatedAt)
	s.replaceAppCollections(app)
	return app
}

func (s *MySQLStore) UpdateApp(app domain.ClientApp) error {
	if strings.TrimSpace(app.ClientSecret) != "" && !security.LooksLikeBcryptHash(app.ClientSecret) {
		hashedSecret, err := security.HashPassword(app.ClientSecret)
		if err != nil {
			return err
		}
		app.ClientSecret = hashedSecret
	}
	app.HasClientSecret = strings.TrimSpace(app.ClientSecret) != ""
	if _, err := s.db.Exec(`
		UPDATE client_apps
		SET owner_user_id = ?, name = ?, icon_url = ?, client_id = ?, client_secret = ?, description = ?, frontchannel_logout_uri = ?, status = ?, review_comment = ?, updated_at = ?
		WHERE id = ?
	`, app.OwnerUserID, app.Name, app.IconURL, app.ClientID, app.ClientSecret, app.Description, app.FrontChannelLogoutURI, app.Status, app.ReviewComment, app.UpdatedAt, app.ID); err != nil {
		return err
	}
	s.replaceAppCollections(app)
	return nil
}

func (s *MySQLStore) DeleteApp(id string) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()

	var clientID string
	if err := tx.QueryRow(`SELECT client_id FROM client_apps WHERE id = ?`, id).Scan(&clientID); err != nil {
		if err == sql.ErrNoRows {
			return ErrNotFound
		}
		return err
	}

	statements := []struct {
		query string
		args  []any
	}{
		{query: `DELETE FROM client_redirect_uris WHERE app_id = ?`, args: []any{id}},
		{query: `DELETE FROM client_post_logout_redirect_uris WHERE app_id = ?`, args: []any{id}},
		{query: `DELETE FROM client_scopes WHERE app_id = ?`, args: []any{id}},
		{query: `DELETE FROM authorization_codes WHERE client_id = ?`, args: []any{clientID}},
		{query: `DELETE FROM refresh_tokens WHERE client_id = ?`, args: []any{clientID}},
		{query: `DELETE FROM consents WHERE client_id = ?`, args: []any{clientID}},
		{query: `DELETE FROM audit_logs WHERE target_id = ?`, args: []any{id}},
		{query: `DELETE FROM client_apps WHERE id = ?`, args: []any{id}},
	}
	for _, stmt := range statements {
		if _, err := tx.Exec(stmt.query, stmt.args...); err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (s *MySQLStore) FindAppByClientID(clientID string) (domain.ClientApp, error) {
	row := s.db.QueryRow(`
		SELECT id, owner_user_id, name, icon_url, client_id, client_secret, description, frontchannel_logout_uri, status, review_comment, created_at, updated_at
		FROM client_apps WHERE client_id = ?
	`, clientID)
	return s.scanApp(row)
}

func (s *MySQLStore) GetApp(id string) (domain.ClientApp, error) {
	row := s.db.QueryRow(`
		SELECT id, owner_user_id, name, icon_url, client_id, client_secret, description, frontchannel_logout_uri, status, review_comment, created_at, updated_at
		FROM client_apps WHERE id = ?
	`, id)
	return s.scanApp(row)
}

func (s *MySQLStore) listApps(whereClause string, arg any) []domain.ClientApp {
	query := `
		SELECT id, owner_user_id, name, icon_url, client_id, client_secret, description, frontchannel_logout_uri, status, review_comment, created_at, updated_at
		FROM client_apps
	`
	args := []any{}
	if whereClause != "" {
		query += " " + whereClause
		args = append(args, arg)
	}
	query += " ORDER BY created_at DESC"
	rows, err := s.db.Query(query, args...)
	if err != nil {
		return []domain.ClientApp{}
	}
	defer rows.Close()

	items := []domain.ClientApp{}
	for rows.Next() {
		app, err := s.scanApp(rows)
		if err == nil {
			items = append(items, app)
		}
	}
	return items
}

func (s *MySQLStore) scanApp(scanner interface{ Scan(dest ...any) error }) (domain.ClientApp, error) {
	var item domain.ClientApp
	if err := scanner.Scan(&item.ID, &item.OwnerUserID, &item.Name, &item.IconURL, &item.ClientID, &item.ClientSecret, &item.Description, &item.FrontChannelLogoutURI, &item.Status, &item.ReviewComment, &item.CreatedAt, &item.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return domain.ClientApp{}, ErrNotFound
		}
		return domain.ClientApp{}, err
	}
	item.HasClientSecret = strings.TrimSpace(item.ClientSecret) != ""
	item.RedirectURIs = s.listAppStrings("client_redirect_uris", "redirect_uri", item.ID)
	item.PostLogoutRedirectURIs = s.listAppStrings("client_post_logout_redirect_uris", "post_logout_redirect_uri", item.ID)
	item.Scopes = s.listAppStrings("client_scopes", "scope", item.ID)
	return item, nil
}

func (s *MySQLStore) replaceAppCollections(app domain.ClientApp) {
	_, _ = s.db.Exec(`DELETE FROM client_redirect_uris WHERE app_id = ?`, app.ID)
	_, _ = s.db.Exec(`DELETE FROM client_post_logout_redirect_uris WHERE app_id = ?`, app.ID)
	_, _ = s.db.Exec(`DELETE FROM client_scopes WHERE app_id = ?`, app.ID)
	for _, uri := range app.RedirectURIs {
		_, _ = s.db.Exec(`INSERT INTO client_redirect_uris (app_id, redirect_uri) VALUES (?, ?)`, app.ID, uri)
	}
	for _, uri := range app.PostLogoutRedirectURIs {
		_, _ = s.db.Exec(`INSERT INTO client_post_logout_redirect_uris (app_id, post_logout_redirect_uri) VALUES (?, ?)`, app.ID, uri)
	}
	for _, scope := range app.Scopes {
		_, _ = s.db.Exec(`INSERT INTO client_scopes (app_id, scope) VALUES (?, ?)`, app.ID, scope)
	}
}

func (s *MySQLStore) listAppStrings(table, column, appID string) []string {
	rows, err := s.db.Query(fmt.Sprintf(`SELECT %s FROM %s WHERE app_id = ? ORDER BY id ASC`, column, table), appID)
	if err != nil {
		return []string{}
	}
	defer rows.Close()

	items := []string{}
	for rows.Next() {
		var value string
		if err := rows.Scan(&value); err == nil {
			items = append(items, value)
		}
	}
	return items
}
