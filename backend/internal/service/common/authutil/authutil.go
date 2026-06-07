package authutil

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"strconv"
	"strings"

	"mysso/backend/internal/domain"
)

func ParseScope(scope string) []string {
	if strings.TrimSpace(scope) == "" {
		return []string{"openid"}
	}
	return strings.Fields(scope)
}

func Contains(list []string, target string) bool {
	for _, item := range list {
		if item == target {
			return true
		}
	}
	return false
}

func ContainsAll(source []string, target []string) bool {
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

func VerifyPKCE(challenge, verifier string) bool {
	return DerivePKCEChallenge(verifier) == challenge
}

func DerivePKCEChallenge(verifier string) string {
	hash := sha256.Sum256([]byte(verifier))
	return base64.RawURLEncoding.EncodeToString(hash[:])
}

func SupportsUserMFA(user domain.User) bool {
	return user.Role != domain.RoleAdmin
}

func EffectiveUserMFAEnabled(user domain.User) bool {
	return SupportsUserMFA(user) && user.MFAEnabled
}

func EffectiveUserMFAMethod(user domain.User) string {
	if !EffectiveUserMFAEnabled(user) {
		return ""
	}
	return strings.TrimSpace(user.MFAMethod)
}

func AllowsAuthenticatedAccess(user domain.User) bool {
	return user.Status == domain.UserActive
}

func GenerateNumericCode(length int) (string, error) {
	if length <= 0 {
		return "", nil
	}
	var builder strings.Builder
	digits := []byte("0123456789")
	random := make([]byte, length)
	if _, err := rand.Read(random); err != nil {
		return "", err
	}
	for _, value := range random {
		builder.WriteByte(digits[int(value)%len(digits)])
	}
	return builder.String(), nil
}

func GenerateOpaqueToken(byteLength int) (string, error) {
	buf := make([]byte, byteLength)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buf), nil
}

func HashValue(value string) string {
	sum := sha256.Sum256([]byte(strings.TrimSpace(value)))
	return hex.EncodeToString(sum[:])
}

func FallbackSetting(value, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return value
}

func FallbackBoolSetting(value string, fallback bool) bool {
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
