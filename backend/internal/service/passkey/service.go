package passkey

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net"
	"net/url"
	"strings"
	"time"

	"github.com/go-webauthn/webauthn/protocol"
	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/google/uuid"
	"golang.org/x/net/publicsuffix"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/service/audit"
	"mysso/backend/internal/service/auth"
	"mysso/backend/internal/service/common/authutil"
	"mysso/backend/internal/service/common/deps"
	riskservice "mysso/backend/internal/service/risk"
	"mysso/backend/internal/service/settings"
	"mysso/backend/internal/service/user"
)

const passkeyChallengeTTL = 5 * time.Minute

type PasskeyService struct {
	deps     *deps.Deps
	audit    *audit.Service
	settings *settings.Service
	user     *user.Service
	risk     *riskservice.Service
}

type Service = PasskeyService

func New(dependencies *deps.Deps, auditService *audit.Service, settingsService *settings.Service, userService *user.Service, riskService ...*riskservice.Service) *Service {
	var riskSvc *riskservice.Service
	if len(riskService) > 0 {
		riskSvc = riskService[0]
	}
	return &PasskeyService{deps: dependencies, audit: auditService, settings: settingsService, user: userService, risk: riskSvc}
}

type PreparePasskeyOptionsResult struct {
	ChallengeToken string `json:"challenge_token"`
	Options        any    `json:"options"`
}

type passkeyAuthUser struct {
	user        domain.User
	credentials []webauthn.Credential
}

func (u *passkeyAuthUser) WebAuthnID() []byte {
	return []byte(u.user.ID)
}

func (u *passkeyAuthUser) WebAuthnName() string {
	return strings.TrimSpace(u.user.Email)
}

func (u *passkeyAuthUser) WebAuthnDisplayName() string {
	if displayName := strings.TrimSpace(u.user.DisplayName); displayName != "" {
		return displayName
	}
	return strings.TrimSpace(u.user.Email)
}

func (u *passkeyAuthUser) WebAuthnCredentials() []webauthn.Credential {
	return u.credentials
}

func (s *PasskeyService) webAuthn() (*webauthn.WebAuthn, error) {
	settings, err := s.deps.Store.GetSettings("public_base_url", "frontend_base_url", "site_name")
	if err != nil {
		return nil, err
	}
	publicBase := authutil.FallbackSetting(settings["public_base_url"], s.deps.Cfg.HTTP.PublicBase)
	frontendBase := authutil.FallbackSetting(settings["frontend_base_url"], s.deps.Cfg.HTTP.FrontendBase)
	siteName := authutil.FallbackSetting(settings["site_name"], "MySSO")

	publicURL, err := url.Parse(publicBase)
	if err != nil {
		return nil, err
	}
	frontendURL, err := url.Parse(frontendBase)
	if err != nil {
		return nil, err
	}

	origins := []string{originFromURL(publicURL), originFromURL(frontendURL)}
	config := &webauthn.Config{
		RPDisplayName: siteName,
		RPID:          resolvePasskeyRPID(publicURL.Hostname(), frontendURL.Hostname()),
		RPOrigins:     uniqueNonEmptyStrings(origins),
	}
	return webauthn.New(config)
}

func resolvePasskeyRPID(publicHostname, frontendHostname string) string {
	publicHostname = strings.TrimSpace(strings.ToLower(publicHostname))
	frontendHostname = strings.TrimSpace(strings.ToLower(frontendHostname))

	if frontendHostname == "" {
		return publicHostname
	}
	if publicHostname == "" {
		return frontendHostname
	}
	if publicHostname == frontendHostname {
		return frontendHostname
	}
	if isWebAuthnSpecialHost(publicHostname) || isWebAuthnSpecialHost(frontendHostname) {
		return frontendHostname
	}

	publicBaseDomain, publicErr := publicsuffix.EffectiveTLDPlusOne(publicHostname)
	frontendBaseDomain, frontendErr := publicsuffix.EffectiveTLDPlusOne(frontendHostname)
	if publicErr == nil && frontendErr == nil && publicBaseDomain == frontendBaseDomain {
		return frontendBaseDomain
	}
	return frontendHostname
}

