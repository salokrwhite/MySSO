package audit

import (
	"time"

	"github.com/google/uuid"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/service/common/deps"
)

type AuditService struct {
	deps *deps.Deps
}

type Service = AuditService

func New(dependencies *deps.Deps) *Service {
	return &AuditService{deps: dependencies}
}

func (s *AuditService) Record(actorID string, role domain.Role, action, targetID string, detail map[string]any) {
	s.deps.Store.AppendAudit(domain.AuditLog{
		ID:        uuid.NewString(),
		ActorID:   actorID,
		ActorRole: role,
		Action:    action,
		TargetID:  targetID,
		Detail:    detail,
		CreatedAt: time.Now().UTC(),
	})
}
