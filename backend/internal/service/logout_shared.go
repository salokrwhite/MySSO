package service

import (
	"strings"

	"mysso/backend/internal/domain"
)

func invalidateSessionAuthState(deps *serviceDeps, sessionToken string) (domain.Session, bool, error) {
	sessionToken = strings.TrimSpace(sessionToken)
	if sessionToken == "" {
		return domain.Session{}, false, nil
	}

	session, err := deps.store.GetSession(sessionToken)
	if err == nil {
		if userID := strings.TrimSpace(session.UserID); userID != "" {
			if err := deps.store.RevokeRefreshTokensByUser(userID); err != nil {
				return domain.Session{}, false, err
			}
		}
	}

	if err := deps.store.DeleteSession(sessionToken); err != nil {
		return domain.Session{}, false, nil
	}

	return session, strings.TrimSpace(session.UserID) != "", nil
}
