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

func (s *MySQLStore) ListAppsPaginated(page, pageSize int, statusFilter, nameKeyword string) ([]domain.ClientApp, int, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}
	where, args := buildAppListFilters(statusFilter, nameKeyword)
	var total int
	if err := s.db.QueryRow(`SELECT COUNT(*) FROM client_apps`+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	offset := (page - 1) * pageSize
	queryArgs := append([]any{}, args...)
	queryArgs = append(queryArgs, pageSize, offset)
	// #nosec G202 -- filter SQL is built from fixed fragments; values are bound parameters.
	rows, err := s.db.Query(`
		SELECT id, owner_user_id, name, icon_url, client_id, client_secret, description, frontchannel_logout_uri, allow_get_session_logout, status, review_comment, created_at, updated_at
		FROM client_apps
		`+where+`
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?
	`, queryArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	items, err := s.scanAppRows(rows)
	if err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func buildAppListFilters(statusFilter, nameKeyword string) (string, []any) {
	clauses := []string{}
	args := []any{}
	if normalizedStatus := strings.TrimSpace(statusFilter); normalizedStatus != "" && normalizedStatus != "all" {
		clauses = append(clauses, "status = ?")
		args = append(args, normalizedStatus)
	}
	if keyword := strings.TrimSpace(nameKeyword); keyword != "" {
		clauses = append(clauses, "LOWER(name) LIKE ?")
		args = append(args, "%"+strings.ToLower(keyword)+"%")
	}
	if len(clauses) == 0 {
		return "", args
	}
	return " WHERE " + strings.Join(clauses, " AND "), args
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
	app.ClientSecret = normalizeAppClientSecret(app.ClientSecret)
	app.HasClientSecret = strings.TrimSpace(app.ClientSecret) != ""
	_, _ = s.db.Exec(`
		INSERT INTO client_apps (id, owner_user_id, name, icon_url, client_id, client_secret, description, frontchannel_logout_uri, allow_get_session_logout, status, review_comment, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, app.ID, app.OwnerUserID, app.Name, app.IconURL, app.ClientID, app.ClientSecret, app.Description, app.FrontChannelLogoutURI, app.AllowGetSessionLogout, app.Status, app.ReviewComment, app.CreatedAt, app.UpdatedAt)
	s.replaceAppCollections(app)
	return app
}

func (s *MySQLStore) UpdateApp(app domain.ClientApp) error {
	app.ClientSecret = normalizeAppClientSecret(app.ClientSecret)
	app.HasClientSecret = strings.TrimSpace(app.ClientSecret) != ""
	if _, err := s.db.Exec(`
		UPDATE client_apps
		SET owner_user_id = ?, name = ?, icon_url = ?, client_id = ?, client_secret = ?, description = ?, frontchannel_logout_uri = ?, allow_get_session_logout = ?, status = ?, review_comment = ?, updated_at = ?
		WHERE id = ?
	`, app.OwnerUserID, app.Name, app.IconURL, app.ClientID, app.ClientSecret, app.Description, app.FrontChannelLogoutURI, app.AllowGetSessionLogout, app.Status, app.ReviewComment, app.UpdatedAt, app.ID); err != nil {
		return err
	}
	s.replaceAppCollections(app)
	return nil
}

func normalizeAppClientSecret(secret string) string {
	secret = strings.TrimSpace(secret)
	if secret == "" || security.LooksLikeBcryptHash(secret) {
		return secret
	}
	hashedSecret, err := security.HashPassword(secret)
	if err != nil {
		return secret
	}
	return hashedSecret
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
		{query: `DELETE FROM client_scopes WHERE app_id = ?`, args: []any{id}},
		{query: `DELETE FROM app_user_access_states WHERE app_id = ?`, args: []any{id}},
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
		SELECT id, owner_user_id, name, icon_url, client_id, client_secret, description, frontchannel_logout_uri, allow_get_session_logout, status, review_comment, created_at, updated_at
		FROM client_apps WHERE client_id = ?
	`, clientID)
	return s.scanApp(row)
}

func (s *MySQLStore) GetApp(id string) (domain.ClientApp, error) {
	row := s.db.QueryRow(`
		SELECT id, owner_user_id, name, icon_url, client_id, client_secret, description, frontchannel_logout_uri, allow_get_session_logout, status, review_comment, created_at, updated_at
		FROM client_apps WHERE id = ?
	`, id)
	return s.scanApp(row)
}

func (s *MySQLStore) listApps(whereClause string, arg any) []domain.ClientApp {
	query := `
		SELECT id, owner_user_id, name, icon_url, client_id, client_secret, description, frontchannel_logout_uri, allow_get_session_logout, status, review_comment, created_at, updated_at
		FROM client_apps
	`
	args := []any{}
	if whereClause != "" {
		// #nosec G202 -- callers pass fixed internal WHERE fragments; values are bound as parameters.
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
		app, err := s.scanAppBase(rows)
		if err == nil {
			items = append(items, app)
		}
	}
	s.hydrateAppCollections(items)
	return items
}

func (s *MySQLStore) scanApp(scanner interface{ Scan(dest ...any) error }) (domain.ClientApp, error) {
	item, err := s.scanAppBase(scanner)
	if err != nil {
		return domain.ClientApp{}, err
	}
	items := []domain.ClientApp{item}
	s.hydrateAppCollections(items)
	return items[0], nil
}

func (s *MySQLStore) scanAppBase(scanner interface{ Scan(dest ...any) error }) (domain.ClientApp, error) {
	var item domain.ClientApp
	if err := scanner.Scan(&item.ID, &item.OwnerUserID, &item.Name, &item.IconURL, &item.ClientID, &item.ClientSecret, &item.Description, &item.FrontChannelLogoutURI, &item.AllowGetSessionLogout, &item.Status, &item.ReviewComment, &item.CreatedAt, &item.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return domain.ClientApp{}, ErrNotFound
		}
		return domain.ClientApp{}, err
	}
	item.HasClientSecret = strings.TrimSpace(item.ClientSecret) != ""
	return item, nil
}

func (s *MySQLStore) scanAppRows(rows *sql.Rows) ([]domain.ClientApp, error) {
	items := []domain.ClientApp{}
	for rows.Next() {
		app, err := s.scanAppBase(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, app)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	s.hydrateAppCollections(items)
	return items, nil
}

func (s *MySQLStore) hydrateAppCollections(items []domain.ClientApp) {
	if len(items) == 0 {
		return
	}
	indexByID := make(map[string]int, len(items))
	ids := make([]string, 0, len(items))
	for index, item := range items {
		indexByID[item.ID] = index
		ids = append(ids, item.ID)
	}
	s.hydrateAppStringCollection(items, indexByID, ids, "client_redirect_uris", "uri", "uri_type = 'login'", func(app *domain.ClientApp, value string) {
		app.RedirectURIs = append(app.RedirectURIs, value)
	})
	s.hydrateAppStringCollection(items, indexByID, ids, "client_redirect_uris", "uri", "uri_type = 'post_logout'", func(app *domain.ClientApp, value string) {
		app.PostLogoutRedirectURIs = append(app.PostLogoutRedirectURIs, value)
	})
	s.hydrateAppStringCollection(items, indexByID, ids, "client_scopes", "scope", "", func(app *domain.ClientApp, value string) {
		app.Scopes = append(app.Scopes, value)
	})
}

func (s *MySQLStore) hydrateAppStringCollection(items []domain.ClientApp, indexByID map[string]int, appIDs []string, table, column, extraWhere string, appendValue func(*domain.ClientApp, string)) {
	placeholders := make([]string, len(appIDs))
	args := make([]any, 0, len(appIDs))
	for i, id := range appIDs {
		placeholders[i] = "?"
		args = append(args, id)
	}
	where := fmt.Sprintf("app_id IN (%s)", strings.Join(placeholders, ","))
	if strings.TrimSpace(extraWhere) != "" {
		where += " AND " + extraWhere
	}
	rows, err := s.db.Query(fmt.Sprintf(`SELECT app_id, %s FROM %s WHERE %s ORDER BY id ASC`, column, table, where), args...)
	if err != nil {
		return
	}
	defer rows.Close()
	for rows.Next() {
		var appID string
		var value string
		if err := rows.Scan(&appID, &value); err != nil {
			continue
		}
		if index, ok := indexByID[appID]; ok {
			appendValue(&items[index], value)
		}
	}
}

func (s *MySQLStore) replaceAppCollections(app domain.ClientApp) {
	_, _ = s.db.Exec(`DELETE FROM client_redirect_uris WHERE app_id = ?`, app.ID)
	_, _ = s.db.Exec(`DELETE FROM client_scopes WHERE app_id = ?`, app.ID)
	for _, uri := range app.RedirectURIs {
		_, _ = s.db.Exec(`INSERT INTO client_redirect_uris (app_id, uri_type, uri) VALUES (?, 'login', ?)`, app.ID, uri)
	}
	for _, uri := range app.PostLogoutRedirectURIs {
		_, _ = s.db.Exec(`INSERT INTO client_redirect_uris (app_id, uri_type, uri) VALUES (?, 'post_logout', ?)`, app.ID, uri)
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
