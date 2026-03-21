package http

import (
	"strings"

	"github.com/gin-gonic/gin"

	"mysso/backend/internal/config"
	"mysso/backend/internal/domain"
)

func containsString(items []string, target string) bool {
	for _, item := range items {
		if strings.EqualFold(strings.TrimSpace(item), strings.TrimSpace(target)) {
			return true
		}
	}
	return false
}

func toInstallDBConfig(driver, host, port, name, user, password, charset string) config.DBConfig {
	return config.DBConfig{
		Driver:   driver,
		Host:     host,
		Port:     port,
		Name:     name,
		User:     user,
		Password: password,
		Charset:  charset,
	}
}

func buildUserResponse(
	user domain.User,
	avatarURL string,
	personalAnnouncementEnabled bool,
	personalAnnouncementContent string,
) gin.H {
	mfaEnabled := user.MFAEnabled
	mfaMethod := user.MFAMethod
	if user.Role == domain.RoleAdmin {
		mfaEnabled = false
		mfaMethod = ""
	}
	return gin.H{
		"id":                            user.ID,
		"country":                       user.Country,
		"gender":                        user.Gender,
		"email":                         user.Email,
		"phone":                         user.Phone,
		"display_name":                  user.DisplayName,
		"role":                          user.Role,
		"status":                        user.Status,
		"mfa_enabled":                   mfaEnabled,
		"mfa_method":                    mfaMethod,
		"last_login_at":                 user.LastLoginAt,
		"last_device_ip":                user.LastDeviceIP,
		"created_at":                    user.CreatedAt,
		"avatar_url":                    avatarURL,
		"deletion_requested_at":         user.DeletionRequestedAt,
		"deletion_scheduled_at":         user.DeletionScheduledAt,
		"preferred_locale":              user.PreferredLocale,
		"personal_announcement_enabled": personalAnnouncementEnabled,
		"personal_announcement_content": personalAnnouncementContent,
	}
}
