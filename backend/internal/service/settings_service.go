package service

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"

	"mysso/backend/internal/appdefaults"
	"mysso/backend/internal/domain"
	"mysso/backend/internal/notify"
	"mysso/backend/internal/security"
)

type SystemSettings struct {
	AllowUserRegistration                bool   `json:"allow_user_registration"`
	EnablePhoneVerification              bool   `json:"enable_phone_verification"`
	SiteName                             string `json:"site_name"`
	SiteNameEN                           string `json:"site_name_en"`
	SiteBrowserTitle                     string `json:"site_browser_title"`
	SiteBrowserTitleEN                   string `json:"site_browser_title_en"`
	SiteLogoDataURL                      string `json:"site_logo_data_url"`
	SiteFooterText                       string `json:"site_footer_text"`
	SiteICPRecordNumber                  string `json:"site_icp_record_number"`
	SitePublicSecurityRecordNumber       string `json:"site_public_security_record_number"`
	HomePageAnnouncementEnabled          bool   `json:"home_page_announcement_enabled"`
	HomePageAnnouncementContent          string `json:"home_page_announcement_content"`
	UserCenterAnnouncementEnabled        bool   `json:"user_center_announcement_enabled"`
	UserCenterAnnouncementContent        string `json:"user_center_announcement_content"`
	DeveloperAnnouncementEnabled         bool   `json:"developer_announcement_enabled"`
	DeveloperAnnouncementContent         string `json:"developer_announcement_content"`
	FrontendBaseURL                      string `json:"frontend_base_url"`
	OIDCFirstPartyClientID               string `json:"oidc_first_party_client_id"`
	OIDCFirstPartyClientSecret           string `json:"oidc_first_party_client_secret"`
	OIDCFirstPartyClientSecretConfigured bool   `json:"oidc_first_party_client_secret_configured"`
	OIDCFirstPartyScope                  string `json:"oidc_first_party_scope"`
	OIDCAutoApproveClientIDs             string `json:"oidc_auto_approve_client_ids"`
	OIDCAutoApproveRedirectHosts         string `json:"oidc_auto_approve_redirect_hosts"`
	SMTPHost                             string `json:"smtp_host"`
	SMTPPort                             string `json:"smtp_port"`
	SMTPUsername                         string `json:"smtp_username"`
	SMTPPassword                         string `json:"smtp_password"`
	SMTPPasswordConfigured               bool   `json:"smtp_password_configured"`
	SMTPFrom                             string `json:"smtp_from"`
	SMTPForceSSL                         bool   `json:"smtp_force_ssl"`
	SMTPVerificationCodeTTLMinute        int    `json:"smtp_verification_code_ttl_minutes"`
	SMTPVerificationCodeCooldownSecond   int    `json:"smtp_verification_code_cooldown_seconds"`
	LoginCodeSubjectTemplate             string `json:"login_code_subject_template"`
	LoginCodeBodyTemplate                string `json:"login_code_body_template"`
	LoginCodeSubjectTemplateEN           string `json:"login_code_subject_template_en"`
	LoginCodeBodyTemplateEN              string `json:"login_code_body_template_en"`
	RegisterCodeSubjectTemplate          string `json:"register_code_subject_template"`
	RegisterCodeBodyTemplate             string `json:"register_code_body_template"`
	RegisterCodeSubjectTemplateEN        string `json:"register_code_subject_template_en"`
	RegisterCodeBodyTemplateEN           string `json:"register_code_body_template_en"`
	ResetPasswordCodeSubjectTemplate     string `json:"reset_password_code_subject_template"`
	ResetPasswordCodeBodyTemplate        string `json:"reset_password_code_body_template"`
	ResetPasswordCodeSubjectTemplateEN   string `json:"reset_password_code_subject_template_en"`
	ResetPasswordCodeBodyTemplateEN      string `json:"reset_password_code_body_template_en"`
	DeleteAccountCodeSubjectTemplate     string `json:"delete_account_code_subject_template"`
	DeleteAccountCodeBodyTemplate        string `json:"delete_account_code_body_template"`
	DeleteAccountCodeSubjectTemplateEN   string `json:"delete_account_code_subject_template_en"`
	DeleteAccountCodeBodyTemplateEN      string `json:"delete_account_code_body_template_en"`
	ChangeEmailCodeSubjectTemplate       string `json:"change_email_code_subject_template"`
	ChangeEmailCodeBodyTemplate          string `json:"change_email_code_body_template"`
	ChangeEmailCodeSubjectTemplateEN     string `json:"change_email_code_subject_template_en"`
	ChangeEmailCodeBodyTemplateEN        string `json:"change_email_code_body_template_en"`
	SMSProvider                          string `json:"sms_provider"`
	SMSTemplateProvider                  string `json:"sms_template_provider"`
	SMSAPIBase                           string `json:"sms_api_base"`
	SMSUsername                          string `json:"sms_username"`
	SMSPassword                          string `json:"sms_password"`
	SMSPasswordConfigured                bool   `json:"sms_password_configured"`
	SMSSignature                         string `json:"sms_signature"`
	SMSLoginTemplate                     string `json:"sms_login_template"`
	SMSRegisterTemplate                  string `json:"sms_register_template"`
	SMSResetPasswordTemplate             string `json:"sms_reset_password_template"`
	SMSBindPhoneTemplate                 string `json:"sms_bind_phone_template"`
	SMSDeleteAccountTemplate             string `json:"sms_delete_account_template"`
	AliyunSMSAccessKeyID                 string `json:"aliyun_sms_access_key_id"`
	AliyunSMSAccessKeySecret             string `json:"aliyun_sms_access_key_secret"`
	AliyunSMSAccessKeySecretConfigured   bool   `json:"aliyun_sms_access_key_secret_configured"`
	AliyunSMSEndpoint                    string `json:"aliyun_sms_endpoint"`
	AliyunSMSRegionID                    string `json:"aliyun_sms_region_id"`
	AliyunSMSSignName                    string `json:"aliyun_sms_sign_name"`
	AliyunSMSLoginTemplateCode           string `json:"aliyun_sms_login_template_code"`
	AliyunSMSRegisterTemplateCode        string `json:"aliyun_sms_register_template_code"`
	AliyunSMSResetTemplateCode           string `json:"aliyun_sms_reset_template_code"`
	AliyunSMSBindPhoneTemplateCode       string `json:"aliyun_sms_bind_phone_template_code"`
	AliyunSMSDeleteTemplateCode          string `json:"aliyun_sms_delete_template_code"`
	RiskControlEnabled                   bool   `json:"risk_control_enabled"`
	RiskImmediateBindProbability         int    `json:"risk_immediate_bind_probability"`
	RiskDelayedBindProbability           int    `json:"risk_delayed_bind_probability"`
	RiskDelayedBindLoginCount            int    `json:"risk_delayed_bind_login_count"`
	RateLimitEnabled                     bool   `json:"rate_limit_enabled"`
	SendChallengeEnabled                 bool   `json:"send_challenge_enabled"`
	ChallengeTokenTTLSeconds             int    `json:"challenge_token_ttl_seconds"`
	ChallengeRequiredAfterIPMinuteCount  int    `json:"challenge_required_after_ip_minute_count"`
	CaptchaRequiredAfterIPHourCount      int    `json:"captcha_required_after_ip_hour_count"`
	EmailTargetCooldownSeconds           int    `json:"email_target_cooldown_seconds"`
	EmailIPMinuteLimit                   int    `json:"email_ip_minute_limit"`
	EmailIPHourLimit                     int    `json:"email_ip_hour_limit"`
	EmailIPHourUniqueTargetLimit         int    `json:"email_ip_hour_unique_target_limit"`
	EmailGlobalMinuteLimit               int    `json:"email_global_minute_limit"`
	EmailGlobalHourLimit                 int    `json:"email_global_hour_limit"`
	EmailFuseMinutes                     int    `json:"email_fuse_minutes"`
	SMSTargetCooldownSeconds             int    `json:"sms_target_cooldown_seconds"`
	SMSIPMinuteLimit                     int    `json:"sms_ip_minute_limit"`
	SMSIPHourLimit                       int    `json:"sms_ip_hour_limit"`
	SMSIPHourUniqueTargetLimit           int    `json:"sms_ip_hour_unique_target_limit"`
	SMSGlobalMinuteLimit                 int    `json:"sms_global_minute_limit"`
	SMSGlobalHourLimit                   int    `json:"sms_global_hour_limit"`
	SMSFuseMinutes                       int    `json:"sms_fuse_minutes"`
	AdminTestEmailMinuteLimit            int    `json:"admin_test_email_minute_limit"`
	AdminTestEmailDailyLimit             int    `json:"admin_test_email_daily_limit"`
	AdminTestSMSMinuteLimit              int    `json:"admin_test_sms_minute_limit"`
	AdminTestSMSDailyLimit               int    `json:"admin_test_sms_daily_limit"`
	AuthAttemptWindowMinutes             int    `json:"auth_attempt_window_minutes"`
	AuthAttemptLockMinutes               int    `json:"auth_attempt_lock_minutes"`
	PasswordLoginAccountAttemptLimit     int    `json:"password_login_account_attempt_limit"`
	OTPLoginAccountAttemptLimit          int    `json:"otp_login_account_attempt_limit"`
	MFALoginAccountAttemptLimit          int    `json:"mfa_login_account_attempt_limit"`
	AuthAttemptIPLimit                   int    `json:"auth_attempt_ip_limit"`
	AuthAttemptDeviceLimit               int    `json:"auth_attempt_device_limit"`
}

type VerificationCooldownError struct {
	RetryAfterSeconds int
}

func (e *VerificationCooldownError) Error() string {
	return fmt.Sprintf("please wait %d seconds before requesting another verification code", e.RetryAfterSeconds)
}

type RegisterInput struct {
	Country  string
	Email    string
	Code     string
	Password string
	Role     domain.Role
	IP       string
	DeviceID string
}

type SettingsService struct {
	deps      *serviceDeps
	rateLimit *RateLimitService
}

