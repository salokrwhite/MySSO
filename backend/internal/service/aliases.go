package service

import (
	"mysso/backend/internal/service/admin"
	"mysso/backend/internal/service/auth"
	"mysso/backend/internal/service/common/appurl"
	"mysso/backend/internal/service/common/templateutil"
	"mysso/backend/internal/service/oauth"
	"mysso/backend/internal/service/settings"
)

type PasswordLoginResult = auth.PasswordLoginResult
type RegisterInput = settings.RegisterInput
type VerificationCooldownError = settings.VerificationCooldownError
type SystemSettings = settings.SystemSettings
type LogoutResult = oauth.LogoutResult
type CreateUserInput = admin.CreateUserInput
type UpdateUserInput = admin.UpdateUserInput
type UserSecurityPolicyView = admin.UserSecurityPolicyView
type UpdateUserSecurityPolicyInput = admin.UpdateUserSecurityPolicyInput

var ErrForbidden = appurl.ErrForbidden
var ErrAppSecretRequiresApproval = appurl.ErrAppSecretRequiresApproval
var ErrInvalidClientCredentials = appurl.ErrInvalidClientCredentials

func BuildAuthorizeRedirect(baseRedirect, code, state string) string {
	return appurl.BuildAuthorizeRedirect(baseRedirect, code, state)
}

func BuildAuthorizeErrorRedirect(baseRedirect, errorCode, description, state string) string {
	return appurl.BuildAuthorizeErrorRedirect(baseRedirect, errorCode, description, state)
}

func SplitListSetting(raw string) []string {
	return templateutil.SplitListSetting(raw)
}
