package oauth

import (
	"fmt"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/security"
	"mysso/backend/internal/service/accesscontrol"
	"mysso/backend/internal/service/audit"
	"mysso/backend/internal/service/auth"
	"mysso/backend/internal/service/common/appurl"
	"mysso/backend/internal/service/common/authutil"
	"mysso/backend/internal/service/common/deps"
	"mysso/backend/internal/service/common/scopeutil"
	"mysso/backend/internal/service/settings"
	"mysso/backend/internal/store"
)

type OAuthService struct {
	deps          *deps.Deps
	audit         *audit.Service
	settings      *settings.Service
	accessControl *accesscontrol.Service
}

type Service = OAuthService

func New(dependencies *deps.Deps, auditService *audit.Service, settingsService *settings.Service, accessControlService *accesscontrol.Service) *Service {
	return &OAuthService{deps: dependencies, audit: auditService, settings: settingsService, accessControl: accessControlService}
}

type LogoutResult struct {
	PostLogoutRedirectURI  string
	State                  string
	FrontChannelLogoutURIs []string
}

func (s *OAuthService) ExchangeFirstPartyAuthorizationCode(codeValue, redirectURI, verifier string) (map[string]any, error) {
	clientID, clientSecret, _, err := s.settings.GetFirstPartyClientCredentials()
	if err != nil {
		return nil, err
	}
	return s.ExchangeAuthorizationCode(
		clientID,
		clientSecret,
		codeValue,
		redirectURI,
		verifier,
	)
}

func (s *OAuthService) ExchangeFirstPartyRefreshToken(refreshToken string) (map[string]any, error) {
	clientID, clientSecret, _, err := s.settings.GetFirstPartyClientCredentials()
	if err != nil {
		return nil, err
	}
	return s.ExchangeRefreshToken(
		clientID,
		clientSecret,
		refreshToken,
	)
}

