package settings

import (
	"encoding/json"
	"fmt"
	"net"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"

	"mysso/backend/internal/appdefaults"
	"mysso/backend/internal/captcha"
	"mysso/backend/internal/domain"
	"mysso/backend/internal/notify"
	"mysso/backend/internal/security"
	"mysso/backend/internal/service/common/appurl"
	"mysso/backend/internal/service/common/authutil"
	"mysso/backend/internal/service/common/deps"
	"mysso/backend/internal/service/common/templateutil"
)

type SystemSettings struct {
	AllowUserRegistration                bool   `json:"allow_user_registration"`
	EnablePhoneVerification              bool   `json:"enable_phone_verification"`
	EnableQRLogin                        bool   `json:"enable_qr_login"`
	APPCurrentVersionCode                int    `json:"app_current_version_code"`
	APPCurrentVersionName                string `json:"app_current_version_name"`
	APPDownloadURL                       string `json:"app_download_url"`
	APPForceUpdate                       bool   `json:"app_force_update"`
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
	PublicBaseURL                        string `json:"public_base_url"`
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
	EmailVerificationCodeDailyLimit      int    `json:"email_verification_code_daily_limit"`
	SMSVerificationCodeDailyLimit        int    `json:"sms_verification_code_daily_limit"`
	CaptchaEnabled                       bool   `json:"captcha_enabled"`
	CaptchaMode                          int    `json:"captcha_mode"`
	CaptchaComplexOfNoiseText            int    `json:"captcha_ComplexOfNoiseText"`
	CaptchaComplexOfNoiseDot             int    `json:"captcha_ComplexOfNoiseDot"`
	CaptchaIsShowHollowLine              bool   `json:"captcha_IsShowHollowLine"`
	CaptchaIsShowNoiseDot                bool   `json:"captcha_IsShowNoiseDot"`
	CaptchaIsShowNoiseText               bool   `json:"captcha_IsShowNoiseText"`
	CaptchaIsShowSlimeLine               bool   `json:"captcha_IsShowSlimeLine"`
	CaptchaIsShowSineLine                bool   `json:"captcha_IsShowSineLine"`
	CaptchaLength                        int    `json:"captcha_CaptchaLen"`
	CaptchaTTLSeconds                    int    `json:"captcha_ttl_seconds"`
	CaptchaImageRateLimitPerMinute       int    `json:"captcha_image_rate_limit_per_minute"`
	CaptchaPrecheckRateLimitPerMinute    int    `json:"captcha_precheck_rate_limit_per_minute"`
	CaptchaTargetRateLimitPerMinute      int    `json:"captcha_target_rate_limit_per_minute"`
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
	RiskPhoneBindingEnabled              bool   `json:"risk_phone_binding_enabled"`
	RiskImmediateBindProbability         int    `json:"risk_immediate_bind_probability"`
	RiskDelayedBindProbability           int    `json:"risk_delayed_bind_probability"`
	RiskDelayedBindLoginCount            int    `json:"risk_delayed_bind_login_count"`
	RiskMediumThreshold                  int    `json:"risk_medium_threshold"`
	RiskHighThreshold                    int    `json:"risk_high_threshold"`
	RiskCriticalThreshold                int    `json:"risk_critical_threshold"`
	RiskAutoBlockThreshold               int    `json:"risk_auto_block_threshold"`
	RiskMaxFailedLogins                  int    `json:"risk_max_failed_logins"`
	RiskLockoutMinutes                   int    `json:"risk_lockout_minutes"`
	RiskScoreWindowDays                  int    `json:"risk_score_window_days"`
	RiskFailedLoginScoreWeight           int    `json:"risk_failed_login_score_weight"`
	RiskFailedLoginScoreCap              int    `json:"risk_failed_login_score_cap"`
	RiskEnableGeoCheck                   bool   `json:"risk_enable_geo_check"`
	RiskEnableDeviceCheck                bool   `json:"risk_enable_device_check"`
	RiskEnableBehaviorCheck              bool   `json:"risk_enable_behavior_check"`
	RiskEnableIPBlacklist                bool   `json:"risk_enable_ip_blacklist"`
	RiskEnableMitigation                 bool   `json:"risk_enable_mitigation"`
	RiskAllowBlockStepUp                 bool   `json:"risk_allow_block_step_up"`
	RiskTrustedDeviceDays                int    `json:"risk_trusted_device_days"`
	RiskMitigationHours                  int    `json:"risk_mitigation_hours"`
	RiskTrustedDeviceScoreDiscount       int    `json:"risk_trusted_device_score_discount"`
	RiskMitigationScoreDiscount          int    `json:"risk_mitigation_score_discount"`
	RiskHighRiskGeoDiscount              int    `json:"risk_high_risk_geo_discount"`
	RiskNewDeviceDiscount                int    `json:"risk_new_device_discount"`
	RiskIPChangeDiscount                 int    `json:"risk_ip_change_discount"`
	RiskTrustedIPs                       string `json:"risk_trusted_ips"`
	RiskHighRiskCountries                string `json:"risk_high_risk_countries"`
	DeveloperManagedUsersSearchWindowSec int    `json:"developer_managed_users_search_window_seconds"`
	DeveloperManagedUsersSearchLimit     int    `json:"developer_managed_users_search_limit"`
}

type VerificationCooldownError struct {
	RetryAfterSeconds int
	Message           string
}

type DeviceBindingInput struct {
	KeyID     string
	PublicKey string
}

type DeveloperManagedUsersSearchRateLimit struct {
	WindowSeconds int
	Limit         int
}

type CaptchaRateLimit struct {
	ImagePerMinute    int
	PrecheckPerMinute int
	TargetPerMinute   int
}

func (e *VerificationCooldownError) Error() string {
	if strings.TrimSpace(e.Message) != "" {
		return e.Message
	}
	return fmt.Sprintf("please wait %d seconds before requesting another verification code", e.RetryAfterSeconds)
}

type RegisterInput struct {
	Country           string
	Email             string
	Code              string
	Password          string
	AgreementAccepted bool
	PrivacyAccepted   bool
	Role              domain.Role
	IP                string
	DeviceID          string
	Device            DeviceBindingInput
}

type SettingsService struct {
	deps *deps.Deps
}

type Service = SettingsService

func New(dependencies *deps.Deps) *Service {
	return &SettingsService{deps: dependencies}
}

func (s *SettingsService) GetFirstPartyClientCredentials() (string, string, string, error) {
	values, err := s.deps.Store.GetSettings(
		"oidc_first_party_client_id",
		"oidc_first_party_client_secret",
		"oidc_first_party_scope",
	)
	if err != nil {
		return "", "", "", err
	}
	clientID := authutil.FallbackSetting(values["oidc_first_party_client_id"], s.deps.Cfg.OIDC.FirstPartyClientID)
	clientSecret := authutil.FallbackSetting(values["oidc_first_party_client_secret"], s.deps.Cfg.OIDC.FirstPartyClientSecret)
	scope := authutil.FallbackSetting(values["oidc_first_party_scope"], s.deps.Cfg.OIDC.FirstPartyScope)
	return clientID, clientSecret, scope, nil
}

