package domain

import "strings"

func UserPreferredLocaleKey(userID string) string {
	return "user_preferred_locale_" + strings.TrimSpace(userID)
}