func (s *OAuthService) GenerateAuthorizationCode(session domain.Session, clientID, redirectURI, responseType, scope, state, nonce, challenge, challengeMethod, prompt, maxAge, acrValues string, consentAccepted bool) (string, error) {
	if strings.TrimSpace(responseType) != "code" {
		return "", fmt.Errorf("unsupported response_type")
	}
	app, err := s.deps.Store.FindAppByClientID(clientID)
	if err != nil {
		return "", fmt.Errorf("application not found")
	}
	if app.Status != domain.AppApproved {
		return "", appApprovalError(app)
	}
	if !authutil.Contains(app.RedirectURIs, redirectURI) {
		return "", fmt.Errorf("redirect_uri mismatch")
	}
	scopes := authutil.ParseScope(scope)
	if !authutil.ContainsAll(app.Scopes, scopes) {
		return "", fmt.Errorf("scope not allowed")
	}
	enabledScopes := s.listEnabledScopeKeys()
	if !authutil.ContainsAll(enabledScopes, scopes) {
		return "", fmt.Errorf("scope not allowed")
	}
	if !authutil.Contains(scopes, "openid") {
		return "", fmt.Errorf("openid scope is required")
	}
	if challenge == "" && strings.TrimSpace(challengeMethod) != "" {
		return "", fmt.Errorf("code_challenge_method requires code_challenge")
	}
	if challenge != "" && strings.TrimSpace(challengeMethod) != "S256" {
		return "", fmt.Errorf("unsupported code_challenge_method")
	}
	promptValues := parsePrompt(prompt)
	if promptValues["none"] && len(promptValues) > 1 {
		return "", fmt.Errorf("prompt none must not be combined with other values")
	}
	if err := s.accessControl.EnsureAppAccessAllowed(clientID, session.UserID, time.Now().UTC()); err != nil {
		return "", err
	}
	hasConsent := hasActiveConsent(s.deps.Store.ListConsentsByUser(session.UserID), clientID, scopes)
	if promptValues["none"] && !hasConsent {
		return "", fmt.Errorf("consent_required")
	}
	if !promptValues["none"] && !hasConsent && !consentAccepted {
		return "", fmt.Errorf("consent_required")
	}
	if strings.TrimSpace(maxAge) != "" {
		maxAgeSeconds, err := strconv.Atoi(strings.TrimSpace(maxAge))
		if err != nil || maxAgeSeconds < 0 {
			return "", fmt.Errorf("invalid max_age")
		}
		if session.AuthenticatedAt.IsZero() || time.Since(session.AuthenticatedAt) > time.Duration(maxAgeSeconds)*time.Second {
			return "", fmt.Errorf("login_required")
		}
	}
	if !acrValuesSatisfied(session.ACR, acrValues) {
		return "", fmt.Errorf("acr_values_not_satisfied")
	}
	code := domain.AuthorizationCode{
		Code:              uuid.NewString(),
		UserID:            session.UserID,
		ClientID:          clientID,
		RedirectURI:       redirectURI,
		Scopes:            scopes,
		CodeChallenge:     challenge,
		CodeChallengeMeth: challengeMethod,
		Nonce:             nonce,
		State:             state,
		AuthTime:          session.AuthenticatedAt,
		ACR:               session.ACR,
		ExpiresAt:         time.Now().UTC().Add(s.deps.Cfg.OIDC.AuthorizationCodeTTL),
	}
	s.deps.Store.SaveAuthorizationCode(code)

	if !hasConsent {
		consent := domain.Consent{
			ID:        uuid.NewString(),
			UserID:    session.UserID,
			ClientID:  clientID,
			Scopes:    scopes,
			CreatedAt: time.Now().UTC(),
		}
		s.deps.Store.SaveConsent(consent)
		s.deps.AppendUserOperationLog(session.UserID, "oauth.consent.grant", consent.ID, map[string]any{
			"client_id": clientID,
			"app_name":  app.Name,
			"scopes":    scopes,
		})
	}
	s.audit.Record(session.UserID, session.Role, "oauth.authorize", clientID, map[string]any{
		"scopes":     scopes,
		"prompt":     prompt,
		"max_age":    maxAge,
		"acr_values": acrValues,
		"acr":        session.ACR,
	})
	return code.Code, nil
}