func (s *SettingsService) getFirstPartyClientCredentials() (string, string, string, error) {
	values, err := s.deps.store.GetSettings(
		"oidc_first_party_client_id",
		"oidc_first_party_client_secret",
		"oidc_first_party_scope",
	)
	if err != nil {
		return "", "", "", err
	}
	clientID := fallbackSetting(values["oidc_first_party_client_id"], s.deps.cfg.OIDC.FirstPartyClientID)
	clientSecret := fallbackSetting(values["oidc_first_party_client_secret"], s.deps.cfg.OIDC.FirstPartyClientSecret)
	scope := fallbackSetting(values["oidc_first_party_scope"], s.deps.cfg.OIDC.FirstPartyScope)
	return clientID, clientSecret, scope, nil
}

func (s *SettingsService) GetSystemSettings() (SystemSettings, error) {
	values, err := s.deps.store.GetSettings(
		"allow_user_registration",
		"enable_phone_verification",
		"site_name",
		"site_name_en",
		"site_browser_title",
		"site_browser_title_en",
		"site_logo_data_url",
		"site_footer_text",
		"site_icp_record_number",
		"site_public_security_record_number",
		"home_page_announcement_enabled",
		"home_page_announcement_content",
		"user_center_announcement_enabled",
		"user_center_announcement_content",
		"developer_announcement_enabled",
		"developer_announcement_content",
		"frontend_base_url",
		"oidc_first_party_client_id",
		"oidc_first_party_client_secret",
		"oidc_first_party_scope",
		"oidc_auto_approve_client_ids",
		"oidc_auto_approve_redirect_hosts",
		"smtp_host",
		"smtp_port",
		"smtp_username",
		"smtp_password",
		"smtp_from",
		"smtp_force_ssl",
		"smtp_verification_code_ttl_minutes",
		"smtp_verification_code_cooldown_seconds",
		"login_code_subject_template",
		"login_code_body_template",
		"login_code_subject_template_en",
		"login_code_body_template_en",
		"register_code_subject_template",
		"register_code_body_template",
		"register_code_subject_template_en",
		"register_code_body_template_en",
		"reset_password_code_subject_template",
		"reset_password_code_body_template",
		"reset_password_code_subject_template_en",
		"reset_password_code_body_template_en",
		"delete_account_code_subject_template",
		"delete_account_code_body_template",
		"delete_account_code_subject_template_en",
		"delete_account_code_body_template_en",
		"change_email_code_subject_template",
		"change_email_code_body_template",
		"change_email_code_subject_template_en",
		"change_email_code_body_template_en",
		"sms_provider",
		"sms_template_provider",
		"sms_api_base",
		"sms_username",
		"sms_password",
		"sms_signature",
		"sms_login_template",
		"sms_register_template",
		"sms_reset_password_template",
		"sms_bind_phone_template",
		"sms_delete_account_template",
		"aliyun_sms_access_key_id",
		"aliyun_sms_access_key_secret",
		"aliyun_sms_endpoint",
		"aliyun_sms_region_id",
		"aliyun_sms_sign_name",
		"aliyun_sms_login_template_code",
		"aliyun_sms_register_template_code",
		"aliyun_sms_reset_template_code",
		"aliyun_sms_bind_phone_template_code",
		"aliyun_sms_delete_template_code",
		"risk_control_enabled",
		"risk_immediate_bind_probability",
		"risk_delayed_bind_probability",
		"risk_delayed_bind_login_count",
		"rate_limit_enabled",
		"send_challenge_enabled",
		"challenge_token_ttl_seconds",
		"challenge_required_after_ip_minute_count",
		"captcha_required_after_ip_hour_count",
		"email_target_cooldown_seconds",
		"email_ip_minute_limit",
		"email_ip_hour_limit",
		"email_ip_hour_unique_target_limit",
		"email_global_minute_limit",
		"email_global_hour_limit",
		"email_fuse_minutes",
		"sms_target_cooldown_seconds",
		"sms_ip_minute_limit",
		"sms_ip_hour_limit",
		"sms_ip_hour_unique_target_limit",
		"sms_global_minute_limit",
		"sms_global_hour_limit",
		"sms_fuse_minutes",
		"admin_test_email_minute_limit",
		"admin_test_email_daily_limit",
		"admin_test_sms_minute_limit",
		"admin_test_sms_daily_limit",
		"auth_attempt_window_minutes",
		"auth_attempt_lock_minutes",
		"password_login_account_attempt_limit",
		"otp_login_account_attempt_limit",
		"mfa_login_account_attempt_limit",
		"auth_attempt_ip_limit",
		"auth_attempt_device_limit",
	)
	if err != nil {
		return SystemSettings{}, err
	}

	ttlMinutes := int(s.deps.cfg.SMTP.VerificationCodeTTL.Minutes())
	if ttlMinutes <= 0 {
		ttlMinutes = appdefaults.DefaultVerificationCodeTTLMinutes
	}
	if raw := strings.TrimSpace(values["smtp_verification_code_ttl_minutes"]); raw != "" {
		if parsed, parseErr := strconv.Atoi(raw); parseErr == nil && parsed > 0 {
			ttlMinutes = parsed
		}
	}

	cooldownSeconds := appdefaults.DefaultVerificationCodeCooldownSeconds
	if raw := strings.TrimSpace(values["smtp_verification_code_cooldown_seconds"]); raw != "" {
		if parsed, parseErr := strconv.Atoi(raw); parseErr == nil && parsed >= 0 {
			cooldownSeconds = parsed
		}
	}

	riskImmediateProbability := appdefaults.DefaultRiskImmediateBindProbability
	if raw := strings.TrimSpace(values["risk_immediate_bind_probability"]); raw != "" {
		if parsed, parseErr := strconv.Atoi(raw); parseErr == nil && parsed >= 0 && parsed <= 100 {
			riskImmediateProbability = parsed
		}
	}

	riskDelayedProbability := appdefaults.DefaultRiskDelayedBindProbability
	if raw := strings.TrimSpace(values["risk_delayed_bind_probability"]); raw != "" {
		if parsed, parseErr := strconv.Atoi(raw); parseErr == nil && parsed >= 0 && parsed <= 100 {
			riskDelayedProbability = parsed
		}
	}

	riskDelayedLoginCount := appdefaults.DefaultRiskDelayedBindLoginCount
	if raw := strings.TrimSpace(values["risk_delayed_bind_login_count"]); raw != "" {
		if parsed, parseErr := strconv.Atoi(raw); parseErr == nil && parsed > 0 {
			riskDelayedLoginCount = parsed
		}
	}

	parseNonNegative := func(key string, fallback int) int {
		if raw := strings.TrimSpace(values[key]); raw != "" {
			if parsed, parseErr := strconv.Atoi(raw); parseErr == nil && parsed >= 0 {
				return parsed
			}
		}
		return fallback
	}
	parsePositive := func(key string, fallback int) int {
		if raw := strings.TrimSpace(values[key]); raw != "" {
			if parsed, parseErr := strconv.Atoi(raw); parseErr == nil && parsed > 0 {
				return parsed
			}
		}
		return fallback
	}

	challengeTTLSeconds := parsePositive("challenge_token_ttl_seconds", appdefaults.DefaultChallengeTokenTTLSeconds)
	challengeRequiredAfterIPMinuteCount := parseNonNegative("challenge_required_after_ip_minute_count", appdefaults.DefaultChallengeIPMinuteThreshold)
	captchaRequiredAfterIPHourCount := parseNonNegative("captcha_required_after_ip_hour_count", appdefaults.DefaultCaptchaIPHourThreshold)
	emailTargetCooldownSeconds := parseNonNegative("email_target_cooldown_seconds", appdefaults.DefaultEmailTargetCooldownSeconds)
	emailIPMinuteLimit := parseNonNegative("email_ip_minute_limit", appdefaults.DefaultEmailIPMinuteLimit)
	emailIPHourLimit := parseNonNegative("email_ip_hour_limit", appdefaults.DefaultEmailIPHourLimit)
	emailIPHourUniqueTargetLimit := parseNonNegative("email_ip_hour_unique_target_limit", appdefaults.DefaultEmailIPHourUniqueTargetLimit)
	emailGlobalMinuteLimit := parseNonNegative("email_global_minute_limit", appdefaults.DefaultEmailGlobalMinuteLimit)
	emailGlobalHourLimit := parseNonNegative("email_global_hour_limit", appdefaults.DefaultEmailGlobalHourLimit)
	emailFuseMinutes := parsePositive("email_fuse_minutes", appdefaults.DefaultEmailFuseMinutes)
	smsTargetCooldownSeconds := parseNonNegative("sms_target_cooldown_seconds", appdefaults.DefaultSMSCodeTargetCooldownSeconds)
	smsIPMinuteLimit := parseNonNegative("sms_ip_minute_limit", appdefaults.DefaultSMSIPMinuteLimit)
	smsIPHourLimit := parseNonNegative("sms_ip_hour_limit", appdefaults.DefaultSMSIPHourLimit)
	smsIPHourUniqueTargetLimit := parseNonNegative("sms_ip_hour_unique_target_limit", appdefaults.DefaultSMSIPHourUniqueTargetLimit)
	smsGlobalMinuteLimit := parseNonNegative("sms_global_minute_limit", appdefaults.DefaultSMSGlobalMinuteLimit)
	smsGlobalHourLimit := parseNonNegative("sms_global_hour_limit", appdefaults.DefaultSMSGlobalHourLimit)
	smsFuseMinutes := parsePositive("sms_fuse_minutes", appdefaults.DefaultSMSFuseMinutes)
	adminTestEmailMinuteLimit := parseNonNegative("admin_test_email_minute_limit", appdefaults.DefaultAdminTestEmailMinuteLimit)
	adminTestEmailDailyLimit := parseNonNegative("admin_test_email_daily_limit", appdefaults.DefaultAdminTestEmailDailyLimit)
	adminTestSMSMinuteLimit := parseNonNegative("admin_test_sms_minute_limit", appdefaults.DefaultAdminTestSMSMinuteLimit)
	adminTestSMSDailyLimit := parseNonNegative("admin_test_sms_daily_limit", appdefaults.DefaultAdminTestSMSDailyLimit)
	authAttemptWindowMinutes := parsePositive("auth_attempt_window_minutes", appdefaults.DefaultAuthAttemptWindowMinutes)
	authAttemptLockMinutes := parsePositive("auth_attempt_lock_minutes", appdefaults.DefaultAuthAttemptLockMinutes)
	passwordLoginAccountAttemptLimit := parseNonNegative("password_login_account_attempt_limit", appdefaults.DefaultPasswordLoginAccountAttemptLimit)
	otpLoginAccountAttemptLimit := parseNonNegative("otp_login_account_attempt_limit", appdefaults.DefaultOTPLoginAccountAttemptLimit)
	mfaLoginAccountAttemptLimit := parseNonNegative("mfa_login_account_attempt_limit", appdefaults.DefaultMFALoginAccountAttemptLimit)
	authAttemptIPLimit := parseNonNegative("auth_attempt_ip_limit", appdefaults.DefaultAuthAttemptIPLimit)
	authAttemptDeviceLimit := parseNonNegative("auth_attempt_device_limit", appdefaults.DefaultAuthAttemptDeviceLimit)

	oidcFirstPartyClientSecret := strings.TrimSpace(fallbackSetting(values["oidc_first_party_client_secret"], s.deps.cfg.OIDC.FirstPartyClientSecret))
	smtpPassword := strings.TrimSpace(fallbackSetting(values["smtp_password"], s.deps.cfg.SMTP.Password))
	smsPassword := strings.TrimSpace(values["sms_password"])
	aliyunSMSAccessKeySecret := strings.TrimSpace(values["aliyun_sms_access_key_secret"])

	return SystemSettings{
		AllowUserRegistration:                fallbackBoolSetting(values["allow_user_registration"], appdefaults.DefaultAllowUserRegistration),
		EnablePhoneVerification:              fallbackBoolSetting(values["enable_phone_verification"], true),
		SiteName:                             fallbackSetting(values["site_name"], appdefaults.DefaultSiteName),
		SiteNameEN:                           strings.TrimSpace(values["site_name_en"]),
		SiteBrowserTitle:                     strings.TrimSpace(values["site_browser_title"]),
		SiteBrowserTitleEN:                   strings.TrimSpace(values["site_browser_title_en"]),
		SiteLogoDataURL:                      strings.TrimSpace(values["site_logo_data_url"]),
		SiteFooterText:                       strings.TrimSpace(values["site_footer_text"]),
		SiteICPRecordNumber:                  strings.TrimSpace(values["site_icp_record_number"]),
		SitePublicSecurityRecordNumber:       strings.TrimSpace(values["site_public_security_record_number"]),
		HomePageAnnouncementEnabled:          fallbackBoolSetting(values["home_page_announcement_enabled"], appdefaults.DefaultHomePageAnnouncementEnabled),
		HomePageAnnouncementContent:          strings.TrimSpace(values["home_page_announcement_content"]),
		UserCenterAnnouncementEnabled:        fallbackBoolSetting(values["user_center_announcement_enabled"], appdefaults.DefaultUserCenterAnnouncementEnabled),
		UserCenterAnnouncementContent:        strings.TrimSpace(values["user_center_announcement_content"]),
		DeveloperAnnouncementEnabled:         fallbackBoolSetting(values["developer_announcement_enabled"], appdefaults.DefaultDeveloperAnnouncementEnabled),
		DeveloperAnnouncementContent:         strings.TrimSpace(values["developer_announcement_content"]),
		FrontendBaseURL:                      fallbackSetting(values["frontend_base_url"], s.deps.cfg.HTTP.FrontendBase),
		OIDCFirstPartyClientID:               fallbackSetting(values["oidc_first_party_client_id"], s.deps.cfg.OIDC.FirstPartyClientID),
		OIDCFirstPartyClientSecret:           "",
		OIDCFirstPartyClientSecretConfigured: oidcFirstPartyClientSecret != "",
		OIDCFirstPartyScope:                  fallbackSetting(values["oidc_first_party_scope"], s.deps.cfg.OIDC.FirstPartyScope),
		OIDCAutoApproveClientIDs:             strings.TrimSpace(values["oidc_auto_approve_client_ids"]),
		OIDCAutoApproveRedirectHosts:         strings.TrimSpace(values["oidc_auto_approve_redirect_hosts"]),
		SMTPHost:                             fallbackSetting(values["smtp_host"], s.deps.cfg.SMTP.Host),
		SMTPPort:                             fallbackSetting(values["smtp_port"], s.deps.cfg.SMTP.Port),
		SMTPUsername:                         fallbackSetting(values["smtp_username"], s.deps.cfg.SMTP.Username),
		SMTPPassword:                         "",
		SMTPPasswordConfigured:               smtpPassword != "",
		SMTPFrom:                             fallbackSetting(values["smtp_from"], s.deps.cfg.SMTP.From),
		SMTPForceSSL:                         fallbackBoolSetting(values["smtp_force_ssl"], s.deps.cfg.SMTP.ForceSSL),
		SMTPVerificationCodeTTLMinute:        ttlMinutes,
		SMTPVerificationCodeCooldownSecond:   cooldownSeconds,
		LoginCodeSubjectTemplate:             fallbackSetting(values["login_code_subject_template"], appdefaults.DefaultLoginCodeSubjectTemplate),
		LoginCodeBodyTemplate:                fallbackSetting(values["login_code_body_template"], appdefaults.DefaultLoginCodeBodyTemplate),
		LoginCodeSubjectTemplateEN:           fallbackSetting(values["login_code_subject_template_en"], appdefaults.DefaultLoginCodeSubjectTemplateEN),
		LoginCodeBodyTemplateEN:              fallbackSetting(values["login_code_body_template_en"], appdefaults.DefaultLoginCodeBodyTemplateEN),
		RegisterCodeSubjectTemplate:          fallbackSetting(values["register_code_subject_template"], appdefaults.DefaultRegisterCodeSubjectTemplate),
		RegisterCodeBodyTemplate:             fallbackSetting(values["register_code_body_template"], appdefaults.DefaultRegisterCodeBodyTemplate),
		RegisterCodeSubjectTemplateEN:        fallbackSetting(values["register_code_subject_template_en"], appdefaults.DefaultRegisterCodeSubjectTemplateEN),
		RegisterCodeBodyTemplateEN:           fallbackSetting(values["register_code_body_template_en"], appdefaults.DefaultRegisterCodeBodyTemplateEN),
		ResetPasswordCodeSubjectTemplate:     fallbackSetting(values["reset_password_code_subject_template"], appdefaults.DefaultResetPasswordCodeSubjectTemplate),
		ResetPasswordCodeBodyTemplate:        fallbackSetting(values["reset_password_code_body_template"], appdefaults.DefaultResetPasswordCodeBodyTemplate),
		ResetPasswordCodeSubjectTemplateEN:   fallbackSetting(values["reset_password_code_subject_template_en"], appdefaults.DefaultResetPasswordCodeSubjectTemplateEN),
		ResetPasswordCodeBodyTemplateEN:      fallbackSetting(values["reset_password_code_body_template_en"], appdefaults.DefaultResetPasswordCodeBodyTemplateEN),
		DeleteAccountCodeSubjectTemplate:     fallbackSetting(values["delete_account_code_subject_template"], appdefaults.DefaultDeleteAccountCodeSubjectTemplate),
		DeleteAccountCodeBodyTemplate:        fallbackSetting(values["delete_account_code_body_template"], appdefaults.DefaultDeleteAccountCodeBodyTemplate),
		DeleteAccountCodeSubjectTemplateEN:   fallbackSetting(values["delete_account_code_subject_template_en"], appdefaults.DefaultDeleteAccountCodeSubjectTemplateEN),
		DeleteAccountCodeBodyTemplateEN:      fallbackSetting(values["delete_account_code_body_template_en"], appdefaults.DefaultDeleteAccountCodeBodyTemplateEN),
		ChangeEmailCodeSubjectTemplate:       fallbackSetting(values["change_email_code_subject_template"], appdefaults.DefaultChangeEmailCodeSubjectTemplate),
		ChangeEmailCodeBodyTemplate:          fallbackSetting(values["change_email_code_body_template"], appdefaults.DefaultChangeEmailCodeBodyTemplate),
		ChangeEmailCodeSubjectTemplateEN:     fallbackSetting(values["change_email_code_subject_template_en"], appdefaults.DefaultChangeEmailCodeSubjectTemplateEN),
		ChangeEmailCodeBodyTemplateEN:        fallbackSetting(values["change_email_code_body_template_en"], appdefaults.DefaultChangeEmailCodeBodyTemplateEN),
		SMSProvider:                          fallbackSetting(values["sms_provider"], appdefaults.DefaultSMSProvider),
		SMSTemplateProvider:                  fallbackSetting(values["sms_template_provider"], appdefaults.DefaultSMSTemplateProvider),
		SMSAPIBase:                           fallbackSetting(values["sms_api_base"], appdefaults.DefaultSMSAPIBase),
		SMSUsername:                          strings.TrimSpace(values["sms_username"]),
		SMSPassword:                          "",
		SMSPasswordConfigured:                smsPassword != "",
		SMSSignature:                         fallbackSetting(values["sms_signature"], appdefaults.DefaultSMSSignature),
		SMSLoginTemplate:                     fallbackSetting(values["sms_login_template"], appdefaults.DefaultSMSLoginTemplate),
		SMSRegisterTemplate:                  fallbackSetting(values["sms_register_template"], appdefaults.DefaultSMSRegisterTemplate),
		SMSResetPasswordTemplate:             fallbackSetting(values["sms_reset_password_template"], appdefaults.DefaultSMSResetPasswordTemplate),
		SMSBindPhoneTemplate:                 fallbackSetting(values["sms_bind_phone_template"], appdefaults.DefaultSMSBindPhoneTemplate),
		SMSDeleteAccountTemplate:             fallbackSetting(values["sms_delete_account_template"], appdefaults.DefaultSMSDeleteAccountTemplate),
		AliyunSMSAccessKeyID:                 strings.TrimSpace(values["aliyun_sms_access_key_id"]),
		AliyunSMSAccessKeySecret:             "",
		AliyunSMSAccessKeySecretConfigured:   aliyunSMSAccessKeySecret != "",
		AliyunSMSEndpoint:                    fallbackSetting(values["aliyun_sms_endpoint"], appdefaults.DefaultAliyunSMSEndpoint),
		AliyunSMSRegionID:                    fallbackSetting(values["aliyun_sms_region_id"], appdefaults.DefaultAliyunSMSRegionID),
		AliyunSMSSignName:                    fallbackSetting(values["aliyun_sms_sign_name"], appdefaults.DefaultAliyunSMSSignName),
		AliyunSMSLoginTemplateCode:           strings.TrimSpace(values["aliyun_sms_login_template_code"]),
		AliyunSMSRegisterTemplateCode:        strings.TrimSpace(values["aliyun_sms_register_template_code"]),
		AliyunSMSResetTemplateCode:           strings.TrimSpace(values["aliyun_sms_reset_template_code"]),
		AliyunSMSBindPhoneTemplateCode:       strings.TrimSpace(values["aliyun_sms_bind_phone_template_code"]),
		AliyunSMSDeleteTemplateCode:          strings.TrimSpace(values["aliyun_sms_delete_template_code"]),
		RiskControlEnabled:                   fallbackBoolSetting(values["risk_control_enabled"], appdefaults.DefaultRiskControlEnabled),
		RiskImmediateBindProbability:         riskImmediateProbability,
		RiskDelayedBindProbability:           riskDelayedProbability,
		RiskDelayedBindLoginCount:            riskDelayedLoginCount,
		RateLimitEnabled:                     fallbackBoolSetting(values["rate_limit_enabled"], appdefaults.DefaultRateLimitEnabled),
		SendChallengeEnabled:                 fallbackBoolSetting(values["send_challenge_enabled"], appdefaults.DefaultSendChallengeEnabled),
		ChallengeTokenTTLSeconds:             challengeTTLSeconds,
		ChallengeRequiredAfterIPMinuteCount:  challengeRequiredAfterIPMinuteCount,
		CaptchaRequiredAfterIPHourCount:      captchaRequiredAfterIPHourCount,
		EmailTargetCooldownSeconds:           emailTargetCooldownSeconds,
		EmailIPMinuteLimit:                   emailIPMinuteLimit,
		EmailIPHourLimit:                     emailIPHourLimit,
		EmailIPHourUniqueTargetLimit:         emailIPHourUniqueTargetLimit,
		EmailGlobalMinuteLimit:               emailGlobalMinuteLimit,
		EmailGlobalHourLimit:                 emailGlobalHourLimit,
		EmailFuseMinutes:                     emailFuseMinutes,
		SMSTargetCooldownSeconds:             smsTargetCooldownSeconds,
		SMSIPMinuteLimit:                     smsIPMinuteLimit,
		SMSIPHourLimit:                       smsIPHourLimit,
		SMSIPHourUniqueTargetLimit:           smsIPHourUniqueTargetLimit,
		SMSGlobalMinuteLimit:                 smsGlobalMinuteLimit,
		SMSGlobalHourLimit:                   smsGlobalHourLimit,
		SMSFuseMinutes:                       smsFuseMinutes,
		AdminTestEmailMinuteLimit:            adminTestEmailMinuteLimit,
		AdminTestEmailDailyLimit:             adminTestEmailDailyLimit,
		AdminTestSMSMinuteLimit:              adminTestSMSMinuteLimit,
		AdminTestSMSDailyLimit:               adminTestSMSDailyLimit,
		AuthAttemptWindowMinutes:             authAttemptWindowMinutes,
		AuthAttemptLockMinutes:               authAttemptLockMinutes,
		PasswordLoginAccountAttemptLimit:     passwordLoginAccountAttemptLimit,
		OTPLoginAccountAttemptLimit:          otpLoginAccountAttemptLimit,
		MFALoginAccountAttemptLimit:          mfaLoginAccountAttemptLimit,
		AuthAttemptIPLimit:                   authAttemptIPLimit,
		AuthAttemptDeviceLimit:               authAttemptDeviceLimit,
	}, nil
}

