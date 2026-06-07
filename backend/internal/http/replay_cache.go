package http

import (
	"sync"
	"time"
)

type replayCache struct {
	mu      sync.Mutex
	seen    map[string]time.Time
	lastGC  time.Time
	maxKeys int
}

func newReplayCache(maxKeys int) *replayCache {
	if maxKeys <= 0 {
		maxKeys = 10000
	}
	return &replayCache{
		seen:    map[string]time.Time{},
		maxKeys: maxKeys,
	}
}

func (c *replayCache) markIfNew(key string, ttl time.Duration, now time.Time) bool {
	if key == "" || ttl <= 0 {
		return true
	}
	c.mu.Lock()
	defer c.mu.Unlock()

	if now.Sub(c.lastGC) > ttl {
		c.gc(now)
	}
	if expiresAt, ok := c.seen[key]; ok && expiresAt.After(now) {
		return false
	}
	if len(c.seen) >= c.maxKeys {
		c.gc(now)
		if len(c.seen) >= c.maxKeys {
			return false
		}
	}
	c.seen[key] = now.Add(ttl)
	return true
}

func (c *replayCache) gc(now time.Time) {
	for key, expiresAt := range c.seen {
		if !expiresAt.After(now) {
			delete(c.seen, key)
		}
	}
	c.lastGC = now
}
