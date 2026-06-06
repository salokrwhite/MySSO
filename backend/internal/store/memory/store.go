package memory

import (
	"crypto/rand"
	"encoding/hex"
	"sync"
	"time"

	"github.com/google/uuid"

	"mysso/backend/internal/appdefaults"
	"mysso/backend/internal/domain"
	"mysso/backend/internal/security"
	"mysso/backend/internal/store"
)

type CleanupPlan = store.CleanupPlan

var (
	ErrNotFound                         = store.ErrNotFound
	ErrAuthorizationCodeUnavailable     = store.ErrAuthorizationCodeUnavailable
	ErrAuthorizationCodeRequestMismatch = store.ErrAuthorizationCodeRequestMismatch
	ErrAuthorizationCodePKCEMismatch    = store.ErrAuthorizationCodePKCEMismatch
	ErrRefreshTokenClientMismatch       = store.ErrRefreshTokenClientMismatch
	ErrRefreshTokenRevoked              = store.ErrRefreshTokenRevoked
	ErrRefreshTokenReuseDetected        = store.ErrRefreshTokenReuseDetected
	ErrRefreshTokenExpired              = store.ErrRefreshTokenExpired
)

type MemoryStore struct {
	mu                    sync.RWMutex
	users                 map[string]domain.User
	usersByEmail          map[string]string
	apps                  map[string]domain.ClientApp
	appsByClientID        map[string]string
	sessions              map[string]domain.Session
	emailCodes            map[string]domain.EmailVerificationCode
	smsCodes              map[string]domain.SMSVerificationCode
	authChallenges        map[string]domain.AuthChallenge
	passkeys              map[string]domain.Passkey
	passkeyUsageLogs      []domain.PasskeyUsageLog
	userSecurityPolicies  map[string]domain.UserSecurityPolicy
	authCodes             map[string]domain.AuthorizationCode
	consents              map[string]domain.Consent
	refreshTokens         map[string]domain.RefreshToken
	developerGroups       map[string]domain.DeveloperGroup
	developerGroupMembers map[string]map[string]struct{}
	appGroupBindings      map[string]map[string]domain.AppGroupBinding
	appUserBans           map[string]domain.AppUserBan
	appUserAccessVersions map[string]domain.AppUserAccessVersion
	developerAccessLogs   []domain.DeveloperAccessLog
	auditLogs             []domain.AuditLog
	userOperationLogs     []domain.UserOperationLog
	emailSendLogs         []domain.EmailSendLog
	phoneSendLogs         []domain.PhoneSendLog
	policies              map[string]domain.GatewayPolicy
	scopes                map[string]domain.ScopeDefinition
	settings              map[string]string
}

var _ store.Store = (*MemoryStore)(nil)