func (s *SettingsService) UpdateSystemSettings(input SystemSettings) error {
	currentSettings, err := s.GetSystemSettings()
	if err != nil {
		return err
	}
	currentSecretValues, err := s.deps.store.GetSettings(
		"oidc_first_party_client_secret",
		"smtp_password",
		"sms_password",
		"aliyun_sms_access_key_secret",
	)
	if err != nil {
		return err
	}
	currentOIDCFirstPartyClientSecret := fallbackSetting(currentSecretValues["oidc_first_party_client_secret"], s.deps.cfg.OIDC.FirstPartyClientSecret)
	currentSMTPPassword := fallbackSetting(currentSecretValues["smtp_password"], s.deps.cfg.SMTP.Password)
	currentSMSPassword := currentSecretValues["sms_password"]
	currentAliyunSMSAccessKeySecret := currentSecretValues["aliyun_sms_access_key_secret"]

	if strings.TrimSpace(input.SiteName) == "" {
		input.SiteName = appdefaults.DefaultSiteName
	}
	if strings.TrimSpace(input.FrontendBaseURL) == "" {
		input.FrontendBaseURL = s.deps.cfg.HTTP.FrontendBase
	}
	if strings.TrimSpace(input.OIDCFirstPartyClientID) == "" {
		input.OIDCFirstPartyClientID = s.deps.cfg.OIDC.FirstPartyClientID
	}
	if strings.TrimSpace(input.OIDCFirstPartyClientSecret) == "" {
		input.OIDCFirstPartyClientSecret = currentOIDCFirstPartyClientSecret
	}
	if strings.TrimSpace(input.OIDCFirstPartyClientSecret) == "" {
		return fmt.Errorf("first-party client secret is required")
	}
	if strings.TrimSpace(input.SMTPPassword) == "" {
		input.SMTPPassword = currentSMTPPassword
	}
	if strings.TrimSpace(input.SMSPassword) == "" {
		input.SMSPassword = currentSMSPassword
	}
	if strings.TrimSpace(input.AliyunSMSAccessKeySecret) == "" {
		input.AliyunSMSAccessKeySecret = currentAliyunSMSAccessKeySecret
	}
	if strings.TrimSpace(input.OIDCFirstPartyScope) == "" {
		input.OIDCFirstPartyScope = s.deps.cfg.OIDC.FirstPartyScope
	}
	if strings.TrimSpace(input.SMTPPort) == "" {
		input.SMTPPort = appdefaults.DefaultSMTPPort
	}
	if input.SMTPVerificationCodeTTLMinute <= 0 {
		input.SMTPVerificationCodeTTLMinute = appdefaults.DefaultVerificationCodeTTLMinutes
	}
	if input.SMTPVerificationCodeCooldownSecond < 0 {
		input.SMTPVerificationCodeCooldownSecond = 0
	}
	if strings.TrimSpace(input.LoginCodeSubjectTemplate) == "" {
		input.LoginCodeSubjectTemplate = appdefaults.DefaultLoginCodeSubjectTemplate
	}
	if strings.TrimSpace(input.LoginCodeBodyTemplate) == "" {
		input.LoginCodeBodyTemplate = appdefaults.DefaultLoginCodeBodyTemplate
	}
	if strings.TrimSpace(input.LoginCodeSubjectTemplateEN) == "" {
		input.LoginCodeSubjectTemplateEN = appdefaults.DefaultLoginCodeSubjectTemplateEN
	}
	if strings.TrimSpace(input.LoginCodeBodyTemplateEN) == "" {
		input.LoginCodeBodyTemplateEN = appdefaults.DefaultLoginCodeBodyTemplateEN
	}
	if strings.TrimSpace(input.RegisterCodeSubjectTemplate) == "" {
		input.RegisterCodeSubjectTemplate = appdefaults.DefaultRegisterCodeSubjectTemplate
	}
	if strings.TrimSpace(input.RegisterCodeBodyTemplate) == "" {
		input.RegisterCodeBodyTemplate = appdefaults.DefaultRegisterCodeBodyTemplate
	}
	if strings.TrimSpace(input.RegisterCodeSubjectTemplateEN) == "" {
		input.RegisterCodeSubjectTemplateEN = appdefaults.DefaultRegisterCodeSubjectTemplateEN
	}
	if strings.TrimSpace(input.RegisterCodeBodyTemplateEN) == "" {
		input.RegisterCodeBodyTemplateEN = appdefaults.DefaultRegisterCodeBodyTemplateEN
	}
	if strings.TrimSpace(input.ResetPasswordCodeSubjectTemplate) == "" {
		input.ResetPasswordCodeSubjectTemplate = appdefaults.DefaultResetPasswordCodeSubjectTemplate
	}
	if strings.TrimSpace(input.ResetPasswordCodeBodyTemplate) == "" {
		input.ResetPasswordCodeBodyTemplate = appdefaults.DefaultResetPasswordCodeBodyTemplate
	}
	if strings.TrimSpace(input.ResetPasswordCodeSubjectTemplateEN) == "" {
		input.ResetPasswordCodeSubjectTemplateEN = appdefaults.DefaultResetPasswordCodeSubjectTemplateEN
	}
	if strings.TrimSpace(input.ResetPasswordCodeBodyTemplateEN) == "" {
		input.ResetPasswordCodeBodyTemplateEN = appdefaults.DefaultResetPasswordCodeBodyTemplateEN
	}
	if strings.TrimSpace(input.DeleteAccountCodeSubjectTemplate) == "" {
		input.DeleteAccountCodeSubjectTemplate = appdefaults.DefaultDeleteAccountCodeSubjectTemplate
	}
	if strings.TrimSpace(input.DeleteAccountCodeBodyTemplate) == "" {
		input.DeleteAccountCodeBodyTemplate = appdefaults.DefaultDeleteAccountCodeBodyTemplate
	}
	if strings.TrimSpace(input.DeleteAccountCodeSubjectTemplateEN) == "" {
		input.DeleteAccountCodeSubjectTemplateEN = appdefaults.DefaultDeleteAccountCodeSubjectTemplateEN
	}
	if strings.TrimSpace(input.DeleteAccountCodeBodyTemplateEN) == "" {
		input.DeleteAccountCodeBodyTemplateEN = appdefaults.DefaultDeleteAccountCodeBodyTemplateEN
	}
	if strings.TrimSpace(input.ChangeEmailCodeSubjectTemplate) == "" {
		input.ChangeEmailCodeSubjectTemplate = appdefaults.DefaultChangeEmailCodeSubjectTemplate
	}
	if strings.TrimSpace(input.ChangeEmailCodeBodyTemplate) == "" {
		input.ChangeEmailCodeBodyTemplate = appdefaults.DefaultChangeEmailCodeBodyTemplate
	}
	if strings.TrimSpace(input.ChangeEmailCodeSubjectTemplateEN) == "" {
		input.ChangeEmailCodeSubjectTemplateEN = appdefaults.DefaultChangeEmailCodeSubjectTemplateEN
	}
	if strings.TrimSpace(input.ChangeEmailCodeBodyTemplateEN) == "" {
		input.ChangeEmailCodeBodyTemplateEN = appdefaults.DefaultChangeEmailCodeBodyTemplateEN
	}
	if strings.TrimSpace(input.SMSProvider) == "" {
		input.SMSProvider = appdefaults.DefaultSMSProvider
	}
	if strings.TrimSpace(input.SMSTemplateProvider) == "" {
		input.SMSTemplateProvider = appdefaults.DefaultSMSTemplateProvider
	}
	if strings.TrimSpace(input.SMSAPIBase) == "" {
		input.SMSAPIBase = appdefaults.DefaultSMSAPIBase
	}
	if strings.TrimSpace(input.SMSLoginTemplate) == "" {
		input.SMSLoginTemplate = appdefaults.DefaultSMSLoginTemplate
	}
	if strings.TrimSpace(input.SMSRegisterTemplate) == "" {
		input.SMSRegisterTemplate = appdefaults.DefaultSMSRegisterTemplate
	}
	if strings.TrimSpace(input.SMSResetPasswordTemplate) == "" {
		input.SMSResetPasswordTemplate = appdefaults.DefaultSMSResetPasswordTemplate
	}
	if strings.TrimSpace(input.SMSBindPhoneTemplate) == "" {
		input.SMSBindPhoneTemplate = appdefaults.DefaultSMSBindPhoneTemplate
	}
	if strings.TrimSpace(input.SMSDeleteAccountTemplate) == "" {
		input.SMSDeleteAccountTemplate = appdefaults.DefaultSMSDeleteAccountTemplate
	}
	if strings.TrimSpace(input.AliyunSMSEndpoint) == "" {
		input.AliyunSMSEndpoint = appdefaults.DefaultAliyunSMSEndpoint
	}
	if strings.TrimSpace(input.AliyunSMSRegionID) == "" {
		input.AliyunSMSRegionID = appdefaults.DefaultAliyunSMSRegionID
	}
	if input.RiskImmediateBindProbability < 0 {
		input.RiskImmediateBindProbability = 0
	}
	if input.RiskImmediateBindProbability > 100 {
		input.RiskImmediateBindProbability = 100
	}
	if input.RiskDelayedBindProbability < 0 {
		input.RiskDelayedBindProbability = 0
	}
	if input.RiskDelayedBindProbability > 100 {
		input.RiskDelayedBindProbability = 100
	}
	if input.RiskDelayedBindLoginCount <= 0 {
		input.RiskDelayedBindLoginCount = appdefaults.DefaultRiskDelayedBindLoginCount
	}
	if input.RiskImmediateBindProbability+input.RiskDelayedBindProbability != 100 {
		return fmt.Errorf("risk probabilities must add up to 100")
	}
	if input.ChallengeTokenTTLSeconds <= 0 {
		input.ChallengeTokenTTLSeconds = appdefaults.DefaultChallengeTokenTTLSeconds
	}
	if input.ChallengeRequiredAfterIPMinuteCount < 0 {
		input.ChallengeRequiredAfterIPMinuteCount = appdefaults.DefaultChallengeIPMinuteThreshold
	}
	if input.CaptchaRequiredAfterIPHourCount < 0 {
		input.CaptchaRequiredAfterIPHourCount = appdefaults.DefaultCaptchaIPHourThreshold
	}
	if input.EmailTargetCooldownSeconds < 0 {
		input.EmailTargetCooldownSeconds = appdefaults.DefaultEmailTargetCooldownSeconds
	}
	if input.EmailIPMinuteLimit < 0 {
		input.EmailIPMinuteLimit = appdefaults.DefaultEmailIPMinuteLimit
	}
	if input.EmailIPHourLimit < 0 {
		input.EmailIPHourLimit = appdefaults.DefaultEmailIPHourLimit
	}
	if input.EmailIPHourUniqueTargetLimit < 0 {
		input.EmailIPHourUniqueTargetLimit = appdefaults.DefaultEmailIPHourUniqueTargetLimit
	}
	if input.EmailGlobalMinuteLimit < 0 {
		input.EmailGlobalMinuteLimit = appdefaults.DefaultEmailGlobalMinuteLimit
	}
	if input.EmailGlobalHourLimit < 0 {
		input.EmailGlobalHourLimit = appdefaults.DefaultEmailGlobalHourLimit
	}
	if input.EmailFuseMinutes <= 0 {
		input.EmailFuseMinutes = appdefaults.DefaultEmailFuseMinutes
	}
	if input.SMSTargetCooldownSeconds < 0 {
		input.SMSTargetCooldownSeconds = appdefaults.DefaultSMSCodeTargetCooldownSeconds
	}
	if input.SMSIPMinuteLimit < 0 {
		input.SMSIPMinuteLimit = appdefaults.DefaultSMSIPMinuteLimit
	}
	if input.SMSIPHourLimit < 0 {
		input.SMSIPHourLimit = appdefaults.DefaultSMSIPHourLimit
	}
	if input.SMSIPHourUniqueTargetLimit < 0 {
		input.SMSIPHourUniqueTargetLimit = appdefaults.DefaultSMSIPHourUniqueTargetLimit
	}
	if input.SMSGlobalMinuteLimit < 0 {
		input.SMSGlobalMinuteLimit = appdefaults.DefaultSMSGlobalMinuteLimit
	}
	if input.SMSGlobalHourLimit < 0 {
		input.SMSGlobalHourLimit = appdefaults.DefaultSMSGlobalHourLimit
	}
	if input.SMSFuseMinutes <= 0 {
		input.SMSFuseMinutes = appdefaults.DefaultSMSFuseMinutes
	}
	if input.AdminTestEmailMinuteLimit < 0 {
		input.AdminTestEmailMinuteLimit = appdefaults.DefaultAdminTestEmailMinuteLimit
	}
	if input.AdminTestEmailDailyLimit < 0 {
		input.AdminTestEmailDailyLimit = appdefaults.DefaultAdminTestEmailDailyLimit
	}
	if input.AdminTestSMSMinuteLimit < 0 {
		input.AdminTestSMSMinuteLimit = appdefaults.DefaultAdminTestSMSMinuteLimit
	}
	if input.AdminTestSMSDailyLimit < 0 {
		input.AdminTestSMSDailyLimit = appdefaults.DefaultAdminTestSMSDailyLimit
	}
	if input.AuthAttemptWindowMinutes <= 0 {
		input.AuthAttemptWindowMinutes = appdefaults.DefaultAuthAttemptWindowMinutes
	}
	if input.AuthAttemptLockMinutes <= 0 {
		input.AuthAttemptLockMinutes = appdefaults.DefaultAuthAttemptLockMinutes
	}
	if input.PasswordLoginAccountAttemptLimit < 0 {
		input.PasswordLoginAccountAttemptLimit = appdefaults.DefaultPasswordLoginAccountAttemptLimit
	}
	if input.OTPLoginAccountAttemptLimit < 0 {
		input.OTPLoginAccountAttemptLimit = appdefaults.DefaultOTPLoginAccountAttemptLimit
	}
	if input.MFALoginAccountAttemptLimit < 0 {
		input.MFALoginAccountAttemptLimit = appdefaults.DefaultMFALoginAccountAttemptLimit
	}
	if input.AuthAttemptIPLimit < 0 {
		input.AuthAttemptIPLimit = appdefaults.DefaultAuthAttemptIPLimit
	}
	if input.AuthAttemptDeviceLimit < 0 {
		input.AuthAttemptDeviceLimit = appdefaults.DefaultAuthAttemptDeviceLimit
	}
	if input.RiskControlEnabled {
		if err := validateRiskControlPrerequisites(input); err != nil {
			return err
		}
	}

	if err := s.deps.store.UpsertSettings(map[string]string{
		"allow_user_registration":                  strconv.FormatBool(input.AllowUserRegistration),
		"enable_phone_verification":                strconv.FormatBool(input.EnablePhoneVerification),
		"site_name":                                strings.TrimSpace(input.SiteName),
		"site_name_en":                             strings.TrimSpace(input.SiteNameEN),
		"site_browser_title":                       strings.TrimSpace(input.SiteBrowserTitle),
		"site_browser_title_en":                    strings.TrimSpace(input.SiteBrowserTitleEN),
		"site_logo_data_url":                       strings.TrimSpace(input.SiteLogoDataURL),
		"site_footer_text":                         input.SiteFooterText,
		"site_icp_record_number":                   strings.TrimSpace(input.SiteICPRecordNumber),
		"site_public_security_record_number":       strings.TrimSpace(input.SitePublicSecurityRecordNumber),
		"home_page_announcement_enabled":           strconv.FormatBool(input.HomePageAnnouncementEnabled),
		"home_page_announcement_content":           strings.TrimSpace(input.HomePageAnnouncementContent),
		"user_center_announcement_enabled":         strconv.FormatBool(input.UserCenterAnnouncementEnabled),
		"user_center_announcement_content":         strings.TrimSpace(input.UserCenterAnnouncementContent),
		"developer_announcement_enabled":           strconv.FormatBool(input.DeveloperAnnouncementEnabled),
		"developer_announcement_content":           strings.TrimSpace(input.DeveloperAnnouncementContent),
		"frontend_base_url":                        strings.TrimSpace(input.FrontendBaseURL),
		"oidc_first_party_client_id":               strings.TrimSpace(input.OIDCFirstPartyClientID),
		"oidc_first_party_client_secret":           strings.TrimSpace(input.OIDCFirstPartyClientSecret),
		"oidc_first_party_scope":                   strings.TrimSpace(input.OIDCFirstPartyScope),
		"oidc_auto_approve_client_ids":             normalizeListSetting(input.OIDCAutoApproveClientIDs),
		"oidc_auto_approve_redirect_hosts":         normalizeListSetting(input.OIDCAutoApproveRedirectHosts),
		"smtp_host":                                strings.TrimSpace(input.SMTPHost),
		"smtp_port":                                strings.TrimSpace(input.SMTPPort),
		"smtp_username":                            strings.TrimSpace(input.SMTPUsername),
		"smtp_password":                            input.SMTPPassword,
		"smtp_from":                                strings.TrimSpace(input.SMTPFrom),
		"smtp_force_ssl":                           strconv.FormatBool(input.SMTPForceSSL),
		"smtp_verification_code_ttl_minutes":       strconv.Itoa(input.SMTPVerificationCodeTTLMinute),
		"smtp_verification_code_cooldown_seconds":  strconv.Itoa(input.SMTPVerificationCodeCooldownSecond),
		"login_code_subject_template":              strings.TrimSpace(input.LoginCodeSubjectTemplate),
		"login_code_body_template":                 input.LoginCodeBodyTemplate,
		"login_code_subject_template_en":           strings.TrimSpace(input.LoginCodeSubjectTemplateEN),
		"login_code_body_template_en":              input.LoginCodeBodyTemplateEN,
		"register_code_subject_template":           strings.TrimSpace(input.RegisterCodeSubjectTemplate),
		"register_code_body_template":              input.RegisterCodeBodyTemplate,
		"register_code_subject_template_en":        strings.TrimSpace(input.RegisterCodeSubjectTemplateEN),
		"register_code_body_template_en":           input.RegisterCodeBodyTemplateEN,
		"reset_password_code_subject_template":     strings.TrimSpace(input.ResetPasswordCodeSubjectTemplate),
		"reset_password_code_body_template":        input.ResetPasswordCodeBodyTemplate,
		"reset_password_code_subject_template_en":  strings.TrimSpace(input.ResetPasswordCodeSubjectTemplateEN),
		"reset_password_code_body_template_en":     input.ResetPasswordCodeBodyTemplateEN,
		"delete_account_code_subject_template":     strings.TrimSpace(input.DeleteAccountCodeSubjectTemplate),
		"delete_account_code_body_template":        input.DeleteAccountCodeBodyTemplate,
		"delete_account_code_subject_template_en":  strings.TrimSpace(input.DeleteAccountCodeSubjectTemplateEN),
		"delete_account_code_body_template_en":     input.DeleteAccountCodeBodyTemplateEN,
		"change_email_code_subject_template":       strings.TrimSpace(input.ChangeEmailCodeSubjectTemplate),
		"change_email_code_body_template":          input.ChangeEmailCodeBodyTemplate,
		"change_email_code_subject_template_en":    strings.TrimSpace(input.ChangeEmailCodeSubjectTemplateEN),
		"change_email_code_body_template_en":       input.ChangeEmailCodeBodyTemplateEN,
		"sms_provider":                             strings.TrimSpace(input.SMSProvider),
		"sms_template_provider":                    strings.TrimSpace(input.SMSTemplateProvider),
		"sms_api_base":                             strings.TrimSpace(input.SMSAPIBase),
		"sms_username":                             strings.TrimSpace(input.SMSUsername),
		"sms_password":                             input.SMSPassword,
		"sms_signature":                            strings.TrimSpace(input.SMSSignature),
		"sms_login_template":                       input.SMSLoginTemplate,
		"sms_register_template":                    input.SMSRegisterTemplate,
		"sms_reset_password_template":              input.SMSResetPasswordTemplate,
		"sms_bind_phone_template":                  input.SMSBindPhoneTemplate,
		"sms_delete_account_template":              input.SMSDeleteAccountTemplate,
		"aliyun_sms_access_key_id":                 strings.TrimSpace(input.AliyunSMSAccessKeyID),
		"aliyun_sms_access_key_secret":             input.AliyunSMSAccessKeySecret,
		"aliyun_sms_endpoint":                      strings.TrimSpace(input.AliyunSMSEndpoint),
		"aliyun_sms_region_id":                     strings.TrimSpace(input.AliyunSMSRegionID),
		"aliyun_sms_sign_name":                     strings.TrimSpace(input.AliyunSMSSignName),
		"aliyun_sms_login_template_code":           strings.TrimSpace(input.AliyunSMSLoginTemplateCode),
		"aliyun_sms_register_template_code":        strings.TrimSpace(input.AliyunSMSRegisterTemplateCode),
		"aliyun_sms_reset_template_code":           strings.TrimSpace(input.AliyunSMSResetTemplateCode),
		"aliyun_sms_bind_phone_template_code":      strings.TrimSpace(input.AliyunSMSBindPhoneTemplateCode),
		"aliyun_sms_delete_template_code":          strings.TrimSpace(input.AliyunSMSDeleteTemplateCode),
		"risk_control_enabled":                     strconv.FormatBool(input.RiskControlEnabled),
		"risk_immediate_bind_probability":          strconv.Itoa(input.RiskImmediateBindProbability),
		"risk_delayed_bind_probability":            strconv.Itoa(input.RiskDelayedBindProbability),
		"risk_delayed_bind_login_count":            strconv.Itoa(input.RiskDelayedBindLoginCount),
		"rate_limit_enabled":                       strconv.FormatBool(input.RateLimitEnabled),
		"send_challenge_enabled":                   strconv.FormatBool(input.SendChallengeEnabled),
		"challenge_token_ttl_seconds":              strconv.Itoa(input.ChallengeTokenTTLSeconds),
		"challenge_required_after_ip_minute_count": strconv.Itoa(input.ChallengeRequiredAfterIPMinuteCount),
		"captcha_required_after_ip_hour_count":     strconv.Itoa(input.CaptchaRequiredAfterIPHourCount),
		"email_target_cooldown_seconds":            strconv.Itoa(input.EmailTargetCooldownSeconds),
		"email_ip_minute_limit":                    strconv.Itoa(input.EmailIPMinuteLimit),
		"email_ip_hour_limit":                      strconv.Itoa(input.EmailIPHourLimit),
		"email_ip_hour_unique_target_limit":        strconv.Itoa(input.EmailIPHourUniqueTargetLimit),
		"email_global_minute_limit":                strconv.Itoa(input.EmailGlobalMinuteLimit),
		"email_global_hour_limit":                  strconv.Itoa(input.EmailGlobalHourLimit),
		"email_fuse_minutes":                       strconv.Itoa(input.EmailFuseMinutes),
		"sms_target_cooldown_seconds":              strconv.Itoa(input.SMSTargetCooldownSeconds),
		"sms_ip_minute_limit":                      strconv.Itoa(input.SMSIPMinuteLimit),
		"sms_ip_hour_limit":                        strconv.Itoa(input.SMSIPHourLimit),
		"sms_ip_hour_unique_target_limit":          strconv.Itoa(input.SMSIPHourUniqueTargetLimit),
		"sms_global_minute_limit":                  strconv.Itoa(input.SMSGlobalMinuteLimit),
		"sms_global_hour_limit":                    strconv.Itoa(input.SMSGlobalHourLimit),
		"sms_fuse_minutes":                         strconv.Itoa(input.SMSFuseMinutes),
		"admin_test_email_minute_limit":            strconv.Itoa(input.AdminTestEmailMinuteLimit),
		"admin_test_email_daily_limit":             strconv.Itoa(input.AdminTestEmailDailyLimit),
		"admin_test_sms_minute_limit":              strconv.Itoa(input.AdminTestSMSMinuteLimit),
		"admin_test_sms_daily_limit":               strconv.Itoa(input.AdminTestSMSDailyLimit),
		"auth_attempt_window_minutes":              strconv.Itoa(input.AuthAttemptWindowMinutes),
		"auth_attempt_lock_minutes":                strconv.Itoa(input.AuthAttemptLockMinutes),
		"password_login_account_attempt_limit":     strconv.Itoa(input.PasswordLoginAccountAttemptLimit),
		"otp_login_account_attempt_limit":          strconv.Itoa(input.OTPLoginAccountAttemptLimit),
		"mfa_login_account_attempt_limit":          strconv.Itoa(input.MFALoginAccountAttemptLimit),
		"auth_attempt_ip_limit":                    strconv.Itoa(input.AuthAttemptIPLimit),
		"auth_attempt_device_limit":                strconv.Itoa(input.AuthAttemptDeviceLimit),
	}); err != nil {
		return err
	}

	if err := s.syncFirstPartyClient(input); err != nil {
		return err
	}

	removeReplacedUploadedFile(currentSettings.SiteLogoDataURL, input.SiteLogoDataURL)

	s.deps.cfg.SMTP.Host = strings.TrimSpace(input.SMTPHost)
	s.deps.cfg.SMTP.Port = strings.TrimSpace(input.SMTPPort)
	s.deps.cfg.SMTP.Username = strings.TrimSpace(input.SMTPUsername)
	s.deps.cfg.SMTP.Password = input.SMTPPassword
	s.deps.cfg.SMTP.From = strings.TrimSpace(input.SMTPFrom)
	s.deps.cfg.SMTP.ForceSSL = input.SMTPForceSSL
	s.deps.cfg.SMTP.VerificationCodeTTL = time.Duration(input.SMTPVerificationCodeTTLMinute) * time.Minute
	s.deps.mail = notify.NewMailer(s.deps.cfg.SMTP)
	s.deps.cfg.SMS.Provider = strings.TrimSpace(input.SMSProvider)
	s.deps.cfg.SMS.TemplateProvider = strings.TrimSpace(input.SMSTemplateProvider)
	s.deps.cfg.SMS.APIBase = strings.TrimSpace(input.SMSAPIBase)
	s.deps.cfg.SMS.Username = strings.TrimSpace(input.SMSUsername)
	s.deps.cfg.SMS.Password = input.SMSPassword
	s.deps.cfg.SMS.Signature = strings.TrimSpace(input.SMSSignature)
	s.deps.cfg.SMS.LoginTemplate = input.SMSLoginTemplate
	s.deps.cfg.SMS.RegisterTemplate = input.SMSRegisterTemplate
	s.deps.cfg.SMS.ResetPasswordTemplate = input.SMSResetPasswordTemplate
	s.deps.cfg.SMS.BindPhoneTemplate = input.SMSBindPhoneTemplate
	s.deps.cfg.SMS.DeleteAccountTemplate = input.SMSDeleteAccountTemplate
	s.deps.cfg.SMS.AliyunAccessKeyID = strings.TrimSpace(input.AliyunSMSAccessKeyID)
	s.deps.cfg.SMS.AliyunAccessKeySecret = input.AliyunSMSAccessKeySecret
	s.deps.cfg.SMS.AliyunEndpoint = strings.TrimSpace(input.AliyunSMSEndpoint)
	s.deps.cfg.SMS.AliyunRegionID = strings.TrimSpace(input.AliyunSMSRegionID)
	s.deps.cfg.SMS.AliyunSignName = strings.TrimSpace(input.AliyunSMSSignName)
	s.deps.cfg.SMS.AliyunLoginTemplateCode = strings.TrimSpace(input.AliyunSMSLoginTemplateCode)
	s.deps.cfg.SMS.AliyunRegisterTemplateCode = strings.TrimSpace(input.AliyunSMSRegisterTemplateCode)
	s.deps.cfg.SMS.AliyunResetTemplateCode = strings.TrimSpace(input.AliyunSMSResetTemplateCode)
	s.deps.cfg.SMS.AliyunBindPhoneTemplateCode = strings.TrimSpace(input.AliyunSMSBindPhoneTemplateCode)
	s.deps.cfg.SMS.AliyunDeleteTemplateCode = strings.TrimSpace(input.AliyunSMSDeleteTemplateCode)
	s.deps.sms = notify.NewSMSSender(s.deps.cfg.SMS)
	return nil
}

