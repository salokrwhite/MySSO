package store

import (
	"testing"
	"time"

	"mysso/backend/internal/domain"
)

func TestMemoryStoreCleanupRuntimeDataRemovesExpiredArtifactsAndRetainsLiveSecurityData(t *testing.T) {
	s := NewMemoryStore("654321")
	now := time.Now().UTC()

	s.sessions["expired-session"] = domain.Session{Token: "expired-session", ExpiresAt: now.Add(-time.Minute)}
	s.sessions["active-session"] = domain.Session{Token: "active-session", ExpiresAt: now.Add(time.Hour)}

	s.authCodes["expired-code"] = domain.AuthorizationCode{Code: "expired-code", ExpiresAt: now.Add(-time.Minute)}
	s.authCodes["used-code"] = domain.AuthorizationCode{Code: "used-code", Used: true, ExpiresAt: now.Add(time.Hour)}
	s.authCodes["active-code"] = domain.AuthorizationCode{Code: "active-code", ExpiresAt: now.Add(time.Hour)}

	s.refreshTokens["expired-refresh"] = domain.RefreshToken{Token: "expired-refresh", ExpiresAt: now.Add(-time.Minute)}
	revokedAt := now.Add(-time.Minute)
	s.refreshTokens["revoked-live-refresh"] = domain.RefreshToken{Token: "revoked-live-refresh", ExpiresAt: now.Add(time.Hour), Revoked: true, RevokedAt: &revokedAt}
	s.refreshTokens["active-refresh"] = domain.RefreshToken{Token: "active-refresh", ExpiresAt: now.Add(time.Hour)}

	s.consents["old-revoked-consent"] = domain.Consent{ID: "old-revoked-consent", RevokedAt: now.Add(-366 * 24 * time.Hour)}
	s.consents["recent-revoked-consent"] = domain.Consent{ID: "recent-revoked-consent", RevokedAt: now.Add(-24 * time.Hour)}
	s.consents["active-consent"] = domain.Consent{ID: "active-consent"}

	s.emailCodes["expired-email"] = domain.EmailVerificationCode{ID: "expired-email", ExpiresAt: now.Add(-time.Minute), Consumed: true}
	s.emailCodes["active-email"] = domain.EmailVerificationCode{ID: "active-email", ExpiresAt: now.Add(time.Hour)}
	s.smsCodes["expired-sms"] = domain.SMSVerificationCode{ID: "expired-sms", ExpiresAt: now.Add(-time.Minute), Consumed: true}
	s.smsCodes["active-sms"] = domain.SMSVerificationCode{ID: "active-sms", ExpiresAt: now.Add(time.Hour)}

	s.rateLimitCounters["expired-counter"] = domain.RateLimitCounter{CounterKey: "expired-counter", ExpiresAt: now.Add(-time.Minute)}
	s.rateLimitCounters["active-counter"] = domain.RateLimitCounter{CounterKey: "active-counter", ExpiresAt: now.Add(time.Hour)}

	consumedAt := now.Add(-time.Minute)
	s.requestChallenges["expired-request"] = domain.RequestChallenge{Token: "expired-request", ExpiresAt: now.Add(-time.Minute)}
	s.requestChallenges["consumed-request"] = domain.RequestChallenge{Token: "consumed-request", ExpiresAt: now.Add(time.Hour), ConsumedAt: &consumedAt}
	s.requestChallenges["active-request"] = domain.RequestChallenge{Token: "active-request", ExpiresAt: now.Add(time.Hour)}

	s.mfaChallenges["expired-mfa"] = domain.MFALoginChallenge{Token: "expired-mfa", ExpiresAt: now.Add(-time.Minute)}
	s.mfaChallenges["active-mfa"] = domain.MFALoginChallenge{Token: "active-mfa", ExpiresAt: now.Add(time.Hour)}
	s.deletionLoginChallenges["expired-deletion"] = domain.DeletionLoginChallenge{Token: "expired-deletion", ExpiresAt: now.Add(-time.Minute)}
	s.deletionLoginChallenges["active-deletion"] = domain.DeletionLoginChallenge{Token: "active-deletion", ExpiresAt: now.Add(time.Hour)}
	s.passkeyRegChallenges["expired-passkey-reg"] = domain.PasskeyRegistrationChallenge{Token: "expired-passkey-reg", ExpiresAt: now.Add(-time.Minute)}
	s.passkeyRegChallenges["active-passkey-reg"] = domain.PasskeyRegistrationChallenge{Token: "active-passkey-reg", ExpiresAt: now.Add(time.Hour)}
	s.passkeyLoginChallenges["expired-passkey-login"] = domain.PasskeyLoginChallenge{Token: "expired-passkey-login", ExpiresAt: now.Add(-time.Minute)}
	s.passkeyLoginChallenges["active-passkey-login"] = domain.PasskeyLoginChallenge{Token: "active-passkey-login", ExpiresAt: now.Add(time.Hour)}
	s.phoneBindingChallenges["expired-phone"] = domain.PhoneBindingChallenge{Token: "expired-phone", ExpiresAt: now.Add(-time.Minute)}
	s.phoneBindingChallenges["active-phone"] = domain.PhoneBindingChallenge{Token: "active-phone", ExpiresAt: now.Add(time.Hour)}
	s.loginStepUpChallenges["expired-step-up"] = domain.LoginStepUpChallenge{Token: "expired-step-up", ExpiresAt: now.Add(-time.Minute)}
	s.loginStepUpChallenges["active-step-up"] = domain.LoginStepUpChallenge{Token: "active-step-up", ExpiresAt: now.Add(time.Hour)}
	s.mfaEnrollmentChallenges["expired-enroll"] = domain.LoginMFAEnrollmentChallenge{Token: "expired-enroll", ExpiresAt: now.Add(-time.Minute)}
	s.mfaEnrollmentChallenges["active-enroll"] = domain.LoginMFAEnrollmentChallenge{Token: "active-enroll", ExpiresAt: now.Add(time.Hour)}

	s.rateLimitEvents = []domain.RateLimitEvent{
		{ID: "old-rate", CreatedAt: now.Add(-31 * 24 * time.Hour)},
		{ID: "live-rate", CreatedAt: now.Add(-24 * time.Hour)},
	}
	s.passkeyUsageLogs = []domain.PasskeyUsageLog{
		{ID: "old-passkey-log", CreatedAt: now.Add(-181 * 24 * time.Hour)},
		{ID: "live-passkey-log", CreatedAt: now.Add(-24 * time.Hour)},
	}
	s.emailSendLogs = []domain.EmailSendLog{
		{ID: "old-email-log", CreatedAt: now.Add(-91 * 24 * time.Hour)},
		{ID: "live-email-log", CreatedAt: now.Add(-24 * time.Hour)},
	}
	s.phoneSendLogs = []domain.PhoneSendLog{
		{ID: "old-phone-log", CreatedAt: now.Add(-91 * 24 * time.Hour)},
		{ID: "live-phone-log", CreatedAt: now.Add(-24 * time.Hour)},
	}
	s.auditLogs = []domain.AuditLog{
		{ID: "old-audit-log", CreatedAt: now.Add(-366 * 24 * time.Hour)},
		{ID: "live-audit-log", CreatedAt: now.Add(-24 * time.Hour)},
	}
	s.userOperationLogs = []domain.UserOperationLog{
		{ID: "old-user-log", CreatedAt: now.Add(-366 * 24 * time.Hour)},
		{ID: "live-user-log", CreatedAt: now.Add(-24 * time.Hour)},
	}

	err := s.CleanupRuntimeData(CleanupPlan{
		ExpiredBefore:          now,
		RevokedConsentBefore:   now.Add(-365 * 24 * time.Hour),
		RateLimitEventBefore:   now.Add(-30 * 24 * time.Hour),
		PasskeyUsageLogBefore:  now.Add(-180 * 24 * time.Hour),
		EmailSendLogBefore:     now.Add(-90 * 24 * time.Hour),
		PhoneSendLogBefore:     now.Add(-90 * 24 * time.Hour),
		AuditLogBefore:         now.Add(-365 * 24 * time.Hour),
		UserOperationLogBefore: now.Add(-365 * 24 * time.Hour),
	})
	if err != nil {
		t.Fatalf("CleanupRuntimeData returned error: %v", err)
	}

	assertMissing(t, s.sessions, "expired-session")
	assertPresent(t, s.sessions, "active-session")

	assertMissing(t, s.authCodes, "expired-code")
	assertMissing(t, s.authCodes, "used-code")
	assertPresent(t, s.authCodes, "active-code")

	assertMissing(t, s.refreshTokens, "expired-refresh")
	assertPresent(t, s.refreshTokens, "revoked-live-refresh")
	assertPresent(t, s.refreshTokens, "active-refresh")

	assertMissing(t, s.consents, "old-revoked-consent")
	assertPresent(t, s.consents, "recent-revoked-consent")
	assertPresent(t, s.consents, "active-consent")

	assertMissing(t, s.emailCodes, "expired-email")
	assertPresent(t, s.emailCodes, "active-email")
	assertMissing(t, s.smsCodes, "expired-sms")
	assertPresent(t, s.smsCodes, "active-sms")

	assertMissing(t, s.rateLimitCounters, "expired-counter")
	assertPresent(t, s.rateLimitCounters, "active-counter")

	assertMissing(t, s.requestChallenges, "expired-request")
	assertMissing(t, s.requestChallenges, "consumed-request")
	assertPresent(t, s.requestChallenges, "active-request")

	assertMissing(t, s.mfaChallenges, "expired-mfa")
	assertPresent(t, s.mfaChallenges, "active-mfa")
	assertMissing(t, s.deletionLoginChallenges, "expired-deletion")
	assertPresent(t, s.deletionLoginChallenges, "active-deletion")
	assertMissing(t, s.passkeyRegChallenges, "expired-passkey-reg")
	assertPresent(t, s.passkeyRegChallenges, "active-passkey-reg")
	assertMissing(t, s.passkeyLoginChallenges, "expired-passkey-login")
	assertPresent(t, s.passkeyLoginChallenges, "active-passkey-login")
	assertMissing(t, s.phoneBindingChallenges, "expired-phone")
	assertPresent(t, s.phoneBindingChallenges, "active-phone")
	assertMissing(t, s.loginStepUpChallenges, "expired-step-up")
	assertPresent(t, s.loginStepUpChallenges, "active-step-up")
	assertMissing(t, s.mfaEnrollmentChallenges, "expired-enroll")
	assertPresent(t, s.mfaEnrollmentChallenges, "active-enroll")

	if len(s.rateLimitEvents) != 1 || s.rateLimitEvents[0].ID != "live-rate" {
		t.Fatalf("unexpected rate limit events after cleanup: %+v", s.rateLimitEvents)
	}
	if len(s.passkeyUsageLogs) != 1 || s.passkeyUsageLogs[0].ID != "live-passkey-log" {
		t.Fatalf("unexpected passkey usage logs after cleanup: %+v", s.passkeyUsageLogs)
	}
	if len(s.emailSendLogs) != 1 || s.emailSendLogs[0].ID != "live-email-log" {
		t.Fatalf("unexpected email send logs after cleanup: %+v", s.emailSendLogs)
	}
	if len(s.phoneSendLogs) != 1 || s.phoneSendLogs[0].ID != "live-phone-log" {
		t.Fatalf("unexpected phone send logs after cleanup: %+v", s.phoneSendLogs)
	}
	if len(s.auditLogs) != 1 || s.auditLogs[0].ID != "live-audit-log" {
		t.Fatalf("unexpected audit logs after cleanup: %+v", s.auditLogs)
	}
	if len(s.userOperationLogs) != 1 || s.userOperationLogs[0].ID != "live-user-log" {
		t.Fatalf("unexpected user operation logs after cleanup: %+v", s.userOperationLogs)
	}
}

func assertPresent[T any](t *testing.T, items map[string]T, key string) {
	t.Helper()
	if _, ok := items[key]; !ok {
		t.Fatalf("expected %q to be present", key)
	}
}

func assertMissing[T any](t *testing.T, items map[string]T, key string) {
	t.Helper()
	if _, ok := items[key]; ok {
		t.Fatalf("expected %q to be removed", key)
	}
}
