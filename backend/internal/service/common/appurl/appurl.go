package appurl

import (
	"errors"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"slices"
	"strings"

	"mysso/backend/internal/domain"
)

var (
	ErrForbidden                 = errors.New("forbidden")
	ErrAppSecretRequiresApproval = errors.New("app secret can only be created after approval")
	ErrInvalidClientCredentials  = errors.New("invalid client credentials")
)

func BuildAuthorizeRedirect(baseRedirect, code, state string) string {
	u, _ := url.Parse(baseRedirect)
	query := u.Query()
	query.Set("code", code)
	if state != "" {
		query.Set("state", state)
	}
	u.RawQuery = query.Encode()
	return u.String()
}

func BuildAuthorizeErrorRedirect(baseRedirect, errorCode, description, state string) string {
	u, _ := url.Parse(baseRedirect)
	query := u.Query()
	if strings.TrimSpace(errorCode) != "" {
		query.Set("error", strings.TrimSpace(errorCode))
	}
	if strings.TrimSpace(description) != "" {
		query.Set("error_description", strings.TrimSpace(description))
	}
	if state != "" {
		query.Set("state", state)
	}
	u.RawQuery = query.Encode()
	return u.String()
}

func RemoveReplacedUploadedFile(previousURL, nextURL string) {
	previousURL = strings.TrimSpace(previousURL)
	nextURL = strings.TrimSpace(nextURL)
	if previousURL == "" || previousURL == nextURL || !strings.HasPrefix(previousURL, "/uploads/") {
		return
	}
	filename := filepath.Base(previousURL)
	if filename == "." || filename == string(filepath.Separator) || strings.Contains(filename, "..") {
		return
	}
	_ = os.Remove(filepath.Join("uploads", filename))
}

func BuildAppCreateAuditDetail(app domain.ClientApp) map[string]any {
	return map[string]any{
		"name":                      app.Name,
		"icon_url":                  app.IconURL,
		"description":               app.Description,
		"redirect_uris":             app.RedirectURIs,
		"post_logout_redirect_uris": app.PostLogoutRedirectURIs,
		"frontchannel_logout_uri":   app.FrontChannelLogoutURI,
		"allow_get_session_logout":  app.AllowGetSessionLogout,
		"scopes":                    app.Scopes,
		"status":                    app.Status,
	}
}

func BuildAppChangeDetails(before, after domain.ClientApp) []map[string]any {
	changes := make([]map[string]any, 0)
	appendChange := func(field string, previous any, current any, changed bool) {
		if !changed {
			return
		}
		changes = append(changes, map[string]any{
			"field":  field,
			"before": previous,
			"after":  current,
		})
	}

	appendChange("name", before.Name, after.Name, before.Name != after.Name)
	appendChange("icon_url", before.IconURL, after.IconURL, before.IconURL != after.IconURL)
	appendChange("description", before.Description, after.Description, before.Description != after.Description)
	appendChange("redirect_uris", before.RedirectURIs, after.RedirectURIs, !stringSlicesEqual(before.RedirectURIs, after.RedirectURIs))
	appendChange("post_logout_redirect_uris", before.PostLogoutRedirectURIs, after.PostLogoutRedirectURIs, !stringSlicesEqual(before.PostLogoutRedirectURIs, after.PostLogoutRedirectURIs))
	appendChange("frontchannel_logout_uri", before.FrontChannelLogoutURI, after.FrontChannelLogoutURI, before.FrontChannelLogoutURI != after.FrontChannelLogoutURI)
	appendChange("allow_get_session_logout", before.AllowGetSessionLogout, after.AllowGetSessionLogout, before.AllowGetSessionLogout != after.AllowGetSessionLogout)
	appendChange("scopes", before.Scopes, after.Scopes, !stringSlicesEqual(before.Scopes, after.Scopes))
	appendChange("status", before.Status, after.Status, before.Status != after.Status)
	appendChange("review_comment", before.ReviewComment, after.ReviewComment, before.ReviewComment != after.ReviewComment)

	return changes
}

func NormalizeAppOAuthURLs(redirectURIs, postLogoutRedirectURIs []string, frontChannelLogoutURI string) ([]string, []string, string, error) {
	normalizedRedirects, err := normalizeAppCallbackURLs(redirectURIs)
	if err != nil {
		return nil, nil, "", fmt.Errorf("invalid redirect_uris: %w", err)
	}
	normalizedPostLogout, err := normalizeAppCallbackURLs(postLogoutRedirectURIs)
	if err != nil {
		return nil, nil, "", fmt.Errorf("invalid post_logout_redirect_uris: %w", err)
	}
	normalizedFrontChannel, err := normalizeFrontChannelLogoutURL(frontChannelLogoutURI, normalizedRedirects, normalizedPostLogout)
	if err != nil {
		return nil, nil, "", err
	}
	return normalizedRedirects, normalizedPostLogout, normalizedFrontChannel, nil
}