func (s *SettingsService) IsUserRegistrationAllowed() bool {
	settings, err := s.deps.store.GetSettings("allow_user_registration")
	if err != nil {
		return true
	}
	return fallbackBoolSetting(settings["allow_user_registration"], true)
}

func (s *SettingsService) IsPhoneVerificationEnabled() bool {
	settings, err := s.deps.store.GetSettings("enable_phone_verification")
	if err != nil {
		return true
	}
	return fallbackBoolSetting(settings["enable_phone_verification"], true)
}

func (s *SettingsService) SendTestEmail(senderUserID, to string) error {
	to = strings.TrimSpace(to)
	if to == "" {
		return fmt.Errorf("test email recipient is required")
	}
	if !s.deps.mail.Enabled() {
		return fmt.Errorf("smtp not configured")
	}
	if s.rateLimit != nil {
		if err := s.rateLimit.CheckAdminTestSend(senderUserID, "email"); err != nil {
			return err
		}
	}
	subject := "MySSO SMTP Test"
	body := "This is a test email from MySSO system settings."
	if err := s.deps.mail.Send(to, subject, body); err != nil {
		return err
	}
	s.deps.appendEmailSendLog(to, fmt.Sprintf("主题：%s\n%s", subject, body), s.deps.lookupUserEmailByID(senderUserID))
	return nil
}

