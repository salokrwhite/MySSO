package mysql

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"mysso/backend/internal/domain"
)

func (s *MySQLStore) GetRateLimitCounter(counterKey string) (domain.RateLimitCounter, error) {
	row := s.db.QueryRow(`
		SELECT counter_key, window_type, count, window_started_at, expires_at, updated_at
		FROM rate_limit_counters
		WHERE counter_key = ? AND expires_at >= UTC_TIMESTAMP()
		LIMIT 1
	`, counterKey)
	var item domain.RateLimitCounter
	if err := row.Scan(&item.CounterKey, &item.WindowType, &item.Count, &item.WindowStartedAt, &item.ExpiresAt, &item.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return domain.RateLimitCounter{}, ErrNotFound
		}
		return domain.RateLimitCounter{}, err
	}
	return item, nil
}

func (s *MySQLStore) IncrementRateLimitCounter(counterKey, windowType string, windowStartedAt, expiresAt time.Time, delta int) (domain.RateLimitCounter, error) {
	tx, err := s.db.Begin()
	if err != nil {
		return domain.RateLimitCounter{}, err
	}
	defer func() { _ = tx.Rollback() }()

	var item domain.RateLimitCounter
	row := tx.QueryRow(`
		SELECT counter_key, window_type, count, window_started_at, expires_at, updated_at
		FROM rate_limit_counters
		WHERE counter_key = ?
		FOR UPDATE
	`, counterKey)
	scanErr := row.Scan(&item.CounterKey, &item.WindowType, &item.Count, &item.WindowStartedAt, &item.ExpiresAt, &item.UpdatedAt)
	now := time.Now().UTC()
	if scanErr != nil {
		if scanErr != sql.ErrNoRows {
			return domain.RateLimitCounter{}, scanErr
		}
		item = domain.RateLimitCounter{
			CounterKey:      counterKey,
			WindowType:      windowType,
			Count:           delta,
			WindowStartedAt: windowStartedAt,
			ExpiresAt:       expiresAt,
			UpdatedAt:       now,
		}
		if _, err := tx.Exec(`
			INSERT INTO rate_limit_counters (counter_key, window_type, count, window_started_at, expires_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?)
		`, item.CounterKey, item.WindowType, item.Count, item.WindowStartedAt, item.ExpiresAt, item.UpdatedAt); err != nil {
			return domain.RateLimitCounter{}, err
		}
		if err := tx.Commit(); err != nil {
			return domain.RateLimitCounter{}, err
		}
		return item, nil
	}

	if item.ExpiresAt.Before(now) || item.WindowStartedAt.Before(windowStartedAt) {
		item.Count = 0
		item.WindowStartedAt = windowStartedAt
	}
	item.WindowType = windowType
	item.Count += delta
	item.ExpiresAt = expiresAt
	item.UpdatedAt = now
	if _, err := tx.Exec(`
		UPDATE rate_limit_counters
		SET window_type = ?, count = ?, window_started_at = ?, expires_at = ?, updated_at = ?
		WHERE counter_key = ?
	`, item.WindowType, item.Count, item.WindowStartedAt, item.ExpiresAt, item.UpdatedAt, item.CounterKey); err != nil {
		return domain.RateLimitCounter{}, err
	}
	if err := tx.Commit(); err != nil {
		return domain.RateLimitCounter{}, err
	}
	return item, nil
}

func (s *MySQLStore) SetRateLimitCounter(counter domain.RateLimitCounter) error {
	_, err := s.db.Exec(`
		INSERT INTO rate_limit_counters (counter_key, window_type, count, window_started_at, expires_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
			window_type = VALUES(window_type),
			count = VALUES(count),
			window_started_at = VALUES(window_started_at),
			expires_at = VALUES(expires_at),
			updated_at = VALUES(updated_at)
	`, counter.CounterKey, counter.WindowType, counter.Count, counter.WindowStartedAt, counter.ExpiresAt, counter.UpdatedAt)
	return err
}

