package auth

import (
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/service/audit"
	"mysso/backend/internal/service/common/authutil"
	"mysso/backend/internal/service/common/deps"
)

func createLoginSession(dependencies *deps.Deps, auditService *audit.Service, userData domain.User, ip, acr string) (domain.Session, domain.User, error) {
	if !authutil.AllowsAuthenticatedAccess(userData) {
		return domain.Session{}, domain.User{}, fmt.Errorf("user status is %s", userData.Status)
	}
	now := time.Now().UTC()
	userData.LastLoginAt = &now
	userData.LastDeviceIP = ip
	_ = dependencies.Store.UpdateUser(userData)

	session := domain.Session{
		Token:           uuid.NewString(),
		UserID:          userData.ID,
		Role:            userData.Role,
		AuthenticatedAt: now,
		ACR:             acr,
		ExpiresAt:       now.Add(24 * time.Hour),
	}
	dependencies.Store.CreateSession(session)
	auditService.Record(userData.ID, userData.Role, "user.login", userData.ID, map[string]any{"ip": ip, "acr": acr})
	settings, _ := dependencies.Store.GetSettings("site_name", "frontend_base_url", "public_base_url")
	siteName := strings.TrimSpace(settings["site_name"])
	if siteName == "" {
		siteName = "MySSO"
	}
	frontendBaseURL := strings.TrimSpace(settings["frontend_base_url"])
	if frontendBaseURL == "" {
		frontendBaseURL = strings.TrimSpace(dependencies.Cfg.HTTP.FrontendBase)
	}
	publicBaseURL := strings.TrimSpace(settings["public_base_url"])
	if publicBaseURL == "" {
		publicBaseURL = strings.TrimSpace(dependencies.Cfg.HTTP.PublicBase)
	}
	dependencies.AppendUserOperationLog(userData.ID, "user.login", userData.ID, map[string]any{
		"ip":                ip,
		"acr":               acr,
		"site_name":         siteName,
		"frontend_base_url": frontendBaseURL,
		"public_base_url":   publicBaseURL,
	})
	return session, userData, nil
}

func cancelUserDeletion(dependencies *deps.Deps, auditService *audit.Service, userData domain.User, method string) (domain.User, error) {
	if userData.DeletionScheduledAt == nil {
		return userData, nil
	}
	userData.DeletionRequestedAt = nil
	userData.DeletionScheduledAt = nil
	if err := dependencies.Store.UpdateUser(userData); err != nil {
		return domain.User{}, err
	}
	auditService.Record(userData.ID, userData.Role, "user.account.deletion_cancelled", userData.ID, map[string]any{
		"method": method,
	})
	return userData, nil
}