func (s *SettingsService) GetSystemSettings() (SystemSettings, error) {
	values, err := s.deps.Store.GetSettings(
		"allow_user_registration",
		"enable_phone_verification",
		"enable_qr_login",
		"app_current_version_code",
		"app_current_version_name",
		"app_download_url",
		"app_force_update",
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
		"public_base_url",
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
		"email_verification_code_daily_limit",
		"sms_verification_code_daily_limit",
		"captcha_enabled",
		"captcha_mode",
		"captcha_ComplexOfNoiseText",
		"captcha_ComplexOfNoiseDot",
		"captcha_IsShowHollowLine",
		"captcha_IsShowNoiseDot",
		"captcha_IsShowNoiseText",
		"captcha_IsShowSlimeLine",
		"captcha_IsShowSineLine",
		"captcha_CaptchaLen",
		"captcha_ttl_seconds",
		"captcha_image_rate_limit_per_minute",
		"captcha_precheck_rate_limit_per_minute",
		"captcha_target_rate_limit_per_minute",
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
		"risk_phone_binding_enabled",
		"risk_immediate_bind_probability",
		"risk_delayed_bind_probability",
		"risk_delayed_bind_login_count",
		"risk_medium_threshold",
		"risk_high_threshold",
		"risk_critical_threshold",
		"risk_auto_block_threshold",
		"risk_max_failed_logins",
		"risk_lockout_minutes",
		"risk_score_window_days",
		"risk_failed_login_score_weight",
		"risk_failed_login_score_cap",
		"risk_enable_geo_check",
		"risk_enable_device_check",
		"risk_enable_behavior_check",
		"risk_enable_ip_blacklist",
		"risk_enable_mitigation",
		"risk_allow_block_step_up",
		"risk_trusted_device_days",
		"risk_mitigation_hours",
		"risk_trusted_device_score_discount",
		"risk_mitigation_score_discount",
		"risk_high_risk_geo_discount",
		"risk_new_device_discount",
		"risk_ip_change_discount",
		"risk_trusted_ips",
		"risk_high_risk_countries",
		"developer_managed_users_search_window_seconds",
		"developer_managed_users_search_limit",
	)
	if err != nil {
		return SystemSettings{}, err
	}

	ttlMinutes := int(s.deps.Cfg.SMTP.VerificationCodeTTL.Minutes())
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
	captchaSettings := captcha.NormalizeSettings(captcha.Settings{
		Enabled:            authutil.FallbackBoolSetting(values["captcha_enabled"], appdefaults.DefaultCaptchaEnabled),
		Height:             appdefaults.DefaultCaptchaHeight,
		Width:              appdefaults.DefaultCaptchaWidth,
		Mode:               parseIntSetting(values["captcha_mode"], appdefaults.DefaultCaptchaMode),
		ComplexOfNoiseText: parseIntSetting(values["captcha_ComplexOfNoiseText"], appdefaults.DefaultCaptchaComplexOfNoiseText),
		ComplexOfNoiseDot:  parseIntSetting(values["captcha_ComplexOfNoiseDot"], appdefaults.DefaultCaptchaComplexOfNoiseDot),
		IsShowHollowLine:   authutil.FallbackBoolSetting(values["captcha_IsShowHollowLine"], appdefaults.DefaultCaptchaIsShowHollowLine),
		IsShowNoiseDot:     authutil.FallbackBoolSetting(values["captcha_IsShowNoiseDot"], appdefaults.DefaultCaptchaIsShowNoiseDot),
		IsShowNoiseText:    authutil.FallbackBoolSetting(values["captcha_IsShowNoiseText"], appdefaults.DefaultCaptchaIsShowNoiseText),
		IsShowSlimeLine:    authutil.FallbackBoolSetting(values["captcha_IsShowSlimeLine"], appdefaults.DefaultCaptchaIsShowSlimeLine),
		IsShowSineLine:     authutil.FallbackBoolSetting(values["captcha_IsShowSineLine"], appdefaults.DefaultCaptchaIsShowSineLine),
		Length:             parseIntSetting(values["captcha_CaptchaLen"], appdefaults.DefaultCaptchaLength),
		TTL:                time.Duration(parseIntSetting(values["captcha_ttl_seconds"], appdefaults.DefaultCaptchaTTLSeconds)) * time.Second,
	})

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

	developerManagedUsersSearchWindowSec := appdefaults.DefaultDeveloperManagedUsersSearchWindow
	if raw := strings.TrimSpace(values["developer_managed_users_search_window_seconds"]); raw != "" {
		if parsed, parseErr := strconv.Atoi(raw); parseErr == nil && parsed >= 0 {
			developerManagedUsersSearchWindowSec = parsed
		}
	}

	developerManagedUsersSearchLimit := appdefaults.DefaultDeveloperManagedUsersSearchLimit
	if raw := strings.TrimSpace(values["developer_managed_users_search_limit"]); raw != "" {
		if parsed, parseErr := strconv.Atoi(raw); parseErr == nil && parsed >= 0 {
			developerManagedUsersSearchLimit = parsed
		}
	}
	captchaImageRateLimit := normalizeRateLimitSetting(values["captcha_image_rate_limit_per_minute"], appdefaults.DefaultCaptchaImageRateLimitPerMinute, appdefaults.MaxCaptchaRateLimitPerMinute)
	captchaPrecheckRateLimit := normalizeRateLimitSetting(values["captcha_precheck_rate_limit_per_minute"], appdefaults.DefaultCaptchaPrecheckRateLimitPerMinute, appdefaults.MaxCaptchaRateLimitPerMinute)
	captchaTargetRateLimit := normalizeRateLimitSetting(values["captcha_target_rate_limit_per_minute"], appdefaults.DefaultCaptchaTargetRateLimitPerMinute, appdefaults.MaxCaptchaRateLimitPerMinute)
	emailVerificationCodeDailyLimit := normalizeRateLimitSetting(values["email_verification_code_daily_limit"], appdefaults.DefaultEmailVerificationCodeDailyLimit, appdefaults.MaxVerificationCodeDailyLimit)
	smsVerificationCodeDailyLimit := normalizeRateLimitSetting(values["sms_verification_code_daily_limit"], appdefaults.DefaultSMSVerificationCodeDailyLimit, appdefaults.MaxVerificationCodeDailyLimit)

	oidcFirstPartyClientSecret := strings.TrimSpace(authutil.FallbackSetting(values["oidc_first_party_client_secret"], s.deps.Cfg.OIDC.FirstPartyClientSecret))
	smtpPassword := strings.TrimSpace(authutil.FallbackSetting(values["smtp_password"], s.deps.Cfg.SMTP.Password))
	smsPassword := strings.TrimSpace(values["sms_password"])
	aliyunSMSAccessKeySecret := strings.TrimSpace(values["aliyun_sms_access_key_secret"])

	return SystemSettings{
		AllowUserRegistration:                authutil.FallbackBoolSetting(values["allow_user_registration"], appdefaults.DefaultAllowUserRegistration),
		EnablePhoneVerification:              authutil.FallbackBoolSetting(values["enable_phone_verification"], true),
		EnableQRLogin:                        authutil.FallbackBoolSetting(values["enable_qr_login"], false),
		APPCurrentVersionCode:                parseIntSetting(values["app_current_version_code"], 1),
		APPCurrentVersionName:                strings.TrimSpace(values["app_current_version_name"]),
		APPDownloadURL:                       strings.TrimSpace(values["app_download_url"]),
		APPForceUpdate:                       authutil.FallbackBoolSetting(values["app_force_update"], false),
		SiteName:                             authutil.FallbackSetting(values["site_name"], appdefaults.DefaultSiteName),
		SiteNameEN:                           strings.TrimSpace(values["site_name_en"]),
		SiteBrowserTitle:                     strings.TrimSpace(values["site_browser_title"]),
		SiteBrowserTitleEN:                   strings.TrimSpace(values["site_browser_title_en"]),
		SiteLogoDataURL:                      strings.TrimSpace(values["site_logo_data_url"]),
		SiteFooterText:                       strings.TrimSpace(values["site_footer_text"]),
		SiteICPRecordNumber:                  strings.TrimSpace(values["site_icp_record_number"]),
		SitePublicSecurityRecordNumber:       strings.TrimSpace(values["site_public_security_record_number"]),
		HomePageAnnouncementEnabled:          authutil.FallbackBoolSetting(values["home_page_announcement_enabled"], appdefaults.DefaultHomePageAnnouncementEnabled),
		HomePageAnnouncementContent:          strings.TrimSpace(values["home_page_announcement_content"]),
		UserCenterAnnouncementEnabled:        authutil.FallbackBoolSetting(values["user_center_announcement_enabled"], appdefaults.DefaultUserCenterAnnouncementEnabled),
		UserCenterAnnouncementContent:        strings.TrimSpace(values["user_center_announcement_content"]),
		DeveloperAnnouncementEnabled:         authutil.FallbackBoolSetting(values["developer_announcement_enabled"], appdefaults.DefaultDeveloperAnnouncementEnabled),
		DeveloperAnnouncementContent:         strings.TrimSpace(values["developer_announcement_content"]),
		PublicBaseURL:                        authutil.FallbackSetting(values["public_base_url"], s.deps.Cfg.HTTP.PublicBase),
		FrontendBaseURL:                      authutil.FallbackSetting(values["frontend_base_url"], s.deps.Cfg.HTTP.FrontendBase),
		OIDCFirstPartyClientID:               authutil.FallbackSetting(values["oidc_first_party_client_id"], s.deps.Cfg.OIDC.FirstPartyClientID),
		OIDCFirstPartyClientSecret:           "",
		OIDCFirstPartyClientSecretConfigured: oidcFirstPartyClientSecret != "",
		OIDCFirstPartyScope:                  authutil.FallbackSetting(values["oidc_first_party_scope"], s.deps.Cfg.OIDC.FirstPartyScope),
		OIDCAutoApproveClientIDs:             strings.TrimSpace(values["oidc_auto_approve_client_ids"]),
		OIDCAutoApproveRedirectHosts:         strings.TrimSpace(values["oidc_auto_approve_redirect_hosts"]),
		SMTPHost:                             authutil.FallbackSetting(values["smtp_host"], s.deps.Cfg.SMTP.Host),
		SMTPPort:                             authutil.FallbackSetting(values["smtp_port"], s.deps.Cfg.SMTP.Port),
		SMTPUsername:                         authutil.FallbackSetting(values["smtp_username"], s.deps.Cfg.SMTP.Username),
		SMTPPassword:                         "",
		SMTPPasswordConfigured:               smtpPassword != "",
		SMTPFrom:                             authutil.FallbackSetting(values["smtp_from"], s.deps.Cfg.SMTP.From),
		SMTPForceSSL:                         authutil.FallbackBoolSetting(values["smtp_force_ssl"], s.deps.Cfg.SMTP.ForceSSL),
		SMTPVerificationCodeTTLMinute:        ttlMinutes,
		SMTPVerificationCodeCooldownSecond:   cooldownSeconds,
		EmailVerificationCodeDailyLimit:      emailVerificationCodeDailyLimit,
		SMSVerificationCodeDailyLimit:        smsVerificationCodeDailyLimit,
		CaptchaEnabled:                       captchaSettings.Enabled,
		CaptchaMode:                          captchaSettings.Mode,
		CaptchaComplexOfNoiseText:            captchaSettings.ComplexOfNoiseText,
		CaptchaComplexOfNoiseDot:             captchaSettings.ComplexOfNoiseDot,
		CaptchaIsShowHollowLine:              captchaSettings.IsShowHollowLine,
		CaptchaIsShowNoiseDot:                captchaSettings.IsShowNoiseDot,
		CaptchaIsShowNoiseText:               captchaSettings.IsShowNoiseText,
		CaptchaIsShowSlimeLine:               captchaSettings.IsShowSlimeLine,
		CaptchaIsShowSineLine:                captchaSettings.IsShowSineLine,
		CaptchaLength:                        captchaSettings.Length,
		CaptchaTTLSeconds:                    int(captchaSettings.TTL.Seconds()),
		CaptchaImageRateLimitPerMinute:       captchaImageRateLimit,
		CaptchaPrecheckRateLimitPerMinute:    captchaPrecheckRateLimit,
		CaptchaTargetRateLimitPerMinute:      captchaTargetRateLimit,
		LoginCodeSubjectTemplate:             authutil.FallbackSetting(values["login_code_subject_template"], appdefaults.DefaultLoginCodeSubjectTemplate),
		LoginCodeBodyTemplate:                authutil.FallbackSetting(values["login_code_body_template"], appdefaults.DefaultLoginCodeBodyTemplate),
		LoginCodeSubjectTemplateEN:           authutil.FallbackSetting(values["login_code_subject_template_en"], appdefaults.DefaultLoginCodeSubjectTemplateEN),
		LoginCodeBodyTemplateEN:              authutil.FallbackSetting(values["login_code_body_template_en"], appdefaults.DefaultLoginCodeBodyTemplateEN),
		RegisterCodeSubjectTemplate:          authutil.FallbackSetting(values["register_code_subject_template"], appdefaults.DefaultRegisterCodeSubjectTemplate),
		RegisterCodeBodyTemplate:             authutil.FallbackSetting(values["register_code_body_template"], appdefaults.DefaultRegisterCodeBodyTemplate),
		RegisterCodeSubjectTemplateEN:        authutil.FallbackSetting(values["register_code_subject_template_en"], appdefaults.DefaultRegisterCodeSubjectTemplateEN),
		RegisterCodeBodyTemplateEN:           authutil.FallbackSetting(values["register_code_body_template_en"], appdefaults.DefaultRegisterCodeBodyTemplateEN),
		ResetPasswordCodeSubjectTemplate:     authutil.FallbackSetting(values["reset_password_code_subject_template"], appdefaults.DefaultResetPasswordCodeSubjectTemplate),
		ResetPasswordCodeBodyTemplate:        authutil.FallbackSetting(values["reset_password_code_body_template"], appdefaults.DefaultResetPasswordCodeBodyTemplate),
		ResetPasswordCodeSubjectTemplateEN:   authutil.FallbackSetting(values["reset_password_code_subject_template_en"], appdefaults.DefaultResetPasswordCodeSubjectTemplateEN),
		ResetPasswordCodeBodyTemplateEN:      authutil.FallbackSetting(values["reset_password_code_body_template_en"], appdefaults.DefaultResetPasswordCodeBodyTemplateEN),
		DeleteAccountCodeSubjectTemplate:     authutil.FallbackSetting(values["delete_account_code_subject_template"], appdefaults.DefaultDeleteAccountCodeSubjectTemplate),
		DeleteAccountCodeBodyTemplate:        authutil.FallbackSetting(values["delete_account_code_body_template"], appdefaults.DefaultDeleteAccountCodeBodyTemplate),
		DeleteAccountCodeSubjectTemplateEN:   authutil.FallbackSetting(values["delete_account_code_subject_template_en"], appdefaults.DefaultDeleteAccountCodeSubjectTemplateEN),
		DeleteAccountCodeBodyTemplateEN:      authutil.FallbackSetting(values["delete_account_code_body_template_en"], appdefaults.DefaultDeleteAccountCodeBodyTemplateEN),
		ChangeEmailCodeSubjectTemplate:       authutil.FallbackSetting(values["change_email_code_subject_template"], appdefaults.DefaultChangeEmailCodeSubjectTemplate),
		ChangeEmailCodeBodyTemplate:          authutil.FallbackSetting(values["change_email_code_body_template"], appdefaults.DefaultChangeEmailCodeBodyTemplate),
		ChangeEmailCodeSubjectTemplateEN:     authutil.FallbackSetting(values["change_email_code_subject_template_en"], appdefaults.DefaultChangeEmailCodeSubjectTemplateEN),
		ChangeEmailCodeBodyTemplateEN:        authutil.FallbackSetting(values["change_email_code_body_template_en"], appdefaults.DefaultChangeEmailCodeBodyTemplateEN),
		SMSProvider:                          authutil.FallbackSetting(values["sms_provider"], appdefaults.DefaultSMSProvider),
		SMSTemplateProvider:                  authutil.FallbackSetting(values["sms_template_provider"], appdefaults.DefaultSMSTemplateProvider),
		SMSAPIBase:                           authutil.FallbackSetting(values["sms_api_base"], appdefaults.DefaultSMSAPIBase),
		SMSUsername:                          strings.TrimSpace(values["sms_username"]),
		SMSPassword:                          "",
		SMSPasswordConfigured:                smsPassword != "",
		SMSSignature:                         authutil.FallbackSetting(values["sms_signature"], appdefaults.DefaultSMSSignature),
		SMSLoginTemplate:                     authutil.FallbackSetting(values["sms_login_template"], appdefaults.DefaultSMSLoginTemplate),
		SMSRegisterTemplate:                  authutil.FallbackSetting(values["sms_register_template"], appdefaults.DefaultSMSRegisterTemplate),
		SMSResetPasswordTemplate:             authutil.FallbackSetting(values["sms_reset_password_template"], appdefaults.DefaultSMSResetPasswordTemplate),
		SMSBindPhoneTemplate:                 authutil.FallbackSetting(values["sms_bind_phone_template"], appdefaults.DefaultSMSBindPhoneTemplate),
		SMSDeleteAccountTemplate:             authutil.FallbackSetting(values["sms_delete_account_template"], appdefaults.DefaultSMSDeleteAccountTemplate),
		AliyunSMSAccessKeyID:                 strings.TrimSpace(values["aliyun_sms_access_key_id"]),
		AliyunSMSAccessKeySecret:             "",
		AliyunSMSAccessKeySecretConfigured:   aliyunSMSAccessKeySecret != "",
		AliyunSMSEndpoint:                    authutil.FallbackSetting(values["aliyun_sms_endpoint"], appdefaults.DefaultAliyunSMSEndpoint),
		AliyunSMSRegionID:                    authutil.FallbackSetting(values["aliyun_sms_region_id"], appdefaults.DefaultAliyunSMSRegionID),
		AliyunSMSSignName:                    authutil.FallbackSetting(values["aliyun_sms_sign_name"], appdefaults.DefaultAliyunSMSSignName),
		AliyunSMSLoginTemplateCode:           strings.TrimSpace(values["aliyun_sms_login_template_code"]),
		AliyunSMSRegisterTemplateCode:        strings.TrimSpace(values["aliyun_sms_register_template_code"]),
		AliyunSMSResetTemplateCode:           strings.TrimSpace(values["aliyun_sms_reset_template_code"]),
		AliyunSMSBindPhoneTemplateCode:       strings.TrimSpace(values["aliyun_sms_bind_phone_template_code"]),
		AliyunSMSDeleteTemplateCode:          strings.TrimSpace(values["aliyun_sms_delete_template_code"]),
		RiskControlEnabled:                   authutil.FallbackBoolSetting(values["risk_control_enabled"], appdefaults.DefaultRiskControlEnabled),
		RiskPhoneBindingEnabled:              authutil.FallbackBoolSetting(values["risk_phone_binding_enabled"], appdefaults.DefaultRiskPhoneBindingEnabled),
		RiskImmediateBindProbability:         riskImmediateProbability,
		RiskDelayedBindProbability:           riskDelayedProbability,
		RiskDelayedBindLoginCount:            riskDelayedLoginCount,
		RiskMediumThreshold:                  parseIntSetting(values["risk_medium_threshold"], 30),
		RiskHighThreshold:                    parseIntSetting(values["risk_high_threshold"], 60),
		RiskCriticalThreshold:                parseIntSetting(values["risk_critical_threshold"], 80),
		RiskAutoBlockThreshold:               parseIntSetting(values["risk_auto_block_threshold"], 90),
		RiskMaxFailedLogins:                  parseIntSetting(values["risk_max_failed_logins"], 5),
		RiskLockoutMinutes:                   parseIntSetting(values["risk_lockout_minutes"], 15),
		RiskScoreWindowDays:                  parseIntSetting(values["risk_score_window_days"], 30),
		RiskFailedLoginScoreWeight:           parseIntSetting(values["risk_failed_login_score_weight"], 5),
		RiskFailedLoginScoreCap:              parseIntSetting(values["risk_failed_login_score_cap"], 30),
		RiskEnableGeoCheck:                   authutil.FallbackBoolSetting(values["risk_enable_geo_check"], true),
		RiskEnableDeviceCheck:                authutil.FallbackBoolSetting(values["risk_enable_device_check"], true),
		RiskEnableBehaviorCheck:              authutil.FallbackBoolSetting(values["risk_enable_behavior_check"], true),
		RiskEnableIPBlacklist:                authutil.FallbackBoolSetting(values["risk_enable_ip_blacklist"], true),
		RiskEnableMitigation:                 authutil.FallbackBoolSetting(values["risk_enable_mitigation"], true),
		RiskAllowBlockStepUp:                 authutil.FallbackBoolSetting(values["risk_allow_block_step_up"], true),
		RiskTrustedDeviceDays:                parseIntSetting(values["risk_trusted_device_days"], 30),
		RiskMitigationHours:                  parseIntSetting(values["risk_mitigation_hours"], 72),
		RiskTrustedDeviceScoreDiscount:       parseIntSetting(values["risk_trusted_device_score_discount"], 20),
		RiskMitigationScoreDiscount:          parseIntSetting(values["risk_mitigation_score_discount"], 15),
		RiskHighRiskGeoDiscount:              parseIntSetting(values["risk_high_risk_geo_discount"], 20),
		RiskNewDeviceDiscount:                parseIntSetting(values["risk_new_device_discount"], 10),
		RiskIPChangeDiscount:                 parseIntSetting(values["risk_ip_change_discount"], 8),
		RiskTrustedIPs:                       strings.TrimSpace(values["risk_trusted_ips"]),
		RiskHighRiskCountries:                strings.TrimSpace(values["risk_high_risk_countries"]),
		DeveloperManagedUsersSearchWindowSec: developerManagedUsersSearchWindowSec,
		DeveloperManagedUsersSearchLimit:     developerManagedUsersSearchLimit,
	}, nil
}