func (s *OAuthService) ExchangeAuthorizationCode(clientID, clientSecret, codeValue, redirectURI, verifier string) (map[string]any, error) {
	app, err := s.deps.Store.FindAppByClientID(clientID)
	if err != nil {
		return nil, fmt.Errorf("application not found")
	}
	if app.Status != domain.AppApproved {
		return nil, appApprovalError(app)
	}
	if !matchesClientSecret(clientSecret, app.ClientSecret) {
		return nil, appurl.ErrInvalidClientCredentials
	}
	code, err := s.deps.Store.ConsumeAuthorizationCode(codeValue, clientID, redirectURI, authutil.DerivePKCEChallenge(verifier))
	if err != nil {
		if err == store.ErrNotFound {
			return nil, fmt.Errorf("invalid code")
		}
		if err == store.ErrAuthorizationCodeUnavailable {
			return nil, fmt.Errorf("authorization code expired or used")
		}
		if err == store.ErrAuthorizationCodeRequestMismatch {
			return nil, fmt.Errorf("authorization request mismatch")
		}
		if err == store.ErrAuthorizationCodePKCEMismatch {
			return nil, fmt.Errorf("pkce verification failed")
		}
		return nil, err
	}

	user, err := s.deps.Store.GetUser(code.UserID)
	if err != nil {
		return nil, err
	}
	if !authutil.AllowsAuthenticatedAccess(user) {
		return nil, fmt.Errorf("user inactive")
	}
	if err := s.accessControl.EnsureAppAccessAllowed(clientID, user.ID, time.Now().UTC()); err != nil {
		return nil, err
	}
	appAccessVersion := s.accessControl.GetCurrentAppAccessVersion(app.ID, user.ID)
	idTokenClaims := map[string]any{
		"nonce":     code.Nonce,
		"auth_time": code.AuthTime.Unix(),
		"acr":       code.ACR,
	}
	if authutil.Contains(code.Scopes, "email") {
		idTokenClaims["email"] = user.Email
	}
	if authutil.Contains(code.Scopes, "phone") {
		idTokenClaims["phone"] = user.Phone
	}
	if authutil.Contains(code.Scopes, "profile") {
		idTokenClaims["name"] = user.DisplayName
	}
	if authutil.Contains(code.Scopes, "role") {
		idTokenClaims["role"] = string(user.Role)
	}
	accessTokenClaims := map[string]any{
		"scope":   strings.Join(code.Scopes, " "),
		"ver":     effectiveAuthVersion(user.AuthVersion),
		"azp":     clientID,
		"app_ver": appAccessVersion,
	}
	if authutil.Contains(code.Scopes, "email") {
		accessTokenClaims["email"] = user.Email
	}
	if authutil.Contains(code.Scopes, "phone") {
		accessTokenClaims["phone"] = user.Phone
	}
	if authutil.Contains(code.Scopes, "role") {
		accessTokenClaims["role"] = string(user.Role)
	}
	accessToken, err := s.deps.JWT.Sign(user.ID, s.deps.Cfg.OIDC.DefaultAudience, s.deps.Cfg.OIDC.AccessTokenTTL, accessTokenClaims)
	if err != nil {
		return nil, err
	}
	idToken, err := s.deps.JWT.Sign(user.ID, clientID, s.deps.Cfg.OIDC.AccessTokenTTL, idTokenClaims)
	if err != nil {
		return nil, err
	}
	refreshToken := domain.RefreshToken{
		Token:     "rt_" + strings.ReplaceAll(uuid.NewString(), "-", ""),
		UserID:    user.ID,
		ClientID:  clientID,
		Scopes:    code.Scopes,
		CreatedAt: time.Now().UTC(),
		ExpiresAt: time.Now().UTC().Add(s.deps.Cfg.OIDC.RefreshTokenTTL),
	}
	s.deps.Store.SaveRefreshToken(refreshToken)
	s.audit.Record(user.ID, user.Role, "oauth.token", clientID, map[string]any{"grant_type": "authorization_code"})

	return map[string]any{
		"token_type":    "Bearer",
		"expires_in":    int(s.deps.Cfg.OIDC.AccessTokenTTL.Seconds()),
		"access_token":  accessToken,
		"id_token":      idToken,
		"refresh_token": refreshToken.Token,
		"scope":         strings.Join(code.Scopes, " "),
	}, nil
}

