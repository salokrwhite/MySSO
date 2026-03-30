package user

import (
	"time"

	"mysso/backend/internal/store"
)

const (
	revokedConsentRetention  = 365 * 24 * time.Hour
	rateLimitEventRetention  = 30 * 24 * time.Hour
	passkeyUsageLogRetention = 180 * 24 * time.Hour
	emailSendLogRetention    = 90 * 24 * time.Hour
	phoneSendLogRetention    = 90 * 24 * time.Hour
	auditLogRetention        = 365 * 24 * time.Hour
	userOperationRetention   = 365 * 24 * time.Hour
)

func (s *UserService) CleanupRuntimeData() error {
	now := time.Now().UTC()
	return s.deps.Store.CleanupRuntimeData(store.CleanupPlan{
		ExpiredBefore:          now,
		RevokedConsentBefore:   now.Add(-revokedConsentRetention),
		RateLimitEventBefore:   now.Add(-rateLimitEventRetention),
		PasskeyUsageLogBefore:  now.Add(-passkeyUsageLogRetention),
		EmailSendLogBefore:     now.Add(-emailSendLogRetention),
		PhoneSendLogBefore:     now.Add(-phoneSendLogRetention),
		AuditLogBefore:         now.Add(-auditLogRetention),
		UserOperationLogBefore: now.Add(-userOperationRetention),
	})
}
