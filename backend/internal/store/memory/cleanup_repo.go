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

	for token, item := range s.authChallenges {
		if item.ExpiresAt.Before(plan.ExpiredBefore) || item.ConsumedAt != nil {
			delete(s.authChallenges, token)
		}
	}

	s.passkeyUsageLogs = filterPasskeyUsageLogsByCreatedAt(s.passkeyUsageLogs, plan.PasskeyUsageLogBefore)
	s.emailSendLogs = filterEmailSendLogsByCreatedAt(s.emailSendLogs, plan.EmailSendLogBefore)
	s.phoneSendLogs = filterPhoneSendLogsByCreatedAt(s.phoneSendLogs, plan.PhoneSendLogBefore)
	s.auditLogs = filterAuditLogsByCreatedAt(s.auditLogs, plan.AuditLogBefore)
	s.userOperationLogs = filterUserOperationLogsByCreatedAt(s.userOperationLogs, plan.UserOperationLogBefore)

	return nil
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
