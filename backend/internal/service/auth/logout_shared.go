package auth

import (
	"strings"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/service/common/deps"
)

func InvalidateSessionAuthState(dependencies *deps.Deps, sessionToken string) (domain.Session, bool, error) {
	sessionToken = strings.TrimSpace(sessionToken)
	if sessionToken == "" {
		return domain.Session{}, false, nil
	}

	session, err := dependencies.Store.GetSession(sessionToken)
	if err == nil {
		if userID := strings.TrimSpace(session.UserID); userID != "" {
			if err := dependencies.Store.RevokeRefreshTokensByUser(userID); err != nil {
				return domain.Session{}, false, err
			}
		}
	}

	if err := dependencies.Store.DeleteSession(sessionToken); err != nil {
		return domain.Session{}, false, nil
	}

	return session, strings.TrimSpace(session.UserID) != "", nil
}
