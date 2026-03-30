package templateutil

import (
	"fmt"
	"strings"
)

func NormalizeListSetting(raw string) string {
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

func NormalizeGender(value string) (string, error) {
	value = strings.ToLower(strings.TrimSpace(value))
	switch value {
	case "", "male", "female", "other":
		return value, nil
	default:
		return "", fmt.Errorf("invalid gender")
	}
}

func RenderTemplate(template string, replacements map[string]string) string {
	result := template
	for placeholder, value := range replacements {
		result = strings.ReplaceAll(result, placeholder, value)
	}
	return result
}

func DeriveDisplayName(email string) string {
	parts := strings.SplitN(email, "@", 2)
	if len(parts) == 0 || strings.TrimSpace(parts[0]) == "" {
		return email
	}
	return parts[0]
}

func UserAvatarSettingKey(userID string) string {
	return "user_avatar_" + strings.TrimSpace(userID)
}
