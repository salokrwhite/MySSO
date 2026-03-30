package user

import (
	"mysso/backend/internal/domain"
	"mysso/backend/internal/service/common/authutil"
	"mysso/backend/internal/service/ratelimit"
)

type userAttemptAuditContext struct {
	Kind       string
	Identifier string
	IP         string
	DeviceID   string
	User       *domain.User
}

func (s *UserService) checkUserAttempt(ctx userAttemptAuditContext) error {
	if s.rateLimit == nil {
		return nil
	}
	if err := s.rateLimit.CheckAuthAttempt(ratelimit.AuthAttemptOptions{
		Kind:       ctx.Kind,
		Identifier: ctx.Identifier,
		IP:         ctx.IP,
		DeviceID:   ctx.DeviceID,
	}); err != nil {
		s.auditUserAttempt(ctx, "blocked", "rate_limited")
		return err
	}
	return nil
}

func (s *UserService) resetUserAttempt(ctx userAttemptAuditContext) {
	if s.rateLimit == nil {
		return
	}
	_ = s.rateLimit.ResetAuthAttempts(ratelimit.AuthAttemptOptions{
		Kind:       ctx.Kind,
		Identifier: ctx.Identifier,
		IP:         ctx.IP,
		DeviceID:   ctx.DeviceID,
	})
}

func (s *UserService) failUserAttempt(ctx userAttemptAuditContext, reason string) error {
	s.auditUserAttempt(ctx, "failed", reason)
	if s.rateLimit == nil {
		return nil
	}
	if err := s.rateLimit.RecordFailedAuthAttempt(ratelimit.AuthAttemptOptions{
		Kind:       ctx.Kind,
		Identifier: ctx.Identifier,
		IP:         ctx.IP,
		DeviceID:   ctx.DeviceID,
	}); err != nil {
		s.auditUserAttempt(ctx, "blocked", "rate_limited")
		return err
	}
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
