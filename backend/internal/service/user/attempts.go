package user

import (
	"mysso/backend/internal/domain"
	"mysso/backend/internal/service/common/authutil"
)

type userAttemptAuditContext struct {
	Kind       string
	Identifier string
	IP         string
	DeviceID   string
	User       *domain.User
}

func (s *UserService) checkUserAttempt(ctx userAttemptAuditContext) error {
	return nil
}

func (s *UserService) resetUserAttempt(ctx userAttemptAuditContext) {
}

func (s *UserService) failUserAttempt(ctx userAttemptAuditContext, reason string) error {
	s.auditUserAttempt(ctx, "failed", reason)
	return nil
}

func (s *UserService) auditUserAttempt(ctx userAttemptAuditContext, outcome, reason string) {
	actorID := ""
	actorRole := domain.Role("")
	targetID := authutil.HashValue(ctx.Identifier)
	if ctx.User != nil {
		actorID = ctx.User.ID
		actorRole = ctx.User.Role
		targetID = ctx.User.ID
	}
	s.audit.Record(actorID, actorRole, "user."+ctx.Kind+"."+outcome, targetID, map[string]any{
		"reason":          reason,
		"identifier_hash": authutil.HashValue(ctx.Identifier),
		"ip":              ctx.IP,
		"device_hash":     authutil.HashValue(ctx.DeviceID),
	})
}
