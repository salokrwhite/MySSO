package service

import (
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"

	"mysso/backend/internal/domain"
)

func createLoginSession(deps *serviceDeps, audit *AuditService, user domain.User, ip, acr string) (domain.Session, domain.User, error) {
	if !userAllowsAuthenticatedAccess(user) {
		return domain.Session{}, domain.User{}, fmt.Errorf("user status is %s", user.Status)
	}
	now := time.Now().UTC()
	user.LastLoginAt = &now
	user.LastDeviceIP = ip
	_ = deps.store.UpdateUser(user)

	session := domain.Session{
		Token:           uuid.NewString(),
		UserID:          user.ID,
		Role:            user.Role,
		AuthenticatedAt: now,
		ACR:             acr,
		ExpiresAt:       now.Add(24 * time.Hour),
	}
	deps.store.CreateSession(session)
	audit.Record(user.ID, user.Role, "user.login", user.ID, map[string]any{"ip": ip, "acr": acr})
	settings, _ := deps.store.GetSettings("site_name", "frontend_base_url", "public_base_url")
	siteName := strings.TrimSpace(settings["site_name"])
	if siteName == "" {
		siteName = "MySSO"
	}
	frontendBaseURL := strings.TrimSpace(settings["frontend_base_url"])
	if frontendBaseURL == "" {
		frontendBaseURL = strings.TrimSpace(deps.cfg.HTTP.FrontendBase)
	}
	publicBaseURL := strings.TrimSpace(settings["public_base_url"])
	if publicBaseURL == "" {
		publicBaseURL = strings.TrimSpace(deps.cfg.HTTP.PublicBase)
	}
	deps.appendUserOperationLog(user.ID, "user.login", user.ID, map[string]any{
		"ip":                ip,
		"acr":               acr,
		"site_name":         siteName,
		"frontend_base_url": frontendBaseURL,
		"public_base_url":   publicBaseURL,
	})
	return session, user, nil
}

func cancelUserDeletion(deps *serviceDeps, audit *AuditService, user domain.User, method string) (domain.User, error) {
	if user.DeletionScheduledAt == nil {
		return user, nil
	}
	user.DeletionRequestedAt = nil
	user.DeletionScheduledAt = nil
	if err := deps.store.UpdateUser(user); err != nil {
		return domain.User{}, err
	}
	audit.Record(user.ID, user.Role, "user.account.deletion_cancelled", user.ID, map[string]any{
		"method": method,
	})
	return user, nil
}
