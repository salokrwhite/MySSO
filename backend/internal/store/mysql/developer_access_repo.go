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
	// #nosec G202 -- app/email/group SQL fragments are fixed predicates; all values are bound parameters.
	rows, err := s.db.Query(` // #nosec G202 -- app/email/group SQL fragments are fixed predicates; all values are bound parameters.
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

func managedUsersEmailPredicate(emailKeyword string) (string, []any) {
	keyword := strings.ToLower(strings.TrimSpace(emailKeyword))
	if keyword == "" {
		return "", nil
	}
	if strings.ContainsAny(keyword, "%_") {
		keyword = strings.NewReplacer("%", `\%`, "_", `\_`).Replace(keyword)
	}
	return " AND u.email LIKE ?", []any{"%" + keyword + "%"}
}

func managedUsersAppPredicate(appID string) (string, []any) {
	appID = strings.TrimSpace(appID)
	if appID == "" {
		return "", nil
	}
	return " AND a.id = ?", []any{appID}
}

func managedUsersGroupPredicate(groupIDs []string) (string, []any) {
	normalized := make([]string, 0, len(groupIDs))
	seen := map[string]struct{}{}
	for _, groupID := range groupIDs {
		groupID = strings.TrimSpace(groupID)
		if groupID == "" {
			continue
		}
		if _, ok := seen[groupID]; ok {
			continue
		}
		seen[groupID] = struct{}{}
		normalized = append(normalized, groupID)
	}
	if len(normalized) == 0 {
		return "", nil
	}
	placeholders := make([]string, 0, len(normalized))
	args := make([]any, 0, len(normalized))
	for _, groupID := range normalized {
		placeholders = append(placeholders, "?")
		args = append(args, groupID)
	}
	// #nosec G202 -- placeholders are generated constants; group IDs are bound as query parameters.
	return " AND EXISTS (SELECT 1 FROM developer_group_members gm WHERE gm.user_id = c.user_id AND gm.group_id IN (" + strings.Join(placeholders, ",") + "))", args
}

func appendUserIDInClause(query string, args []any, userIDs []string) (string, []any) {
	placeholders := make([]string, 0, len(userIDs))
	for _, userID := range userIDs {
		placeholders = append(placeholders, "?")
		args = append(args, userID)
	}
	// #nosec G202 -- placeholders are generated constants; user IDs are bound as query parameters.
	return query + strings.Join(placeholders, ",") + ")", args
}

func maskManagedUserPhone(phone string) string {
	phone = strings.TrimSpace(phone)
	if len(phone) < 7 {
		return phone
	}
	return phone[:3] + "****" + phone[len(phone)-4:]
}

func (s *MySQLStore) HasManagedUser(ownerUserID, userID string) (bool, error) {
	var exists int
	err := s.db.QueryRow(`
		SELECT EXISTS (
			SELECT 1
			FROM client_apps a
			INNER JOIN consents c ON c.client_id = a.client_id
			WHERE a.owner_user_id = ? AND c.user_id = ?
			LIMIT 1
		)
	`, ownerUserID, strings.TrimSpace(userID)).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists == 1, nil
}

func (s *MySQLStore) ListManagedUsersPaginated(ownerUserID string, page, pageSize int, appID, emailKeyword string, groupIDs []string, now time.Time) ([]domain.DeveloperManagedUser, int, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}
	appClause, appArgs := managedUsersAppPredicate(appID)
	emailClause, emailArgs := managedUsersEmailPredicate(emailKeyword)
	groupClause, groupArgs := managedUsersGroupPredicate(groupIDs)
	baseArgs := []any{ownerUserID}
	baseArgs = append(baseArgs, appArgs...)
	baseArgs = append(baseArgs, emailArgs...)
	baseArgs = append(baseArgs, groupArgs...)

	countQuery := `
		SELECT COUNT(*) FROM (
			SELECT c.user_id
			FROM client_apps a
			INNER JOIN consents c ON c.client_id = a.client_id
			INNER JOIN users u ON u.id = c.user_id
			WHERE a.owner_user_id = ?` + appClause + emailClause + groupClause + `
			GROUP BY c.user_id
		) managed_users
	`
	var total int
	if err := s.db.QueryRow(countQuery, baseArgs...).Scan(&total); err != nil {
		return nil, 0, err
	}
	if total == 0 {
		return []domain.DeveloperManagedUser{}, 0, nil
	}

	offset := (page - 1) * pageSize
	pageArgs := append([]any{}, baseArgs...)
	pageArgs = append(pageArgs, pageSize, offset)
	rows, err := s.db.Query(managedUsersPageQuery(appClause, emailClause, groupClause), pageArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	items := make([]domain.DeveloperManagedUser, 0, pageSize)
	itemByUserID := map[string]*domain.DeveloperManagedUser{}
	userIDs := make([]string, 0, pageSize)
	for rows.Next() {
		var item domain.DeveloperManagedUser
		var email, phone string
		if err := rows.Scan(&item.UserID, &item.DisplayName, &email, &phone, &item.LastAuthorizedAt); err != nil {
			return nil, 0, err
		}
		item.DisplayName = strings.TrimSpace(item.DisplayName)
		item.MaskedEmail = strings.TrimSpace(email)
		item.MaskedPhone = maskManagedUserPhone(phone)
		item.AuthorizedApps = []domain.DeveloperManagedUserAuthorizedApp{}
		item.GroupIDs = []string{}
		item.GroupNames = []string{}
		item.AppBans = []domain.AppUserBan{}
		items = append(items, item)
		itemByUserID[item.UserID] = &items[len(items)-1]
		userIDs = append(userIDs, item.UserID)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, err
	}
	if len(userIDs) == 0 {
		return items, total, nil
	}

	if err := s.loadManagedUserAuthorizedApps(ownerUserID, appID, userIDs, itemByUserID); err != nil {
		return nil, 0, err
	}
	if err := s.loadManagedUserGroups(ownerUserID, userIDs, itemByUserID); err != nil {
		return nil, 0, err
	}
	if err := s.loadManagedUserBans(ownerUserID, appID, userIDs, now, itemByUserID); err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func managedUsersPageQuery(appClause, emailClause, groupClause string) string {
	// #nosec G202 -- clauses are fixed predicates returned by managedUsers*Predicate; values are bound parameters.
	return `
		SELECT c.user_id, u.display_name, u.email, u.phone, MAX(c.created_at) AS last_authorized_at
		FROM client_apps a
		INNER JOIN consents c ON c.client_id = a.client_id
		INNER JOIN users u ON u.id = c.user_id
		WHERE a.owner_user_id = ?` + appClause + emailClause + groupClause + `
		GROUP BY c.user_id, u.display_name, u.email, u.phone
		ORDER BY last_authorized_at DESC, c.user_id ASC
		LIMIT ? OFFSET ?
	`
}

func (s *MySQLStore) loadManagedUserAuthorizedApps(ownerUserID, appID string, userIDs []string, itemByUserID map[string]*domain.DeveloperManagedUser) error {
	appClause, appArgs := managedUsersAppPredicate(appID)
	// #nosec G202 -- app predicate and IN placeholders are fixed fragments; all values are bound parameters.
	query := `
		SELECT c.user_id, a.id, a.client_id, a.name, MAX(c.created_at) AS last_authorized_at
		FROM client_apps a
		INNER JOIN consents c ON c.client_id = a.client_id
		WHERE a.owner_user_id = ?` + appClause + ` AND c.user_id IN (`
	args := []any{ownerUserID}
	args = append(args, appArgs...)
	query, args = appendUserIDInClause(query, args, userIDs)
	query += `
		GROUP BY c.user_id, a.id, a.client_id, a.name
		ORDER BY c.user_id ASC, last_authorized_at DESC
	`
	rows, err := s.db.Query(query, args...)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var userID string
		var app domain.DeveloperManagedUserAuthorizedApp
		if err := rows.Scan(&userID, &app.AppID, &app.ClientID, &app.AppName, &app.LastAuthorizedAt); err != nil {
			return err
		}
		if item := itemByUserID[userID]; item != nil {
			item.AuthorizedApps = append(item.AuthorizedApps, app)
		}
	}
	return rows.Err()
}

func (s *MySQLStore) loadManagedUserGroups(ownerUserID string, userIDs []string, itemByUserID map[string]*domain.DeveloperManagedUser) error {
	// #nosec G202 -- app predicate and IN placeholders are fixed fragments; all values are bound parameters.
	query := `
		SELECT m.user_id, g.id, g.name
		FROM developer_group_members m
		INNER JOIN developer_groups g ON g.id = m.group_id
		WHERE g.owner_user_id = ? AND m.user_id IN (`
	args := []any{ownerUserID}
	query, args = appendUserIDInClause(query, args, userIDs)
	query += ` ORDER BY m.user_id ASC, g.name ASC, g.created_at ASC`
	rows, err := s.db.Query(query, args...)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var userID, groupID, groupName string
		if err := rows.Scan(&userID, &groupID, &groupName); err != nil {
			return err
		}
		if item := itemByUserID[userID]; item != nil {
			item.GroupIDs = append(item.GroupIDs, groupID)
			item.GroupNames = append(item.GroupNames, groupName)
		}
	}
	return rows.Err()
}

func (s *MySQLStore) loadManagedUserBans(ownerUserID, appID string, userIDs []string, now time.Time, itemByUserID map[string]*domain.DeveloperManagedUser) error {
	appClause, appArgs := managedUsersAppPredicate(appID)
	// #nosec G202 -- app predicate and IN placeholders are fixed fragments; all values are bound parameters.
	query := `
		SELECT b.ban_id, b.app_id, b.user_id, b.ban_reason, b.ban_expires_at, b.ban_created_at, b.ban_updated_at
		FROM app_user_access_states b
		INNER JOIN client_apps a ON a.id = b.app_id
		WHERE a.owner_user_id = ?` + appClause + ` AND b.user_id IN (`
	args := []any{ownerUserID}
	args = append(args, appArgs...)
	query, args = appendUserIDInClause(query, args, userIDs)
	query += ` AND b.ban_id <> '' AND (b.ban_expires_at IS NULL OR b.ban_expires_at > ?)
		ORDER BY b.user_id ASC, b.ban_updated_at DESC`
	args = append(args, now)
	rows, err := s.db.Query(query, args...)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		ban, err := scanAppUserBan(rows)
		if err != nil {
			return err
		}
		if item := itemByUserID[ban.UserID]; item != nil {
			item.AppBans = append(item.AppBans, ban)
		}
	}
	return rows.Err()
}

func (s *MySQLStore) CreateOrUpdateAppUserBan(ban domain.AppUserBan) error {
	_, err := s.db.Exec(`
		INSERT INTO app_user_access_states (app_id, user_id, access_version, ban_id, ban_reason, ban_expires_at, ban_created_at, ban_updated_at, updated_at)
		VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
			ban_reason = VALUES(ban_reason),
			ban_expires_at = VALUES(ban_expires_at),
			ban_updated_at = VALUES(ban_updated_at),
			updated_at = VALUES(updated_at),
			ban_id = VALUES(ban_id),
			ban_created_at = COALESCE(LEAST(ban_created_at, VALUES(ban_created_at)), VALUES(ban_created_at))
	`, ban.AppID, ban.UserID, ban.ID, ban.Reason, nullableTime(ban.ExpiresAt), ban.CreatedAt, ban.UpdatedAt, ban.UpdatedAt)
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
		SELECT ban_id, app_id, user_id, ban_reason, ban_expires_at, ban_created_at, ban_updated_at
		FROM app_user_access_states
		WHERE app_id = ? AND user_id = ? AND ban_id <> '' AND (ban_expires_at IS NULL OR ban_expires_at > ?)
	`, appID, userID, now)
	return scanAppUserBan(row)
}

func (s *MySQLStore) ListAppUserBans(appID string, includeExpired bool, now time.Time) ([]domain.AppUserBan, error) {
	query := `
		SELECT ban_id, app_id, user_id, ban_reason, ban_expires_at, ban_created_at, ban_updated_at
		FROM app_user_access_states
		WHERE app_id = ? AND ban_id <> ''
	`
	args := []any{appID}
	if !includeExpired {
		query += ` AND (ban_expires_at IS NULL OR ban_expires_at > ?)`
		args = append(args, now)
	}
	query += ` ORDER BY ban_updated_at DESC, ban_created_at DESC`
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
	_, err := s.db.Exec(`
		UPDATE app_user_access_states
		SET ban_id = '', ban_reason = '', ban_expires_at = NULL, ban_created_at = NULL, ban_updated_at = NULL, updated_at = UTC_TIMESTAMP()
		WHERE app_id = ? AND user_id = ?
	`, appID, userID)
	return err
}

func (s *MySQLStore) GetAppUserAccessVersion(appID, userID string) (domain.AppUserAccessVersion, error) {
	var item domain.AppUserAccessVersion
	err := s.db.QueryRow(`
		SELECT app_id, user_id, access_version, updated_at
		FROM app_user_access_states
		WHERE app_id = ? AND user_id = ? AND access_version > 1
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
		INSERT INTO app_user_access_states (app_id, user_id, access_version, updated_at)
		VALUES (?, ?, 2, ?)
		ON DUPLICATE KEY UPDATE
			access_version = access_version + 1,
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

func (s *MySQLStore) ListAllDeveloperAccessLogsPaginated(includeDeleted bool, page, pageSize int) ([]domain.DeveloperAccessLog, int, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}
	countQuery := `SELECT COUNT(*) FROM developer_access_logs`
	if !includeDeleted {
		countQuery += ` WHERE deleted_at IS NULL`
	}
	var total int
	if err := s.db.QueryRow(countQuery).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := `
		SELECT id, owner_user_id, actor_id, action, target_type, target_id, app_id, user_id, group_id, detail_json, created_at, deleted_at
		FROM developer_access_logs
	`
	if !includeDeleted {
		query += ` WHERE deleted_at IS NULL`
	}
	query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
	rows, err := s.db.Query(query, pageSize, (page-1)*pageSize)
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
	if err := rows.Err(); err != nil {
		return nil, 0, err
	}
	return items, total, nil
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
