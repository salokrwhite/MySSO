package service

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"math/big"
	"net/url"
	"os"
	"path/filepath"
	"slices"
	"strconv"
	"strings"

	"mysso/backend/internal/domain"
)

func parseScope(scope string) []string {
	if strings.TrimSpace(scope) == "" {
		return []string{"openid"}
	}
	return strings.Fields(scope)
}

func contains(list []string, target string) bool {
	for _, item := range list {
		if item == target {
			return true
		}
	}
	return false
}

func containsAll(source []string, target []string) bool {
	set := map[string]struct{}{}
	for _, item := range source {
		set[item] = struct{}{}
	}
	for _, item := range target {
		if _, ok := set[item]; !ok {
			return false
		}
	}
	return true
}

func verifyPKCE(challenge, verifier string) bool {
	return derivePKCEChallenge(verifier) == challenge
}

func derivePKCEChallenge(verifier string) string {
	hash := sha256.Sum256([]byte(verifier))
	return base64.RawURLEncoding.EncodeToString(hash[:])
}

func deriveDisplayName(email string) string {
	parts := strings.SplitN(email, "@", 2)
	if len(parts) == 0 || strings.TrimSpace(parts[0]) == "" {
		return email
	}
	return parts[0]
}

func supportsUserMFA(user domain.User) bool {
	return user.Role != domain.RoleAdmin
}

func effectiveUserMFAEnabled(user domain.User) bool {
	return supportsUserMFA(user) && user.MFAEnabled
}

func effectiveUserMFAMethod(user domain.User) string {
	if !effectiveUserMFAEnabled(user) {
		return ""
	}
	return strings.TrimSpace(user.MFAMethod)
}

func generateNumericCode(length int) (string, error) {
	var builder strings.Builder
	for i := 0; i < length; i++ {
		n, err := rand.Int(rand.Reader, big.NewInt(10))
		if err != nil {
			return "", err
		}
		builder.WriteByte(byte('0' + n.Int64()))
	}
	return builder.String(), nil
}

func generateOpaqueToken(byteLength int) (string, error) {
	buf := make([]byte, byteLength)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buf), nil
}

func hashValue(value string) string {
	sum := sha256.Sum256([]byte(strings.TrimSpace(value)))
	return hex.EncodeToString(sum[:])
}

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

func fallbackSetting(value, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return value
}

func fallbackBoolSetting(value string, fallback bool) bool {
	value = strings.TrimSpace(value)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func normalizeListSetting(raw string) string {
	items := SplitListSetting(raw)
	if len(items) == 0 {
		return ""
	}
	return strings.Join(items, "\n")
}

func SplitListSetting(raw string) []string {
	parts := strings.FieldsFunc(raw, func(r rune) bool {
		return r == ',' || r == '\n' || r == '\r'
	})
	items := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		items = append(items, part)
	}
	return items
}

func normalizeGender(value string) (string, error) {
	value = strings.ToLower(strings.TrimSpace(value))
	switch value {
	case "", "male", "female", "other":
		return value, nil
	default:
		return "", fmt.Errorf("invalid gender")
	}
}

func renderTemplate(template string, replacements map[string]string) string {
	result := template
	for placeholder, value := range replacements {
		result = strings.ReplaceAll(result, placeholder, value)
	}
	return result
}

func userAvatarSettingKey(userID string) string {
	return "user_avatar_" + strings.TrimSpace(userID)
}

func removeReplacedUploadedFile(previousURL, nextURL string) {
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

var (
	ErrForbidden                 = errors.New("forbidden")
	ErrAppSecretRequiresApproval = errors.New("app secret can only be created after approval")
	ErrInvalidClientCredentials  = errors.New("invalid client credentials")
)

func buildAppCreateAuditDetail(app domain.ClientApp) map[string]any {
	return map[string]any{
		"name":                      app.Name,
		"icon_url":                  app.IconURL,
		"description":               app.Description,
		"redirect_uris":             app.RedirectURIs,
		"post_logout_redirect_uris": app.PostLogoutRedirectURIs,
		"frontchannel_logout_uri":   app.FrontChannelLogoutURI,
		"scopes":                    app.Scopes,
		"status":                    app.Status,
	}
}

func buildAppChangeDetails(before, after domain.ClientApp) []map[string]any {
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
	appendChange(
		"post_logout_redirect_uris",
		before.PostLogoutRedirectURIs,
		after.PostLogoutRedirectURIs,
		!stringSlicesEqual(before.PostLogoutRedirectURIs, after.PostLogoutRedirectURIs),
	)
	appendChange(
		"frontchannel_logout_uri",
		before.FrontChannelLogoutURI,
		after.FrontChannelLogoutURI,
		before.FrontChannelLogoutURI != after.FrontChannelLogoutURI,
	)
	appendChange("scopes", before.Scopes, after.Scopes, !stringSlicesEqual(before.Scopes, after.Scopes))
	appendChange("status", before.Status, after.Status, before.Status != after.Status)
	appendChange("review_comment", before.ReviewComment, after.ReviewComment, before.ReviewComment != after.ReviewComment)

	return changes
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

func normalizeAppOAuthURLs(redirectURIs, postLogoutRedirectURIs []string, frontChannelLogoutURI string) ([]string, []string, string, error) {
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

func sanitizeStoredAppOAuthURLs(redirectURIs, postLogoutRedirectURIs []string, frontChannelLogoutURI string) ([]string, []string, string) {
	normalizedRedirects := sanitizeStoredAppCallbackURLs(redirectURIs)
	normalizedPostLogout := sanitizeStoredAppCallbackURLs(postLogoutRedirectURIs)
	normalizedFrontChannel, err := normalizeFrontChannelLogoutURL(frontChannelLogoutURI, normalizedRedirects, normalizedPostLogout)
	if err != nil {
		normalizedFrontChannel = ""
	}
	return normalizedRedirects, normalizedPostLogout, normalizedFrontChannel
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

func isSafeFrontChannelLogoutURL(value string, redirectURIs, postLogoutRedirectURIs []string) bool {
	normalized, err := normalizeAbsoluteHTTPURL(value)
	if err != nil || normalized == "" {
		return false
	}
	return matchesAllowedAppOrigin(normalized, redirectURIs, postLogoutRedirectURIs)
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
