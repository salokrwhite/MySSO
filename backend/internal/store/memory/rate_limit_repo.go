package memory

import (
	"slices"
	"strings"
	"time"

	"mysso/backend/internal/domain"
)

func (s *MemoryStore) GetRateLimitCounter(counterKey string) (domain.RateLimitCounter, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	item, ok := s.rateLimitCounters[counterKey]
	if !ok || item.ExpiresAt.Before(time.Now().UTC()) {
		return domain.RateLimitCounter{}, ErrNotFound
	}
	return item, nil
}

func (s *MemoryStore) IncrementRateLimitCounter(counterKey, windowType string, windowStartedAt, expiresAt time.Time, delta int) (domain.RateLimitCounter, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now().UTC()
	item, ok := s.rateLimitCounters[counterKey]
	if !ok || item.ExpiresAt.Before(now) || item.WindowStartedAt.Before(windowStartedAt) {
		item = domain.RateLimitCounter{
			CounterKey:      counterKey,
			WindowType:      windowType,
			Count:           0,
			WindowStartedAt: windowStartedAt,
			ExpiresAt:       expiresAt,
		}
	}
	item.Count += delta
	item.WindowType = windowType
	item.WindowStartedAt = windowStartedAt
	item.ExpiresAt = expiresAt
	item.UpdatedAt = now
	s.rateLimitCounters[counterKey] = item
	return item, nil
}

func (s *MemoryStore) SetRateLimitCounter(counter domain.RateLimitCounter) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	counter.UpdatedAt = time.Now().UTC()
	s.rateLimitCounters[counter.CounterKey] = counter
	return nil
}

func (s *MemoryStore) DeleteRateLimitCounter(counterKey string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.rateLimitCounters, counterKey)
	return nil
}

func (s *MemoryStore) CountActiveRateLimitCountersByPrefix(prefix string, now time.Time) (int, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	count := 0
	for key, item := range s.rateLimitCounters {
		if strings.HasPrefix(key, prefix) && item.ExpiresAt.After(now) {
			count++
		}
	}
	return count, nil
}

func (s *MemoryStore) SaveRequestChallenge(challenge domain.RequestChallenge) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.requestChallenges[challenge.Token] = challenge
	return nil
}

func (s *MemoryStore) GetRequestChallenge(token string) (domain.RequestChallenge, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	item, ok := s.requestChallenges[token]
	if !ok || item.ExpiresAt.Before(time.Now().UTC()) || item.ConsumedAt != nil {
		return domain.RequestChallenge{}, ErrNotFound
	}
	return item, nil
}

func (s *MemoryStore) ConsumeRequestChallenge(token string, consumedAt time.Time) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	item, ok := s.requestChallenges[token]
	if !ok {
		return ErrNotFound
	}
	item.ConsumedAt = &consumedAt
	s.requestChallenges[token] = item
	return nil
}

func (s *MemoryStore) AppendRateLimitEvent(event domain.RateLimitEvent) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.rateLimitEvents = append([]domain.RateLimitEvent{event}, s.rateLimitEvents...)
	return nil
}

func (s *MemoryStore) ListRateLimitEvents() []domain.RateLimitEvent {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return slices.Clone(s.rateLimitEvents)
}

func (s *MemoryStore) DeleteRateLimitEvents(ids []string) error {
	if len(ids) == 0 {
		return nil
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	idSet := make(map[string]struct{}, len(ids))
	for _, id := range ids {
		idSet[id] = struct{}{}
	}

	filtered := s.rateLimitEvents[:0]
	for _, item := range s.rateLimitEvents {
		if _, shouldDelete := idSet[item.ID]; shouldDelete {
			continue
		}
		filtered = append(filtered, item)
	}
	s.rateLimitEvents = filtered
	return nil
}
