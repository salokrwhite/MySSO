package mysql

import (
	"database/sql"

	"mysso/backend/internal/domain"
)

func (s *MySQLStore) ListScopes() []domain.ScopeDefinition {
	rows, err := s.db.Query(`
		SELECT scope_key, display_name, description, enabled, developer_selectable, is_system, updated_at
		FROM scope_definitions
		ORDER BY is_system DESC, scope_key ASC
	`)
	if err != nil {
		return []domain.ScopeDefinition{}
	}
	defer rows.Close()

	items := []domain.ScopeDefinition{}
	for rows.Next() {
		var item domain.ScopeDefinition
		if err := rows.Scan(
			&item.Key,
			&item.DisplayName,
			&item.Description,
			&item.Enabled,
			&item.DeveloperSelectable,
			&item.System,
			&item.UpdatedAt,
		); err == nil {
			items = append(items, item)
		}
	}
	return items
}

func (s *MySQLStore) GetScope(key string) (domain.ScopeDefinition, error) {
	var item domain.ScopeDefinition
	if err := s.db.QueryRow(`
		SELECT scope_key, display_name, description, enabled, developer_selectable, is_system, updated_at
		FROM scope_definitions
		WHERE scope_key = ?
	`, key).Scan(
		&item.Key,
		&item.DisplayName,
		&item.Description,
		&item.Enabled,
		&item.DeveloperSelectable,
		&item.System,
		&item.UpdatedAt,
	); err != nil {
		if err == sql.ErrNoRows {
			return domain.ScopeDefinition{}, ErrNotFound
		}
		return domain.ScopeDefinition{}, err
	}
	return item, nil
}

func (s *MySQLStore) UpsertScope(scope domain.ScopeDefinition) error {
	_, err := s.db.Exec(`
		INSERT INTO scope_definitions (scope_key, display_name, description, enabled, developer_selectable, is_system, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
			display_name = VALUES(display_name),
			description = VALUES(description),
			enabled = VALUES(enabled),
			developer_selectable = VALUES(developer_selectable),
			is_system = VALUES(is_system),
			updated_at = VALUES(updated_at)
	`, scope.Key, scope.DisplayName, scope.Description, scope.Enabled, scope.DeveloperSelectable, scope.System, scope.UpdatedAt)
	return err
}

func (s *MySQLStore) DeleteScope(key string) error {
	result, err := s.db.Exec(`DELETE FROM scope_definitions WHERE scope_key = ?`, key)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err == nil && affected == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *MySQLStore) CountAppsByScope(scope string) (int, error) {
	var count int
	if err := s.db.QueryRow(`SELECT COUNT(DISTINCT app_id) FROM client_scopes WHERE scope = ?`, scope).Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}