func (s *OAuthService) ExchangeRefreshToken(clientID, clientSecret, refreshTokenValue string) (map[string]any, error) {
	app, err := s.deps.Store.FindAppByClientID(clientID)
	if err != nil {
		return nil, fmt.Errorf("application not found")
	}
	if app.Status != domain.AppApproved {
		return nil, appApprovalError(app)
	}
	if !matchesClientSecret(clientSecret, app.ClientSecret) {
		return nil, appurl.ErrInvalidClientCredentials
	}
	nextRefreshToken := domain.RefreshToken{
		Token:     "rt_" + strings.ReplaceAll(uuid.NewString(), "-", ""),
		ClientID:  clientID,
		CreatedAt: time.Now().UTC(),
		ExpiresAt: time.Now().UTC().Add(s.deps.Cfg.OIDC.RefreshTokenTTL),
	}
	token, err := s.deps.Store.RotateRefreshToken(strings.TrimSpace(refreshTokenValue), clientID, nextRefreshToken)
	if err != nil {
		if err == store.ErrNotFound {
			return nil, fmt.Errorf("invalid refresh token")
		}
		if err == store.ErrRefreshTokenClientMismatch {
			return nil, fmt.Errorf("refresh token client mismatch")
		}
		if err == store.ErrRefreshTokenReuseDetected {
			_ = s.deps.Store.RevokeRefreshTokensByUserClient(token.UserID, token.ClientID)
			s.audit.Record(token.UserID, domain.RoleUser, "oauth.refresh_token.reuse_detected", clientID, map[string]any{
				"refresh_token": token.Token,
			})
			return nil, fmt.Errorf("refresh token reuse detected")
		}
		if err == store.ErrRefreshTokenRevoked {
			return nil, fmt.Errorf("refresh token revoked")
		}
		if err == store.ErrRefreshTokenExpired {
			return nil, fmt.Errorf("refresh token expired")
		}
		return nil, err
	}
	nextRefreshToken.UserID = token.UserID
	nextRefreshToken.ClientID = token.ClientID
	nextRefreshToken.Scopes = token.Scopes
	nextRefreshToken.RotatedFrom = token.Token
	user, err := s.deps.Store.GetUser(token.UserID)
	if err != nil {
		return nil, err
	}
	if !authutil.AllowsAuthenticatedAccess(user) {
		return nil, fmt.Errorf("user inactive")
	}
	if err := s.accessControl.EnsureAppAccessAllowed(clientID, user.ID, time.Now().UTC()); err != nil {
		return nil, err
	}
	appAccessVersion := s.accessControl.GetCurrentAppAccessVersion(app.ID, user.ID)
	accessTokenClaims := map[string]any{
		"scope":   strings.Join(token.Scopes, " "),
		"ver":     effectiveAuthVersion(user.AuthVersion),
		"azp":     clientID,
		"app_ver": appAccessVersion,
	}
	if authutil.Contains(token.Scopes, "email") {
		accessTokenClaims["email"] = user.Email
	}
	if authutil.Contains(token.Scopes, "phone") {
		accessTokenClaims["phone"] = user.Phone
	}
	if authutil.Contains(token.Scopes, "role") {
		accessTokenClaims["role"] = string(user.Role)
	}
	accessToken, err := s.deps.JWT.Sign(user.ID, s.deps.Cfg.OIDC.DefaultAudience, s.deps.Cfg.OIDC.AccessTokenTTL, accessTokenClaims)
	if err != nil {
		return nil, err
	}
	idTokenClaims := map[string]any{
		"auth_time": token.CreatedAt.Unix(),
	}
	if authutil.Contains(token.Scopes, "email") {
		idTokenClaims["email"] = user.Email
	}
	if authutil.Contains(token.Scopes, "phone") {
		idTokenClaims["phone"] = user.Phone
	}
	if authutil.Contains(token.Scopes, "profile") {
		idTokenClaims["name"] = user.DisplayName
	}
	if authutil.Contains(token.Scopes, "role") {
		idTokenClaims["role"] = string(user.Role)
	}
	idToken, err := s.deps.JWT.Sign(user.ID, clientID, s.deps.Cfg.OIDC.AccessTokenTTL, idTokenClaims)
	if err != nil {
		return nil, err
	}
	s.audit.Record(user.ID, user.Role, "oauth.token", clientID, map[string]any{
		"grant_type":    "refresh_token",
		"rotated_from":  token.Token,
		"refresh_token": nextRefreshToken.Token,
	})
	return map[string]any{
		"token_type":    "Bearer",
		"expires_in":    int(s.deps.Cfg.OIDC.AccessTokenTTL.Seconds()),
		"access_token":  accessToken,
		"id_token":      idToken,
		"refresh_token": nextRefreshToken.Token,
		"scope":         strings.Join(token.Scopes, " "),
	}, nil
}

func parsePrompt(prompt string) map[string]bool {
	items := map[string]bool{}
	for _, item := range strings.Fields(strings.TrimSpace(prompt)) {
		items[item] = true
	}
	return items
}

func appApprovalError(app domain.ClientApp) error {
	if app.Status == domain.AppDisabled {
		return fmt.Errorf("application disabled")
	}
	if app.Status == domain.AppRejected {
		comment := strings.TrimSpace(app.ReviewComment)
		if comment != "" {
			return fmt.Errorf("application rejected: %s", comment)
		}
		return fmt.Errorf("application rejected")
	}
	return fmt.Errorf("application not approved")
}