func (s *MySQLStore) DeleteRateLimitCounter(counterKey string) error {
	_, err := s.db.Exec(`DELETE FROM rate_limit_counters WHERE counter_key = ?`, counterKey)
	return err
}

func (s *MySQLStore) CountActiveRateLimitCountersByPrefix(prefix string, now time.Time) (int, error) {
	row := s.db.QueryRow(`
		SELECT COUNT(*) FROM rate_limit_counters
		WHERE counter_key LIKE ? AND expires_at >= ?
	`, prefix+"%", now)
	var count int
	if err := row.Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}

func (s *MySQLStore) SaveRequestChallenge(challenge domain.RequestChallenge) error {
	_, err := s.db.Exec(`
		INSERT INTO request_challenges (token, purpose, channel, ip_hash, ua_hash, target_hash, captcha_passed, expires_at, consumed_at, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, challenge.Token, challenge.Purpose, challenge.Channel, challenge.IPHash, challenge.UAHash, challenge.TargetHash, challenge.CaptchaPassed, challenge.ExpiresAt, challenge.ConsumedAt, challenge.CreatedAt)
	return err
}

func (s *MySQLStore) GetRequestChallenge(token string) (domain.RequestChallenge, error) {
	row := s.db.QueryRow(`
		SELECT token, purpose, channel, ip_hash, ua_hash, target_hash, captcha_passed, expires_at, consumed_at, created_at
		FROM request_challenges
		WHERE token = ? AND expires_at >= UTC_TIMESTAMP() AND consumed_at IS NULL
		LIMIT 1
	`, token)
	var item domain.RequestChallenge
	if err := row.Scan(&item.Token, &item.Purpose, &item.Channel, &item.IPHash, &item.UAHash, &item.TargetHash, &item.CaptchaPassed, &item.ExpiresAt, &item.ConsumedAt, &item.CreatedAt); err != nil {
		if err == sql.ErrNoRows {
			return domain.RequestChallenge{}, ErrNotFound
		}
		return domain.RequestChallenge{}, err
	}
	return item, nil
}

func (s *MySQLStore) ConsumeRequestChallenge(token string, consumedAt time.Time) error {
	result, err := s.db.Exec(`UPDATE request_challenges SET consumed_at = ? WHERE token = ? AND consumed_at IS NULL`, consumedAt, token)
	if err != nil {
		return err
	}
	affected, _ := result.RowsAffected()
	if affected == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *MySQLStore) AppendRateLimitEvent(event domain.RateLimitEvent) error {
	_, err := s.db.Exec(`
		INSERT INTO rate_limit_events (id, channel, purpose, target_hash, source_ip, user_agent_hash, result, matched_rule, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, event.ID, event.Channel, event.Purpose, event.TargetHash, event.SourceIP, event.UserAgentHash, event.Result, event.MatchedRule, event.CreatedAt)
	return err
}

func (s *MySQLStore) ListRateLimitEvents() []domain.RateLimitEvent {
	rows, err := s.db.Query(`
		SELECT id, channel, purpose, target_hash, source_ip, user_agent_hash, result, matched_rule, created_at
		FROM rate_limit_events
		ORDER BY created_at DESC
		LIMIT 1000
	`)
	if err != nil {
		return nil
	}
	defer rows.Close()

	items := make([]domain.RateLimitEvent, 0)
	for rows.Next() {
		var item domain.RateLimitEvent
		if err := rows.Scan(&item.ID, &item.Channel, &item.Purpose, &item.TargetHash, &item.SourceIP, &item.UserAgentHash, &item.Result, &item.MatchedRule, &item.CreatedAt); err != nil {
			continue
		}
		items = append(items, item)
	}
	return items
}

func (s *MySQLStore) DeleteRateLimitEvents(ids []string) error {
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
		fmt.Sprintf("DELETE FROM rate_limit_events WHERE id IN (%s)", strings.Join(placeholders, ",")),
		args...,
	)
	return err
}
