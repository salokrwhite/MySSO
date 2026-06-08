package mysql

import (
	"database/sql"
	"encoding/json"
	"strings"
	"time"

	"github.com/google/uuid"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/store"
)

func (s *MySQLStore) InsertRiskEvent(event domain.RiskEvent) error {
	if event.ID == "" {
		event.ID = uuid.NewString()
	}
	if event.CreatedAt.IsZero() {
		event.CreatedAt = time.Now().UTC()
	}
	signals, _ := json.Marshal(event.Signals)
	_, err := s.db.Exec(`INSERT INTO risk_events
		(id, user_id, event_type, identifier_hash, failure_reason, risk_score, risk_level, action_taken, ip_address, ip_country, ip_region, ip_city, device_fingerprint, device_key_id, client_type, user_agent, signals_json, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		event.ID, event.UserID, event.EventType, event.IdentifierHash, event.FailureReason, event.RiskScore, event.RiskLevel, event.ActionTaken, event.IPAddress,
		event.IPCountry, event.IPRegion, event.IPCity, event.DeviceFingerprint, event.DeviceKeyID, event.ClientType, event.UserAgent, string(signals), event.CreatedAt)
	return err
}

func (s *MySQLStore) ListRiskEvents(page, pageSize int, userID, eventType, level string) ([]domain.RiskEvent, int, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}
	if pageSize > 200 {
		pageSize = 200
	}
	where := "WHERE (? = '' OR risk_events.user_id = ?) AND (? = '' OR event_type = ?) AND (? = '' OR risk_level = ?) AND (risk_events.user_id = '' OR u.id IS NULL OR u.role <> ?)"
	args := []any{userID, userID, eventType, eventType, level, level, string(domain.RoleAdmin)}
	var total int
	if err := s.db.QueryRow("SELECT COUNT(*) FROM risk_events LEFT JOIN users u ON u.id = risk_events.user_id "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	rows, err := s.db.Query(`SELECT risk_events.id, risk_events.user_id, COALESCE(u.email, ''), COALESCE(u.display_name, ''), risk_events.event_type, risk_events.identifier_hash, risk_events.failure_reason,
		risk_events.risk_score, risk_events.risk_level, risk_events.action_taken, risk_events.ip_address, risk_events.ip_country, risk_events.ip_region,
		risk_events.ip_city, risk_events.device_fingerprint, risk_events.device_key_id, risk_events.client_type, risk_events.user_agent,
		risk_events.signals_json, risk_events.created_at
		FROM risk_events LEFT JOIN users u ON u.id = risk_events.user_id `+where+` ORDER BY risk_events.created_at DESC LIMIT ? OFFSET ?`, append(args, pageSize, (page-1)*pageSize)...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	events := []domain.RiskEvent{}
	for rows.Next() {
		event, err := scanRiskEvent(rows)
		if err != nil {
			return nil, 0, err
		}
		events = append(events, event)
	}
	return events, total, rows.Err()
}

func (s *MySQLStore) ListRiskAccountSummaries(page, pageSize int, userID, level string, mediumThreshold, highThreshold, criticalThreshold, scoreWindowDays, failedLoginScoreWeight, failedLoginScoreCap int) ([]domain.RiskAccountSummary, int, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}
	if pageSize > 200 {
		pageSize = 200
	}
	userID = strings.TrimSpace(userID)
	level = strings.TrimSpace(level)
	if scoreWindowDays <= 0 {
		scoreWindowDays = 30
	}
	if scoreWindowDays > 365 {
		scoreWindowDays = 365
	}
	if failedLoginScoreWeight < 0 {
		failedLoginScoreWeight = 0
	}
	if failedLoginScoreCap < 0 {
		failedLoginScoreCap = 0
	}
	windowStart := time.Now().UTC().AddDate(0, 0, -scoreWindowDays)
	comprehensiveScoreSQL := "CAST(ROUND(GREATEST(MAX(risk_score), LEAST(SUM(CASE WHEN event_type IN ('login_failed', 'login_blocked') THEN 1 ELSE 0 END) * ?, ?))) AS SIGNED)"

	where := "WHERE u.role <> ? AND (? = '' OR u.id = ?) AND (? = '' OR COALESCE(agg.risk_level, 'none') = ?)"
	args := []any{string(domain.RoleAdmin), userID, userID, level, level}
	var total int
	if err := s.db.QueryRow(`
		SELECT COUNT(*) FROM users u
		LEFT JOIN (
			SELECT user_id, comprehensive_score,
				CASE
					WHEN comprehensive_score >= ? THEN 'critical'
					WHEN comprehensive_score >= ? THEN 'high'
					WHEN comprehensive_score >= ? THEN 'medium'
					WHEN comprehensive_score > 0 THEN 'low'
					ELSE 'none'
				END AS risk_level
			FROM (
				SELECT
					user_id,
					`+comprehensiveScoreSQL+` AS comprehensive_score
				FROM risk_events
				WHERE user_id <> '' AND created_at >= ?
				GROUP BY user_id
			) scored
		) agg ON agg.user_id = u.id `+where, append([]any{criticalThreshold, highThreshold, mediumThreshold, failedLoginScoreWeight, failedLoginScoreCap, windowStart}, args...)...).Scan(&total); err != nil {
		return nil, 0, err
	}

	queryArgs := []any{
		windowStart,
		windowStart,
		windowStart,
		windowStart,
		windowStart,
		windowStart,
		windowStart,
		windowStart,
		criticalThreshold,
		highThreshold,
		mediumThreshold,
		failedLoginScoreWeight,
		failedLoginScoreCap,
		windowStart,
	}
	queryArgs = append(queryArgs, args...)
	queryArgs = append(queryArgs, pageSize, (page-1)*pageSize)
	rows, err := s.db.Query(`
		SELECT
			u.id, u.email, u.display_name, u.role, u.status, u.phone, u.mfa_enabled, u.last_login_at, u.last_device_ip, u.created_at,
			COALESCE(agg.comprehensive_score, 0),
			COALESCE(agg.risk_level, 'none'),
			COALESCE(agg.event_count, 0),
			COALESCE(agg.login_success_count, 0),
			COALESCE(agg.login_failure_count, 0),
			COALESCE(agg.blocked_count, 0),
			COALESCE(agg.step_up_count, 0),
			COALESCE(agg.captcha_count, 0),
			COALESCE(agg.device_count, 0),
			COALESCE((
				SELECT event_type FROM risk_events e
				WHERE e.user_id = u.id AND e.created_at >= ?
				ORDER BY e.created_at DESC, e.id DESC LIMIT 1
			), ''),
			COALESCE((
				SELECT action_taken FROM risk_events e
				WHERE e.user_id = u.id AND e.created_at >= ?
				ORDER BY e.created_at DESC, e.id DESC LIMIT 1
			), ''),
			COALESCE((
				SELECT ip_address FROM risk_events e
				WHERE e.user_id = u.id AND e.created_at >= ?
				ORDER BY e.created_at DESC, e.id DESC LIMIT 1
			), ''),
			COALESCE((
				SELECT ip_country FROM risk_events e
				WHERE e.user_id = u.id AND e.created_at >= ?
				ORDER BY e.created_at DESC, e.id DESC LIMIT 1
			), ''),
			COALESCE((
				SELECT ip_region FROM risk_events e
				WHERE e.user_id = u.id AND e.created_at >= ?
				ORDER BY e.created_at DESC, e.id DESC LIMIT 1
			), ''),
			COALESCE((
				SELECT ip_city FROM risk_events e
				WHERE e.user_id = u.id AND e.created_at >= ?
				ORDER BY e.created_at DESC, e.id DESC LIMIT 1
			), ''),
			COALESCE((
				SELECT client_type FROM risk_events e
				WHERE e.user_id = u.id AND e.created_at >= ?
				ORDER BY e.created_at DESC, e.id DESC LIMIT 1
			), ''),
			(
				SELECT created_at FROM risk_events e
				WHERE e.user_id = u.id AND e.created_at >= ?
				ORDER BY e.created_at DESC, e.id DESC LIMIT 1
			),
			device_trust.trusted_until,
			device_trust.mitigated_until,
			account_trust.mitigated_until,
			COALESCE(account_trust.trust_reason, '')
		FROM users u
		LEFT JOIN (
			SELECT user_id, MAX(trusted_until) AS trusted_until, MAX(mitigated_until) AS mitigated_until
			FROM device_profiles
			WHERE device_fingerprint <> '__account__'
			GROUP BY user_id
		) device_trust ON device_trust.user_id = u.id
		LEFT JOIN device_profiles account_trust
			ON account_trust.user_id = u.id AND account_trust.device_fingerprint = '__account__'
		LEFT JOIN (
			SELECT
				user_id,
				comprehensive_score,
				CASE
					WHEN comprehensive_score >= ? THEN 'critical'
					WHEN comprehensive_score >= ? THEN 'high'
					WHEN comprehensive_score >= ? THEN 'medium'
					WHEN comprehensive_score > 0 THEN 'low'
					ELSE 'none'
				END AS risk_level,
				event_count,
				login_success_count,
				login_failure_count,
				blocked_count,
				step_up_count,
				captcha_count,
				device_count,
				last_event_at
			FROM (
				SELECT
					user_id,
					`+comprehensiveScoreSQL+` AS comprehensive_score,
					COUNT(*) AS event_count,
					SUM(CASE WHEN event_type IN ('login', 'login_success', 'login_allowed') AND action_taken = 'allow' THEN 1 ELSE 0 END) AS login_success_count,
					SUM(CASE WHEN event_type IN ('login_failed', 'login_blocked') THEN 1 ELSE 0 END) AS login_failure_count,
					SUM(CASE WHEN action_taken = 'block' THEN 1 ELSE 0 END) AS blocked_count,
					SUM(CASE WHEN action_taken = 'step_up' THEN 1 ELSE 0 END) AS step_up_count,
					SUM(CASE WHEN action_taken = 'captcha' THEN 1 ELSE 0 END) AS captcha_count,
					COUNT(DISTINCT NULLIF(device_fingerprint, '')) AS device_count,
					MAX(created_at) AS last_event_at
				FROM risk_events
				WHERE user_id <> '' AND created_at >= ?
				GROUP BY user_id
			) scored
		) agg ON agg.user_id = u.id
		`+where+`
		ORDER BY COALESCE(agg.comprehensive_score, 0) DESC, COALESCE(agg.last_event_at, u.created_at) DESC
		LIMIT ? OFFSET ?`, queryArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	items := []domain.RiskAccountSummary{}
	for rows.Next() {
		var item domain.RiskAccountSummary
		var lastLoginAt sql.NullTime
		var lastEventAt sql.NullTime
		var trustedUntil sql.NullTime
		var mitigatedUntil sql.NullTime
		var falsePositiveUntil sql.NullTime
		if err := rows.Scan(
			&item.UserID, &item.Email, &item.DisplayName, &item.Role, &item.Status, &item.Phone, &item.MFAEnabled, &lastLoginAt, &item.LastDeviceIP, &item.CreatedAt,
			&item.ComprehensiveScore, &item.RiskLevel, &item.EventCount, &item.LoginSuccessCount, &item.LoginFailureCount, &item.BlockedCount,
			&item.StepUpCount, &item.CaptchaCount, &item.DeviceCount, &item.LastEventType, &item.LastActionTaken, &item.LastIPAddress,
			&item.LastIPCountry, &item.LastIPRegion, &item.LastIPCity, &item.LastClientType, &lastEventAt, &trustedUntil, &mitigatedUntil, &falsePositiveUntil, &item.FalsePositiveNote,
		); err != nil {
			return nil, 0, err
		}
		if lastLoginAt.Valid {
			item.LastLoginAt = &lastLoginAt.Time
		}
		if lastEventAt.Valid {
			item.LastEventAt = &lastEventAt.Time
		}
		if trustedUntil.Valid {
			item.TrustedUntil = &trustedUntil.Time
		}
		if mitigatedUntil.Valid {
			item.MitigatedUntil = &mitigatedUntil.Time
		}
		if falsePositiveUntil.Valid {
			item.FalsePositiveUntil = &falsePositiveUntil.Time
		}
		items = append(items, item)
	}
	return items, total, rows.Err()
}

func (s *MySQLStore) DeleteRiskEvents(startAt, endAt *time.Time) (int64, error) {
	query := "DELETE FROM risk_events"
	args := []any{}
	if startAt != nil || endAt != nil {
		conditions := []string{}
		if startAt != nil {
			conditions = append(conditions, "created_at >= ?")
			args = append(args, *startAt)
		}
		if endAt != nil {
			conditions = append(conditions, "created_at <= ?")
			args = append(args, *endAt)
		}
		// #nosec G202 -- conditions are fixed SQL fragments selected by nil checks; times are bound as parameters.
		query += " WHERE " + strings.Join(conditions, " AND ")
	}
	result, err := s.db.Exec(query, args...)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}

func scanRiskEvent(scanner interface{ Scan(dest ...any) error }) (domain.RiskEvent, error) {
	var event domain.RiskEvent
	var raw string
	err := scanner.Scan(&event.ID, &event.UserID, &event.Email, &event.DisplayName, &event.EventType, &event.IdentifierHash, &event.FailureReason, &event.RiskScore, &event.RiskLevel, &event.ActionTaken,
		&event.IPAddress, &event.IPCountry, &event.IPRegion, &event.IPCity, &event.DeviceFingerprint, &event.DeviceKeyID,
		&event.ClientType, &event.UserAgent, &raw, &event.CreatedAt)
	if err != nil {
		return domain.RiskEvent{}, err
	}
	_ = json.Unmarshal([]byte(raw), &event.Signals)
	return event, nil
}

func (s *MySQLStore) CountRiskEventsSince(eventType, identifierHash, ip string, since time.Time) (int, error) {
	var count int
	err := s.db.QueryRow(`SELECT COUNT(*) FROM risk_events
		WHERE event_type = ? AND created_at >= ? AND (? = '' OR ip_address = ?)
		AND (? = '' OR identifier_hash = ?)`,
		eventType, since, ip, ip, identifierHash, identifierHash).Scan(&count)
	return count, err
}

func (s *MySQLStore) UpsertDeviceProfile(profile domain.DeviceProfile) error {
	if profile.ID == "" {
		profile.ID = uuid.NewString()
	}
	now := time.Now().UTC()
	if profile.FirstSeenAt.IsZero() {
		profile.FirstSeenAt = now
	}
	if profile.LastSeenAt.IsZero() {
		profile.LastSeenAt = now
	}
	_, err := s.db.Exec(`INSERT INTO device_profiles
		(id, user_id, device_fingerprint, device_key_id, client_type, first_ip, last_ip, first_seen_at, last_seen_at, last_risk_score, last_risk_level, blocked_at, trusted_until, mitigated_until, trust_reason, trust_updated_by)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE device_key_id=VALUES(device_key_id), client_type=VALUES(client_type), last_ip=VALUES(last_ip),
		last_seen_at=VALUES(last_seen_at), last_risk_score=VALUES(last_risk_score), last_risk_level=VALUES(last_risk_level), blocked_at=VALUES(blocked_at)`,
		profile.ID, profile.UserID, profile.DeviceFingerprint, profile.DeviceKeyID, profile.ClientType, profile.FirstIP, profile.LastIP,
		profile.FirstSeenAt, profile.LastSeenAt, profile.LastRiskScore, profile.LastRiskLevel, profile.BlockedAt, profile.TrustedUntil, profile.MitigatedUntil, profile.TrustReason, profile.TrustUpdatedBy)
	return err
}

func (s *MySQLStore) GetDeviceProfile(userID, fingerprint string) (domain.DeviceProfile, error) {
	var p domain.DeviceProfile
	err := s.db.QueryRow(`SELECT id, user_id, device_fingerprint, device_key_id, client_type, first_ip, last_ip, first_seen_at, last_seen_at,
		last_risk_score, last_risk_level, blocked_at, trusted_until, mitigated_until, trust_reason, trust_updated_by FROM device_profiles WHERE user_id = ? AND device_fingerprint = ?`, userID, fingerprint).
		Scan(&p.ID, &p.UserID, &p.DeviceFingerprint, &p.DeviceKeyID, &p.ClientType, &p.FirstIP, &p.LastIP, &p.FirstSeenAt, &p.LastSeenAt, &p.LastRiskScore, &p.LastRiskLevel, &p.BlockedAt, &p.TrustedUntil, &p.MitigatedUntil, &p.TrustReason, &p.TrustUpdatedBy)
	if err == sql.ErrNoRows {
		return domain.DeviceProfile{}, store.ErrNotFound
	}
	return p, err
}

func (s *MySQLStore) CountUserDevicesSince(userID string, since time.Time) (int, error) {
	var count int
	err := s.db.QueryRow(`SELECT COUNT(*) FROM device_profiles WHERE user_id = ? AND device_fingerprint <> '__account__' AND last_seen_at >= ?`, userID, since).Scan(&count)
	return count, err
}

func (s *MySQLStore) TrustDevice(userID, fingerprint, reason, updatedBy string, trustedUntil, mitigatedUntil *time.Time) error {
	now := time.Now().UTC()
	if fingerprint = strings.TrimSpace(fingerprint); fingerprint == "" {
		return nil
	}
	_, err := s.db.Exec(`INSERT INTO device_profiles
		(id, user_id, device_fingerprint, first_seen_at, last_seen_at, trusted_until, mitigated_until, trust_reason, trust_updated_by)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE trusted_until=VALUES(trusted_until), mitigated_until=VALUES(mitigated_until), trust_reason=VALUES(trust_reason), trust_updated_by=VALUES(trust_updated_by), last_seen_at=VALUES(last_seen_at)`,
		uuid.NewString(), strings.TrimSpace(userID), fingerprint, now, now, trustedUntil, mitigatedUntil, strings.TrimSpace(reason), strings.TrimSpace(updatedBy))
	return err
}

func (s *MySQLStore) ClearUserRiskProfile(userID string) error {
	_, err := s.db.Exec("DELETE FROM risk_events WHERE user_id = ?", strings.TrimSpace(userID))
	return err
}

func (s *MySQLStore) SetUserRiskFalsePositive(userID, note string, until time.Time) error {
	now := time.Now().UTC()
	_, err := s.db.Exec(`INSERT INTO device_profiles
		(id, user_id, device_fingerprint, first_seen_at, last_seen_at, mitigated_until, trust_reason, trust_updated_by)
		VALUES (?, ?, '__account__', ?, ?, ?, ?, '')
		ON DUPLICATE KEY UPDATE mitigated_until=VALUES(mitigated_until), trust_reason=VALUES(trust_reason), last_seen_at=VALUES(last_seen_at)`,
		uuid.NewString(), strings.TrimSpace(userID), now, now, until, strings.TrimSpace(note))
	return err
}

func (s *MySQLStore) GetUserRiskFalsePositiveUntil(userID string, now time.Time) (*time.Time, error) {
	var until time.Time
	err := s.db.QueryRow(`SELECT mitigated_until FROM device_profiles
		WHERE user_id = ? AND device_fingerprint = '__account__' AND mitigated_until IS NOT NULL AND mitigated_until > ?`,
		strings.TrimSpace(userID), now).Scan(&until)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &until, nil
}

func (s *MySQLStore) InsertLoginHistory(history domain.LoginHistory) error {
	if history.ID == "" {
		history.ID = uuid.NewString()
	}
	if history.CreatedAt.IsZero() {
		history.CreatedAt = time.Now().UTC()
	}
	_, err := s.db.Exec(`INSERT INTO login_history
		(id, user_id, ip_address, ip_country, ip_region, ip_city, device_fingerprint, device_key_id, client_type, risk_score, risk_level, success, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		history.ID, history.UserID, history.IPAddress, history.IPCountry, history.IPRegion, history.IPCity, history.DeviceFingerprint,
		history.DeviceKeyID, history.ClientType, history.RiskScore, history.RiskLevel, history.Success, history.CreatedAt)
	return err
}

func (s *MySQLStore) GetLastLoginHistory(userID string) (domain.LoginHistory, error) {
	var h domain.LoginHistory
	err := s.db.QueryRow(`SELECT id, user_id, ip_address, ip_country, ip_region, ip_city, device_fingerprint, device_key_id, client_type,
		risk_score, risk_level, success, created_at FROM login_history WHERE user_id = ? AND success = 1 ORDER BY created_at DESC LIMIT 1`, userID).
		Scan(&h.ID, &h.UserID, &h.IPAddress, &h.IPCountry, &h.IPRegion, &h.IPCity, &h.DeviceFingerprint, &h.DeviceKeyID, &h.ClientType, &h.RiskScore, &h.RiskLevel, &h.Success, &h.CreatedAt)
	if err == sql.ErrNoRows {
		return domain.LoginHistory{}, store.ErrNotFound
	}
	return h, err
}

func (s *MySQLStore) CountFailedLogins(identifierHash, ip string, since time.Time) (int, error) {
	var count int
	err := s.db.QueryRow(`SELECT COUNT(*) FROM risk_events WHERE event_type = 'login_failed' AND created_at >= ?
		AND (? = '' OR ip_address = ?) AND (? = '' OR identifier_hash = ?)`,
		since, ip, ip, identifierHash, identifierHash).Scan(&count)
	return count, err
}

func (s *MySQLStore) AddIPBlacklist(entry domain.IPBlacklistEntry) error {
	if entry.ID == "" {
		entry.ID = uuid.NewString()
	}
	if entry.CreatedAt.IsZero() {
		entry.CreatedAt = time.Now().UTC()
	}
	_, err := s.db.Exec(`INSERT INTO ip_blacklist (id, ip_address, reason, created_by, created_at, expires_at)
		VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE reason=VALUES(reason), created_by=VALUES(created_by), created_at=VALUES(created_at), expires_at=VALUES(expires_at)`,
		entry.ID, entry.IPAddress, entry.Reason, entry.CreatedBy, entry.CreatedAt, entry.ExpiresAt)
	return err
}

func (s *MySQLStore) RemoveIPBlacklist(ip string) error {
	_, err := s.db.Exec("DELETE FROM ip_blacklist WHERE ip_address = ?", ip)
	return err
}

func (s *MySQLStore) IsIPBlacklisted(ip string, now time.Time) (domain.IPBlacklistEntry, bool, error) {
	var entry domain.IPBlacklistEntry
	err := s.db.QueryRow(`SELECT id, ip_address, reason, created_by, created_at, expires_at FROM ip_blacklist
		WHERE ip_address = ? AND (expires_at IS NULL OR expires_at > ?)`, ip, now).
		Scan(&entry.ID, &entry.IPAddress, &entry.Reason, &entry.CreatedBy, &entry.CreatedAt, &entry.ExpiresAt)
	if err == sql.ErrNoRows {
		return domain.IPBlacklistEntry{}, false, nil
	}
	return entry, err == nil, err
}

func (s *MySQLStore) ListIPBlacklist() ([]domain.IPBlacklistEntry, error) {
	rows, err := s.db.Query(`SELECT id, ip_address, reason, created_by, created_at, expires_at FROM ip_blacklist ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []domain.IPBlacklistEntry{}
	for rows.Next() {
		var item domain.IPBlacklistEntry
		if err := rows.Scan(&item.ID, &item.IPAddress, &item.Reason, &item.CreatedBy, &item.CreatedAt, &item.ExpiresAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (s *MySQLStore) CountRiskEventsByLevel(since time.Time) (map[string]int, error) {
	rows, err := s.db.Query(`SELECT risk_level, COUNT(*) FROM risk_events WHERE created_at >= ? GROUP BY risk_level`, since)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := map[string]int{}
	for rows.Next() {
		var level string
		var count int
		if err := rows.Scan(&level, &count); err != nil {
			return nil, err
		}
		result[level] = count
	}
	return result, rows.Err()
}