func hasActiveConsent(consents []domain.Consent, clientID string, scopes []string) bool {
	for _, consent := range consents {
		if consent.ClientID == clientID && authutil.ContainsAll(consent.Scopes, scopes) {
			return true
		}
	}
	return false
}

func acrValuesSatisfied(sessionACR, acrValues string) bool {
	requested := strings.Fields(strings.TrimSpace(acrValues))
	if len(requested) == 0 {
		return true
	}
	for _, item := range requested {
		if item == sessionACR {
			return true
		}
	}
	return false
}

func (s *OAuthService) RevokeToken(token string) error {
	return s.deps.Store.RevokeRefreshToken(token)
}

func (s *OAuthService) RevokeTokenByClient(clientID, clientSecret, token string) error {
	clientID = strings.TrimSpace(clientID)
	token = strings.TrimSpace(token)
	if _, err := s.authenticateConfidentialClient(clientID, clientSecret); err != nil {
		return err
	}
	if token == "" {
		return nil
	}
	refreshToken, err := s.deps.Store.GetRefreshToken(token)
	if err != nil {
		if err == store.ErrNotFound {
			return nil
		}
		return err
	}
	if refreshToken.ClientID != clientID {
		return nil
	}
	if refreshToken.Revoked {
		return nil
	}
	return s.deps.Store.RevokeRefreshToken(token)
}

func (s *OAuthService) UserInfo(accessToken string) (map[string]any, error) {
	claims, err := s.deps.JWT.Parse(accessToken)
	if err != nil {
		return nil, err
	}
	userID, _ := claims["sub"].(string)
	user, err := s.deps.Store.GetUser(userID)
	if err != nil {
		return nil, err
	}
	if !authutil.AllowsAuthenticatedAccess(user) || !s.tokenClaimsStillValid(claims, user) {
		return nil, fmt.Errorf("token expired")
	}
	scopeString, _ := claims["scope"].(string)
	scopes := authutil.ParseScope(scopeString)
	result := map[string]any{
		"sub": user.ID,
	}
	if authutil.Contains(scopes, "email") {
		result["email"] = user.Email
	}
	if authutil.Contains(scopes, "phone") {
		result["phone"] = user.Phone
	}
	if authutil.Contains(scopes, "profile") {
		result["name"] = user.DisplayName
	}
	if authutil.Contains(scopes, "role") {
		result["role"] = user.Role
	}
	return result, nil
}

func (s *OAuthService) ValidateAccessTokenClaims(accessToken string) (map[string]any, error) {
	claims, err := s.deps.JWT.Parse(accessToken)
	if err != nil {
		return nil, err
	}
	userID, _ := claims["sub"].(string)
	user, err := s.deps.Store.GetUser(userID)
	if err != nil || !authutil.AllowsAuthenticatedAccess(user) || !s.tokenClaimsStillValid(claims, user) {
		return nil, fmt.Errorf("invalid token")
	}
	return claims, nil
}

func (s *OAuthService) Introspect(clientID, clientSecret, accessToken string) (map[string]any, error) {
	client, err := s.authenticateConfidentialClient(clientID, clientSecret)
	if err != nil {
		return nil, err
	}
	claims, err := s.ValidateAccessTokenClaims(accessToken)
	if err != nil {
		return map[string]any{"active": false}, nil
	}
	authorizedParty := claimString(claims["azp"])
	if authorizedParty == "" || authorizedParty != client.ClientID {
		return map[string]any{"active": false}, nil
	}
	result := map[string]any{
		"active":     true,
		"token_type": "Bearer",
		"client_id":  authorizedParty,
	}
	if issuer := claimString(claims["iss"]); issuer != "" {
		result["iss"] = issuer
	}
	if subject := claimString(claims["sub"]); subject != "" {
		result["sub"] = subject
	}
	if scope := claimString(claims["scope"]); scope != "" {
		result["scope"] = scope
	}
	if exp, ok := claims["exp"]; ok {
		result["exp"] = exp
	}
	if iat, ok := claims["iat"]; ok {
		result["iat"] = iat
	}
	if audience := claimString(claims["aud"]); audience != "" {
		result["aud"] = audience
	}
	return result, nil
}

