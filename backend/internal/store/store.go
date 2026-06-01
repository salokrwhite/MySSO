package store

import (
	"errors"
	"time"

	"mysso/backend/internal/domain"
)

var (
	ErrNotFound                         = errors.New("not found")
	ErrAuthorizationCodeUnavailable     = errors.New("authorization code unavailable")
	ErrAuthorizationCodeRequestMismatch = errors.New("authorization code request mismatch")
	ErrAuthorizationCodePKCEMismatch    = errors.New("authorization code pkce mismatch")
	ErrRefreshTokenClientMismatch       = errors.New("refresh token client mismatch")
	ErrRefreshTokenRevoked              = errors.New("refresh token revoked")
	ErrRefreshTokenReuseDetected        = errors.New("refresh token reuse detected")
	ErrRefreshTokenExpired              = errors.New("refresh token expired")
)

type CleanupPlan struct {
	ExpiredBefore          time.Time
	RevokedConsentBefore   time.Time
	PasskeyUsageLogBefore  time.Time
	EmailSendLogBefore     time.Time
	PhoneSendLogBefore     time.Time
	AuditLogBefore         time.Time
	UserOperationLogBefore time.Time
}

type UserStore interface {
	CreateUser(user domain.User) error
	FindUserByEmail(email string) (domain.User, error)
	FindUserByPhone(phone string) (domain.User, error)
	GetUser(id string) (domain.User, error)
	ListUsers() []domain.User
	ListUsersPaginated(page, pageSize int, emailKeyword, statusFilter, userID string) ([]domain.User, int, error)
	CountUsers(statusFilter string) (int, error)
	UpdateUser(user domain.User) error
	UpdateUserAndInvalidateAuth(user domain.User) error
	DeleteUser(id string) error
	ListUsersPendingDeletion(before time.Time) ([]domain.User, error)
}

type VerificationStore interface {
	SaveEmailVerificationCode(code domain.EmailVerificationCode) error
	GetEmailVerificationCode(email, purpose, code string) (domain.EmailVerificationCode, error)
	GetLatestEmailVerificationCode(email, purpose string) (domain.EmailVerificationCode, error)
	ConsumeEmailVerificationCode(id string) error
	SaveSMSVerificationCode(code domain.SMSVerificationCode) error
	GetSMSVerificationCode(phone, purpose, code string) (domain.SMSVerificationCode, error)
	GetLatestSMSVerificationCode(phone, purpose string) (domain.SMSVerificationCode, error)
	ConsumeSMSVerificationCode(id string) error
	SaveMFALoginChallenge(challenge domain.MFALoginChallenge) error
	GetMFALoginChallenge(token string) (domain.MFALoginChallenge, error)
	ConsumeMFALoginChallenge(token string, consumedAt time.Time) error
	DeleteMFALoginChallenge(token string) error
	SaveDeletionLoginChallenge(challenge domain.DeletionLoginChallenge) error
	GetDeletionLoginChallenge(token string) (domain.DeletionLoginChallenge, error)
	ConsumeDeletionLoginChallenge(token string, consumedAt time.Time) error
	DeleteDeletionLoginChallenge(token string) error
}

type PasskeyStore interface {
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
	ConsumePasskeyRegistrationChallenge(token string, consumedAt time.Time) error
	DeletePasskeyRegistrationChallenge(token string) error
	ListPasskeyRegistrationChallenges() []domain.PasskeyRegistrationChallenge
	DeletePasskeyRegistrationChallenges(tokens []string) error
	SavePasskeyLoginChallenge(challenge domain.PasskeyLoginChallenge) error
	GetPasskeyLoginChallenge(token string) (domain.PasskeyLoginChallenge, error)
	ConsumePasskeyLoginChallenge(token string, consumedAt time.Time) error
	DeletePasskeyLoginChallenge(token string) error
	ListPasskeyLoginChallenges() []domain.PasskeyLoginChallenge
	DeletePasskeyLoginChallenges(tokens []string) error
	AppendPasskeyUsageLog(log domain.PasskeyUsageLog) error
	ListPasskeyUsageLogs() []domain.PasskeyUsageLog
	ListPasskeyUsageLogsByUser(userID string) []domain.PasskeyUsageLog
	DeletePasskeyUsageLogs(ids []string) error
}

type PhoneBindingChallengeStore interface {
	SavePhoneBindingChallenge(challenge domain.PhoneBindingChallenge) error
	GetPhoneBindingChallenge(token string) (domain.PhoneBindingChallenge, error)
	ConsumePhoneBindingChallenge(token string, consumedAt time.Time) error
	DeletePhoneBindingChallenge(token string) error
}

type SecurityPolicyStore interface {
	GetUserSecurityPolicy(userID string) (domain.UserSecurityPolicy, error)
	UpsertUserSecurityPolicy(policy domain.UserSecurityPolicy) error
	UpdatePhoneBindingRiskState(userID, mode string, required bool, loginCount int) error
	DeleteUserSecurityPolicy(userID string) error
	SaveLoginStepUpChallenge(challenge domain.LoginStepUpChallenge) error
	GetLoginStepUpChallenge(token string) (domain.LoginStepUpChallenge, error)
	ConsumeLoginStepUpChallenge(token string, consumedAt time.Time) error
	DeleteLoginStepUpChallenge(token string) error
	SaveLoginMFAEnrollmentChallenge(challenge domain.LoginMFAEnrollmentChallenge) error
	GetLoginMFAEnrollmentChallenge(token string) (domain.LoginMFAEnrollmentChallenge, error)
	ConsumeLoginMFAEnrollmentChallenge(token string, consumedAt time.Time) error
	DeleteLoginMFAEnrollmentChallenge(token string) error
}