func (s *SettingsService) SendTestSMS(senderUserID, provider, phone, content string) error {
	provider = strings.TrimSpace(provider)
	phone = strings.TrimSpace(phone)
	content = strings.TrimSpace(content)
	if phone == "" {
		return fmt.Errorf("test sms recipient phone is required")
	}
	if content == "" {
		return fmt.Errorf("test sms content is required")
	}
	if len([]rune(content)) > appdefaults.DefaultTestSMSContentMaxLength {
		return fmt.Errorf("test sms content is too long")
	}
	if s.rateLimit != nil {
		if err := s.rateLimit.CheckAdminTestSend(senderUserID, "sms"); err != nil {
			return err
		}
	}

	sender := s.deps.sms
	if provider != "" {
		testConfig := s.deps.cfg.SMS
		testConfig.Provider = provider
		sender = notify.NewSMSSender(testConfig)
	}
	if !sender.Enabled() {
		return fmt.Errorf("sms not configured")
	}
	if err := sender.Send(phone, "", content, notify.SendOptions{}); err != nil {
		return err
	}
	s.deps.appendPhoneSendLog(phone, content, s.deps.lookupUserEmailByID(senderUserID))
	return nil
}

func (s *SettingsService) BuildSMSVerificationContent(purpose, phone, code string) string {
	template := appdefaults.DefaultSMSRegisterTemplate
	switch strings.ToLower(strings.TrimSpace(purpose)) {
	case "login":
		template = appdefaults.DefaultSMSLoginTemplate
	case "mfa_login":
		template = appdefaults.DefaultSMSLoginTemplate
	case "login_step_up":
		template = appdefaults.DefaultSMSLoginTemplate
	case "reset_password":
		template = appdefaults.DefaultSMSResetPasswordTemplate
	case "change_phone":
		template = appdefaults.DefaultSMSBindPhoneTemplate
	case "verify_current_phone":
		template = appdefaults.DefaultSMSBindPhoneTemplate
	case "risk_phone_binding":
		template = appdefaults.DefaultSMSBindPhoneTemplate
	case "delete_account":
		template = appdefaults.DefaultSMSDeleteAccountTemplate
	}

	if values, err := s.deps.store.GetSettings("sms_login_template", "sms_register_template", "sms_reset_password_template", "sms_bind_phone_template", "sms_delete_account_template", "sms_signature"); err == nil {
		switch strings.ToLower(strings.TrimSpace(purpose)) {
		case "login":
			template = fallbackSetting(values["sms_login_template"], appdefaults.DefaultSMSLoginTemplate)
		case "mfa_login":
			template = fallbackSetting(values["sms_login_template"], appdefaults.DefaultSMSLoginTemplate)
		case "login_step_up":
			template = fallbackSetting(values["sms_login_template"], appdefaults.DefaultSMSLoginTemplate)
		case "reset_password":
			template = fallbackSetting(values["sms_reset_password_template"], appdefaults.DefaultSMSResetPasswordTemplate)
		case "change_phone":
			template = fallbackSetting(values["sms_bind_phone_template"], appdefaults.DefaultSMSBindPhoneTemplate)
		case "verify_current_phone":
			template = fallbackSetting(values["sms_bind_phone_template"], appdefaults.DefaultSMSBindPhoneTemplate)
		case "risk_phone_binding":
			template = fallbackSetting(values["sms_bind_phone_template"], appdefaults.DefaultSMSBindPhoneTemplate)
		case "delete_account":
			template = fallbackSetting(values["sms_delete_account_template"], appdefaults.DefaultSMSDeleteAccountTemplate)
		default:
			template = fallbackSetting(values["sms_register_template"], appdefaults.DefaultSMSRegisterTemplate)
		}
		template = strings.ReplaceAll(template, "{{signature}}", fallbackSetting(values["sms_signature"], appdefaults.DefaultSMSSignature))
	} else {
		template = strings.ReplaceAll(template, "{{signature}}", strings.TrimSpace(s.deps.cfg.SMS.Signature))
	}

	template = strings.ReplaceAll(template, "{{code}}", code)
	template = strings.ReplaceAll(template, "{{minutes}}", strconv.Itoa(int(s.deps.cfg.SMTP.VerificationCodeTTL.Minutes())))
	template = strings.ReplaceAll(template, "{{phone}}", phone)
	return template
}