func isWebAuthnSpecialHost(hostname string) bool {
	if hostname == "" {
		return true
	}
	return hostname == "localhost" || net.ParseIP(hostname) != nil
}

func (s *PasskeyService) ListPasskeys(userID string) ([]domain.Passkey, error) {
	items, err := s.deps.Store.ListPasskeysByUser(userID)
	if err != nil {
		return nil, err
	}
	usageLogs := s.deps.Store.ListPasskeyUsageLogsByUser(userID)
	latestSuccessByPasskeyID := make(map[string]domain.PasskeyUsageLog, len(usageLogs))
	for _, log := range usageLogs {
		if log.Result != "success" || strings.TrimSpace(log.PasskeyID) == "" {
			continue
		}
		if _, ok := latestSuccessByPasskeyID[log.PasskeyID]; ok {
			continue
		}
		latestSuccessByPasskeyID[log.PasskeyID] = log
	}
	for i := range items {
		if usageLog, ok := latestSuccessByPasskeyID[items[i].ID]; ok {
			usedAt := usageLog.CreatedAt
			items[i].LastUsedAt = &usedAt
			items[i].LastUsedIP = usageLog.SourceIP
		}
	}
	return items, nil
}

func (s *PasskeyService) PrepareRegistration(userID, currentPassword, currentMFACode, ip, deviceID string) (*PreparePasskeyOptionsResult, error) {
	user, err := s.deps.Store.GetUser(userID)
	if err != nil {
		return nil, err
	}
	if err := s.user.VerifyCurrentPassword(user, currentPassword, ip, deviceID); err != nil {
		return nil, err
	}
	if err := s.user.VerifyCurrentMFA(user, currentMFACode, ip, deviceID); err != nil {
		return nil, err
	}

	existing, err := s.deps.Store.ListPasskeysByUser(user.ID)
	if err != nil {
		return nil, err
	}
	credentials, err := passkeyCredentials(existing)
	if err != nil {
		return nil, err
	}
	webAuthn, err := s.webAuthn()
	if err != nil {
		return nil, err
	}

	options, sessionData, err := webAuthn.BeginRegistration(
		&passkeyAuthUser{user: user, credentials: credentials},
		webauthn.WithAuthenticatorSelection(protocol.AuthenticatorSelection{
			RequireResidentKey: protocol.ResidentKeyRequired(),
			UserVerification:   protocol.VerificationPreferred,
		}),
		webauthn.WithExclusions(exclusionDescriptors(credentials)),
	)
	if err != nil {
		return nil, err
	}

	sessionDataJSON, err := json.Marshal(sessionData)
	if err != nil {
		return nil, err
	}
	challenge := domain.PasskeyRegistrationChallenge{
		Token:           uuid.NewString(),
		UserID:          user.ID,
		SessionDataJSON: string(sessionDataJSON),
		ExpiresAt:       time.Now().UTC().Add(passkeyChallengeTTL),
		CreatedAt:       time.Now().UTC(),
	}
	if err := s.deps.Store.SavePasskeyRegistrationChallenge(challenge); err != nil {
		return nil, err
	}
	return &PreparePasskeyOptionsResult{
		ChallengeToken: challenge.Token,
		Options:        options,
	}, nil
}

