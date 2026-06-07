package auth

import (
	"mysso/backend/internal/domain"
	"mysso/backend/internal/service/common/authutil"
)

type authAttemptAuditContext struct {
	Kind       string
	Identifier string
	IP         string
	DeviceID   string
	User       *domain.User
}

func (s *AuthService) checkAuthAttempt(ctx authAttemptAuditContext) error {
	if ctx.User != nil && ctx.User.Role == domain.RoleAdmin {
		return nil
	}
	if s.risk != nil {
		return s.risk.CheckAttempt(ctx.Identifier, ctx.IP)
	}
	return nil
}

func (s *AuthService) resetAuthAttempt(ctx authAttemptAuditContext) {
}

func (s *AuthService) failAuthAttempt(ctx authAttemptAuditContext, reason string) error {
	if s.risk != nil && (ctx.User == nil || ctx.User.Role != domain.RoleAdmin) {
		userID := ""
		if ctx.User != nil {
			userID = ctx.User.ID
		}
		s.risk.RecordFailedAttemptForUser(userID, ctx.Identifier, ctx.IP, ctx.DeviceID, ctx.Kind, reason)
	}
	s.auditAuthAttempt(ctx, "failed", reason)
	return nil
}

func (s *AuthService) auditAuthAttempt(ctx authAttemptAuditContext, outcome, reason string) {
	actorID := ""
	actorRole := domain.Role("")
	targetID := authutil.HashValue(ctx.Identifier)
	if ctx.User != nil {
		actorID = ctx.User.ID
		actorRole = ctx.User.Role
		targetID = ctx.User.ID
	}
	s.audit.Record(actorID, actorRole, "auth."+ctx.Kind+"."+outcome, targetID, map[string]any{
		"reason":          reason,
		"identifier_hash": authutil.HashValue(ctx.Identifier),
		"ip":              ctx.IP,
		"device_hash":     authutil.HashValue(ctx.DeviceID),
	})
}
