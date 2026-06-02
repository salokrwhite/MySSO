package http

import (
	"sync"
	"time"
)

type inMemoryRateLimiter struct {
	mu      sync.Mutex
	events  map[string][]time.Time
	lastGC  time.Time
	maxKeys int
}

func newInMemoryRateLimiter() *inMemoryRateLimiter {
	return &inMemoryRateLimiter{
		events:  map[string][]time.Time{},
		maxKeys: 10000,
	}
}

func (l *inMemoryRateLimiter) allow(key string, limit int, window time.Duration, now time.Time) (bool, time.Duration) {
	if key == "" || limit <= 0 || window <= 0 {
		return true, 0
	}
	l.mu.Lock()
	defer l.mu.Unlock()

	if now.Sub(l.lastGC) > window {
		l.gc(now, window)
	}

	cutoff := now.Add(-window)
	events := l.events[key]
	keepFrom := 0
	for keepFrom < len(events) && events[keepFrom].Before(cutoff) {
		keepFrom++
	}
	if keepFrom > 0 {
		events = append([]time.Time{}, events[keepFrom:]...)
	}
	if len(events) >= limit {
		retryAfter := window - now.Sub(events[0])
		if retryAfter < time.Second {
			retryAfter = time.Second
		}
		l.events[key] = events
		return false, retryAfter
	}
	if len(l.events) >= l.maxKeys && l.events[key] == nil {
		l.gc(now, window)
		if len(l.events) >= l.maxKeys {
			return false, window
		}
	}
	events = append(events, now)
	l.events[key] = events
	return true, 0
}

func (l *inMemoryRateLimiter) gc(now time.Time, window time.Duration) {
	cutoff := now.Add(-window)
	for key, events := range l.events {
		keepFrom := 0
		for keepFrom < len(events) && events[keepFrom].Before(cutoff) {
			keepFrom++
		}
		if keepFrom >= len(events) {
			delete(l.events, key)
			continue
		}
		if keepFrom > 0 {
			l.events[key] = append([]time.Time{}, events[keepFrom:]...)
		}
	}
	l.lastGC = now
}
