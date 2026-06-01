package mysql

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"mysso/backend/internal/domain"
)

func (s *MySQLStore) AppendAudit(log domain.AuditLog) {
	_, _ = s.db.Exec(`
		INSERT INTO audit_logs (id, actor_id, actor_role, action, target_id, detail_json, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`, log.ID, log.ActorID, log.ActorRole, log.Action, log.TargetID, mustJSON(log.Detail), log.CreatedAt)
}

func (s *MySQLStore) ListAudit() []domain.AuditLog {
	rows, err := s.db.Query(`
		SELECT id, actor_id, actor_role, action, target_id, detail_json, created_at
		FROM audit_logs ORDER BY created_at DESC
	`)
	if err != nil {
		return []domain.AuditLog{}
	}
	defer rows.Close()

	items := []domain.AuditLog{}
	for rows.Next() {
		var item domain.AuditLog
		var detail string
		if err := rows.Scan(&item.ID, &item.ActorID, &item.ActorRole, &item.Action, &item.TargetID, &detail, &item.CreatedAt); err == nil {
			item.Detail = parseMap(detail)
			items = append(items, item)
		}
	}
	return items
}

func (s *MySQLStore) ListAuditPaginated(page, pageSize int) ([]domain.AuditLog, int, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}
	var total int
	if err := s.db.QueryRow(`SELECT COUNT(*) FROM audit_logs`).Scan(&total); err != nil {
		return nil, 0, err
	}
	rows, err := s.db.Query(`
		SELECT id, actor_id, actor_role, action, target_id, detail_json, created_at
		FROM audit_logs
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?
	`, pageSize, (page-1)*pageSize)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	items := make([]domain.AuditLog, 0, pageSize)
	for rows.Next() {
		var item domain.AuditLog
		var detail string
		if err := rows.Scan(&item.ID, &item.ActorID, &item.ActorRole, &item.Action, &item.TargetID, &detail, &item.CreatedAt); err != nil {
			return nil, 0, err
		}
		item.Detail = parseMap(detail)
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func (s *MySQLStore) ListAuditByTarget(targetID string) []domain.AuditLog {
	rows, err := s.db.Query(`
		SELECT id, actor_id, actor_role, action, target_id, detail_json, created_at
		FROM audit_logs
		WHERE target_id = ?
		ORDER BY created_at DESC
	`, targetID)
	if err != nil {
		return []domain.AuditLog{}
	}
	defer rows.Close()

	items := []domain.AuditLog{}
	for rows.Next() {
		var item domain.AuditLog
		var detail string
		if err := rows.Scan(&item.ID, &item.ActorID, &item.ActorRole, &item.Action, &item.TargetID, &detail, &item.CreatedAt); err == nil {
			item.Detail = parseMap(detail)
			items = append(items, item)
		}
	}
	return items
}

func (s *MySQLStore) CountAuditLogs() (int, error) {
	var total int
	if err := s.db.QueryRow(`SELECT COUNT(*) FROM audit_logs`).Scan(&total); err != nil {
		return 0, err
	}
	return total, nil
}

func (s *MySQLStore) DeleteAuditLogs(ids []string) error {
	if len(ids) == 0 {
		return nil
	}
	placeholders := make([]string, len(ids))
	args := make([]any, 0, len(ids))
	for i, id := range ids {
		placeholders[i] = "?"
		args = append(args, id)
	}
	_, err := s.db.Exec(
		fmt.Sprintf("DELETE FROM audit_logs WHERE id IN (%s)", strings.Join(placeholders, ",")),
		args...,
	)
	return err
}

func (s *MySQLStore) DeleteAuditLogsByTarget(targetID string, startAt, endAt *time.Time) (int64, error) {
	query := `DELETE FROM audit_logs WHERE target_id = ?`
	args := []any{targetID}
	if startAt != nil {
		query += ` AND created_at >= ?`
		args = append(args, *startAt)
	}
	if endAt != nil {
		query += ` AND created_at <= ?`
		args = append(args, *endAt)
	}
	result, err := s.db.Exec(query, args...)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}

func (s *MySQLStore) AppendUserOperationLog(log domain.UserOperationLog) {
	_, _ = s.db.Exec(`
		INSERT INTO user_operation_logs (id, user_id, action, target_id, detail_json, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, log.ID, log.UserID, log.Action, log.TargetID, mustJSON(log.Detail), log.CreatedAt)
}

func (s *MySQLStore) ListUserOperationLogs(userID string, page, pageSize int) ([]domain.UserOperationLog, int, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}

	var total int
	if err := s.db.QueryRow(`SELECT COUNT(*) FROM user_operation_logs WHERE user_id = ?`, userID).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := s.db.Query(`
		SELECT id, user_id, action, target_id, detail_json, created_at
		FROM user_operation_logs
		WHERE user_id = ?
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?
	`, userID, pageSize, (page-1)*pageSize)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	items := make([]domain.UserOperationLog, 0, pageSize)
	for rows.Next() {
		var item domain.UserOperationLog
		var detail sql.NullString
		if err := rows.Scan(&item.ID, &item.UserID, &item.Action, &item.TargetID, &detail, &item.CreatedAt); err != nil {
			return nil, 0, err
		}
		if detail.Valid {
			item.Detail = parseMap(detail.String)
		}
		items = append(items, item)
	}
	return items, total, nil
}

func (s *MySQLStore) DeleteUserOperationLogs(userID string, startAt, endAt *time.Time) (int64, error) {
	query := `DELETE FROM user_operation_logs WHERE user_id = ?`
	args := []any{userID}
	if startAt != nil {
		query += ` AND created_at >= ?`
		args = append(args, *startAt)
	}
	if endAt != nil {
		query += ` AND created_at <= ?`
		args = append(args, *endAt)
	}
	result, err := s.db.Exec(query, args...)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}

func (s *MySQLStore) AppendEmailSendLog(log domain.EmailSendLog) {
	_, _ = s.db.Exec(`
		INSERT INTO send_logs (id, channel, target, content, account_email, created_at)
		VALUES (?, 'email', ?, ?, ?, ?)
	`, log.ID, log.TargetEmail, log.Content, log.AccountEmail, log.CreatedAt)
}

func (s *MySQLStore) ListEmailSendLogs() []domain.EmailSendLog {
	rows, err := s.db.Query(`
		SELECT id, target, content, account_email, created_at
		FROM send_logs
		WHERE channel = 'email'
		ORDER BY created_at DESC
	`)
	if err != nil {
		return []domain.EmailSendLog{}
	}
	defer rows.Close()

	items := []domain.EmailSendLog{}
	for rows.Next() {
		var item domain.EmailSendLog
		if err := rows.Scan(&item.ID, &item.TargetEmail, &item.Content, &item.AccountEmail, &item.CreatedAt); err == nil {
			items = append(items, item)
		}
	}
	return items
}

func (s *MySQLStore) DeleteEmailSendLogs(ids []string) error {
	if len(ids) == 0 {
		return nil
	}
	placeholders := make([]string, len(ids))
	args := make([]any, 0, len(ids))
	for i, id := range ids {
		placeholders[i] = "?"
		args = append(args, id)
	}
	_, err := s.db.Exec(
		fmt.Sprintf("DELETE FROM send_logs WHERE channel = 'email' AND id IN (%s)", strings.Join(placeholders, ",")),
		args...,
	)
	return err
}

func (s *MySQLStore) AppendPhoneSendLog(log domain.PhoneSendLog) {
	_, _ = s.db.Exec(`
		INSERT INTO send_logs (id, channel, target, content, account_email, created_at)
		VALUES (?, 'sms', ?, ?, ?, ?)
	`, log.ID, log.TargetPhone, log.Content, log.AccountEmail, log.CreatedAt)
}

func (s *MySQLStore) ListPhoneSendLogs() []domain.PhoneSendLog {
	rows, err := s.db.Query(`
		SELECT id, target, content, account_email, created_at
		FROM send_logs
		WHERE channel = 'sms'
		ORDER BY created_at DESC
	`)
	if err != nil {
		return []domain.PhoneSendLog{}
	}
	defer rows.Close()

	items := []domain.PhoneSendLog{}
	for rows.Next() {
		var item domain.PhoneSendLog
		if err := rows.Scan(&item.ID, &item.TargetPhone, &item.Content, &item.AccountEmail, &item.CreatedAt); err == nil {
			items = append(items, item)
		}
	}
	return items
}

func (s *MySQLStore) DeletePhoneSendLogs(ids []string) error {
	if len(ids) == 0 {
		return nil
	}
	placeholders := make([]string, len(ids))
	args := make([]any, 0, len(ids))
	for i, id := range ids {
		placeholders[i] = "?"
		args = append(args, id)
	}
	_, err := s.db.Exec(
		fmt.Sprintf("DELETE FROM send_logs WHERE channel = 'sms' AND id IN (%s)", strings.Join(placeholders, ",")),
		args...,
	)
	return err
}

func (s *MySQLStore) ListPolicies() []domain.GatewayPolicy {
	rows, err := s.db.Query(`
		SELECT id, name, path, method, scopes, claims, enabled, description, updated_at
		FROM gateway_policies ORDER BY updated_at DESC
	`)
	if err != nil {
		return []domain.GatewayPolicy{}
	}
	defer rows.Close()

	items := []domain.GatewayPolicy{}
	for rows.Next() {
		var item domain.GatewayPolicy
		var scopes string
		var claims string
		if err := rows.Scan(&item.ID, &item.Name, &item.Path, &item.Method, &scopes, &claims, &item.Enabled, &item.Description, &item.UpdatedAt); err == nil {
			item.Scopes = parseStringSlice(scopes)
			item.Claims = parseStringSlice(claims)
			items = append(items, item)
		}
	}
	return items
}

func (s *MySQLStore) CountPolicies() (int, error) {
	var total int
	if err := s.db.QueryRow(`SELECT COUNT(*) FROM gateway_policies`).Scan(&total); err != nil {
		return 0, err
	}
	return total, nil
}

func (s *MySQLStore) GetSettings(keys ...string) (map[string]string, error) {
	result := map[string]string{}
	query := `SELECT setting_key, setting_value FROM system_settings`
	args := []any{}
	if len(keys) > 0 {
		placeholders := make([]string, len(keys))
		for i, key := range keys {
			placeholders[i] = "?"
			args = append(args, key)
		}
		query += " WHERE setting_key IN (" + strings.Join(placeholders, ",") + ")"
	}
	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var key, value string
		if err := rows.Scan(&key, &value); err != nil {
			return nil, err
		}
		result[key] = value
	}
	return result, nil
}

func (s *MySQLStore) UpsertSettings(values map[string]string) error {
	for key, value := range values {
		if _, err := s.db.Exec(`
			INSERT INTO system_settings (setting_key, setting_value, updated_at)
			VALUES (?, ?, UTC_TIMESTAMP())
			ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = VALUES(updated_at)
		`, key, value); err != nil {
			return err
		}
	}
	return nil
}