func (s *SettingsService) syncFirstPartyClient(settings SystemSettings) error {
	redirectBase := strings.TrimSpace(settings.FrontendBaseURL)
	if redirectBase == "" {
		redirectBase = s.deps.cfg.HTTP.PublicBase
	}
	redirectURI := strings.TrimRight(redirectBase, "/") + "/callback"
	scopes := parseScope(settings.OIDCFirstPartyScope)
	now := time.Now().UTC()

	app, err := s.deps.store.FindAppByClientID(settings.OIDCFirstPartyClientID)
	if err == nil {
		app.Name = appdefaults.FirstPartyWebPortalName
		app.OwnerUserID = appdefaults.FirstPartyClientOwnerID
		app.ClientSecret = settings.OIDCFirstPartyClientSecret
		app.HasClientSecret = true
		app.RedirectURIs = []string{redirectURI}
		app.Scopes = scopes
		app.Status = domain.AppApproved
		app.Description = appdefaults.FirstPartyWebPortalDescription
		app.UpdatedAt = now
		return s.deps.store.UpdateApp(app)
	}
	hashedSecret, err := security.HashPassword(settings.OIDCFirstPartyClientSecret)
	if err != nil {
		return err
	}

	s.deps.store.CreateApp(domain.ClientApp{
		ID:              uuid.NewString(),
		Name:            appdefaults.FirstPartyWebPortalName,
		OwnerUserID:     appdefaults.FirstPartyClientOwnerID,
		ClientID:        settings.OIDCFirstPartyClientID,
		ClientSecret:    hashedSecret,
		HasClientSecret: true,
		RedirectURIs:    []string{redirectURI},
		Scopes:          scopes,
		Status:          domain.AppApproved,
		Description:     appdefaults.FirstPartyWebPortalDescription,
		CreatedAt:       now,
		UpdatedAt:       now,
	})
	return nil
}

