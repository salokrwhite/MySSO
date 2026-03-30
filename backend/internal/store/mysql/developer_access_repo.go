package mysql

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"mysso/backend/internal/domain"
)

func mysqlAppUserKey(appID, userID string) []any {
	return []any{strings.TrimSpace(appID), strings.TrimSpace(userID)}
}

func (s *MySQLStore) ListDeveloperGroups(ownerUserID string) ([]domain.DeveloperGroup, error) {
	rows, err := s.db.Query(`
		SELECT id, owner_user_id, name, description, created_at, updated_at
		FROM developer_groups
		WHERE owner_user_id = ?
		ORDER BY name ASC, created_at ASC
	`, ownerUserID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]domain.DeveloperGroup, 0)
	for rows.Next() {
		var item domain.DeveloperGroup
		if err := rows.Scan(&item.ID, &item.OwnerUserID, &item.Name, &item.Description, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

func (s *MySQLStore) GetDeveloperGroup(id string) (domain.DeveloperGroup, error) {
	var item domain.DeveloperGroup
	err := s.db.QueryRow(`
		SELECT id, owner_user_id, name, description, created_at, updated_at
		FROM developer_groups
		WHERE id = ?
	`, id).Scan(&item.ID, &item.OwnerUserID, &item.Name, &item.Description, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return domain.DeveloperGroup{}, ErrNotFound
		}
		return domain.DeveloperGroup{}, err
	}
	return item, nil
}

func (s *MySQLStore) CreateDeveloperGroup(group domain.DeveloperGroup) error {
	_, err := s.db.Exec(`
		INSERT INTO developer_groups (id, owner_user_id, name, description, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, group.ID, group.OwnerUserID, group.Name, group.Description, group.CreatedAt, group.UpdatedAt)
	return err
}

func (s *MySQLStore) UpdateDeveloperGroup(group domain.DeveloperGroup) error {
	_, err := s.db.Exec(`
		UPDATE developer_groups
		SET name = ?, description = ?, updated_at = ?
		WHERE id = ?
	`, group.Name, group.Description, group.UpdatedAt, group.ID)
	return err
}

func (s *MySQLStore) DeleteDeveloperGroup(id string) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()
	queries := []struct {
		query string
		args  []any
	}{
		{query: `DELETE FROM developer_group_members WHERE group_id = ?`, args: []any{id}},
		{query: `DELETE FROM app_group_bindings WHERE group_id = ?`, args: []any{id}},
		{query: `DELETE FROM developer_groups WHERE id = ?`, args: []any{id}},
	}
	for _, item := range queries {
		if _, err := tx.Exec(item.query, item.args...); err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (s *MySQLStore) ListDeveloperGroupMembers(groupID string) ([]string, error) {
	rows, err := s.db.Query(`
		SELECT user_id
		FROM developer_group_members
		WHERE group_id = ?
		ORDER BY user_id ASC
	`, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]string, 0)
	for rows.Next() {
		var userID string
		if err := rows.Scan(&userID); err != nil {
			return nil, err
		}
		items = append(items, userID)
	}
	return items, nil
}

func (s *MySQLStore) AddDeveloperGroupMember(groupID, userID string) error {
	_, err := s.db.Exec(`
		INSERT IGNORE INTO developer_group_members (group_id, user_id, created_at)
		VALUES (?, ?, UTC_TIMESTAMP())
	`, groupID, userID)
	return err
}

func (s *MySQLStore) RemoveDeveloperGroupMember(groupID, userID string) error {
	_, err := s.db.Exec(`DELETE FROM developer_group_members WHERE group_id = ? AND user_id = ?`, groupID, userID)
	return err
}

func (s *MySQLStore) ListUserGroupsByOwner(ownerUserID, userID string) ([]domain.DeveloperGroup, error) {
	rows, err := s.db.Query(`
		SELECT g.id, g.owner_user_id, g.name, g.description, g.created_at, g.updated_at
		FROM developer_groups g
		INNER JOIN developer_group_members m ON m.group_id = g.id
		WHERE g.owner_user_id = ? AND m.user_id = ?
		ORDER BY g.name ASC, g.created_at ASC
	`, ownerUserID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]domain.DeveloperGroup, 0)
	for rows.Next() {
		var item domain.DeveloperGroup
		if err := rows.Scan(&item.ID, &item.OwnerUserID, &item.Name, &item.Description, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

func (s *MySQLStore) ListAppGroupBindings(appID string) ([]domain.AppGroupBinding, error) {
	rows, err := s.db.Query(`
		SELECT b.app_id, b.group_id, g.name, b.created_at
		FROM app_group_bindings b
		INNER JOIN developer_groups g ON g.id = b.group_id
		WHERE b.app_id = ?
		ORDER BY g.name ASC, b.created_at ASC
	`, appID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]domain.AppGroupBinding, 0)
	for rows.Next() {
		var item domain.AppGroupBinding
		if err := rows.Scan(&item.AppID, &item.GroupID, &item.GroupName, &item.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

func (s *MySQLStore) ReplaceAppGroupBindings(appID string, groupIDs []string, createdAt time.Time) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()
	if _, err := tx.Exec(`DELETE FROM app_group_bindings WHERE app_id = ?`, appID); err != nil {
		return err
	}
	for _, groupID := range groupIDs {
		groupID = strings.TrimSpace(groupID)
		if groupID == "" {
			continue
		}
		if _, err := tx.Exec(`
			INSERT INTO app_group_bindings (app_id, group_id, created_at)
			VALUES (?, ?, ?)
		`, appID, groupID, createdAt); err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (s *MySQLStore) ListAppIDsByGroup(groupID string) ([]string, error) {
	rows, err := s.db.Query(`
		SELECT app_id
		FROM app_group_bindings
		WHERE group_id = ?
		ORDER BY app_id ASC
	`, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]string, 0)
	for rows.Next() {
		var appID string
		if err := rows.Scan(&appID); err != nil {
			return nil, err
		}
		items = append(items, appID)
	}
	return items, nil
}

func (s *MySQLStore) CreateOrUpdateAppUserBan(ban domain.AppUserBan) error {
	_, err := s.db.Exec(`
		INSERT INTO app_user_bans (id, app_id, user_id, reason, expires_at, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
			reason = VALUES(reason),
			expires_at = VALUES(expires_at),
			updated_at = VALUES(updated_at),
			id = VALUES(id),
			created_at = LEAST(created_at, VALUES(created_at))
	`, ban.ID, ban.AppID, ban.UserID, ban.Reason, nullableTime(ban.ExpiresAt), ban.CreatedAt, ban.UpdatedAt)
	return err
}

func scanAppUserBan(scanner interface{ Scan(dest ...any) error }) (domain.AppUserBan, error) {
	var item domain.AppUserBan
	var expiresAt sql.NullTime
	if err := scanner.Scan(&item.ID, &item.AppID, &item.UserID, &item.Reason, &expiresAt, &item.CreatedAt, &item.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return domain.AppUserBan{}, ErrNotFound
		}
		return domain.AppUserBan{}, err
	}
	if expiresAt.Valid {
		t := expiresAt.Time
		item.ExpiresAt = &t
	}
	return item, nil
}

func (s *MySQLStore) GetActiveAppUserBan(appID, userID string, now time.Time) (domain.AppUserBan, error) {
	row := s.db.QueryRow(`
		SELECT id, app_id, user_id, reason, expires_at, created_at, updated_at
		FROM app_user_bans
		WHERE app_id = ? AND user_id = ? AND (expires_at IS NULL OR expires_at > ?)
	`, appID, userID, now)
	return scanAppUserBan(row)
}

func (s *MySQLStore) ListAppUserBans(appID string, includeExpired bool, now time.Time) ([]domain.AppUserBan, error) {
	query := `
		SELECT id, app_id, user_id, reason, expires_at, created_at, updated_at
		FROM app_user_bans
		WHERE app_id = ?
	`
	args := []any{appID}
	if !includeExpired {
		query += ` AND (expires_at IS NULL OR expires_at > ?)`
		args = append(args, now)
	}
	query += ` ORDER BY updated_at DESC, created_at DESC`
	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]domain.AppUserBan, 0)
	for rows.Next() {
		item, err := scanAppUserBan(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

func (s *MySQLStore) DeleteAppUserBan(appID, userID string) error {
	_, err := s.db.Exec(`DELETE FROM app_user_bans WHERE app_id = ? AND user_id = ?`, appID, userID)
	return err
}

func (s *MySQLStore) GetAppUserAccessVersion(appID, userID string) (domain.AppUserAccessVersion, error) {
	var item domain.AppUserAccessVersion
	err := s.db.QueryRow(`
		SELECT app_id, user_id, version, updated_at
		FROM app_user_access_versions
		WHERE app_id = ? AND user_id = ?
	`, appID, userID).Scan(&item.AppID, &item.UserID, &item.Version, &item.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return domain.AppUserAccessVersion{}, ErrNotFound
		}
		return domain.AppUserAccessVersion{}, err
	}
	return item, nil
}

func (s *MySQLStore) BumpAppUserAccessVersion(appID, userID string, updatedAt time.Time) (domain.AppUserAccessVersion, error) {
	if _, err := s.db.Exec(`
		INSERT INTO app_user_access_versions (app_id, user_id, version, updated_at)
		VALUES (?, ?, 2, ?)
		ON DUPLICATE KEY UPDATE
			version = version + 1,
			updated_at = VALUES(updated_at)
	`, appID, userID, updatedAt); err != nil {
		return domain.AppUserAccessVersion{}, err
	}
	return s.GetAppUserAccessVersion(appID, userID)
}

func (s *MySQLStore) AppendDeveloperAccessLog(log domain.DeveloperAccessLog) error {
	_, err := s.db.Exec(`
		INSERT INTO developer_access_logs (id, owner_user_id, actor_id, action, target_type, target_id, app_id, user_id, group_id, detail_json, created_at, deleted_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, log.ID, log.OwnerUserID, log.ActorID, log.Action, log.TargetType, log.TargetID, log.AppID, log.UserID, log.GroupID, mustJSON(log.Detail), log.CreatedAt, nullableTime(log.DeletedAt))
	return err
}

func scanDeveloperAccessLog(scanner interface{ Scan(dest ...any) error }) (domain.DeveloperAccessLog, error) {
	var item domain.DeveloperAccessLog
	var detail string
	var deletedAt sql.NullTime
	if err := scanner.Scan(&item.ID, &item.OwnerUserID, &item.ActorID, &item.Action, &item.TargetType, &item.TargetID, &item.AppID, &item.UserID, &item.GroupID, &detail, &item.CreatedAt, &deletedAt); err != nil {
		if err == sql.ErrNoRows {
			return domain.DeveloperAccessLog{}, ErrNotFound
		}
		return domain.DeveloperAccessLog{}, err
	}
	item.Detail = parseMap(detail)
	if deletedAt.Valid {
		t := deletedAt.Time
		item.DeletedAt = &t
	}
	return item, nil
}

func (s *MySQLStore) ListDeveloperAccessLogs(ownerUserID string, includeDeleted bool) ([]domain.DeveloperAccessLog, error) {
	query := `
		SELECT id, owner_user_id, actor_id, action, target_type, target_id, app_id, user_id, group_id, detail_json, created_at, deleted_at
		FROM developer_access_logs
		WHERE owner_user_id = ?
	`
	args := []any{ownerUserID}
	if !includeDeleted {
		query += ` AND deleted_at IS NULL`
	}
	query += ` ORDER BY created_at DESC`
	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]domain.DeveloperAccessLog, 0)
	for rows.Next() {
		item, err := scanDeveloperAccessLog(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

func (s *MySQLStore) ListDeveloperAccessLogsPaginated(ownerUserID string, includeDeleted bool, page, pageSize int) ([]domain.DeveloperAccessLog, int, error) {
	countQuery := `SELECT COUNT(*) FROM developer_access_logs WHERE owner_user_id = ?`
	countArgs := []any{ownerUserID}
	if !includeDeleted {
		countQuery += ` AND deleted_at IS NULL`
	}

	var total int
	if err := s.db.QueryRow(countQuery, countArgs...).Scan(&total); err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if offset < 0 {
		offset = 0
	}

	query := `
		SELECT id, owner_user_id, actor_id, action, target_type, target_id, app_id, user_id, group_id, detail_json, created_at, deleted_at
		FROM developer_access_logs
		WHERE owner_user_id = ?
	`
	args := []any{ownerUserID}
	if !includeDeleted {
		query += ` AND deleted_at IS NULL`
	}
	query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	items := make([]domain.DeveloperAccessLog, 0, pageSize)
	for rows.Next() {
		item, err := scanDeveloperAccessLog(rows)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, item)
	}
	return items, total, nil
}

func (s *MySQLStore) ListAllDeveloperAccessLogs(includeDeleted bool) ([]domain.DeveloperAccessLog, error) {
	query := `
		SELECT id, owner_user_id, actor_id, action, target_type, target_id, app_id, user_id, group_id, detail_json, created_at, deleted_at
		FROM developer_access_logs
	`
	if !includeDeleted {
		query += ` WHERE deleted_at IS NULL`
	}
	query += ` ORDER BY created_at DESC`
	rows, err := s.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]domain.DeveloperAccessLog, 0)
	for rows.Next() {
		item, err := scanDeveloperAccessLog(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

func (s *MySQLStore) SoftDeleteDeveloperAccessLogs(ownerUserID string, ids []string, deletedAt time.Time) error {
	if len(ids) == 0 {
		return nil
	}
	placeholders := make([]string, len(ids))
	args := make([]any, 0, len(ids)+2)
	args = append(args, deletedAt, ownerUserID)
	for index, id := range ids {
		placeholders[index] = "?"
		args = append(args, id)
	}
	_, err := s.db.Exec(fmt.Sprintf(`
		UPDATE developer_access_logs
		SET deleted_at = ?
		WHERE owner_user_id = ? AND id IN (%s) AND deleted_at IS NULL
	`, strings.Join(placeholders, ",")), args...)
	return err
}

func (s *MySQLStore) HardDeleteDeveloperAccessLogs(ids []string) error {
	if len(ids) == 0 {
		return nil
	}
	placeholders := make([]string, len(ids))
	args := make([]any, 0, len(ids))
	for index, id := range ids {
		placeholders[index] = "?"
		args = append(args, id)
	}
	_, err := s.db.Exec(fmt.Sprintf(
		`DELETE FROM developer_access_logs WHERE id IN (%s)`,
		strings.Join(placeholders, ","),
	), args...)
	return err
}
