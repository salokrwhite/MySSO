package domain

import "strings"

func UserAnnouncementEnabledKey(userID string) string {
	return "user_announcement_enabled_" + strings.TrimSpace(userID)
}

func UserAnnouncementContentKey(userID string) string {
	return "user_announcement_content_" + strings.TrimSpace(userID)
}
