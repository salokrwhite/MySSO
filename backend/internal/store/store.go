package store

import (
	"time"

	"mysso/backend/internal/domain"
)

type CleanupPlan struct {
	ExpiredBefore          time.Time
	RevokedConsentBefore   time.Time
	RateLimitEventBefore   time.Time
	PasskeyUsageLogBefore  time.Time
	EmailSendLogBefore     time.Time
	PhoneSendLogBefore     time.Time
	AuditLogBefore         time.Time
	UserOperationLogBefore time.Time
}

type Store interface {
	CreateUser(user domain.User) error
	FindUserByEmail(email string) (domain.User, error)
	FindUserByPhone(phone string) (domain.User, error)
	GetUser(id string) (domain.User, error)
	ListUsers() []domain.User
	UpdateUser(user domain.User) error
	UpdateUserAndInvalidateAuth(user domain.User) error
	DeleteUser(id string) error
	SaveEmailVerificationCode(code domain.EmailVerificationCode) error
	GetEmailVerificationCode(email, purpose, code string) (domain.EmailVerificationCode, error)
	GetLatestEmailVerificationCode(email, purpose string) (domain.EmailVerificationCode, error)
	ConsumeEmailVerificationCode(id string) error
	SaveSMSVerificationCode(code domain.SMSVerificationCode) error
	GetSMSVerificationCode(phone, purpose, code string) (domain.SMSVerificationCode, error)
	GetLatestSMSVerificationCode(phone, purpose string) (domain.SMSVerificationCode, error)
	ConsumeSMSVerificationCode(id string) error
	GetRateLimitCounter(counterKey string) (domain.RateLimitCounter, error)
	IncrementRateLimitCounter(counterKey, windowType string, windowStartedAt, expiresAt time.Time, delta int) (domain.RateLimitCounter, error)
	SetRateLimitCounter(counter domain.RateLimitCounter) error
	DeleteRateLimitCounter(counterKey string) error
	CountActiveRateLimitCountersByPrefix(prefix string, now time.Time) (int, error)
	SaveRequestChallenge(challenge domain.RequestChallenge) error
	GetRequestChallenge(token string) (domain.RequestChallenge, error)
	ConsumeRequestChallenge(token string, consumedAt time.Time) error
	AppendRateLimitEvent(event domain.RateLimitEvent) error
	ListRateLimitEvents() []domain.RateLimitEvent
	DeleteRateLimitEvents(ids []string) error
	SaveMFALoginChallenge(challenge domain.MFALoginChallenge) error
	GetMFALoginChallenge(token string) (domain.MFALoginChallenge, error)
	DeleteMFALoginChallenge(token string) error
	ListPasskeysByUser(userID string) ([]domain.Passkey, error)
	ListAllPasskeys() []domain.Passkey
	GetPasskeyByID(id string) (domain.Passkey, error)
	GetPasskeyByCredentialID(credentialID string) (domain.Passkey, error)
	CreatePasskey(passkey domain.Passkey) error
	UpdatePasskeyUsage(passkeyID string, signCount uint32, lastUsedAt time.Time, credentialJSON string) error
	DeletePasskey(userID, passkeyID string) error
	DeletePasskeys(ids []string) error
	SavePasskeyRegistrationChallenge(challenge domain.PasskeyRegistrationChallenge) error
	GetPasskeyRegistrationChallenge(token string) (domain.PasskeyRegistrationChallenge, error)
	DeletePasskeyRegistrationChallenge(token string) error
	ListPasskeyRegistrationChallenges() []domain.PasskeyRegistrationChallenge
	DeletePasskeyRegistrationChallenges(tokens []string) error
	SavePasskeyLoginChallenge(challenge domain.PasskeyLoginChallenge) error
	GetPasskeyLoginChallenge(token string) (domain.PasskeyLoginChallenge, error)
	DeletePasskeyLoginChallenge(token string) error
	ListPasskeyLoginChallenges() []domain.PasskeyLoginChallenge
	DeletePasskeyLoginChallenges(tokens []string) error
	AppendPasskeyUsageLog(log domain.PasskeyUsageLog) error
	ListPasskeyUsageLogs() []domain.PasskeyUsageLog
	ListPasskeyUsageLogsByUser(userID string) []domain.PasskeyUsageLog
	DeletePasskeyUsageLogs(ids []string) error
	SavePhoneBindingChallenge(challenge domain.PhoneBindingChallenge) error
	GetPhoneBindingChallenge(token string) (domain.PhoneBindingChallenge, error)
	DeletePhoneBindingChallenge(token string) error
	GetUserSecurityPolicy(userID string) (domain.UserSecurityPolicy, error)
	UpsertUserSecurityPolicy(policy domain.UserSecurityPolicy) error
	DeleteUserSecurityPolicy(userID string) error
	SaveLoginStepUpChallenge(challenge domain.LoginStepUpChallenge) error
	GetLoginStepUpChallenge(token string) (domain.LoginStepUpChallenge, error)
	DeleteLoginStepUpChallenge(token string) error
	SaveLoginMFAEnrollmentChallenge(challenge domain.LoginMFAEnrollmentChallenge) error
	GetLoginMFAEnrollmentChallenge(token string) (domain.LoginMFAEnrollmentChallenge, error)
	DeleteLoginMFAEnrollmentChallenge(token string) error
	SaveDeletionLoginChallenge(challenge domain.DeletionLoginChallenge) error
	GetDeletionLoginChallenge(token string) (domain.DeletionLoginChallenge, error)
	DeleteDeletionLoginChallenge(token string) error
	CreateSession(session domain.Session)
	GetSession(token string) (domain.Session, error)
	DeleteSession(token string) error
	DeleteSessionsByUser(userID string) error
	ListAppsByOwner(ownerID string) []domain.ClientApp
	ListApps() []domain.ClientApp
	CreateApp(app domain.ClientApp) domain.ClientApp
	UpdateApp(app domain.ClientApp) error
	DeleteApp(id string) error
	FindAppByClientID(clientID string) (domain.ClientApp, error)
	GetApp(id string) (domain.ClientApp, error)
	SaveAuthorizationCode(code domain.AuthorizationCode)
	ConsumeAuthorizationCode(value, clientID, redirectURI, expectedCodeChallenge string) (domain.AuthorizationCode, error)
	SaveConsent(consent domain.Consent)
	ListConsentsByUser(userID string) []domain.Consent
	RevokeConsent(id string) error
	SaveRefreshToken(token domain.RefreshToken)
	GetRefreshToken(value string) (domain.RefreshToken, error)
	RotateRefreshToken(oldToken, expectedClientID string, next domain.RefreshToken) (domain.RefreshToken, error)
	RevokeRefreshToken(value string) error
	RevokeRefreshTokensByUser(userID string) error
	RevokeRefreshTokensByUserClient(userID, clientID string) error
	AppendAudit(log domain.AuditLog)
	ListAudit() []domain.AuditLog
	DeleteAuditLogs(ids []string) error
	AppendUserOperationLog(log domain.UserOperationLog)
	ListUserOperationLogs(userID string, page, pageSize int) ([]domain.UserOperationLog, int, error)
	DeleteUserOperationLogs(userID string, startAt, endAt *time.Time) (int64, error)
	AppendEmailSendLog(log domain.EmailSendLog)
	ListEmailSendLogs() []domain.EmailSendLog
	DeleteEmailSendLogs(ids []string) error
	AppendPhoneSendLog(log domain.PhoneSendLog)
	ListPhoneSendLogs() []domain.PhoneSendLog
	DeletePhoneSendLogs(ids []string) error
	ListPolicies() []domain.GatewayPolicy
	ListScopes() []domain.ScopeDefinition
	GetScope(key string) (domain.ScopeDefinition, error)
	UpsertScope(scope domain.ScopeDefinition) error
	DeleteScope(key string) error
	CountAppsByScope(scope string) (int, error)
	GetSettings(keys ...string) (map[string]string, error)
	UpsertSettings(values map[string]string) error
	ListUsersPendingDeletion(before time.Time) ([]domain.User, error)
	CleanupRuntimeData(plan CleanupPlan) error
}