func SanitizeStoredAppOAuthURLs(redirectURIs, postLogoutRedirectURIs []string, frontChannelLogoutURI string) ([]string, []string, string) {
	normalizedRedirects := sanitizeStoredAppCallbackURLs(redirectURIs)
	normalizedPostLogout := sanitizeStoredAppCallbackURLs(postLogoutRedirectURIs)
	normalizedFrontChannel, err := normalizeFrontChannelLogoutURL(frontChannelLogoutURI, normalizedRedirects, normalizedPostLogout)
	if err != nil {
		normalizedFrontChannel = ""
	}
	return normalizedRedirects, normalizedPostLogout, normalizedFrontChannel
}

func IsSafeFrontChannelLogoutURL(value string, redirectURIs, postLogoutRedirectURIs []string) bool {
	normalized, err := normalizeAbsoluteHTTPURL(value)
	if err != nil || normalized == "" {
		return false
	}
	return matchesAllowedAppOrigin(normalized, redirectURIs, postLogoutRedirectURIs)
}

func stringSlicesEqual(left, right []string) bool {
	if len(left) != len(right) {
		return false
	}
	for index := range left {
		if left[index] != right[index] {
			return false
		}
	}
	return true
}

func normalizeAppCallbackURLs(values []string) ([]string, error) {
	normalized := make([]string, 0, len(values))
	seen := make(map[string]struct{}, len(values))
	for _, raw := range values {
		item, err := normalizeAbsoluteHTTPURL(raw)
		if err != nil {
			return nil, err
		}
		if item == "" {
			continue
		}
		if _, ok := seen[item]; ok {
			continue
		}
		seen[item] = struct{}{}
		normalized = append(normalized, item)
	}
	return normalized, nil
}

func sanitizeStoredAppCallbackURLs(values []string) []string {
	normalized := make([]string, 0, len(values))
	seen := make(map[string]struct{}, len(values))
	for _, raw := range values {
		item, err := normalizeAbsoluteHTTPURL(raw)
		if err != nil || item == "" {
			continue
		}
		if _, ok := seen[item]; ok {
			continue
		}
		seen[item] = struct{}{}
		normalized = append(normalized, item)
	}
	return normalized
}

func normalizeFrontChannelLogoutURL(value string, redirectURIs, postLogoutRedirectURIs []string) (string, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return "", nil
	}
	normalized, err := normalizeAbsoluteHTTPURL(value)
	if err != nil {
		return "", fmt.Errorf("invalid frontchannel_logout_uri: %w", err)
	}
	if !matchesAllowedAppOrigin(normalized, redirectURIs, postLogoutRedirectURIs) {
		return "", fmt.Errorf("invalid frontchannel_logout_uri: origin must match a registered redirect URI")
	}
	return normalized, nil
}

func matchesAllowedAppOrigin(target string, redirectURIs, postLogoutRedirectURIs []string) bool {
	targetOrigin, ok := normalizedURLOrigin(target)
	if !ok {
		return false
	}
	allowed := append(slices.Clone(redirectURIs), postLogoutRedirectURIs...)
	for _, candidate := range allowed {
		candidateOrigin, ok := normalizedURLOrigin(candidate)
		if ok && candidateOrigin == targetOrigin {
			return true
		}
	}
	return false
}

func normalizeAbsoluteHTTPURL(value string) (string, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return "", nil
	}
	parsed, err := url.Parse(value)
	if err != nil {
		return "", fmt.Errorf("must be a valid absolute URL")
	}
	if !parsed.IsAbs() {
		return "", fmt.Errorf("must be an absolute URL")
	}
	scheme := strings.ToLower(strings.TrimSpace(parsed.Scheme))
	if scheme != "https" && scheme != "http" {
		return "", fmt.Errorf("only http and https URLs are allowed")
	}
	if parsed.Host == "" || strings.TrimSpace(parsed.Hostname()) == "" {
		return "", fmt.Errorf("host is required")
	}
	if parsed.User != nil {
		return "", fmt.Errorf("username and password are not allowed")
	}
	if parsed.Fragment != "" {
		return "", fmt.Errorf("fragments are not allowed")
	}
	return parsed.String(), nil
}

func normalizedURLOrigin(value string) (string, bool) {
	parsed, err := url.Parse(strings.TrimSpace(value))
	if err != nil || !parsed.IsAbs() || parsed.Host == "" || parsed.User != nil {
		return "", false
	}
	scheme := strings.ToLower(strings.TrimSpace(parsed.Scheme))
	if scheme != "https" && scheme != "http" {
		return "", false
	}
	return strings.ToLower(parsed.Scheme) + "://" + strings.ToLower(parsed.Host), true
}
