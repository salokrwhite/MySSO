package domain

import "strings"

func UserRiskPhoneBindingModeKey(userID string) string {
	return "user_risk_phone_binding_mode_" + strings.TrimSpace(userID)
}

func UserRiskPhoneBindingRequiredKey(userID string) string {
	return "user_risk_phone_binding_required_" + strings.TrimSpace(userID)
}

func UserRiskPhoneBindingLoginCountKey(userID string) string {
	return "user_risk_phone_binding_login_count_" + strings.TrimSpace(userID)
}
