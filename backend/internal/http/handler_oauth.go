package http

import (
	"errors"
	"net/http"
	"net/url"
	"strings"

	"github.com/gin-gonic/gin"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/service"
)

func (s *Server) handleAuthorize(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	redirectURI := strings.TrimSpace(c.Query("redirect_uri"))
	state := c.Query("state")
	promptValues := parsePromptValues(c.Query("prompt"))
	promptLoginSatisfied := strings.TrimSpace(c.Query("prompt_login_satisfied")) == "1"
	if promptValues["login"] && !promptLoginSatisfied {
		s.redirectAuthorizeToFrontend(c)
		return
	}
	sessionToken := s.extractSessionToken(c)
	if sessionToken == "" {
		if strings.EqualFold(strings.TrimSpace(c.Query("prompt")), "none") && redirectURI != "" {
			c.Redirect(http.StatusFound, service.BuildAuthorizeErrorRedirect(redirectURI, "login_required", "end-user authentication required", state))
			return
		}
		s.redirectAuthorizeToFrontend(c)
		return
	}
	_, session, err := s.services.Auth.CurrentUser(sessionToken)
	if err != nil {
		if redirectURI != "" && strings.EqualFold(strings.TrimSpace(c.Query("prompt")), "none") {
			c.Redirect(http.StatusFound, service.BuildAuthorizeErrorRedirect(redirectURI, "login_required", err.Error(), state))
			return
		}
		s.redirectAuthorizeToFrontend(c)
		return
	}
	if !promptValues["none"] {
		s.redirectAuthorizeToFrontend(c)
		return
	}
	redirectURL, err := s.buildAuthorizeRedirectURL(session, authorizeRequest{
		ClientID:            c.Query("client_id"),
		RedirectURI:         c.Query("redirect_uri"),
		ResponseType:        c.Query("response_type"),
		Scope:               c.Query("scope"),
		State:               c.Query("state"),
		Nonce:               c.Query("nonce"),
		CodeChallenge:       c.Query("code_challenge"),
		CodeChallengeMethod: c.Query("code_challenge_method"),
		Prompt:              c.Query("prompt"),
		MaxAge:              c.Query("max_age"),
		ACRValues:           c.Query("acr_values"),
		ConsentAccepted:     false,
	})
	if err != nil {
		if redirectURI != "" {
			c.Redirect(http.StatusFound, service.BuildAuthorizeErrorRedirect(redirectURI, normalizeAuthorizeError(err.Error()), err.Error(), state))
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.Redirect(http.StatusFound, redirectURL)
}

func (s *Server) handleSessionAuthorize(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	session := c.MustGet("session").(domain.Session)
	var req authorizeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	redirectURL, err := s.buildAuthorizeRedirectURL(session, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"redirect_url": redirectURL})
}

func (s *Server) buildAuthorizeRedirectURL(session domain.Session, req authorizeRequest) (string, error) {
	code, err := s.services.OAuth.GenerateAuthorizationCode(
		session,
		req.ClientID,
		req.RedirectURI,
		req.ResponseType,
		req.Scope,
		req.State,
		req.Nonce,
		req.CodeChallenge,
		req.CodeChallengeMethod,
		req.Prompt,
		req.MaxAge,
		req.ACRValues,
		req.ConsentAccepted,
	)
	if err != nil {
		return "", err
	}
	return service.BuildAuthorizeRedirect(strings.TrimSpace(req.RedirectURI), code, strings.TrimSpace(req.State)), nil
}

func (s *Server) handleToken(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	clientID, clientSecret := oauthClientCredentials(c)
	var (
		result map[string]any
		err    error
	)
	switch c.PostForm("grant_type") {
	case "", "authorization_code":
		result, err = s.services.OAuth.ExchangeAuthorizationCode(
			clientID,
			clientSecret,
			c.PostForm("code"),
			c.PostForm("redirect_uri"),
			c.PostForm("code_verifier"),
		)
	case "refresh_token":
		result, err = s.services.OAuth.ExchangeRefreshToken(
			clientID,
			clientSecret,
			c.PostForm("refresh_token"),
		)
	default:
		err = errors.New("unsupported grant_type")
	}
	if err != nil {
		if errors.Is(err, service.ErrInvalidClientCredentials) {
			c.Header("WWW-Authenticate", `Basic realm="oauth2/token"`)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid client credentials"})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}

func (s *Server) handleFirstPartyTokenExchange(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	var req firstPartyTokenExchangeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result, err := s.services.OAuth.ExchangeFirstPartyAuthorizationCode(req.Code, req.RedirectURI, req.CodeVerifier)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"id_token": result["id_token"],
	})
}

func (s *Server) handleFirstPartyRefresh(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	var req firstPartyRefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result, err := s.services.OAuth.ExchangeFirstPartyRefreshToken(req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}

func (s *Server) handleRevoke(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	clientID, clientSecret := oauthClientCredentials(c)
	if err := s.services.OAuth.RevokeTokenByClient(clientID, clientSecret, c.PostForm("token")); err != nil {
		if errors.Is(err, service.ErrInvalidClientCredentials) {
			c.Header("WWW-Authenticate", `Basic realm="oauth2/revoke"`)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid client credentials"})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

func (s *Server) handleUserInfo(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	auth := c.GetHeader("Authorization")
	if !strings.HasPrefix(auth, "Bearer ") {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing bearer token"})
		return
	}
	info, err := s.services.OAuth.UserInfo(strings.TrimPrefix(auth, "Bearer "))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, info)
}

func (s *Server) handleOIDCLogout(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	if c.Request.Method == http.MethodPost && s.rejectCrossSiteUnsafeRequest(c) {
		return
	}

	postLogoutRedirectURI := strings.TrimSpace(c.Query("post_logout_redirect_uri"))
	if postLogoutRedirectURI == "" {
		postLogoutRedirectURI = strings.TrimSpace(c.PostForm("post_logout_redirect_uri"))
	}

	clientID := strings.TrimSpace(c.Query("client_id"))
	if clientID == "" {
		clientID = strings.TrimSpace(c.PostForm("client_id"))
	}

	idTokenHint := strings.TrimSpace(c.Query("id_token_hint"))
	if idTokenHint == "" {
		idTokenHint = strings.TrimSpace(c.PostForm("id_token_hint"))
	}

	state := strings.TrimSpace(c.Query("state"))
	if state == "" {
		state = strings.TrimSpace(c.PostForm("state"))
	}

	sessionToken := s.extractSessionToken(c)
	if c.Request.Method == http.MethodGet && strings.TrimSpace(sessionToken) != "" && idTokenHint == "" {
		resolvedClientID, ok := s.services.OAuth.ResolveAllowedGetSessionLogoutClientID(clientID, idTokenHint, postLogoutRedirectURI, c.GetHeader("Referer"))
		if !ok {
			c.JSON(http.StatusMethodNotAllowed, gin.H{"error": "GET logout requires id_token_hint; use POST for browser session logout"})
			return
		}
		if clientID == "" {
			clientID = resolvedClientID
		}
	}

	result, err := s.services.OAuth.Logout(sessionToken, clientID, idTokenHint, postLogoutRedirectURI, state)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	s.clearSessionCookie(c)
	c.Redirect(http.StatusFound, s.buildLogoutBridgeURL(result))
}

func (s *Server) handleIntrospect(c *gin.Context) {
	if !s.requireInstalled(c) {
		return
	}
	type request struct {
		Token        string `json:"token" form:"token"`
		ClientID     string `json:"client_id" form:"client_id"`
		ClientSecret string `json:"client_secret" form:"client_secret"`
	}
	var req request
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	clientID, clientSecret := oauthClientCredentials(c, req.ClientID, req.ClientSecret)
	if strings.TrimSpace(req.Token) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing token"})
		return
	}
	result, err := s.services.OAuth.Introspect(clientID, clientSecret, req.Token)
	if err != nil {
		if errors.Is(err, service.ErrInvalidClientCredentials) {
			c.Header("WWW-Authenticate", `Basic realm="oauth2/introspect"`)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid client credentials"})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}

func oauthClientCredentials(c *gin.Context, fallback ...string) (string, string) {
	clientID := ""
	clientSecret := ""
	if len(fallback) > 0 {
		clientID = strings.TrimSpace(fallback[0])
	}
	if len(fallback) > 1 {
		clientSecret = strings.TrimSpace(fallback[1])
	}
	if clientID == "" {
		clientID = strings.TrimSpace(c.PostForm("client_id"))
	}
	if clientSecret == "" {
		clientSecret = strings.TrimSpace(c.PostForm("client_secret"))
	}
	if basicClientID, basicClientSecret, ok := c.Request.BasicAuth(); ok {
		clientID = strings.TrimSpace(basicClientID)
		clientSecret = strings.TrimSpace(basicClientSecret)
	}
	return clientID, clientSecret
}

func (s *Server) redirectAuthorizeToFrontend(c *gin.Context) {
	target := s.cfg.HTTP.PublicBase
	if s.services != nil && s.services.Settings != nil {
		if settings, err := s.services.Settings.GetSystemSettings(); err == nil && strings.TrimSpace(settings.FrontendBaseURL) != "" {
			target = strings.TrimSpace(settings.FrontendBaseURL)
		}
	}
	target = strings.TrimRight(target, "/") + "/authorize"
	u, err := url.Parse(target)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "session token required"})
		return
	}
	u.RawQuery = c.Request.URL.RawQuery
	c.Redirect(http.StatusFound, u.String())
}

func (s *Server) buildLogoutBridgeURL(result service.LogoutResult) string {
	target := strings.TrimRight(s.cfg.HTTP.PublicBase, "/")
	if s.services != nil && s.services.Settings != nil {
		if settings, err := s.services.Settings.GetSystemSettings(); err == nil && strings.TrimSpace(settings.FrontendBaseURL) != "" {
			target = strings.TrimRight(strings.TrimSpace(settings.FrontendBaseURL), "/")
		}
	}
	u, err := url.Parse(target + "/logout-complete")
	if err != nil {
		return target + "/login"
	}
	query := u.Query()
	if result.PostLogoutRedirectURI != "" {
		query.Set("post_logout_redirect_uri", result.PostLogoutRedirectURI)
	}
	if result.State != "" {
		query.Set("state", result.State)
	}
	for _, item := range result.FrontChannelLogoutURIs {
		if strings.TrimSpace(item) != "" {
			query.Add("frontchannel_logout_uri", item)
		}
	}
	u.RawQuery = query.Encode()
	return u.String()
}

func normalizeAuthorizeError(message string) string {
	switch strings.TrimSpace(message) {
	case "login_required", "consent_required", "invalid_request", "invalid_scope", "access_denied", "server_error", "temporarily_unavailable":
		return strings.TrimSpace(message)
	case "scope not allowed":
		return "invalid_scope"
	case "application rejected":
		return "access_denied"
	case "application access restricted", "application access banned":
		return "access_denied"
	case "application not found":
		return "invalid_request"
	default:
		if strings.HasPrefix(strings.TrimSpace(message), "application rejected:") || strings.HasPrefix(strings.TrimSpace(message), "application access banned:") {
			return "access_denied"
		}
		return "invalid_request"
	}
}

func parsePromptValues(prompt string) map[string]bool {
	values := map[string]bool{}
	for _, item := range strings.Fields(strings.TrimSpace(prompt)) {
		values[item] = true
	}
	return values
}