func tokenVersionMatchesUser(claims map[string]any, user domain.User) bool {
	claimVersion := claimInt(claims["ver"])
	if claimVersion <= 0 {
		return false
	}
	return claimVersion == effectiveAuthVersion(user.AuthVersion)
}

func (s *OAuthService) tokenClaimsStillValid(claims map[string]any, user domain.User) bool {
	if !tokenVersionMatchesUser(claims, user) {
		return false
	}
	clientID := claimString(claims["azp"])
	if clientID == "" {
		return false
	}
	app, err := s.deps.Store.FindAppByClientID(clientID)
	if err != nil {
		return false
	}
	if err := s.accessControl.EnsureAppAccessAllowed(clientID, user.ID, time.Now().UTC()); err != nil {
		return false
	}
	claimAppVersion := claimInt(claims["app_ver"])
	if claimAppVersion <= 0 {
		return false
	}
	return claimAppVersion == s.accessControl.GetCurrentAppAccessVersion(app.ID, user.ID)
}

func claimInt(value any) int {
	switch typed := value.(type) {
	case float64:
		return int(typed)
	case float32:
		return int(typed)
	case int:
		return typed
	case int64:
		return int(typed)
	case string:
		parsed, err := strconv.Atoi(strings.TrimSpace(typed))
		if err == nil {
			return parsed
		}
	}
	return 0
}

func effectiveAuthVersion(version int) int {
	if version <= 0 {
		return 1
	}
	return version
}

func matchesClientSecret(providedSecret, storedSecret string) bool {
	providedSecret = strings.TrimSpace(providedSecret)
	storedSecret = strings.TrimSpace(storedSecret)
	if providedSecret == "" || storedSecret == "" {
		return false
	}
	if security.VerifyPassword(providedSecret, storedSecret) {
		return true
	}
	return false
}

func (s *OAuthService) Discovery() map[string]any {
	base := s.deps.Cfg.HTTP.PublicBase
	return map[string]any{
		"issuer":                                s.deps.Cfg.OIDC.Issuer,
		"authorization_endpoint":                base + "/oauth2/authorize",
		"token_endpoint":                        base + "/oauth2/token",
		"userinfo_endpoint":                     base + "/oauth2/userinfo",
		"revocation_endpoint":                   base + "/oauth2/revoke",
		"end_session_endpoint":                  base + "/oauth2/logout",
		"jwks_uri":                              base + "/.well-known/jwks.json",
		"scopes_supported":                      s.listEnabledScopeKeys(),
		"response_types_supported":              []string{"code"},
		"grant_types_supported":                 []string{"authorization_code", "refresh_token"},
		"subject_types_supported":               []string{"public"},
		"frontchannel_logout_supported":         true,
		"frontchannel_logout_session_supported": false,
		"id_token_signing_alg_values_supported": []string{"RS256"},
		"code_challenge_methods_supported":      []string{"S256"},
		"token_endpoint_auth_methods_supported": []string{"client_secret_basic", "client_secret_post"},
	}
}

func claimString(value any) string {
	switch typed := value.(type) {
	case string:
		return strings.TrimSpace(typed)
	case []string:
		if len(typed) > 0 {
			return strings.TrimSpace(typed[0])
		}
	case []any:
		if len(typed) > 0 {
			return claimString(typed[0])
		}
	}
	return ""
}

func (s *OAuthService) authenticateConfidentialClient(clientID, clientSecret string) (domain.ClientApp, error) {
	clientID = strings.TrimSpace(clientID)
	clientSecret = strings.TrimSpace(clientSecret)
	if clientID == "" || clientSecret == "" {
		return domain.ClientApp{}, appurl.ErrInvalidClientCredentials
	}
	app, err := s.deps.Store.FindAppByClientID(clientID)
	if err != nil || app.Status != domain.AppApproved || !matchesClientSecret(clientSecret, app.ClientSecret) {
		return domain.ClientApp{}, appurl.ErrInvalidClientCredentials
	}
	return app, nil
}