func (s *PasskeyService) CompleteRegistration(userID, challengeToken, credentialResponse, name, currentPassword, currentMFACode, ip, deviceID string) (domain.Passkey, error) {
	user, err := s.deps.Store.GetUser(userID)
	if err != nil {
		return domain.Passkey{}, err
	}
	if err := s.user.VerifyCurrentPassword(user, currentPassword, ip, deviceID); err != nil {
		return domain.Passkey{}, err
	}
	if err := s.user.VerifyCurrentMFA(user, currentMFACode, ip, deviceID); err != nil {
		return domain.Passkey{}, err
	}
	challenge, err := s.deps.Store.GetPasskeyRegistrationChallenge(challengeToken)
	if err != nil {
		return domain.Passkey{}, fmt.Errorf("passkey challenge expired")
	}
	if challenge.UserID != user.ID {
		return domain.Passkey{}, fmt.Errorf("passkey challenge expired")
	}

	var sessionData webauthn.SessionData
	if err := json.Unmarshal([]byte(challenge.SessionDataJSON), &sessionData); err != nil {
		return domain.Passkey{}, err
	}
	credentials, err := passkeyCredentialsFromUserStore(s.deps.Store, user.ID)
	if err != nil {
		return domain.Passkey{}, err
	}
	webAuthn, err := s.webAuthn()
	if err != nil {
		return domain.Passkey{}, err
	}
	parsed, err := protocol.ParseCredentialCreationResponseBody(strings.NewReader(credentialResponse))
	if err != nil {
		return domain.Passkey{}, err
	}
	credential, err := webAuthn.CreateCredential(&passkeyAuthUser{user: user, credentials: credentials}, sessionData, parsed)
	if err != nil {
		return domain.Passkey{}, fmt.Errorf("passkey verification failed")
	}
	if err := s.deps.Store.ConsumePasskeyRegistrationChallenge(challengeToken, time.Now().UTC()); err != nil {
		return domain.Passkey{}, fmt.Errorf("passkey challenge expired")
	}
	defer func() { _ = s.deps.Store.DeletePasskeyRegistrationChallenge(challengeToken) }()
	if err := s.enforceSecurityOperationRisk(user, ip, deviceID, "passkey_create"); err != nil {
		return domain.Passkey{}, err
	}
	credentialJSON, err := json.Marshal(credential)
	if err != nil {
		return domain.Passkey{}, err
	}
	passkey := domain.Passkey{
		ID:             uuid.NewString(),
		UserID:         user.ID,
		Name:           strings.TrimSpace(name),
		CredentialID:   base64.RawURLEncoding.EncodeToString(credential.ID),
		CredentialJSON: string(credentialJSON),
		SignCount:      credential.Authenticator.SignCount,
		AAGUID:         fmt.Sprintf("%x", credential.Authenticator.AAGUID),
		Transports:     transportsToStrings(credential.Transport),
		CreatedAt:      time.Now().UTC(),
		UpdatedAt:      time.Now().UTC(),
	}
	if passkey.Name == "" {
		passkey.Name = "Passkey"
	}
	if _, err := s.deps.Store.GetPasskeyByCredentialID(passkey.CredentialID); err == nil {
		return domain.Passkey{}, fmt.Errorf("passkey already exists")
	}
	if err := s.deps.Store.CreatePasskey(passkey); err != nil {
		return domain.Passkey{}, err
	}
	s.audit.Record(user.ID, user.Role, "user.passkey.create", user.ID, map[string]any{"passkey_id": passkey.ID})
	s.deps.AppendUserOperationLog(user.ID, "user.passkey.create", passkey.ID, map[string]any{
		"passkey_id": passkey.ID,
		"name":       passkey.Name,
	})
	return passkey, nil
}

func (s *PasskeyService) DeletePasskey(userID, passkeyID, currentPassword, currentMFACode, ip, deviceID string) error {
	user, err := s.deps.Store.GetUser(userID)
	if err != nil {
		return err
	}
	if err := s.user.VerifyCurrentPassword(user, currentPassword, ip, deviceID); err != nil {
		return err
	}
	if err := s.user.VerifyCurrentMFA(user, currentMFACode, ip, deviceID); err != nil {
		return err
	}
	if err := s.enforceSecurityOperationRisk(user, ip, deviceID, "passkey_delete"); err != nil {
		return err
	}
	if err := s.deps.Store.DeletePasskey(userID, passkeyID); err != nil {
		return fmt.Errorf("passkey not found")
	}
	s.audit.Record(user.ID, user.Role, "user.passkey.delete", user.ID, map[string]any{"passkey_id": passkeyID})
	s.deps.AppendUserOperationLog(user.ID, "user.passkey.delete", passkeyID, map[string]any{"passkey_id": passkeyID})
	return nil
}

