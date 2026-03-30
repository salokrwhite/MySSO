package auth

import (
	"mysso/backend/internal/domain"
	"mysso/backend/internal/service/common/authutil"
	"mysso/backend/internal/service/ratelimit"
)

type authAttemptAuditContext struct {
	Kind       string
	Identifier string
	IP         string
	DeviceID   string
	User       *domain.User
}

func (s *AuthService) checkAuthAttempt(ctx authAttemptAuditContext) error {
	if s.rateLimit == nil {
		return nil
	}
	if err := s.rateLimit.CheckAuthAttempt(ratelimit.AuthAttemptOptions{
		Kind:       ctx.Kind,
		Identifier: ctx.Identifier,
		IP:         ctx.IP,
		DeviceID:   ctx.DeviceID,
	}); err != nil {
		s.auditAuthAttempt(ctx, "blocked", "rate_limited")
		return err
	}
	return nil
}

func (s *AuthService) resetAuthAttempt(ctx authAttemptAuditContext) {
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

func (s *AuthService) failAuthAttempt(ctx authAttemptAuditContext, reason string) error {
	s.auditAuthAttempt(ctx, "failed", reason)
	if s.rateLimit == nil {
		return nil
	}
	if err := s.rateLimit.RecordFailedAuthAttempt(ratelimit.AuthAttemptOptions{
		Kind:       ctx.Kind,
		Identifier: ctx.Identifier,
		IP:         ctx.IP,
		DeviceID:   ctx.DeviceID,
	}); err != nil {
		s.auditAuthAttempt(ctx, "blocked", "rate_limited")
		return err
	}
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