func (s *SettingsService) UpdateSystemSettings(input SystemSettings) error {
	currentSettings, err := s.GetSystemSettings()
	if err != nil {
		return err
	}
	currentSecretValues, err := s.deps.Store.GetSettings(
		"oidc_first_party_client_secret",
		"smtp_password",
		"sms_password",
		"aliyun_sms_access_key_secret",
	)
	if err != nil {
		return err
	}
	currentOIDCFirstPartyClientSecret := authutil.FallbackSetting(currentSecretValues["oidc_first_party_client_secret"], s.deps.Cfg.OIDC.FirstPartyClientSecret)
	currentSMTPPassword := authutil.FallbackSetting(currentSecretValues["smtp_password"], s.deps.Cfg.SMTP.Password)
	currentSMSPassword := currentSecretValues["sms_password"]
	currentAliyunSMSAccessKeySecret := currentSecretValues["aliyun_sms_access_key_secret"]

	if strings.TrimSpace(input.SiteName) == "" {
		input.SiteName = appdefaults.DefaultSiteName
	}
	if input.APPCurrentVersionCode < 1 {
		input.APPCurrentVersionCode = 1
	}
	input.APPDownloadURL = strings.TrimSpace(input.APPDownloadURL)
	if input.APPDownloadURL != "" {
		if normalizedURL := normalizeHTTPURL(input.APPDownloadURL); normalizedURL == "" {
			return fmt.Errorf("app download url must be a valid http or https URL")
		} else {
			input.APPDownloadURL = normalizedURL
		}
	}
	if strings.TrimSpace(input.PublicBaseURL) == "" {
		input.PublicBaseURL = s.deps.Cfg.HTTP.PublicBase
	}
	if strings.TrimSpace(input.FrontendBaseURL) == "" {
		input.FrontendBaseURL = s.deps.Cfg.HTTP.FrontendBase
	}
	if strings.TrimSpace(input.OIDCFirstPartyClientID) == "" {
		input.OIDCFirstPartyClientID = s.deps.Cfg.OIDC.FirstPartyClientID
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
		input.OIDCFirstPartyScope = s.deps.Cfg.OIDC.FirstPartyScope
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
	input.EmailVerificationCodeDailyLimit = clampRateLimit(input.EmailVerificationCodeDailyLimit, appdefaults.MaxVerificationCodeDailyLimit)
	input.SMSVerificationCodeDailyLimit = clampRateLimit(input.SMSVerificationCodeDailyLimit, appdefaults.MaxVerificationCodeDailyLimit)
	captchaSettings := captcha.NormalizeSettings(captcha.Settings{
		Enabled:            input.CaptchaEnabled,
		Height:             appdefaults.DefaultCaptchaHeight,
		Width:              appdefaults.DefaultCaptchaWidth,
		Mode:               input.CaptchaMode,
		ComplexOfNoiseText: input.CaptchaComplexOfNoiseText,
		ComplexOfNoiseDot:  input.CaptchaComplexOfNoiseDot,
		IsShowHollowLine:   input.CaptchaIsShowHollowLine,
		IsShowNoiseDot:     input.CaptchaIsShowNoiseDot,
		IsShowNoiseText:    input.CaptchaIsShowNoiseText,
		IsShowSlimeLine:    input.CaptchaIsShowSlimeLine,
		IsShowSineLine:     input.CaptchaIsShowSineLine,
		Length:             input.CaptchaLength,
		TTL:                time.Duration(input.CaptchaTTLSeconds) * time.Second,
	})
	input.CaptchaMode = captchaSettings.Mode
	input.CaptchaComplexOfNoiseText = captchaSettings.ComplexOfNoiseText
	input.CaptchaComplexOfNoiseDot = captchaSettings.ComplexOfNoiseDot
	input.CaptchaIsShowHollowLine = captchaSettings.IsShowHollowLine
	input.CaptchaIsShowNoiseDot = captchaSettings.IsShowNoiseDot
	input.CaptchaIsShowNoiseText = captchaSettings.IsShowNoiseText
	input.CaptchaIsShowSlimeLine = captchaSettings.IsShowSlimeLine
	input.CaptchaIsShowSineLine = captchaSettings.IsShowSineLine
	input.CaptchaLength = captchaSettings.Length
	input.CaptchaTTLSeconds = int(captchaSettings.TTL.Seconds())
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
	input.RiskTrustedDeviceDays = clampInt(input.RiskTrustedDeviceDays, 0, 365)
	input.RiskMitigationHours = clampInt(input.RiskMitigationHours, 0, 8760)
	input.RiskTrustedDeviceScoreDiscount = clampInt(input.RiskTrustedDeviceScoreDiscount, 0, 100)
	input.RiskMitigationScoreDiscount = clampInt(input.RiskMitigationScoreDiscount, 0, 100)
	input.RiskHighRiskGeoDiscount = clampInt(input.RiskHighRiskGeoDiscount, 0, 100)
	input.RiskNewDeviceDiscount = clampInt(input.RiskNewDeviceDiscount, 0, 100)
	input.RiskIPChangeDiscount = clampInt(input.RiskIPChangeDiscount, 0, 100)
	input.RiskScoreWindowDays = clampInt(input.RiskScoreWindowDays, 1, 365)
	input.RiskFailedLoginScoreWeight = clampInt(input.RiskFailedLoginScoreWeight, 0, 100)
	input.RiskFailedLoginScoreCap = clampInt(input.RiskFailedLoginScoreCap, 0, 100)
	if input.RiskImmediateBindProbability+input.RiskDelayedBindProbability != 100 {
		return fmt.Errorf("risk probabilities must add up to 100")
	}
	if input.RiskControlEnabled || input.RiskPhoneBindingEnabled {
		if err := validateRiskControlPrerequisites(input); err != nil {
			return err
		}
	}
	if input.DeveloperManagedUsersSearchWindowSec < 0 {
		input.DeveloperManagedUsersSearchWindowSec = 0
	}
	if input.DeveloperManagedUsersSearchWindowSec > appdefaults.MaxDeveloperManagedUsersSearchWindow {
		input.DeveloperManagedUsersSearchWindowSec = appdefaults.MaxDeveloperManagedUsersSearchWindow
	}
	if input.DeveloperManagedUsersSearchLimit < 0 {
		input.DeveloperManagedUsersSearchLimit = 0
	}
	if input.DeveloperManagedUsersSearchLimit > appdefaults.MaxDeveloperManagedUsersSearchLimit {
		input.DeveloperManagedUsersSearchLimit = appdefaults.MaxDeveloperManagedUsersSearchLimit
	}
	input.CaptchaImageRateLimitPerMinute = clampRateLimit(input.CaptchaImageRateLimitPerMinute, appdefaults.MaxCaptchaRateLimitPerMinute)
	input.CaptchaPrecheckRateLimitPerMinute = clampRateLimit(input.CaptchaPrecheckRateLimitPerMinute, appdefaults.MaxCaptchaRateLimitPerMinute)
	input.CaptchaTargetRateLimitPerMinute = clampRateLimit(input.CaptchaTargetRateLimitPerMinute, appdefaults.MaxCaptchaRateLimitPerMinute)

	if err := s.deps.Store.UpsertSettings(map[string]string{
		"allow_user_registration":                       strconv.FormatBool(input.AllowUserRegistration),
		"enable_phone_verification":                     strconv.FormatBool(input.EnablePhoneVerification),
		"enable_qr_login":                               strconv.FormatBool(input.EnableQRLogin),
		"app_current_version_code":                      strconv.Itoa(input.APPCurrentVersionCode),
		"app_current_version_name":                      strings.TrimSpace(input.APPCurrentVersionName),
		"app_download_url":                              input.APPDownloadURL,
		"app_force_update":                              strconv.FormatBool(input.APPForceUpdate),
		"site_name":                                     strings.TrimSpace(input.SiteName),
		"site_name_en":                                  strings.TrimSpace(input.SiteNameEN),
		"site_browser_title":                            strings.TrimSpace(input.SiteBrowserTitle),
		"site_browser_title_en":                         strings.TrimSpace(input.SiteBrowserTitleEN),
		"site_logo_data_url":                            strings.TrimSpace(input.SiteLogoDataURL),
		"site_footer_text":                              input.SiteFooterText,
		"site_icp_record_number":                        strings.TrimSpace(input.SiteICPRecordNumber),
		"site_public_security_record_number":            strings.TrimSpace(input.SitePublicSecurityRecordNumber),
		"home_page_announcement_enabled":                strconv.FormatBool(input.HomePageAnnouncementEnabled),
		"home_page_announcement_content":                strings.TrimSpace(input.HomePageAnnouncementContent),
		"user_center_announcement_enabled":              strconv.FormatBool(input.UserCenterAnnouncementEnabled),
		"user_center_announcement_content":              strings.TrimSpace(input.UserCenterAnnouncementContent),
		"developer_announcement_enabled":                strconv.FormatBool(input.DeveloperAnnouncementEnabled),
		"developer_announcement_content":                strings.TrimSpace(input.DeveloperAnnouncementContent),
		"public_base_url":                               strings.TrimSpace(input.PublicBaseURL),
		"frontend_base_url":                             strings.TrimSpace(input.FrontendBaseURL),
		"oidc_first_party_client_id":                    strings.TrimSpace(input.OIDCFirstPartyClientID),
		"oidc_first_party_client_secret":                strings.TrimSpace(input.OIDCFirstPartyClientSecret),
		"oidc_first_party_scope":                        strings.TrimSpace(input.OIDCFirstPartyScope),
		"oidc_auto_approve_client_ids":                  templateutil.NormalizeListSetting(input.OIDCAutoApproveClientIDs),
		"oidc_auto_approve_redirect_hosts":              templateutil.NormalizeListSetting(input.OIDCAutoApproveRedirectHosts),
		"smtp_host":                                     strings.TrimSpace(input.SMTPHost),
		"smtp_port":                                     strings.TrimSpace(input.SMTPPort),
		"smtp_username":                                 strings.TrimSpace(input.SMTPUsername),
		"smtp_password":                                 input.SMTPPassword,
		"smtp_from":                                     strings.TrimSpace(input.SMTPFrom),
		"smtp_force_ssl":                                strconv.FormatBool(input.SMTPForceSSL),
		"smtp_verification_code_ttl_minutes":            strconv.Itoa(input.SMTPVerificationCodeTTLMinute),
		"smtp_verification_code_cooldown_seconds":       strconv.Itoa(input.SMTPVerificationCodeCooldownSecond),
		"email_verification_code_daily_limit":           strconv.Itoa(input.EmailVerificationCodeDailyLimit),
		"sms_verification_code_daily_limit":             strconv.Itoa(input.SMSVerificationCodeDailyLimit),
		"captcha_enabled":                               strconv.FormatBool(input.CaptchaEnabled),
		"captcha_mode":                                  strconv.Itoa(input.CaptchaMode),
		"captcha_ComplexOfNoiseText":                    strconv.Itoa(input.CaptchaComplexOfNoiseText),
		"captcha_ComplexOfNoiseDot":                     strconv.Itoa(input.CaptchaComplexOfNoiseDot),
		"captcha_IsShowHollowLine":                      strconv.FormatBool(input.CaptchaIsShowHollowLine),
		"captcha_IsShowNoiseDot":                        strconv.FormatBool(input.CaptchaIsShowNoiseDot),
		"captcha_IsShowNoiseText":                       strconv.FormatBool(input.CaptchaIsShowNoiseText),
		"captcha_IsShowSlimeLine":                       strconv.FormatBool(input.CaptchaIsShowSlimeLine),
		"captcha_IsShowSineLine":                        strconv.FormatBool(input.CaptchaIsShowSineLine),
		"captcha_CaptchaLen":                            strconv.Itoa(input.CaptchaLength),
		"captcha_ttl_seconds":                           strconv.Itoa(input.CaptchaTTLSeconds),
		"captcha_image_rate_limit_per_minute":           strconv.Itoa(input.CaptchaImageRateLimitPerMinute),
		"captcha_precheck_rate_limit_per_minute":        strconv.Itoa(input.CaptchaPrecheckRateLimitPerMinute),
		"captcha_target_rate_limit_per_minute":          strconv.Itoa(input.CaptchaTargetRateLimitPerMinute),
		"login_code_subject_template":                   strings.TrimSpace(input.LoginCodeSubjectTemplate),
		"login_code_body_template":                      input.LoginCodeBodyTemplate,
		"login_code_subject_template_en":                strings.TrimSpace(input.LoginCodeSubjectTemplateEN),
		"login_code_body_template_en":                   input.LoginCodeBodyTemplateEN,
		"register_code_subject_template":                strings.TrimSpace(input.RegisterCodeSubjectTemplate),
		"register_code_body_template":                   input.RegisterCodeBodyTemplate,
		"register_code_subject_template_en":             strings.TrimSpace(input.RegisterCodeSubjectTemplateEN),
		"register_code_body_template_en":                input.RegisterCodeBodyTemplateEN,
		"reset_password_code_subject_template":          strings.TrimSpace(input.ResetPasswordCodeSubjectTemplate),
		"reset_password_code_body_template":             input.ResetPasswordCodeBodyTemplate,
		"reset_password_code_subject_template_en":       strings.TrimSpace(input.ResetPasswordCodeSubjectTemplateEN),
		"reset_password_code_body_template_en":          input.ResetPasswordCodeBodyTemplateEN,
		"delete_account_code_subject_template":          strings.TrimSpace(input.DeleteAccountCodeSubjectTemplate),
		"delete_account_code_body_template":             input.DeleteAccountCodeBodyTemplate,
		"delete_account_code_subject_template_en":       strings.TrimSpace(input.DeleteAccountCodeSubjectTemplateEN),
		"delete_account_code_body_template_en":          input.DeleteAccountCodeBodyTemplateEN,
		"change_email_code_subject_template":            strings.TrimSpace(input.ChangeEmailCodeSubjectTemplate),
		"change_email_code_body_template":               input.ChangeEmailCodeBodyTemplate,
		"change_email_code_subject_template_en":         strings.TrimSpace(input.ChangeEmailCodeSubjectTemplateEN),
		"change_email_code_body_template_en":            input.ChangeEmailCodeBodyTemplateEN,
		"sms_provider":                                  strings.TrimSpace(input.SMSProvider),
		"sms_template_provider":                         strings.TrimSpace(input.SMSTemplateProvider),
		"sms_api_base":                                  strings.TrimSpace(input.SMSAPIBase),
		"sms_username":                                  strings.TrimSpace(input.SMSUsername),
		"sms_password":                                  input.SMSPassword,
		"sms_signature":                                 strings.TrimSpace(input.SMSSignature),
		"sms_login_template":                            input.SMSLoginTemplate,
		"sms_register_template":                         input.SMSRegisterTemplate,
		"sms_reset_password_template":                   input.SMSResetPasswordTemplate,
		"sms_bind_phone_template":                       input.SMSBindPhoneTemplate,
		"sms_delete_account_template":                   input.SMSDeleteAccountTemplate,
		"aliyun_sms_access_key_id":                      strings.TrimSpace(input.AliyunSMSAccessKeyID),
		"aliyun_sms_access_key_secret":                  input.AliyunSMSAccessKeySecret,
		"aliyun_sms_endpoint":                           strings.TrimSpace(input.AliyunSMSEndpoint),
		"aliyun_sms_region_id":                          strings.TrimSpace(input.AliyunSMSRegionID),
		"aliyun_sms_sign_name":                          strings.TrimSpace(input.AliyunSMSSignName),
		"aliyun_sms_login_template_code":                strings.TrimSpace(input.AliyunSMSLoginTemplateCode),
		"aliyun_sms_register_template_code":             strings.TrimSpace(input.AliyunSMSRegisterTemplateCode),
		"aliyun_sms_reset_template_code":                strings.TrimSpace(input.AliyunSMSResetTemplateCode),
		"aliyun_sms_bind_phone_template_code":           strings.TrimSpace(input.AliyunSMSBindPhoneTemplateCode),
		"aliyun_sms_delete_template_code":               strings.TrimSpace(input.AliyunSMSDeleteTemplateCode),
		"risk_control_enabled":                          strconv.FormatBool(input.RiskControlEnabled),
		"risk_phone_binding_enabled":                    strconv.FormatBool(input.RiskPhoneBindingEnabled),
		"risk_immediate_bind_probability":               strconv.Itoa(input.RiskImmediateBindProbability),
		"risk_delayed_bind_probability":                 strconv.Itoa(input.RiskDelayedBindProbability),
		"risk_delayed_bind_login_count":                 strconv.Itoa(input.RiskDelayedBindLoginCount),
		"risk_medium_threshold":                         strconv.Itoa(input.RiskMediumThreshold),
		"risk_high_threshold":                           strconv.Itoa(input.RiskHighThreshold),
		"risk_critical_threshold":                       strconv.Itoa(input.RiskCriticalThreshold),
		"risk_auto_block_threshold":                     strconv.Itoa(input.RiskAutoBlockThreshold),
		"risk_max_failed_logins":                        strconv.Itoa(input.RiskMaxFailedLogins),
		"risk_lockout_minutes":                          strconv.Itoa(input.RiskLockoutMinutes),
		"risk_score_window_days":                        strconv.Itoa(input.RiskScoreWindowDays),
		"risk_failed_login_score_weight":                strconv.Itoa(input.RiskFailedLoginScoreWeight),
		"risk_failed_login_score_cap":                   strconv.Itoa(input.RiskFailedLoginScoreCap),
		"risk_enable_geo_check":                         strconv.FormatBool(input.RiskEnableGeoCheck),
		"risk_enable_device_check":                      strconv.FormatBool(input.RiskEnableDeviceCheck),
		"risk_enable_behavior_check":                    strconv.FormatBool(input.RiskEnableBehaviorCheck),
		"risk_enable_ip_blacklist":                      strconv.FormatBool(input.RiskEnableIPBlacklist),
		"risk_enable_mitigation":                        strconv.FormatBool(input.RiskEnableMitigation),
		"risk_allow_block_step_up":                      strconv.FormatBool(input.RiskAllowBlockStepUp),
		"risk_trusted_device_days":                      strconv.Itoa(input.RiskTrustedDeviceDays),
		"risk_mitigation_hours":                         strconv.Itoa(input.RiskMitigationHours),
		"risk_trusted_device_score_discount":            strconv.Itoa(input.RiskTrustedDeviceScoreDiscount),
		"risk_mitigation_score_discount":                strconv.Itoa(input.RiskMitigationScoreDiscount),
		"risk_high_risk_geo_discount":                   strconv.Itoa(input.RiskHighRiskGeoDiscount),
		"risk_new_device_discount":                      strconv.Itoa(input.RiskNewDeviceDiscount),
		"risk_ip_change_discount":                       strconv.Itoa(input.RiskIPChangeDiscount),
		"risk_trusted_ips":                              strings.TrimSpace(input.RiskTrustedIPs),
		"risk_high_risk_countries":                      strings.TrimSpace(input.RiskHighRiskCountries),
		"developer_managed_users_search_window_seconds": strconv.Itoa(input.DeveloperManagedUsersSearchWindowSec),
		"developer_managed_users_search_limit":          strconv.Itoa(input.DeveloperManagedUsersSearchLimit),
	}); err != nil {
		return err
	}

	if err := s.syncFirstPartyClient(input); err != nil {
		return err
	}

	appurl.RemoveReplacedUploadedFile(currentSettings.SiteLogoDataURL, input.SiteLogoDataURL)

	s.deps.Cfg.SMTP.Host = strings.TrimSpace(input.SMTPHost)
	s.deps.Cfg.SMTP.Port = strings.TrimSpace(input.SMTPPort)
	s.deps.Cfg.SMTP.Username = strings.TrimSpace(input.SMTPUsername)
	s.deps.Cfg.SMTP.Password = input.SMTPPassword
	s.deps.Cfg.SMTP.From = strings.TrimSpace(input.SMTPFrom)
	s.deps.Cfg.SMTP.ForceSSL = input.SMTPForceSSL
	s.deps.Cfg.SMTP.VerificationCodeTTL = time.Duration(input.SMTPVerificationCodeTTLMinute) * time.Minute
	s.deps.Mail = notify.NewMailer(s.deps.Cfg.SMTP)
	s.deps.Cfg.SMS.Provider = strings.TrimSpace(input.SMSProvider)
	s.deps.Cfg.SMS.TemplateProvider = strings.TrimSpace(input.SMSTemplateProvider)
	s.deps.Cfg.SMS.APIBase = strings.TrimSpace(input.SMSAPIBase)
	s.deps.Cfg.SMS.Username = strings.TrimSpace(input.SMSUsername)
	s.deps.Cfg.SMS.Password = input.SMSPassword
	s.deps.Cfg.SMS.Signature = strings.TrimSpace(input.SMSSignature)
	s.deps.Cfg.SMS.LoginTemplate = input.SMSLoginTemplate
	s.deps.Cfg.SMS.RegisterTemplate = input.SMSRegisterTemplate
	s.deps.Cfg.SMS.ResetPasswordTemplate = input.SMSResetPasswordTemplate
	s.deps.Cfg.SMS.BindPhoneTemplate = input.SMSBindPhoneTemplate
	s.deps.Cfg.SMS.DeleteAccountTemplate = input.SMSDeleteAccountTemplate
	s.deps.Cfg.SMS.AliyunAccessKeyID = strings.TrimSpace(input.AliyunSMSAccessKeyID)
	s.deps.Cfg.SMS.AliyunAccessKeySecret = input.AliyunSMSAccessKeySecret
	s.deps.Cfg.SMS.AliyunEndpoint = strings.TrimSpace(input.AliyunSMSEndpoint)
	s.deps.Cfg.SMS.AliyunRegionID = strings.TrimSpace(input.AliyunSMSRegionID)
	s.deps.Cfg.SMS.AliyunSignName = strings.TrimSpace(input.AliyunSMSSignName)
	s.deps.Cfg.SMS.AliyunLoginTemplateCode = strings.TrimSpace(input.AliyunSMSLoginTemplateCode)
	s.deps.Cfg.SMS.AliyunRegisterTemplateCode = strings.TrimSpace(input.AliyunSMSRegisterTemplateCode)
	s.deps.Cfg.SMS.AliyunResetTemplateCode = strings.TrimSpace(input.AliyunSMSResetTemplateCode)
	s.deps.Cfg.SMS.AliyunBindPhoneTemplateCode = strings.TrimSpace(input.AliyunSMSBindPhoneTemplateCode)
	s.deps.Cfg.SMS.AliyunDeleteTemplateCode = strings.TrimSpace(input.AliyunSMSDeleteTemplateCode)
	s.deps.SMS = notify.NewSMSSender(s.deps.Cfg.SMS)
	return nil
}

func (s *SettingsService) IsUserRegistrationAllowed() bool {
	settings, err := s.deps.Store.GetSettings("allow_user_registration")
	if err != nil {
		return true
	}
	return authutil.FallbackBoolSetting(settings["allow_user_registration"], true)
}

func (s *SettingsService) IsPhoneVerificationEnabled() bool {
	settings, err := s.deps.Store.GetSettings("enable_phone_verification")
	if err != nil {
		return true
	}
	return authutil.FallbackBoolSetting(settings["enable_phone_verification"], true)
}

func (s *SettingsService) IsQRLoginEnabled() bool {
	settings, err := s.deps.Store.GetSettings("enable_qr_login")
	if err != nil {
		return false
	}
	return authutil.FallbackBoolSetting(settings["enable_qr_login"], false)
}

func (s *SettingsService) SendTestEmail(senderUserID, to string) error {
	to = strings.TrimSpace(to)
	if to == "" {
		return fmt.Errorf("test email recipient is required")
	}
	if !s.deps.Mail.Enabled() {
		return fmt.Errorf("smtp not configured")
	}
	subject := "MySSO SMTP Test"
	body := "This is a test email from MySSO system settings."
	if err := s.deps.Mail.Send(to, subject, body); err != nil {
		return err
	}
	s.deps.AppendEmailSendLog(to, fmt.Sprintf("主题：%s\n%s", subject, body), s.deps.LookupUserEmailByID(senderUserID))
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
	sender := s.deps.SMS
	if provider != "" {
		testConfig := s.deps.Cfg.SMS
		testConfig.Provider = provider
		sender = notify.NewSMSSender(testConfig)
	}
	if !sender.Enabled() {
		return fmt.Errorf("sms not configured")
	}
	if err := sender.Send(phone, "", content, notify.SendOptions{}); err != nil {
		return err
	}
	s.deps.AppendPhoneSendLog(phone, content, s.deps.LookupUserEmailByID(senderUserID))
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

	if values, err := s.deps.Store.GetSettings("sms_login_template", "sms_register_template", "sms_reset_password_template", "sms_bind_phone_template", "sms_delete_account_template", "sms_signature"); err == nil {
		switch strings.ToLower(strings.TrimSpace(purpose)) {
		case "login":
			template = authutil.FallbackSetting(values["sms_login_template"], appdefaults.DefaultSMSLoginTemplate)
		case "mfa_login":
			template = authutil.FallbackSetting(values["sms_login_template"], appdefaults.DefaultSMSLoginTemplate)
		case "login_step_up":
			template = authutil.FallbackSetting(values["sms_login_template"], appdefaults.DefaultSMSLoginTemplate)
		case "reset_password":
			template = authutil.FallbackSetting(values["sms_reset_password_template"], appdefaults.DefaultSMSResetPasswordTemplate)
		case "change_phone":
			template = authutil.FallbackSetting(values["sms_bind_phone_template"], appdefaults.DefaultSMSBindPhoneTemplate)
		case "verify_current_phone":
			template = authutil.FallbackSetting(values["sms_bind_phone_template"], appdefaults.DefaultSMSBindPhoneTemplate)
		case "risk_phone_binding":
			template = authutil.FallbackSetting(values["sms_bind_phone_template"], appdefaults.DefaultSMSBindPhoneTemplate)
		case "delete_account":
			template = authutil.FallbackSetting(values["sms_delete_account_template"], appdefaults.DefaultSMSDeleteAccountTemplate)
		default:
			template = authutil.FallbackSetting(values["sms_register_template"], appdefaults.DefaultSMSRegisterTemplate)
		}
		template = strings.ReplaceAll(template, "{{signature}}", authutil.FallbackSetting(values["sms_signature"], appdefaults.DefaultSMSSignature))
	} else {
		template = strings.ReplaceAll(template, "{{signature}}", strings.TrimSpace(s.deps.Cfg.SMS.Signature))
	}

	template = strings.ReplaceAll(template, "{{code}}", code)
	template = strings.ReplaceAll(template, "{{minutes}}", strconv.Itoa(int(s.deps.Cfg.SMTP.VerificationCodeTTL.Minutes())))
	template = strings.ReplaceAll(template, "{{phone}}", phone)
	return template
}

func (s *SettingsService) syncFirstPartyClient(settings SystemSettings) error {
	redirectBase := strings.TrimSpace(settings.FrontendBaseURL)
	if redirectBase == "" {
		redirectBase = s.deps.Cfg.HTTP.PublicBase
	}
	redirectURI := strings.TrimRight(redirectBase, "/") + "/callback"
	scopes := authutil.ParseScope(settings.OIDCFirstPartyScope)
	now := time.Now().UTC()

	app, err := s.deps.Store.FindAppByClientID(settings.OIDCFirstPartyClientID)
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
		return s.deps.Store.UpdateApp(app)
	}
	hashedSecret, err := security.HashPassword(settings.OIDCFirstPartyClientSecret)
	if err != nil {
		return err
	}

	s.deps.Store.CreateApp(domain.ClientApp{
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

func (s *SettingsService) BuildVerificationEmailContent(purpose, email, country, code string) (string, string) {
	subjectTemplate := appdefaults.DefaultLoginCodeSubjectTemplate
	bodyTemplate := appdefaults.DefaultLoginCodeBodyTemplate
	language := verificationEmailLanguage(country)

	if purpose == "login" || purpose == "mfa_login" || purpose == "login_step_up" {
		if values, err := s.deps.Store.GetSettings("login_code_subject_template", "login_code_body_template", "login_code_subject_template_en", "login_code_body_template_en"); err == nil {
			if language == "en" {
				subjectTemplate = authutil.FallbackSetting(values["login_code_subject_template_en"], appdefaults.DefaultLoginCodeSubjectTemplateEN)
				bodyTemplate = authutil.FallbackSetting(values["login_code_body_template_en"], appdefaults.DefaultLoginCodeBodyTemplateEN)
			} else {
				subjectTemplate = authutil.FallbackSetting(values["login_code_subject_template"], appdefaults.DefaultLoginCodeSubjectTemplate)
				bodyTemplate = authutil.FallbackSetting(values["login_code_body_template"], appdefaults.DefaultLoginCodeBodyTemplate)
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
		if values, err := s.deps.Store.GetSettings("register_code_subject_template", "register_code_body_template", "register_code_subject_template_en", "register_code_body_template_en"); err == nil {
			if language == "en" {
				subjectTemplate = authutil.FallbackSetting(values["register_code_subject_template_en"], appdefaults.DefaultRegisterCodeSubjectTemplateEN)
				bodyTemplate = authutil.FallbackSetting(values["register_code_body_template_en"], appdefaults.DefaultRegisterCodeBodyTemplateEN)
			} else {
				subjectTemplate = authutil.FallbackSetting(values["register_code_subject_template"], appdefaults.DefaultRegisterCodeSubjectTemplate)
				bodyTemplate = authutil.FallbackSetting(values["register_code_body_template"], appdefaults.DefaultRegisterCodeBodyTemplate)
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
		if values, err := s.deps.Store.GetSettings("change_email_code_subject_template", "change_email_code_body_template", "change_email_code_subject_template_en", "change_email_code_body_template_en"); err == nil {
			if language == "en" {
				subjectTemplate = authutil.FallbackSetting(values["change_email_code_subject_template_en"], appdefaults.DefaultChangeEmailCodeSubjectTemplateEN)
				bodyTemplate = authutil.FallbackSetting(values["change_email_code_body_template_en"], appdefaults.DefaultChangeEmailCodeBodyTemplateEN)
			} else {
				subjectTemplate = authutil.FallbackSetting(values["change_email_code_subject_template"], appdefaults.DefaultChangeEmailCodeSubjectTemplate)
				bodyTemplate = authutil.FallbackSetting(values["change_email_code_body_template"], appdefaults.DefaultChangeEmailCodeBodyTemplate)
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
		if values, err := s.deps.Store.GetSettings("reset_password_code_subject_template", "reset_password_code_body_template", "reset_password_code_subject_template_en", "reset_password_code_body_template_en"); err == nil {
			if language == "en" {
				subjectTemplate = authutil.FallbackSetting(values["reset_password_code_subject_template_en"], appdefaults.DefaultResetPasswordCodeSubjectTemplateEN)
				bodyTemplate = authutil.FallbackSetting(values["reset_password_code_body_template_en"], appdefaults.DefaultResetPasswordCodeBodyTemplateEN)
			} else {
				subjectTemplate = authutil.FallbackSetting(values["reset_password_code_subject_template"], appdefaults.DefaultResetPasswordCodeSubjectTemplate)
				bodyTemplate = authutil.FallbackSetting(values["reset_password_code_body_template"], appdefaults.DefaultResetPasswordCodeBodyTemplate)
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
		if values, err := s.deps.Store.GetSettings("delete_account_code_subject_template", "delete_account_code_body_template", "delete_account_code_subject_template_en", "delete_account_code_body_template_en"); err == nil {
			if language == "en" {
				subjectTemplate = authutil.FallbackSetting(values["delete_account_code_subject_template_en"], appdefaults.DefaultDeleteAccountCodeSubjectTemplateEN)
				bodyTemplate = authutil.FallbackSetting(values["delete_account_code_body_template_en"], appdefaults.DefaultDeleteAccountCodeBodyTemplateEN)
			} else {
				subjectTemplate = authutil.FallbackSetting(values["delete_account_code_subject_template"], appdefaults.DefaultDeleteAccountCodeSubjectTemplate)
				bodyTemplate = authutil.FallbackSetting(values["delete_account_code_body_template"], appdefaults.DefaultDeleteAccountCodeBodyTemplate)
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
		"{{minutes}}": strconv.Itoa(int(s.deps.Cfg.SMTP.VerificationCodeTTL.Minutes())),
		"{{email}}":   email,
		"{{country}}": country,
	}
	return templateutil.RenderTemplate(subjectTemplate, replacements), templateutil.RenderTemplate(bodyTemplate, replacements)
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

func (s *SettingsService) GetVerificationCodeCooldownSeconds() int {
	settings, err := s.deps.Store.GetSettings("smtp_verification_code_cooldown_seconds")
	if err == nil {
		if raw := strings.TrimSpace(settings["smtp_verification_code_cooldown_seconds"]); raw != "" {
			if parsed, parseErr := strconv.Atoi(raw); parseErr == nil && parsed >= 0 {
				return parsed
			}
		}
	}
	return appdefaults.DefaultVerificationCodeCooldownSeconds
}

type VerificationCodeDailyLimit struct {
	Email int
	SMS   int
}

func ChinaDayRange(now time.Time) (time.Time, time.Time) {
	location := time.FixedZone("UTC+8", 8*60*60)
	localNow := now.In(location)
	startLocal := time.Date(localNow.Year(), localNow.Month(), localNow.Day(), 0, 0, 0, 0, location)
	endLocal := startLocal.Add(24 * time.Hour)
	return startLocal.UTC(), endLocal.UTC()
}

func VerificationDailyLimitError(now time.Time) *VerificationCooldownError {
	_, endAt := ChinaDayRange(now)
	retryAfter := int(endAt.Sub(now.UTC()).Seconds())
	if retryAfter < 1 {
		retryAfter = 1
	}
	return &VerificationCooldownError{
		RetryAfterSeconds: retryAfter,
		Message:           "verification code daily send limit exceeded",
	}
}

func (s *SettingsService) GetVerificationCodeDailyLimit() VerificationCodeDailyLimit {
	values, err := s.deps.Store.GetSettings(
		"email_verification_code_daily_limit",
		"sms_verification_code_daily_limit",
	)
	if err != nil {
		return VerificationCodeDailyLimit{
			Email: appdefaults.DefaultEmailVerificationCodeDailyLimit,
			SMS:   appdefaults.DefaultSMSVerificationCodeDailyLimit,
		}
	}
	return VerificationCodeDailyLimit{
		Email: normalizeRateLimitSetting(values["email_verification_code_daily_limit"], appdefaults.DefaultEmailVerificationCodeDailyLimit, appdefaults.MaxVerificationCodeDailyLimit),
		SMS:   normalizeRateLimitSetting(values["sms_verification_code_daily_limit"], appdefaults.DefaultSMSVerificationCodeDailyLimit, appdefaults.MaxVerificationCodeDailyLimit),
	}
}

func (s *SettingsService) GetCaptchaSettings() captcha.Settings {
	values, err := s.deps.Store.GetSettings(
		"captcha_enabled",
		"captcha_mode",
		"captcha_ComplexOfNoiseText",
		"captcha_ComplexOfNoiseDot",
		"captcha_IsShowHollowLine",
		"captcha_IsShowNoiseDot",
		"captcha_IsShowNoiseText",
		"captcha_IsShowSlimeLine",
		"captcha_IsShowSineLine",
		"captcha_CaptchaLen",
		"captcha_ttl_seconds",
	)
	if err != nil {
		values = map[string]string{}
	}
	return captcha.NormalizeSettings(captcha.Settings{
		Enabled:            authutil.FallbackBoolSetting(values["captcha_enabled"], appdefaults.DefaultCaptchaEnabled),
		Height:             appdefaults.DefaultCaptchaHeight,
		Width:              appdefaults.DefaultCaptchaWidth,
		Mode:               parseIntSetting(values["captcha_mode"], appdefaults.DefaultCaptchaMode),
		ComplexOfNoiseText: parseIntSetting(values["captcha_ComplexOfNoiseText"], appdefaults.DefaultCaptchaComplexOfNoiseText),
		ComplexOfNoiseDot:  parseIntSetting(values["captcha_ComplexOfNoiseDot"], appdefaults.DefaultCaptchaComplexOfNoiseDot),
		IsShowHollowLine:   authutil.FallbackBoolSetting(values["captcha_IsShowHollowLine"], appdefaults.DefaultCaptchaIsShowHollowLine),
		IsShowNoiseDot:     authutil.FallbackBoolSetting(values["captcha_IsShowNoiseDot"], appdefaults.DefaultCaptchaIsShowNoiseDot),
		IsShowNoiseText:    authutil.FallbackBoolSetting(values["captcha_IsShowNoiseText"], appdefaults.DefaultCaptchaIsShowNoiseText),
		IsShowSlimeLine:    authutil.FallbackBoolSetting(values["captcha_IsShowSlimeLine"], appdefaults.DefaultCaptchaIsShowSlimeLine),
		IsShowSineLine:     authutil.FallbackBoolSetting(values["captcha_IsShowSineLine"], appdefaults.DefaultCaptchaIsShowSineLine),
		Length:             parseIntSetting(values["captcha_CaptchaLen"], appdefaults.DefaultCaptchaLength),
		TTL:                time.Duration(parseIntSetting(values["captcha_ttl_seconds"], appdefaults.DefaultCaptchaTTLSeconds)) * time.Second,
	})
}

func parseIntSetting(raw string, fallback int) int {
	if parsed, err := strconv.Atoi(strings.TrimSpace(raw)); err == nil {
		return parsed
	}
	return fallback
}

func normalizeHTTPURL(raw string) string {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return ""
	}
	parsedURL, err := url.ParseRequestURI(trimmed)
	if err != nil || parsedURL == nil || (parsedURL.Scheme != "http" && parsedURL.Scheme != "https") || parsedURL.Host == "" {
		return ""
	}
	return trimmed
}

func NormalizePublicHTTPURL(raw string) string {
	return normalizeHTTPURL(raw)
}

func normalizeRateLimitSetting(raw string, fallback, max int) int {
	value := parseIntSetting(raw, fallback)
	return clampRateLimit(value, max)
}

func clampRateLimit(value, max int) int {
	if value < 0 {
		return 0
	}
	if value > max {
		return max
	}
	return value
}

func clampInt(value, min, max int) int {
	if value < min {
		return min
	}
	if value > max {
		return max
	}
	return value
}

func (s *SettingsService) GetCaptchaRateLimit() CaptchaRateLimit {
	values, err := s.deps.Store.GetSettings(
		"captcha_image_rate_limit_per_minute",
		"captcha_precheck_rate_limit_per_minute",
		"captcha_target_rate_limit_per_minute",
	)
	if err != nil {
		return CaptchaRateLimit{
			ImagePerMinute:    appdefaults.DefaultCaptchaImageRateLimitPerMinute,
			PrecheckPerMinute: appdefaults.DefaultCaptchaPrecheckRateLimitPerMinute,
			TargetPerMinute:   appdefaults.DefaultCaptchaTargetRateLimitPerMinute,
		}
	}
	return CaptchaRateLimit{
		ImagePerMinute:    normalizeRateLimitSetting(values["captcha_image_rate_limit_per_minute"], appdefaults.DefaultCaptchaImageRateLimitPerMinute, appdefaults.MaxCaptchaRateLimitPerMinute),
		PrecheckPerMinute: normalizeRateLimitSetting(values["captcha_precheck_rate_limit_per_minute"], appdefaults.DefaultCaptchaPrecheckRateLimitPerMinute, appdefaults.MaxCaptchaRateLimitPerMinute),
		TargetPerMinute:   normalizeRateLimitSetting(values["captcha_target_rate_limit_per_minute"], appdefaults.DefaultCaptchaTargetRateLimitPerMinute, appdefaults.MaxCaptchaRateLimitPerMinute),
	}
}

func (s *SettingsService) GetDeveloperManagedUsersSearchRateLimit() DeveloperManagedUsersSearchRateLimit {
	values, err := s.deps.Store.GetSettings(
		"developer_managed_users_search_window_seconds",
		"developer_managed_users_search_limit",
	)
	if err != nil {
		return DeveloperManagedUsersSearchRateLimit{
			WindowSeconds: appdefaults.DefaultDeveloperManagedUsersSearchWindow,
			Limit:         appdefaults.DefaultDeveloperManagedUsersSearchLimit,
		}
	}
	windowSeconds := appdefaults.DefaultDeveloperManagedUsersSearchWindow
	if raw := strings.TrimSpace(values["developer_managed_users_search_window_seconds"]); raw != "" {
		if parsed, parseErr := strconv.Atoi(raw); parseErr == nil && parsed >= 0 {
			windowSeconds = parsed
		}
	}
	limit := appdefaults.DefaultDeveloperManagedUsersSearchLimit
	if raw := strings.TrimSpace(values["developer_managed_users_search_limit"]); raw != "" {
		if parsed, parseErr := strconv.Atoi(raw); parseErr == nil && parsed >= 0 {
			limit = parsed
		}
	}
	return DeveloperManagedUsersSearchRateLimit{
		WindowSeconds: windowSeconds,
		Limit:         limit,
	}
}

func validateRiskControlPrerequisites(input SystemSettings) error {
	if input.RiskMediumThreshold < 0 || input.RiskHighThreshold < 0 || input.RiskCriticalThreshold < 0 || input.RiskAutoBlockThreshold < 0 ||
		input.RiskMediumThreshold > 100 || input.RiskHighThreshold > 100 || input.RiskCriticalThreshold > 100 || input.RiskAutoBlockThreshold > 100 {
		return fmt.Errorf("risk thresholds must be between 0 and 100")
	}
	if !(input.RiskMediumThreshold <= input.RiskHighThreshold &&
		input.RiskHighThreshold <= input.RiskCriticalThreshold &&
		input.RiskCriticalThreshold <= input.RiskAutoBlockThreshold) {
		return fmt.Errorf("risk thresholds must be ordered as medium <= high <= critical <= auto block")
	}
	if input.RiskMaxFailedLogins <= 0 {
		return fmt.Errorf("risk max failed logins must be greater than 0")
	}
	if input.RiskLockoutMinutes <= 0 {
		return fmt.Errorf("risk lockout minutes must be greater than 0")
	}
	if input.RiskScoreWindowDays <= 0 || input.RiskScoreWindowDays > 365 {
		return fmt.Errorf("risk score window days must be between 1 and 365")
	}
	if input.RiskFailedLoginScoreWeight < 0 || input.RiskFailedLoginScoreWeight > 100 {
		return fmt.Errorf("risk failed login score weight must be between 0 and 100")
	}
	if input.RiskFailedLoginScoreCap < 0 || input.RiskFailedLoginScoreCap > 100 {
		return fmt.Errorf("risk failed login score cap must be between 0 and 100")
	}
	for _, item := range parseRiskListSetting(input.RiskTrustedIPs) {
		if net.ParseIP(item) == nil {
			if _, _, err := net.ParseCIDR(item); err != nil {
				return fmt.Errorf("risk trusted IPs must contain only valid IP or CIDR values")
			}
		}
	}

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

func parseRiskListSetting(raw string) []string {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil
	}
	var items []string
	if err := json.Unmarshal([]byte(raw), &items); err == nil {
		out := make([]string, 0, len(items))
		for _, item := range items {
			if item = strings.TrimSpace(item); item != "" {
				out = append(out, item)
			}
		}
		return out
	}
	parts := strings.FieldsFunc(raw, func(r rune) bool { return r == ',' || r == '\n' || r == ';' })
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		if part = strings.TrimSpace(part); part != "" {
			out = append(out, part)
		}
	}
	return out
}