func (s *PasskeyService) PrepareLogin() (*PreparePasskeyOptionsResult, error) {
	webAuthn, err := s.webAuthn()
	if err != nil {
		return nil, err
	}
	options, sessionData, err := webAuthn.BeginDiscoverableLogin()
	if err != nil {
		return nil, err
	}
	sessionDataJSON, err := json.Marshal(sessionData)
	if err != nil {
		return nil, err
	}
	challenge := domain.PasskeyLoginChallenge{
		Token:           uuid.NewString(),
		SessionDataJSON: string(sessionDataJSON),
		ExpiresAt:       time.Now().UTC().Add(passkeyChallengeTTL),
		CreatedAt:       time.Now().UTC(),
	}
	if err := s.deps.Store.SavePasskeyLoginChallenge(challenge); err != nil {
		return nil, err
	}
	return &PreparePasskeyOptionsResult{
		ChallengeToken: challenge.Token,
		Options:        options,
	}, nil
}

func (s *PasskeyService) CompleteLogin(challengeToken, credentialResponse, ip, deviceID, userAgent string, binding ...settings.DeviceBindingInput) (auth.PasswordLoginResult, error) {
	challenge, err := s.deps.Store.GetPasskeyLoginChallenge(challengeToken)
	if err != nil {
		return auth.PasswordLoginResult{}, fmt.Errorf("passkey challenge expired")
	}

	var sessionData webauthn.SessionData
	if err := json.Unmarshal([]byte(challenge.SessionDataJSON), &sessionData); err != nil {
		return auth.PasswordLoginResult{}, err
	}
	webAuthn, err := s.webAuthn()
	if err != nil {
		return auth.PasswordLoginResult{}, err
	}
	parsed, err := protocol.ParseCredentialRequestResponseBody(strings.NewReader(credentialResponse))
	if err != nil {
		return auth.PasswordLoginResult{}, err
	}

	var loginUser domain.User
	resolveUser := func(rawID, userHandle []byte) (webauthn.User, error) {
		userID := strings.TrimSpace(string(userHandle))
		if userID == "" {
			passkey, getErr := s.deps.Store.GetPasskeyByCredentialID(base64.RawURLEncoding.EncodeToString(rawID))
			if getErr != nil {
				return nil, fmt.Errorf("passkey user handle invalid")
			}
			userID = passkey.UserID
		}
		user, getErr := s.deps.Store.GetUser(userID)
		if getErr != nil {
			return nil, fmt.Errorf("passkey user handle invalid")
		}
		loginUser = user
		credentials, credErr := passkeyCredentialsFromUserStore(s.deps.Store, user.ID)
		if credErr != nil {
			return nil, credErr
		}
		return &passkeyAuthUser{user: user, credentials: credentials}, nil
	}

	credential, err := webAuthn.ValidateDiscoverableLogin(resolveUser, sessionData, parsed)
	if err != nil {
		return auth.PasswordLoginResult{}, fmt.Errorf("passkey verification failed")
	}
	if err := s.deps.Store.ConsumePasskeyLoginChallenge(challengeToken, time.Now().UTC()); err != nil {
		return auth.PasswordLoginResult{}, fmt.Errorf("passkey challenge expired")
	}
	defer func() { _ = s.deps.Store.DeletePasskeyLoginChallenge(challengeToken) }()
	usedPasskey, err := s.deps.Store.GetPasskeyByCredentialID(base64.RawURLEncoding.EncodeToString(credential.ID))
	if err != nil {
		return auth.PasswordLoginResult{}, fmt.Errorf("passkey verification failed")
	}
	credentialJSON, err := json.Marshal(credential)
	if err != nil {
		return auth.PasswordLoginResult{}, err
	}
	if err := s.deps.Store.UpdatePasskeyUsage(usedPasskey.ID, credential.Authenticator.SignCount, time.Now().UTC(), string(credentialJSON)); err != nil {
		return auth.PasswordLoginResult{}, err
	}
	_ = s.deps.Store.AppendPasskeyUsageLog(domain.PasskeyUsageLog{
		ID:           uuid.NewString(),
		UserID:       loginUser.ID,
		PasskeyID:    usedPasskey.ID,
		CredentialID: usedPasskey.CredentialID,
		EventType:    "login",
		SourceIP:     strings.TrimSpace(ip),
		UserAgent:    strings.TrimSpace(userAgent),
		Result:       "success",
		CreatedAt:    time.Now().UTC(),
	})

	auth := auth.New(s.deps, s.audit, s.settings, s.user, s.risk)
	return auth.ContinuePostAuthenticationWithRisk(
		loginUser,
		ip,
		"passkey",
		"urn:mysso:acr:passkey",
		riskservice.ClientInfo{
			ClientType:  "web",
			Fingerprint: strings.TrimSpace(deviceID),
			UserAgent:   strings.TrimSpace(userAgent),
		},
		binding...,
	)
}