func (s *OAuthService) listEnabledScopeKeys() []string {
	definitions := scopeutil.ListScopeDefinitionsWithFallback(s.deps.Store)
	items := make([]string, 0, len(definitions))
	for _, item := range definitions {
		if item.Enabled {
			items = append(items, item.Key)
		}
	}
	return items
}

func (s *OAuthService) JWKS() map[string]any {
	return s.deps.JWT.JWKS()
}

func (s *OAuthService) Logout(sessionToken, clientID, idTokenHint, postLogoutRedirectURI, state string) (LogoutResult, error) {
	result := LogoutResult{
		PostLogoutRedirectURI: strings.TrimSpace(postLogoutRedirectURI),
		State:                 strings.TrimSpace(state),
	}

	resolvedClientID, err := s.resolveLogoutClientID(strings.TrimSpace(clientID), strings.TrimSpace(idTokenHint))
	if err != nil {
		return LogoutResult{}, err
	}

	var app domain.ClientApp
	if resolvedClientID != "" {
		app, err = s.deps.Store.FindAppByClientID(resolvedClientID)
		if err != nil {
			return LogoutResult{}, fmt.Errorf("application not found")
		}
	}

	if result.PostLogoutRedirectURI != "" {
		if strings.TrimSpace(app.ClientID) == "" {
			return LogoutResult{}, fmt.Errorf("client_id or id_token_hint is required when post_logout_redirect_uri is provided")
		}
		if !logoutRedirectAllowed(app, result.PostLogoutRedirectURI) {
			return LogoutResult{}, fmt.Errorf("post_logout_redirect_uri mismatch")
		}
	}

	sessionToken = strings.TrimSpace(sessionToken)
	if sessionToken == "" {
		return result, nil
	}

	session, invalidated, err := auth.InvalidateSessionAuthState(s.deps, sessionToken)
	if err != nil {
		return LogoutResult{}, err
	}
	if !invalidated {
		return result, nil
	}

	result.FrontChannelLogoutURIs = s.buildFrontChannelLogoutURIs(session.UserID, app.ClientID)
	s.audit.Record(session.UserID, session.Role, "oauth.logout", session.UserID, map[string]any{
		"client_id":                 app.ClientID,
		"frontchannel_logout_count": len(result.FrontChannelLogoutURIs),
		"post_logout_redirect_uri":  result.PostLogoutRedirectURI,
	})
	return result, nil
}

func (s *OAuthService) ResolveAllowedGetSessionLogoutClientID(clientID, idTokenHint, postLogoutRedirectURI, referer string) (string, bool) {
	resolvedClientID, err := s.resolveLogoutClientID(strings.TrimSpace(clientID), strings.TrimSpace(idTokenHint))
	if err != nil {
		return "", false
	}
	postLogoutRedirectURI = strings.TrimSpace(postLogoutRedirectURI)
	refererOrigin := urlOrigin(referer)
	if resolvedClientID != "" {
		app, err := s.deps.Store.FindAppByClientID(resolvedClientID)
		if err == nil && appAllowsGetSessionLogout(app) && allowedGetSessionLogoutSource(app, postLogoutRedirectURI, refererOrigin) {
			return app.ClientID, true
		}
		return "", false
	}

	matchedClientID := ""
	for _, app := range s.deps.Store.ListApps() {
		if appAllowsGetSessionLogout(app) && allowedGetSessionLogoutSource(app, postLogoutRedirectURI, refererOrigin) {
			if matchedClientID != "" {
				return "", false
			}
			matchedClientID = app.ClientID
		}
	}
	return matchedClientID, matchedClientID != ""
}

func appAllowsGetSessionLogout(app domain.ClientApp) bool {
	return app.Status == domain.AppApproved && app.AllowGetSessionLogout
}

