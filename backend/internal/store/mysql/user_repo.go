package mysql

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"mysso/backend/internal/domain"
)

func (s *MySQLStore) CreateUser(user domain.User) error {
	authVersion := user.AuthVersion
	if authVersion < 1 {
		authVersion = 1
	}
	_, err := s.db.Exec(`
		INSERT INTO users (id, country, gender, preferred_locale, email, phone, display_name, password_hash, role, status, freeze_reason, mfa_enabled, mfa_method, mfa_secret, auth_version, last_login_at, last_device_ip, deletion_requested_at, deletion_scheduled_at, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, user.ID, user.Country, user.Gender, user.PreferredLocale, user.Email, user.Phone, user.DisplayName, user.Password, user.Role, user.Status, user.FreezeReason, user.MFAEnabled, user.MFAMethod, user.MFASecret, authVersion, nullableTime(user.LastLoginAt), user.LastDeviceIP, nullableTime(user.DeletionRequestedAt), nullableTime(user.DeletionScheduledAt), user.CreatedAt, user.CreatedAt)
	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "duplicate") {
			return fmt.Errorf("user already exists")
		}
		return err
	}
	return nil
}

func (s *MySQLStore) FindUserByEmail(email string) (domain.User, error) {
	return scanUser(s.db.QueryRow(`
		SELECT id, country, gender, preferred_locale, email, phone, display_name, password_hash, role, status, freeze_reason, mfa_enabled, mfa_method, mfa_secret, auth_version, last_login_at, created_at, last_device_ip, deletion_requested_at, deletion_scheduled_at
		FROM users WHERE email = ?
	`, email))
}

func (s *MySQLStore) FindUserByPhone(phone string) (domain.User, error) {
	return scanUser(s.db.QueryRow(`
		SELECT id, country, gender, preferred_locale, email, phone, display_name, password_hash, role, status, freeze_reason, mfa_enabled, mfa_method, mfa_secret, auth_version, last_login_at, created_at, last_device_ip, deletion_requested_at, deletion_scheduled_at
		FROM users WHERE phone = ? AND phone <> ''
	`, phone))
}

func (s *MySQLStore) GetUser(id string) (domain.User, error) {
	return scanUser(s.db.QueryRow(`
		SELECT id, country, gender, preferred_locale, email, phone, display_name, password_hash, role, status, freeze_reason, mfa_enabled, mfa_method, mfa_secret, auth_version, last_login_at, created_at, last_device_ip, deletion_requested_at, deletion_scheduled_at
		FROM users WHERE id = ?
	`, id))
}

func (s *MySQLStore) ListUsers() []domain.User {
	rows, err := s.db.Query(`
		SELECT id, country, gender, preferred_locale, email, phone, display_name, password_hash, role, status, freeze_reason, mfa_enabled, mfa_method, mfa_secret, auth_version, last_login_at, created_at, last_device_ip, deletion_requested_at, deletion_scheduled_at
		FROM users ORDER BY created_at DESC
	`)
	if err != nil {
		return []domain.User{}
	}
	defer rows.Close()

	items := []domain.User{}
	for rows.Next() {
		user, err := scanUserFromRows(rows)
		if err == nil {
			items = append(items, user)
		}
	}
	return items
}

func (s *MySQLStore) ListUsersPaginated(page, pageSize int, emailKeyword, statusFilter, userID string) ([]domain.User, int, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}

	whereParts := []string{"1 = 1"}
	args := make([]any, 0, 4)

	normalizedKeyword := strings.ToLower(strings.TrimSpace(emailKeyword))
	if normalizedKeyword != "" {
		whereParts = append(whereParts, "LOWER(email) LIKE ?")
		args = append(args, "%"+normalizedKeyword+"%")
	}

	normalizedUserID := strings.TrimSpace(userID)
	if normalizedUserID != "" {
		whereParts = append(whereParts, "id = ?")
		args = append(args, normalizedUserID)
	}

	normalizedStatus := strings.ToLower(strings.TrimSpace(statusFilter))
	if normalizedStatus != "" && normalizedStatus != "all" {
		if normalizedStatus == "deleting" {
			whereParts = append(whereParts, "deletion_scheduled_at IS NOT NULL")
		} else {
			whereParts = append(whereParts, "status = ? AND deletion_scheduled_at IS NULL")
			args = append(args, normalizedStatus)
		}
	}

	whereClause := strings.Join(whereParts, " AND ")
	var total int
	if err := s.db.QueryRow(
		fmt.Sprintf("SELECT COUNT(*) FROM users WHERE %s", whereClause),
		args...,
	).Scan(&total); err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	queryArgs := append(append([]any{}, args...), pageSize, offset)
	rows, err := s.db.Query(fmt.Sprintf(`
		SELECT id, country, gender, preferred_locale, email, phone, display_name, password_hash, role, status, freeze_reason, mfa_enabled, mfa_method, mfa_secret, auth_version, last_login_at, created_at, last_device_ip, deletion_requested_at, deletion_scheduled_at
		FROM users
		WHERE %s
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?
	`, whereClause), queryArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	items := make([]domain.User, 0, pageSize)
	for rows.Next() {
		user, scanErr := scanUserFromRows(rows)
		if scanErr != nil {
			return nil, 0, scanErr
		}
		items = append(items, user)
	}
	return items, total, nil
}

func (s *MySQLStore) CountUsers(statusFilter string) (int, error) {
	whereParts := []string{"1 = 1"}
	args := make([]any, 0, 1)

	normalizedStatus := strings.ToLower(strings.TrimSpace(statusFilter))
	if normalizedStatus != "" && normalizedStatus != "all" {
		if normalizedStatus == "deleting" {
			whereParts = append(whereParts, "deletion_scheduled_at IS NOT NULL")
		} else {
			whereParts = append(whereParts, "status = ? AND deletion_scheduled_at IS NULL")
			args = append(args, normalizedStatus)
		}
	}

	var total int
	if err := s.db.QueryRow(
		fmt.Sprintf("SELECT COUNT(*) FROM users WHERE %s", strings.Join(whereParts, " AND ")),
		args...,
	).Scan(&total); err != nil {
		return 0, err
	}
	return total, nil
}

func (s *MySQLStore) UpdateUser(user domain.User) error {
	authVersion := user.AuthVersion
	if authVersion < 1 {
		authVersion = 1
	}
	_, err := s.db.Exec(`
		UPDATE users
		SET country = ?, gender = ?, preferred_locale = ?, email = ?, phone = ?, display_name = ?, password_hash = ?, role = ?, status = ?, freeze_reason = ?, mfa_enabled = ?, mfa_method = ?, mfa_secret = ?, auth_version = ?, last_login_at = ?, last_device_ip = ?, deletion_requested_at = ?, deletion_scheduled_at = ?, updated_at = UTC_TIMESTAMP()
		WHERE id = ?
	`, user.Country, user.Gender, user.PreferredLocale, user.Email, user.Phone, user.DisplayName, user.Password, user.Role, user.Status, user.FreezeReason, user.MFAEnabled, user.MFAMethod, user.MFASecret, authVersion, nullableTime(user.LastLoginAt), user.LastDeviceIP, nullableTime(user.DeletionRequestedAt), nullableTime(user.DeletionScheduledAt), user.ID)
	return err
}

func (s *MySQLStore) UpdateUserAndInvalidateAuth(user domain.User) error {
	authVersion := user.AuthVersion
	if authVersion < 1 {
		authVersion = 1
	}
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()

	var currentEmail string
	var currentPhone string
	if err := tx.QueryRow(`SELECT email, phone FROM users WHERE id = ? FOR UPDATE`, user.ID).Scan(&currentEmail, &currentPhone); err != nil {
		if err == sql.ErrNoRows {
			return ErrNotFound
		}
		return err
	}

	if _, err := tx.Exec(`
		UPDATE users
		SET country = ?, gender = ?, preferred_locale = ?, email = ?, phone = ?, display_name = ?, password_hash = ?, role = ?, status = ?, freeze_reason = ?, mfa_enabled = ?, mfa_method = ?, mfa_secret = ?, auth_version = ?, last_login_at = ?, last_device_ip = ?, deletion_requested_at = ?, deletion_scheduled_at = ?, updated_at = UTC_TIMESTAMP()
		WHERE id = ?
	`, user.Country, user.Gender, user.PreferredLocale, user.Email, user.Phone, user.DisplayName, user.Password, user.Role, user.Status, user.FreezeReason, user.MFAEnabled, user.MFAMethod, user.MFASecret, authVersion, nullableTime(user.LastLoginAt), user.LastDeviceIP, nullableTime(user.DeletionRequestedAt), nullableTime(user.DeletionScheduledAt), user.ID); err != nil {
		return err
	}

	statements := []struct {
		query string
		args  []any
	}{
		{query: `DELETE FROM sessions WHERE user_id = ?`, args: []any{user.ID}},
		{query: `UPDATE refresh_tokens SET revoked = 1, revoked_at = UTC_TIMESTAMP() WHERE user_id = ? AND revoked = 0`, args: []any{user.ID}},
		{query: `DELETE FROM auth_challenges WHERE user_id = ?`, args: []any{user.ID}},
		{query: `DELETE FROM passkeys WHERE user_id = ?`, args: []any{user.ID}},
		{query: `DELETE FROM authorization_codes WHERE user_id = ?`, args: []any{user.ID}},
	}
	for _, stmt := range statements {
		if _, err := tx.Exec(stmt.query, stmt.args...); err != nil {
			return err
		}
	}
	emailTargets := map[string]struct{}{}
	for _, email := range []string{currentEmail, user.Email} {
		normalized := strings.ToLower(strings.TrimSpace(email))
		if normalized == "" {
			continue
		}
		if _, exists := emailTargets[normalized]; exists {
			continue
		}
		emailTargets[normalized] = struct{}{}
		if _, err := tx.Exec(`DELETE FROM verification_codes WHERE channel = 'email' AND target = ?`, normalized); err != nil {
			return err
		}
	}
	phoneTargets := map[string]struct{}{}
	for _, phone := range []string{currentPhone, user.Phone} {
		normalized := strings.TrimSpace(phone)
		if normalized == "" {
			continue
		}
		if _, exists := phoneTargets[normalized]; exists {
			continue
		}
		phoneTargets[normalized] = struct{}{}
		if _, err := tx.Exec(`DELETE FROM verification_codes WHERE channel = 'sms' AND target = ?`, normalized); err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (s *MySQLStore) DeleteUser(id string) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()

	var email string
	if err := tx.QueryRow(`SELECT email FROM users WHERE id = ?`, id).Scan(&email); err != nil {
		if err == sql.ErrNoRows {
			return ErrNotFound
		}
		return err
	}

	appRows, err := tx.Query(`SELECT id, client_id FROM client_apps WHERE owner_user_id = ?`, id)
	if err != nil {
		return err
	}
	appIDs := []string{}
	clientIDs := []string{}
	for appRows.Next() {
		var appID, clientID string
		if err := appRows.Scan(&appID, &clientID); err != nil {
			if closeErr := appRows.Close(); closeErr != nil {
				return closeErr
			}
			return err
		}
		appIDs = append(appIDs, appID)
		clientIDs = append(clientIDs, clientID)
	}
	if err := appRows.Close(); err != nil {
		return err
	}

	for _, appID := range appIDs {
		if _, err := tx.Exec(`DELETE FROM client_redirect_uris WHERE app_id = ?`, appID); err != nil {
			return err
		}
		if _, err := tx.Exec(`DELETE FROM client_scopes WHERE app_id = ?`, appID); err != nil {
			return err
		}
		if _, err := tx.Exec(`DELETE FROM app_user_access_states WHERE app_id = ?`, appID); err != nil {
			return err
		}
		if _, err := tx.Exec(`DELETE FROM client_apps WHERE id = ?`, appID); err != nil {
			return err
		}
	}
	for _, clientID := range clientIDs {
		if _, err := tx.Exec(`DELETE FROM authorization_codes WHERE client_id = ?`, clientID); err != nil {
			return err
		}
		if _, err := tx.Exec(`DELETE FROM refresh_tokens WHERE client_id = ?`, clientID); err != nil {
			return err
		}
		if _, err := tx.Exec(`DELETE FROM consents WHERE client_id = ?`, clientID); err != nil {
			return err
		}
	}
	for _, appID := range appIDs {
		if _, err := tx.Exec(`DELETE FROM audit_logs WHERE target_id = ?`, appID); err != nil {
			return err
		}
	}

	statements := []struct {
		query string
		args  []any
	}{
		{query: `DELETE FROM sessions WHERE user_id = ?`, args: []any{id}},
		{query: `DELETE FROM refresh_tokens WHERE user_id = ?`, args: []any{id}},
		{query: `DELETE FROM auth_challenges WHERE user_id = ?`, args: []any{id}},
		{query: `DELETE FROM passkey_usage_logs WHERE user_id = ?`, args: []any{id}},
		{query: `DELETE FROM passkeys WHERE user_id = ?`, args: []any{id}},
		{query: `DELETE FROM app_user_access_states WHERE user_id = ?`, args: []any{id}},
		{query: `DELETE FROM authorization_codes WHERE user_id = ?`, args: []any{id}},
		{query: `DELETE FROM consents WHERE user_id = ?`, args: []any{id}},
		{query: `DELETE FROM verification_codes WHERE channel = 'email' AND target = ?`, args: []any{email}},
		{query: `DELETE FROM verification_codes WHERE channel = 'sms' AND target = (SELECT phone FROM users WHERE id = ? LIMIT 1)`, args: []any{id}},
		{query: `DELETE FROM user_operation_logs WHERE user_id = ?`, args: []any{id}},
		{query: `DELETE FROM audit_logs WHERE actor_id = ? OR target_id = ?`, args: []any{id, id}},
		{query: `DELETE FROM system_settings WHERE setting_key = ?`, args: []any{"user_avatar_" + strings.TrimSpace(id)}},
		{query: `DELETE FROM system_settings WHERE setting_key = ?`, args: []any{domain.UserAnnouncementEnabledKey(id)}},
		{query: `DELETE FROM system_settings WHERE setting_key = ?`, args: []any{domain.UserAnnouncementContentKey(id)}},
		{query: `DELETE FROM user_security_policies WHERE user_id = ?`, args: []any{id}},
		{query: `DELETE FROM users WHERE id = ?`, args: []any{id}},
	}
	for _, stmt := range statements {
		if _, err := tx.Exec(stmt.query, stmt.args...); err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (s *MySQLStore) ListUsersPendingDeletion(before time.Time) ([]domain.User, error) {
	rows, err := s.db.Query(`
		SELECT id, country, gender, preferred_locale, email, phone, display_name, password_hash, role, status, freeze_reason, mfa_enabled, mfa_method, mfa_secret, auth_version, last_login_at, created_at, last_device_ip, deletion_requested_at, deletion_scheduled_at
		FROM users
		WHERE deletion_scheduled_at IS NOT NULL AND deletion_scheduled_at <= ?
		ORDER BY deletion_scheduled_at ASC
	`, before)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]domain.User, 0)
	for rows.Next() {
		user, scanErr := scanUserFromRows(rows)
		if scanErr != nil {
			return nil, scanErr
		}
		items = append(items, user)
	}
	return items, nil
}
