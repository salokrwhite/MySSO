package memory

import (
	"time"

	"mysso/backend/internal/domain"
)

func (s *MemoryStore) SaveAuthorizationCode(code domain.AuthorizationCode) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.authCodes[code.Code] = code
}

func (s *MemoryStore) ConsumeAuthorizationCode(value, clientID, redirectURI, expectedCodeChallenge string) (domain.AuthorizationCode, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	code, ok := s.authCodes[value]
	if !ok {
		return domain.AuthorizationCode{}, ErrNotFound
	}
	if code.Used || code.ExpiresAt.Before(time.Now().UTC()) {
		return domain.AuthorizationCode{}, ErrAuthorizationCodeUnavailable
	}
	if code.ClientID != clientID || code.RedirectURI != redirectURI {
		return domain.AuthorizationCode{}, ErrAuthorizationCodeRequestMismatch
	}
	if code.CodeChallenge != "" && code.CodeChallenge != expectedCodeChallenge {
		return domain.AuthorizationCode{}, ErrAuthorizationCodePKCEMismatch
	}
	code.Used = true
	s.authCodes[value] = code
	return code, nil
}

func (s *MemoryStore) SaveConsent(consent domain.Consent) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.consents[consent.ID] = consent
}

func (s *MemoryStore) ListConsentsByUser(userID string) []domain.Consent {
	s.mu.RLock()
	defer s.mu.RUnlock()
	consents := []domain.Consent{}
	for _, consent := range s.consents {
		if consent.UserID == userID && consent.RevokedAt.IsZero() {
			if appID, ok := s.appsByClientID[consent.ClientID]; ok {
				if app, ok := s.apps[appID]; ok {
					consent.AppName = app.Name
					consent.IconURL = app.IconURL
				}
			}
			consents = append(consents, consent)
		}
	}
	return consents
}

func (s *MemoryStore) ListConsentsByClientID(clientID string, includeRevoked bool) ([]domain.Consent, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	consents := make([]domain.Consent, 0)
	for _, consent := range s.consents {
		if consent.ClientID != clientID {
			continue
		}
		if !includeRevoked && !consent.RevokedAt.IsZero() {
			continue
		}
		if appID, ok := s.appsByClientID[consent.ClientID]; ok {
			if app, ok := s.apps[appID]; ok {
				consent.AppName = app.Name
				consent.IconURL = app.IconURL
			}
		}
		consents = append(consents, consent)
	}
	return consents, nil
}

func (s *MemoryStore) RevokeConsent(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	consent, ok := s.consents[id]
	if !ok {
		return ErrNotFound
	}
	consent.RevokedAt = time.Now().UTC()
	s.consents[id] = consent
	return nil
}

func (s *MemoryStore) SaveRefreshToken(token domain.RefreshToken) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.refreshTokens[token.Token] = token
}

func (s *MemoryStore) RotateRefreshToken(oldToken, expectedClientID string, next domain.RefreshToken) (domain.RefreshToken, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	token, ok := s.refreshTokens[oldToken]
	if !ok {
		return domain.RefreshToken{}, ErrNotFound
	}
	if token.ClientID != expectedClientID {
		return token, ErrRefreshTokenClientMismatch
	}
	if token.Revoked {
		if token.ReplacedByToken != "" {
			return token, ErrRefreshTokenReuseDetected
		}
		return token, ErrRefreshTokenRevoked
	}
	if token.ExpiresAt.Before(time.Now().UTC()) {
		return token, ErrRefreshTokenExpired
	}
	now := time.Now().UTC()
	token.Revoked = true
	token.RevokedAt = &now
	token.ReplacedByToken = next.Token
	next.UserID = token.UserID
	next.ClientID = token.ClientID
	next.Scopes = token.Scopes
	next.RotatedFrom = token.Token
	s.refreshTokens[oldToken] = token
	s.refreshTokens[next.Token] = next
	return token, nil
}

func (s *MemoryStore) GetRefreshToken(value string) (domain.RefreshToken, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	token, ok := s.refreshTokens[value]
	if !ok {
		return domain.RefreshToken{}, ErrNotFound
	}
	return token, nil
}

func (s *MemoryStore) RevokeRefreshToken(value string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	token, ok := s.refreshTokens[value]
	if !ok {
		return ErrNotFound
	}
	token.Revoked = true
	now := time.Now().UTC()
	token.RevokedAt = &now
	s.refreshTokens[value] = token
	return nil
}

func (s *MemoryStore) RevokeRefreshTokensByUser(userID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now().UTC()
	for key, token := range s.refreshTokens {
		if token.UserID == userID && !token.Revoked {
			token.Revoked = true
			token.RevokedAt = &now
			s.refreshTokens[key] = token
		}
	}
	return nil
}

func (s *MemoryStore) RevokeRefreshTokensByUserClient(userID, clientID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now().UTC()
	for key, token := range s.refreshTokens {
		if token.UserID == userID && token.ClientID == clientID && !token.Revoked {
			token.Revoked = true
			token.RevokedAt = &now
			s.refreshTokens[key] = token
		}
	}
	return nil
}