func (s *SettingsService) buildVerificationEmailContent(purpose, email, country, code string) (string, string) {
	subjectTemplate := appdefaults.DefaultLoginCodeSubjectTemplate
	bodyTemplate := appdefaults.DefaultLoginCodeBodyTemplate
	language := verificationEmailLanguage(country)

	if purpose == "login" || purpose == "mfa_login" || purpose == "login_step_up" {
		if values, err := s.deps.store.GetSettings("login_code_subject_template", "login_code_body_template", "login_code_subject_template_en", "login_code_body_template_en"); err == nil {
			if language == "en" {
				subjectTemplate = fallbackSetting(values["login_code_subject_template_en"], appdefaults.DefaultLoginCodeSubjectTemplateEN)
				bodyTemplate = fallbackSetting(values["login_code_body_template_en"], appdefaults.DefaultLoginCodeBodyTemplateEN)
			} else {
				subjectTemplate = fallbackSetting(values["login_code_subject_template"], appdefaults.DefaultLoginCodeSubjectTemplate)
				bodyTemplate = fallbackSetting(values["login_code_body_template"], appdefaults.DefaultLoginCodeBodyTemplate)
			}
		} else {
			if language == "en" {
				subjectTemplate = appdefaults.DefaultLoginCodeSubjectTemplateEN
				bodyTemplate = appdefaults.DefaultLoginCodeBodyTemplateEN
			} else {
				subjectTemplate = appdefaults.DefaultLoginCodeSubjectTemplate
				bodyTemplate = appdefaults.DefaultLoginCodeBodyTemplate
			}
		}
	}

	if purpose == "register" {
		if values, err := s.deps.store.GetSettings("register_code_subject_template", "register_code_body_template", "register_code_subject_template_en", "register_code_body_template_en"); err == nil {
			if language == "en" {
				subjectTemplate = fallbackSetting(values["register_code_subject_template_en"], appdefaults.DefaultRegisterCodeSubjectTemplateEN)
				bodyTemplate = fallbackSetting(values["register_code_body_template_en"], appdefaults.DefaultRegisterCodeBodyTemplateEN)
			} else {
				subjectTemplate = fallbackSetting(values["register_code_subject_template"], appdefaults.DefaultRegisterCodeSubjectTemplate)
				bodyTemplate = fallbackSetting(values["register_code_body_template"], appdefaults.DefaultRegisterCodeBodyTemplate)
			}
		} else {
			if language == "en" {
				subjectTemplate = appdefaults.DefaultRegisterCodeSubjectTemplateEN
				bodyTemplate = appdefaults.DefaultRegisterCodeBodyTemplateEN
			} else {
				subjectTemplate = appdefaults.DefaultRegisterCodeSubjectTemplate
				bodyTemplate = appdefaults.DefaultRegisterCodeBodyTemplate
			}
		}
	}
	if purpose == "change_email" {
		if values, err := s.deps.store.GetSettings("change_email_code_subject_template", "change_email_code_body_template", "change_email_code_subject_template_en", "change_email_code_body_template_en"); err == nil {
			if language == "en" {
				subjectTemplate = fallbackSetting(values["change_email_code_subject_template_en"], appdefaults.DefaultChangeEmailCodeSubjectTemplateEN)
				bodyTemplate = fallbackSetting(values["change_email_code_body_template_en"], appdefaults.DefaultChangeEmailCodeBodyTemplateEN)
			} else {
				subjectTemplate = fallbackSetting(values["change_email_code_subject_template"], appdefaults.DefaultChangeEmailCodeSubjectTemplate)
				bodyTemplate = fallbackSetting(values["change_email_code_body_template"], appdefaults.DefaultChangeEmailCodeBodyTemplate)
			}
		} else if language == "en" {
			subjectTemplate = appdefaults.DefaultChangeEmailCodeSubjectTemplateEN
			bodyTemplate = appdefaults.DefaultChangeEmailCodeBodyTemplateEN
		} else {
			subjectTemplate = appdefaults.DefaultChangeEmailCodeSubjectTemplate
			bodyTemplate = appdefaults.DefaultChangeEmailCodeBodyTemplate
		}
	}
	if purpose == "reset_password" {
		if values, err := s.deps.store.GetSettings("reset_password_code_subject_template", "reset_password_code_body_template", "reset_password_code_subject_template_en", "reset_password_code_body_template_en"); err == nil {
			if language == "en" {
				subjectTemplate = fallbackSetting(values["reset_password_code_subject_template_en"], appdefaults.DefaultResetPasswordCodeSubjectTemplateEN)
				bodyTemplate = fallbackSetting(values["reset_password_code_body_template_en"], appdefaults.DefaultResetPasswordCodeBodyTemplateEN)
			} else {
				subjectTemplate = fallbackSetting(values["reset_password_code_subject_template"], appdefaults.DefaultResetPasswordCodeSubjectTemplate)
				bodyTemplate = fallbackSetting(values["reset_password_code_body_template"], appdefaults.DefaultResetPasswordCodeBodyTemplate)
			}
		} else {
			if language == "en" {
				subjectTemplate = appdefaults.DefaultResetPasswordCodeSubjectTemplateEN
				bodyTemplate = appdefaults.DefaultResetPasswordCodeBodyTemplateEN
			} else {
				subjectTemplate = appdefaults.DefaultResetPasswordCodeSubjectTemplate
				bodyTemplate = appdefaults.DefaultResetPasswordCodeBodyTemplate
			}
		}
	}
	if purpose == "delete_account" {
		if values, err := s.deps.store.GetSettings("delete_account_code_subject_template", "delete_account_code_body_template", "delete_account_code_subject_template_en", "delete_account_code_body_template_en"); err == nil {
			if language == "en" {
				subjectTemplate = fallbackSetting(values["delete_account_code_subject_template_en"], appdefaults.DefaultDeleteAccountCodeSubjectTemplateEN)
				bodyTemplate = fallbackSetting(values["delete_account_code_body_template_en"], appdefaults.DefaultDeleteAccountCodeBodyTemplateEN)
			} else {
				subjectTemplate = fallbackSetting(values["delete_account_code_subject_template"], appdefaults.DefaultDeleteAccountCodeSubjectTemplate)
				bodyTemplate = fallbackSetting(values["delete_account_code_body_template"], appdefaults.DefaultDeleteAccountCodeBodyTemplate)
			}
		} else {
			if language == "en" {
				subjectTemplate = appdefaults.DefaultDeleteAccountCodeSubjectTemplateEN
				bodyTemplate = appdefaults.DefaultDeleteAccountCodeBodyTemplateEN
			} else {
				subjectTemplate = appdefaults.DefaultDeleteAccountCodeSubjectTemplate
				bodyTemplate = appdefaults.DefaultDeleteAccountCodeBodyTemplate
			}
		}
	}

	replacements := map[string]string{
		"{{code}}":    code,
		"{{minutes}}": strconv.Itoa(int(s.deps.cfg.SMTP.VerificationCodeTTL.Minutes())),
		"{{email}}":   email,
		"{{country}}": country,
	}
	return renderTemplate(subjectTemplate, replacements), renderTemplate(bodyTemplate, replacements)
}

