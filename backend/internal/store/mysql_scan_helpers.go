package store

import (
	"database/sql"
	"encoding/json"
	"strings"
	"time"

	"mysso/backend/internal/domain"
)

func scanUser(scanner interface{ Scan(dest ...any) error }) (domain.User, error) {
	var item domain.User
	var lastLoginAt sql.NullTime
	var deletionRequestedAt sql.NullTime
	var deletionScheduledAt sql.NullTime
	if err := scanner.Scan(&item.ID, &item.Country, &item.Gender, &item.PreferredLocale, &item.Email, &item.Phone, &item.DisplayName, &item.Password, &item.Role, &item.Status, &item.FreezeReason, &item.MFAEnabled, &item.MFAMethod, &item.MFASecret, &item.AuthVersion, &lastLoginAt, &item.CreatedAt, &item.LastDeviceIP, &deletionRequestedAt, &deletionScheduledAt); err != nil {
		if err == sql.ErrNoRows {
			return domain.User{}, ErrNotFound
		}
		return domain.User{}, err
	}
	if lastLoginAt.Valid {
		t := lastLoginAt.Time
		item.LastLoginAt = &t
	}
	if deletionRequestedAt.Valid {
		t := deletionRequestedAt.Time
		item.DeletionRequestedAt = &t
	}
	if deletionScheduledAt.Valid {
		t := deletionScheduledAt.Time
		item.DeletionScheduledAt = &t
	}
	return item, nil
}

func scanUserFromRows(rows *sql.Rows) (domain.User, error) {
	return scanUser(rows)
}

func nullableTime(value *time.Time) any {
	if value == nil || value.IsZero() {
		return nil
	}
	return *value
}

func mustJSON(value any) string {
	payload, _ := json.Marshal(value)
	return string(payload)
}

func parseStringSlice(raw string) []string {
	if raw == "" {
		return []string{}
	}
	var items []string
	if err := json.Unmarshal([]byte(raw), &items); err == nil {
		return items
	}
	return strings.Fields(raw)
}

func parseMap(raw string) map[string]any {
	if raw == "" || raw == "null" {
		return nil
	}
	var item map[string]any
	if err := json.Unmarshal([]byte(raw), &item); err != nil {
		return nil
	}
	return item
}
