package store

import "mysso/backend/internal/domain"

func (s *MemoryStore) ListScopes() []domain.ScopeDefinition {
	s.mu.RLock()
	defer s.mu.RUnlock()

	items := make([]domain.ScopeDefinition, 0, len(s.scopes))
	for _, item := range s.scopes {
		items = append(items, item)
	}
	return items
}

func (s *MemoryStore) GetScope(key string) (domain.ScopeDefinition, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	item, ok := s.scopes[key]
	if !ok {
		return domain.ScopeDefinition{}, ErrNotFound
	}
	return item, nil
}

func (s *MemoryStore) UpsertScope(scope domain.ScopeDefinition) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.scopes[scope.Key] = scope
	return nil
}

func (s *MemoryStore) DeleteScope(key string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.scopes[key]; !ok {
		return ErrNotFound
	}
	delete(s.scopes, key)
	return nil
}

func (s *MemoryStore) CountAppsByScope(scope string) (int, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	count := 0
	for _, app := range s.apps {
		for _, item := range app.Scopes {
			if item == scope {
				count++
				break
			}
		}
	}
	return count, nil
}