func allowedGetSessionLogoutSource(app domain.ClientApp, postLogoutRedirectURI, refererOrigin string) bool {
	if strings.TrimSpace(postLogoutRedirectURI) != "" && logoutRedirectAllowed(app, postLogoutRedirectURI) {
		return true
	}
	if refererOrigin == "" {
		return false
	}
	for _, candidate := range append(append([]string{}, app.RedirectURIs...), app.PostLogoutRedirectURIs...) {
		if urlOrigin(candidate) == refererOrigin {
			return true
		}
	}
	return urlOrigin(app.FrontChannelLogoutURI) == refererOrigin
}

func urlOrigin(rawURL string) string {
	parsed, err := url.Parse(strings.TrimSpace(rawURL))
	if err != nil || parsed.Scheme == "" || parsed.Host == "" {
		return ""
	}
	return strings.ToLower(parsed.Scheme + "://" + parsed.Host)
}

func (s *OAuthService) resolveLogoutClientID(clientID, idTokenHint string) (string, error) {
	clientID = strings.TrimSpace(clientID)
	idTokenHint = strings.TrimSpace(idTokenHint)
	if idTokenHint == "" {
		return clientID, nil
	}
	claims, err := s.deps.JWT.Parse(idTokenHint)
	if err != nil {
		return "", fmt.Errorf("invalid id_token_hint")
	}
	hintClientID := extractAudience(claims["aud"])
	if hintClientID == "" {
		return "", fmt.Errorf("invalid id_token_hint")
	}
	if clientID != "" && clientID != hintClientID {
		return "", fmt.Errorf("client_id does not match id_token_hint")
	}
	return hintClientID, nil
}

func extractAudience(value any) string {
	switch typed := value.(type) {
	case string:
		return strings.TrimSpace(typed)
	case []any:
		for _, item := range typed {
			if text, ok := item.(string); ok && strings.TrimSpace(text) != "" {
				return strings.TrimSpace(text)
			}
		}
	case []string:
		for _, item := range typed {
			if strings.TrimSpace(item) != "" {
				return strings.TrimSpace(item)
			}
		}
	}
	return ""
}

func logoutRedirectAllowed(app domain.ClientApp, target string) bool {
	allowed := app.PostLogoutRedirectURIs
	if len(allowed) == 0 {
		allowed = app.RedirectURIs
	}
	for _, candidate := range allowed {
		if strings.TrimSpace(candidate) == strings.TrimSpace(target) {
			return true
		}
	}
	return false
}

func (s *OAuthService) buildFrontChannelLogoutURIs(userID, initiatingClientID string) []string {
	consents := s.deps.Store.ListConsentsByUser(userID)
	clientIDs := map[string]struct{}{}
	for _, consent := range consents {
		if strings.TrimSpace(consent.ClientID) == "" {
			continue
		}
		clientIDs[consent.ClientID] = struct{}{}
	}
	if strings.TrimSpace(initiatingClientID) != "" {
		clientIDs[initiatingClientID] = struct{}{}
	}

	urls := make([]string, 0, len(clientIDs))
	for clientID := range clientIDs {
		app, err := s.deps.Store.FindAppByClientID(clientID)
		if err != nil || strings.TrimSpace(app.FrontChannelLogoutURI) == "" {
			continue
		}
		if !appurl.IsSafeFrontChannelLogoutURL(app.FrontChannelLogoutURI, app.RedirectURIs, app.PostLogoutRedirectURIs) {
			continue
		}
		frontChannelURL, err := url.Parse(strings.TrimSpace(app.FrontChannelLogoutURI))
		if err != nil {
			continue
		}
		query := frontChannelURL.Query()
		query.Set("iss", s.deps.Cfg.OIDC.Issuer)
		query.Set("client_id", app.ClientID)
		frontChannelURL.RawQuery = query.Encode()
		urls = append(urls, frontChannelURL.String())
	}
	return urls
}