func verificationEmailLanguage(country string) string {
	switch strings.ToUpper(strings.TrimSpace(country)) {
	case "CN", "HK", "MO", "TW":
		return "zh"
	default:
		if strings.TrimSpace(country) == "" {
			return "zh"
		}
		return "en"
	}
}

func (s *SettingsService) getVerificationCodeCooldownSeconds() int {
	settings, err := s.deps.store.GetSettings("smtp_verification_code_cooldown_seconds")
	if err == nil {
		if raw := strings.TrimSpace(settings["smtp_verification_code_cooldown_seconds"]); raw != "" {
			if parsed, parseErr := strconv.Atoi(raw); parseErr == nil && parsed >= 0 {
				return parsed
			}
		}
	}
	return appdefaults.DefaultVerificationCodeCooldownSeconds
}

func validateRiskControlPrerequisites(input SystemSettings) error {
	if strings.TrimSpace(input.SMTPHost) == "" ||
		strings.TrimSpace(input.SMTPPort) == "" ||
		strings.TrimSpace(input.SMTPUsername) == "" ||
		strings.TrimSpace(input.SMTPPassword) == "" ||
		strings.TrimSpace(input.SMTPFrom) == "" {
		return fmt.Errorf("please complete the email delivery configuration before enabling risk control")
	}

	if strings.TrimSpace(input.SMSProvider) == "" || strings.EqualFold(strings.TrimSpace(input.SMSProvider), "disabled") {
		return fmt.Errorf("please complete the sms delivery configuration before enabling risk control")
	}
	if strings.TrimSpace(input.SMSTemplateProvider) == "" || strings.EqualFold(strings.TrimSpace(input.SMSTemplateProvider), "disabled") {
		return fmt.Errorf("please complete the sms template configuration before enabling risk control")
	}

	switch strings.TrimSpace(input.SMSProvider) {
	case "smsbao":
		if strings.TrimSpace(input.SMSAPIBase) == "" || strings.TrimSpace(input.SMSUsername) == "" || strings.TrimSpace(input.SMSPassword) == "" {
			return fmt.Errorf("please complete the sms delivery configuration before enabling risk control")
		}
	case "aliyun":
		if strings.TrimSpace(input.AliyunSMSAccessKeyID) == "" ||
			strings.TrimSpace(input.AliyunSMSAccessKeySecret) == "" ||
			strings.TrimSpace(input.AliyunSMSEndpoint) == "" ||
			strings.TrimSpace(input.AliyunSMSRegionID) == "" ||
			strings.TrimSpace(input.AliyunSMSSignName) == "" ||
			strings.TrimSpace(input.AliyunSMSBindPhoneTemplateCode) == "" {
			return fmt.Errorf("please complete the sms delivery configuration before enabling risk control")
		}
	}

	if strings.TrimSpace(input.SMSBindPhoneTemplate) == "" {
		return fmt.Errorf("please complete the sms template configuration before enabling risk control")
	}
	return nil
}