type SessionStore interface {
	CreateSession(session domain.Session)
	GetSession(token string) (domain.Session, error)
	DeleteSession(token string) error
	DeleteSessionsByUser(userID string) error
}

type AppStore interface {
	ListAppsByOwner(ownerID string) []domain.ClientApp
	ListApps() []domain.ClientApp
	ListAppsPaginated(page, pageSize int, statusFilter, nameKeyword string) ([]domain.ClientApp, int, error)
	CountApps(status string) (int, error)
	CreateApp(app domain.ClientApp) domain.ClientApp
	UpdateApp(app domain.ClientApp) error
	DeleteApp(id string) error
	FindAppByClientID(clientID string) (domain.ClientApp, error)
	GetApp(id string) (domain.ClientApp, error)
}

type OAuthStore interface {
	SaveAuthorizationCode(code domain.AuthorizationCode)
	ConsumeAuthorizationCode(value, clientID, redirectURI, expectedCodeChallenge string) (domain.AuthorizationCode, error)
	SaveConsent(consent domain.Consent)
	ListConsentsByUser(userID string) []domain.Consent
	ListConsentsByClientID(clientID string, includeRevoked bool) ([]domain.Consent, error)
	RevokeConsent(id string) error
	SaveRefreshToken(token domain.RefreshToken)
	GetRefreshToken(value string) (domain.RefreshToken, error)
	RotateRefreshToken(oldToken, expectedClientID string, next domain.RefreshToken) (domain.RefreshToken, error)
	RevokeRefreshToken(value string) error
	RevokeRefreshTokensByUser(userID string) error
	RevokeRefreshTokensByUserClient(userID, clientID string) error
}

type DeveloperAccessStore interface {
	ListDeveloperGroups(ownerUserID string) ([]domain.DeveloperGroup, error)
	GetDeveloperGroup(id string) (domain.DeveloperGroup, error)
	CreateDeveloperGroup(group domain.DeveloperGroup) error
	UpdateDeveloperGroup(group domain.DeveloperGroup) error
	DeleteDeveloperGroup(id string) error
	ListDeveloperGroupMembers(groupID string) ([]string, error)
	AddDeveloperGroupMember(groupID, userID string) error
	RemoveDeveloperGroupMember(groupID, userID string) error
	ListUserGroupsByOwner(ownerUserID, userID string) ([]domain.DeveloperGroup, error)
	ListAppGroupBindings(appID string) ([]domain.AppGroupBinding, error)
	ReplaceAppGroupBindings(appID string, groupIDs []string, createdAt time.Time) error
	ListAppIDsByGroup(groupID string) ([]string, error)
	CreateOrUpdateAppUserBan(ban domain.AppUserBan) error
	GetActiveAppUserBan(appID, userID string, now time.Time) (domain.AppUserBan, error)
	ListAppUserBans(appID string, includeExpired bool, now time.Time) ([]domain.AppUserBan, error)
	DeleteAppUserBan(appID, userID string) error
	GetAppUserAccessVersion(appID, userID string) (domain.AppUserAccessVersion, error)
	BumpAppUserAccessVersion(appID, userID string, updatedAt time.Time) (domain.AppUserAccessVersion, error)
	AppendDeveloperAccessLog(log domain.DeveloperAccessLog) error
	ListDeveloperAccessLogs(ownerUserID string, includeDeleted bool) ([]domain.DeveloperAccessLog, error)
	ListDeveloperAccessLogsPaginated(ownerUserID string, includeDeleted bool, page, pageSize int) ([]domain.DeveloperAccessLog, int, error)
	ListAllDeveloperAccessLogs(includeDeleted bool) ([]domain.DeveloperAccessLog, error)
	ListAllDeveloperAccessLogsPaginated(includeDeleted bool, page, pageSize int) ([]domain.DeveloperAccessLog, int, error)
	SoftDeleteDeveloperAccessLogs(ownerUserID string, ids []string, deletedAt time.Time) error
	HardDeleteDeveloperAccessLogs(ids []string) error
}

type AuditSettingsStore interface {
	AppendAudit(log domain.AuditLog)
	ListAudit() []domain.AuditLog
	ListAuditPaginated(page, pageSize int) ([]domain.AuditLog, int, error)
	ListAuditByTarget(targetID string) []domain.AuditLog
	DeleteAuditLogsByTarget(targetID string, startAt, endAt *time.Time) (int64, error)
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
	CountAuditLogs() (int, error)
	ListPolicies() []domain.GatewayPolicy
	CountPolicies() (int, error)
	GetSettings(keys ...string) (map[string]string, error)
	UpsertSettings(values map[string]string) error
}

type ScopeStore interface {
	ListScopes() []domain.ScopeDefinition
	GetScope(key string) (domain.ScopeDefinition, error)
	UpsertScope(scope domain.ScopeDefinition) error
	DeleteScope(key string) error
	CountAppsByScope(scope string) (int, error)
}

type CleanupStore interface {
	CleanupRuntimeData(plan CleanupPlan) error
}

type Store interface {
	UserStore
	VerificationStore
	PasskeyStore
	PhoneBindingChallengeStore
	SecurityPolicyStore
	SessionStore
	AppStore
	OAuthStore
	DeveloperAccessStore
	AuditSettingsStore
	ScopeStore
	CleanupStore
}
