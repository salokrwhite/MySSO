package memory

import "mysso/backend/internal/domain"

func (s *MemoryStore) CreateSession(session domain.Session) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.sessions[session.Token] = session
}

func (s *MemoryStore) GetSession(token string) (domain.Session, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	session, ok := s.sessions[token]
	if !ok {
		return domain.Session{}, ErrNotFound
	}
	return session, nil
}

func (s *MemoryStore) DeleteSession(token string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.sessions[token]; !ok {
		return ErrNotFound
	}
	delete(s.sessions, token)
	return nil
}

func (s *MemoryStore) DeleteSessionsByUser(userID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for token, session := range s.sessions {
		if session.UserID == userID {
			delete(s.sessions, token)
		}
	}
	return nil
}