func NewStore() *MemoryStore {
	now := time.Now().UTC()
	adminID := uuid.NewString()
	devID := uuid.NewString()
	userID := uuid.NewString()
	appID := uuid.NewString()
	policyID := uuid.NewString()
	adminPassword, _ := security.HashPassword("Password123!")
	devPassword, _ := security.HashPassword("Password123!")
	userPassword, _ := security.HashPassword("Password123!")
	rawFirstPartyClientSecret, _ := generateMemorySecret(32)
	firstPartyClientSecret, _ := security.HashPassword(rawFirstPartyClientSecret)
	if firstPartyClientSecret == "" {
		firstPartyClientSecret = rawFirstPartyClientSecret
	}

	users := map[string]domain.User{
		adminID: {
			ID:              adminID,
			Country:         "CN",
			Gender:          "male",
			PreferredLocale: "zh-CN",
			Email:           "admin@example.com",
			DisplayName:     "Platform Admin",
			Password:        adminPassword,
			Role:            domain.RoleAdmin,
			Status:          domain.UserActive,
			MFAEnabled:      false,
			MFAMethod:       "",
			MFASecret:       "",
			CreatedAt:       now,
		},
		devID: {
			ID:              devID,
			Country:         "CN",
			Gender:          "male",
			PreferredLocale: "zh-CN",
			Email:           "dev@example.com",
			DisplayName:     "Demo Developer",
			Password:        devPassword,
			Role:            domain.RoleDeveloper,
			Status:          domain.UserActive,
			MFAEnabled:      false,
			MFAMethod:       "",
			MFASecret:       "",
			CreatedAt:       now,
		},
		userID: {
			ID:              userID,
			Country:         "CN",
			Gender:          "female",
			PreferredLocale: "zh-CN",
			Email:           "user@example.com",
			DisplayName:     "Demo User",
			Password:        userPassword,
			Role:            domain.RoleUser,
			Status:          domain.UserActive,
			MFAEnabled:      false,
			MFAMethod:       "",
			MFASecret:       "",
			CreatedAt:       now,
		},
	}

	app := domain.ClientApp{
		ID:           appID,
		Name:         "Demo Consumer",
		OwnerUserID:  devID,
		ClientID:     appdefaults.DefaultFirstPartyClientID,
		ClientSecret: firstPartyClientSecret,
		RedirectURIs: []string{appdefaults.DefaultFrontendBaseURL + "/callback"},
		Scopes:       []string{"openid", "profile", "email", "gateway.read"},
		Status:       domain.AppApproved,
		Description:  "Default approved application for local testing.",
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	return &MemoryStore{
		users: users,
		usersByEmail: map[string]string{
			"admin@example.com": adminID,
			"dev@example.com":   devID,
			"user@example.com":  userID,
		},
		apps:                  map[string]domain.ClientApp{appID: app},
		appsByClientID:        map[string]string{appdefaults.DefaultFirstPartyClientID: appID},
		sessions:              map[string]domain.Session{},
		emailCodes:            map[string]domain.EmailVerificationCode{},
		smsCodes:              map[string]domain.SMSVerificationCode{},
		authChallenges:        map[string]domain.AuthChallenge{},
		passkeys:              map[string]domain.Passkey{},
		passkeyUsageLogs:      []domain.PasskeyUsageLog{},
		userSecurityPolicies:  map[string]domain.UserSecurityPolicy{},
		authCodes:             map[string]domain.AuthorizationCode{},
		consents:              map[string]domain.Consent{},
		refreshTokens:         map[string]domain.RefreshToken{},
		developerGroups:       map[string]domain.DeveloperGroup{},
		developerGroupMembers: map[string]map[string]struct{}{},
		appGroupBindings:      map[string]map[string]domain.AppGroupBinding{},
		appUserBans:           map[string]domain.AppUserBan{},
		appUserAccessVersions: map[string]domain.AppUserAccessVersion{},
		developerAccessLogs:   []domain.DeveloperAccessLog{},
		auditLogs:             []domain.AuditLog{},
		userOperationLogs:     []domain.UserOperationLog{},
		emailSendLogs:         []domain.EmailSendLog{},
		phoneSendLogs:         []domain.PhoneSendLog{},
		policies: map[string]domain.GatewayPolicy{
			policyID: {
				ID:          policyID,
				Name:        "Read Gateway Metrics",
				Path:        "/api/gateway/protected",
				Method:      "GET",
				Scopes:      []string{"gateway.read"},
				Claims:      []string{"sub", "scope"},
				Enabled:     true,
				UpdatedAt:   now,
				Description: "Demo protected route.",
			},
		},
		scopes: map[string]domain.ScopeDefinition{
			"openid":       {Key: "openid", DisplayName: "基础登录", Description: "确认用户身份并建立 OIDC 登录会话。", Enabled: true, DeveloperSelectable: true, System: true, UpdatedAt: now},
			"profile":      {Key: "profile", DisplayName: "公开资料", Description: "允许读取昵称、头像等公开资料。", Enabled: true, DeveloperSelectable: true, System: true, UpdatedAt: now},
			"email":        {Key: "email", DisplayName: "邮箱资料", Description: "允许读取账号邮箱地址。", Enabled: true, DeveloperSelectable: true, System: true, UpdatedAt: now},
			"phone":        {Key: "phone", DisplayName: "手机号资料", Description: "允许读取账号绑定手机号。", Enabled: true, DeveloperSelectable: true, System: true, UpdatedAt: now},
			"role":         {Key: "role", DisplayName: "账号角色信息", Description: "允许读取账号当前角色标识，例如 user、developer、admin。", Enabled: true, DeveloperSelectable: true, System: true, UpdatedAt: now},
			"gateway.read": {Key: "gateway.read", DisplayName: "网关受保护资源读取", Description: "允许访问系统里受 scope 保护的网关或 API 资源。", Enabled: true, DeveloperSelectable: true, System: true, UpdatedAt: now},
		},
		settings: map[string]string{},
	}
}

func generateMemorySecret(byteLength int) (string, error) {
	buf := make([]byte, byteLength)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return hex.EncodeToString(buf), nil
}
