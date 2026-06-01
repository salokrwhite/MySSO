package settings

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
	"mysso/backend/internal/service/common/appurl"
	"mysso/backend/internal/service/common/authutil"
	"mysso/backend/internal/service/common/deps"
	"mysso/backend/internal/service/common/templateutil"
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

	oidcFirstPartyClientSecret := strings.TrimSpace(authutil.FallbackSetting(values["oidc_first_party_client_secret"], s.deps.Cfg.OIDC.FirstPartyClientSecret))
	smtpPassword := strings.TrimSpace(authutil.FallbackSetting(values["smtp_password"], s.deps.Cfg.SMTP.Password))
	smsPassword := strings.TrimSpace(values["sms_password"])
	aliyunSMSAccessKeySecret := strings.TrimSpace(values["aliyun_sms_access_key_secret"])

	return SystemSettings{
		AllowUserRegistration:                authutil.FallbackBoolSetting(values["allow_user_registration"], appdefaults.DefaultAllowUserRegistration),
		EnablePhoneVerification:              authutil.FallbackBoolSetting(values["enable_phone_verification"], true),
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
		RiskImmediateBindProbability:         riskImmediateProbability,
		RiskDelayedBindProbability:           riskDelayedProbability,
		RiskDelayedBindLoginCount:            riskDelayedLoginCount,
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
	if input.RiskControlEnabled {
		if err := validateRiskControlPrerequisites(input); err != nil {
			return err
		}
	}

	if err := s.deps.Store.UpsertSettings(map[string]string{
		"allow_user_registration":                 strconv.FormatBool(input.AllowUserRegistration),
		"enable_phone_verification":               strconv.FormatBool(input.EnablePhoneVerification),
		"site_name":                               strings.TrimSpace(input.SiteName),
		"site_name_en":                            strings.TrimSpace(input.SiteNameEN),
		"site_browser_title":                      strings.TrimSpace(input.SiteBrowserTitle),
		"site_browser_title_en":                   strings.TrimSpace(input.SiteBrowserTitleEN),
		"site_logo_data_url":                      strings.TrimSpace(input.SiteLogoDataURL),
		"site_footer_text":                        input.SiteFooterText,
		"site_icp_record_number":                  strings.TrimSpace(input.SiteICPRecordNumber),
		"site_public_security_record_number":      strings.TrimSpace(input.SitePublicSecurityRecordNumber),
		"home_page_announcement_enabled":          strconv.FormatBool(input.HomePageAnnouncementEnabled),
		"home_page_announcement_content":          strings.TrimSpace(input.HomePageAnnouncementContent),
		"user_center_announcement_enabled":        strconv.FormatBool(input.UserCenterAnnouncementEnabled),
		"user_center_announcement_content":        strings.TrimSpace(input.UserCenterAnnouncementContent),
		"developer_announcement_enabled":          strconv.FormatBool(input.DeveloperAnnouncementEnabled),
		"developer_announcement_content":          strings.TrimSpace(input.DeveloperAnnouncementContent),
		"public_base_url":                         strings.TrimSpace(input.PublicBaseURL),
		"frontend_base_url":                       strings.TrimSpace(input.FrontendBaseURL),
		"oidc_first_party_client_id":              strings.TrimSpace(input.OIDCFirstPartyClientID),
		"oidc_first_party_client_secret":          strings.TrimSpace(input.OIDCFirstPartyClientSecret),
		"oidc_first_party_scope":                  strings.TrimSpace(input.OIDCFirstPartyScope),
		"oidc_auto_approve_client_ids":            templateutil.NormalizeListSetting(input.OIDCAutoApproveClientIDs),
		"oidc_auto_approve_redirect_hosts":        templateutil.NormalizeListSetting(input.OIDCAutoApproveRedirectHosts),
		"smtp_host":                               strings.TrimSpace(input.SMTPHost),
		"smtp_port":                               strings.TrimSpace(input.SMTPPort),
		"smtp_username":                           strings.TrimSpace(input.SMTPUsername),
		"smtp_password":                           input.SMTPPassword,
		"smtp_from":                               strings.TrimSpace(input.SMTPFrom),
		"smtp_force_ssl":                          strconv.FormatBool(input.SMTPForceSSL),
		"smtp_verification_code_ttl_minutes":      strconv.Itoa(input.SMTPVerificationCodeTTLMinute),
		"smtp_verification_code_cooldown_seconds": strconv.Itoa(input.SMTPVerificationCodeCooldownSecond),
		"login_code_subject_template":             strings.TrimSpace(input.LoginCodeSubjectTemplate),
		"login_code_body_template":                input.LoginCodeBodyTemplate,
		"login_code_subject_template_en":          strings.TrimSpace(input.LoginCodeSubjectTemplateEN),
		"login_code_body_template_en":             input.LoginCodeBodyTemplateEN,
		"register_code_subject_template":          strings.TrimSpace(input.RegisterCodeSubjectTemplate),
		"register_code_body_template":             input.RegisterCodeBodyTemplate,
		"register_code_subject_template_en":       strings.TrimSpace(input.RegisterCodeSubjectTemplateEN),
		"register_code_body_template_en":          input.RegisterCodeBodyTemplateEN,
		"reset_password_code_subject_template":    strings.TrimSpace(input.ResetPasswordCodeSubjectTemplate),
		"reset_password_code_body_template":       input.ResetPasswordCodeBodyTemplate,
		"reset_password_code_subject_template_en": strings.TrimSpace(input.ResetPasswordCodeSubjectTemplateEN),
		"reset_password_code_body_template_en":    input.ResetPasswordCodeBodyTemplateEN,
		"delete_account_code_subject_template":    strings.TrimSpace(input.DeleteAccountCodeSubjectTemplate),
		"delete_account_code_body_template":       input.DeleteAccountCodeBodyTemplate,
		"delete_account_code_subject_template_en": strings.TrimSpace(input.DeleteAccountCodeSubjectTemplateEN),
		"delete_account_code_body_template_en":    input.DeleteAccountCodeBodyTemplateEN,
		"change_email_code_subject_template":      strings.TrimSpace(input.ChangeEmailCodeSubjectTemplate),
		"change_email_code_body_template":         input.ChangeEmailCodeBodyTemplate,
		"change_email_code_subject_template_en":   strings.TrimSpace(input.ChangeEmailCodeSubjectTemplateEN),
		"change_email_code_body_template_en":      input.ChangeEmailCodeBodyTemplateEN,
		"sms_provider":                            strings.TrimSpace(input.SMSProvider),
		"sms_template_provider":                   strings.TrimSpace(input.SMSTemplateProvider),
		"sms_api_base":                            strings.TrimSpace(input.SMSAPIBase),
		"sms_username":                            strings.TrimSpace(input.SMSUsername),
		"sms_password":                            input.SMSPassword,
		"sms_signature":                           strings.TrimSpace(input.SMSSignature),
		"sms_login_template":                      input.SMSLoginTemplate,
		"sms_register_template":                   input.SMSRegisterTemplate,
		"sms_reset_password_template":             input.SMSResetPasswordTemplate,
		"sms_bind_phone_template":                 input.SMSBindPhoneTemplate,
		"sms_delete_account_template":             input.SMSDeleteAccountTemplate,
		"aliyun_sms_access_key_id":                strings.TrimSpace(input.AliyunSMSAccessKeyID),
		"aliyun_sms_access_key_secret":            input.AliyunSMSAccessKeySecret,
		"aliyun_sms_endpoint":                     strings.TrimSpace(input.AliyunSMSEndpoint),
		"aliyun_sms_region_id":                    strings.TrimSpace(input.AliyunSMSRegionID),
		"aliyun_sms_sign_name":                    strings.TrimSpace(input.AliyunSMSSignName),
		"aliyun_sms_login_template_code":          strings.TrimSpace(input.AliyunSMSLoginTemplateCode),
		"aliyun_sms_register_template_code":       strings.TrimSpace(input.AliyunSMSRegisterTemplateCode),
		"aliyun_sms_reset_template_code":          strings.TrimSpace(input.AliyunSMSResetTemplateCode),
		"aliyun_sms_bind_phone_template_code":     strings.TrimSpace(input.AliyunSMSBindPhoneTemplateCode),
		"aliyun_sms_delete_template_code":         strings.TrimSpace(input.AliyunSMSDeleteTemplateCode),
		"risk_control_enabled":                    strconv.FormatBool(input.RiskControlEnabled),
		"risk_immediate_bind_probability":         strconv.Itoa(input.RiskImmediateBindProbability),
		"risk_delayed_bind_probability":           strconv.Itoa(input.RiskDelayedBindProbability),
		"risk_delayed_bind_login_count":           strconv.Itoa(input.RiskDelayedBindLoginCount),
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
