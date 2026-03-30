package memory

import (
	"strings"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/security"
)

func (s *MemoryStore) ListAppsByOwner(ownerID string) []domain.ClientApp {
	s.mu.RLock()
	defer s.mu.RUnlock()
	apps := []domain.ClientApp{}
	for _, app := range s.apps {
		if app.OwnerUserID == ownerID {
			app.HasClientSecret = strings.TrimSpace(app.ClientSecret) != ""
			apps = append(apps, app)
		}
	}
	return apps
}

func (s *MemoryStore) ListApps() []domain.ClientApp {
	s.mu.RLock()
	defer s.mu.RUnlock()
	apps := make([]domain.ClientApp, 0, len(s.apps))
	for _, app := range s.apps {
		app.HasClientSecret = strings.TrimSpace(app.ClientSecret) != ""
		apps = append(apps, app)
	}
	return apps
}

func (s *MemoryStore) CountApps(status string) (int, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	normalizedStatus := strings.TrimSpace(status)
	if normalizedStatus == "" {
		return len(s.apps), nil
	}

	total := 0
	for _, app := range s.apps {
		if string(app.Status) == normalizedStatus {
			total++
		}
	}
	return total, nil
}

func (s *MemoryStore) CreateApp(app domain.ClientApp) domain.ClientApp {
	s.mu.Lock()
	defer s.mu.Unlock()
	app.HasClientSecret = strings.TrimSpace(app.ClientSecret) != ""
	s.apps[app.ID] = app
	s.appsByClientID[app.ClientID] = app.ID
	return app
}

func (s *MemoryStore) UpdateApp(app domain.ClientApp) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.apps[app.ID]; !ok {
		return ErrNotFound
	}
	if strings.TrimSpace(app.ClientSecret) != "" && !security.LooksLikeBcryptHash(app.ClientSecret) {
		hashedSecret, err := security.HashPassword(app.ClientSecret)
		if err != nil {
			return err
		}
		app.ClientSecret = hashedSecret
	}
	app.HasClientSecret = strings.TrimSpace(app.ClientSecret) != ""
	s.apps[app.ID] = app
	s.appsByClientID[app.ClientID] = app.ID
	return nil
}

func (s *MemoryStore) DeleteApp(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	app, ok := s.apps[id]
	if !ok {
		return ErrNotFound
	}

	delete(s.appsByClientID, app.ClientID)
	delete(s.apps, id)

	for codeValue, code := range s.authCodes {
		if code.ClientID == app.ClientID {
			delete(s.authCodes, codeValue)
		}
	}
	for consentID, consent := range s.consents {
		if consent.ClientID == app.ClientID {
			delete(s.consents, consentID)
		}
	}
	for tokenValue, token := range s.refreshTokens {
		if token.ClientID == app.ClientID {
			delete(s.refreshTokens, tokenValue)
		}
	}

	filteredAuditLogs := s.auditLogs[:0]
	for _, log := range s.auditLogs {
		if log.TargetID == id {
			continue
		}
		filteredAuditLogs = append(filteredAuditLogs, log)
	}
	s.auditLogs = filteredAuditLogs

	return nil
}

func (s *MemoryStore) FindAppByClientID(clientID string) (domain.ClientApp, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	id, ok := s.appsByClientID[clientID]
	if !ok {
		return domain.ClientApp{}, ErrNotFound
	}
	app := s.apps[id]
	app.HasClientSecret = strings.TrimSpace(app.ClientSecret) != ""
	return app, nil
}

func (s *MemoryStore) GetApp(id string) (domain.ClientApp, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	app, ok := s.apps[id]
	if !ok {
		return domain.ClientApp{}, ErrNotFound
	}
	app.HasClientSecret = strings.TrimSpace(app.ClientSecret) != ""
	return app, nil
}