func (s *PasskeyService) enforceSecurityOperationRisk(user domain.User, ip, deviceID, operation string) error {
	if s.risk == nil || user.Role == domain.RoleAdmin {
		return nil
	}
	assessment, err := s.risk.AssessSecurityOperation(user, ip, deviceID, operation)
	if err != nil {
		return err
	}
	if assessment.Action != riskservice.ActionAllow {
		s.risk.RecordLogin(user.ID, ip, "", riskservice.ClientInfo{ClientType: "web", Fingerprint: strings.TrimSpace(deviceID), Signals: []string{operation}}, assessment, false)
		return fmt.Errorf("access_denied")
	}
	return nil
}

func passkeyCredentialsFromUserStore(dataStore interface {
	ListPasskeysByUser(userID string) ([]domain.Passkey, error)
}, userID string) ([]webauthn.Credential, error) {
	items, err := dataStore.ListPasskeysByUser(userID)
	if err != nil {
		return nil, err
	}
	return passkeyCredentials(items)
}

func passkeyCredentials(items []domain.Passkey) ([]webauthn.Credential, error) {
	credentials := make([]webauthn.Credential, 0, len(items))
	for _, item := range items {
		var credential webauthn.Credential
		if err := json.Unmarshal([]byte(item.CredentialJSON), &credential); err != nil {
			return nil, err
		}
		credentials = append(credentials, credential)
	}
	return credentials, nil
}

func exclusionDescriptors(credentials []webauthn.Credential) []protocol.CredentialDescriptor {
	descriptors := make([]protocol.CredentialDescriptor, 0, len(credentials))
	for _, credential := range credentials {
		descriptors = append(descriptors, protocol.CredentialDescriptor{
			Type:         protocol.PublicKeyCredentialType,
			CredentialID: credential.ID,
			Transport:    credential.Transport,
		})
	}
	return descriptors
}

func transportsToStrings(transports []protocol.AuthenticatorTransport) []string {
	if len(transports) == 0 {
		return nil
	}
	items := make([]string, 0, len(transports))
	for _, transport := range transports {
		items = append(items, string(transport))
	}
	return items
}

func originFromURL(raw *url.URL) string {
	if raw == nil {
		return ""
	}
	return raw.Scheme + "://" + raw.Host
}

func uniqueNonEmptyStrings(values []string) []string {
	seen := map[string]struct{}{}
	items := make([]string, 0, len(values))
	for _, value := range values {
		trimmed := strings.TrimSpace(value)
		if trimmed == "" {
			continue
		}
		if _, ok := seen[trimmed]; ok {
			continue
		}
		seen[trimmed] = struct{}{}
		items = append(items, trimmed)
	}
	return items
}
