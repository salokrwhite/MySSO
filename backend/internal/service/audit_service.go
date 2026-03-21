package service

import (
	"time"

	"github.com/google/uuid"

	"mysso/backend/internal/domain"
)

type AuditService struct {
	deps *serviceDeps
}

func (s *AuditService) Record(actorID string, role domain.Role, action, targetID string, detail map[string]any) {
	s.deps.store.AppendAudit(domain.AuditLog{
		ID:        uuid.NewString(),
		ActorID:   actorID,
		ActorRole: role,
		Action:    action,
		TargetID:  targetID,
		Detail:    detail,
		CreatedAt: time.Now().UTC(),
	})
}
