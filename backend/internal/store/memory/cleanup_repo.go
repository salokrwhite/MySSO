package memory

import (
	"time"

	"mysso/backend/internal/domain"
)

func (s *MemoryStore) CleanupRuntimeData(plan CleanupPlan) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for token, session := range s.sessions {
		if session.ExpiresAt.Before(plan.ExpiredBefore) {
			delete(s.sessions, token)
		}
	}

	for code, item := range s.authCodes {
		if item.Used || item.ExpiresAt.Before(plan.ExpiredBefore) {
			delete(s.authCodes, code)
		}
	}

	for token, item := range s.refreshTokens {
		if item.ExpiresAt.Before(plan.ExpiredBefore) {
			delete(s.refreshTokens, token)
		}
	}

	for id, item := range s.consents {
		if !item.RevokedAt.IsZero() && item.RevokedAt.Before(plan.RevokedConsentBefore) {
			delete(s.consents, id)
		}
	}

	for id, item := range s.emailCodes {
		if item.ExpiresAt.Before(plan.ExpiredBefore) {
			delete(s.emailCodes, id)
		}
	}

	for id, item := range s.smsCodes {
		if item.ExpiresAt.Before(plan.ExpiredBefore) {
			delete(s.smsCodes, id)
		}
	}

	for key, item := range s.rateLimitCounters {
		if item.ExpiresAt.Before(plan.ExpiredBefore) {
			delete(s.rateLimitCounters, key)
		}
	}

	for token, item := range s.requestChallenges {
		if item.ExpiresAt.Before(plan.ExpiredBefore) || item.ConsumedAt != nil {
			delete(s.requestChallenges, token)
		}
	}

	for token, item := range s.mfaChallenges {
		if item.ExpiresAt.Before(plan.ExpiredBefore) {
			delete(s.mfaChallenges, token)
		}
	}

	for token, item := range s.passkeyRegChallenges {
		if item.ExpiresAt.Before(plan.ExpiredBefore) {
			delete(s.passkeyRegChallenges, token)
		}
	}

	for token, item := range s.passkeyLoginChallenges {
		if item.ExpiresAt.Before(plan.ExpiredBefore) {
			delete(s.passkeyLoginChallenges, token)
		}
	}

	for token, item := range s.phoneBindingChallenges {
		if item.ExpiresAt.Before(plan.ExpiredBefore) {
			delete(s.phoneBindingChallenges, token)
		}
	}

	for token, item := range s.loginStepUpChallenges {
		if item.ExpiresAt.Before(plan.ExpiredBefore) {
			delete(s.loginStepUpChallenges, token)
		}
	}

	for token, item := range s.mfaEnrollmentChallenges {
		if item.ExpiresAt.Before(plan.ExpiredBefore) {
			delete(s.mfaEnrollmentChallenges, token)
		}
	}

	for token, item := range s.deletionLoginChallenges {
		if item.ExpiresAt.Before(plan.ExpiredBefore) {
			delete(s.deletionLoginChallenges, token)
		}
	}

	s.rateLimitEvents = filterRateLimitEventsByCreatedAt(s.rateLimitEvents, plan.RateLimitEventBefore)
	s.passkeyUsageLogs = filterPasskeyUsageLogsByCreatedAt(s.passkeyUsageLogs, plan.PasskeyUsageLogBefore)
	s.emailSendLogs = filterEmailSendLogsByCreatedAt(s.emailSendLogs, plan.EmailSendLogBefore)
	s.phoneSendLogs = filterPhoneSendLogsByCreatedAt(s.phoneSendLogs, plan.PhoneSendLogBefore)
	s.auditLogs = filterAuditLogsByCreatedAt(s.auditLogs, plan.AuditLogBefore)
	s.userOperationLogs = filterUserOperationLogsByCreatedAt(s.userOperationLogs, plan.UserOperationLogBefore)

	return nil
}

func filterRateLimitEventsByCreatedAt(items []domain.RateLimitEvent, cutoff time.Time) []domain.RateLimitEvent {
	filtered := make([]domain.RateLimitEvent, 0, len(items))
	for _, item := range items {
		if !item.CreatedAt.Before(cutoff) {
			filtered = append(filtered, item)
		}
	}
	return filtered
}

func filterPasskeyUsageLogsByCreatedAt(items []domain.PasskeyUsageLog, cutoff time.Time) []domain.PasskeyUsageLog {
	filtered := make([]domain.PasskeyUsageLog, 0, len(items))
	for _, item := range items {
		if !item.CreatedAt.Before(cutoff) {
			filtered = append(filtered, item)
		}
	}
	return filtered
}

func filterEmailSendLogsByCreatedAt(items []domain.EmailSendLog, cutoff time.Time) []domain.EmailSendLog {
	filtered := make([]domain.EmailSendLog, 0, len(items))
	for _, item := range items {
		if !item.CreatedAt.Before(cutoff) {
			filtered = append(filtered, item)
		}
	}
	return filtered
}

func filterPhoneSendLogsByCreatedAt(items []domain.PhoneSendLog, cutoff time.Time) []domain.PhoneSendLog {
	filtered := make([]domain.PhoneSendLog, 0, len(items))
	for _, item := range items {
		if !item.CreatedAt.Before(cutoff) {
			filtered = append(filtered, item)
		}
	}
	return filtered
}

func filterAuditLogsByCreatedAt(items []domain.AuditLog, cutoff time.Time) []domain.AuditLog {
	filtered := make([]domain.AuditLog, 0, len(items))
	for _, item := range items {
		if !item.CreatedAt.Before(cutoff) {
			filtered = append(filtered, item)
		}
	}
	return filtered
}

func filterUserOperationLogsByCreatedAt(items []domain.UserOperationLog, cutoff time.Time) []domain.UserOperationLog {
	filtered := make([]domain.UserOperationLog, 0, len(items))
	for _, item := range items {
		if !item.CreatedAt.Before(cutoff) {
			filtered = append(filtered, item)
		}
	}
	return filtered
}
