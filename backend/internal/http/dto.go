package http

type deleteUserOperationLogsRequest struct {
	DeleteAll bool   `json:"delete_all"`
	StartAt   string `json:"start_at"`
	EndAt     string `json:"end_at"`
}

type deleteAppAuditLogsRequest struct {
	StartAt string `json:"start_at"`
	EndAt   string `json:"end_at"`
}

type loginRequest struct {
	Email            string `json:"email"`
	Password         string `json:"password"`
	Captcha          string `json:"captcha"`
	CaptchaTicket    string `json:"captcha_ticket"`
	CaptchaChallenge string `json:"captcha_challenge"`
	CaptchaSign      string `json:"captcha_sign"`
	DeviceKeyID      string `json:"device_key_id"`
	DevicePublicKey  string `json:"device_public_key"`
}

type otpRequest struct {
	Email           string `json:"email"`
	OTP             string `json:"otp"`
	DeviceKeyID     string `json:"device_key_id"`
	DevicePublicKey string `json:"device_public_key"`
}

type smsLoginRequest struct {
	Phone           string `json:"phone"`
	OTP             string `json:"otp"`
	DeviceKeyID     string `json:"device_key_id"`
	DevicePublicKey string `json:"device_public_key"`
}

type emailCodeRequest struct {
	Email            string `json:"email"`
	Country          string `json:"country"`
	Purpose          string `json:"purpose"`
	Captcha          string `json:"captcha"`
	CaptchaTicket    string `json:"captcha_ticket"`
	CaptchaChallenge string `json:"captcha_challenge"`
	CaptchaSign      string `json:"captcha_sign"`
}

type mfaChallengeRequest struct {
	Email            string `json:"email"`
	Password         string `json:"password"`
	Captcha          string `json:"captcha"`
	CaptchaTicket    string `json:"captcha_ticket"`
	CaptchaChallenge string `json:"captcha_challenge"`
	CaptchaSign      string `json:"captcha_sign"`
}

type completeMFALoginRequest struct {
	ChallengeToken  string `json:"challenge_token"`
	OTP             string `json:"otp"`
	DeviceKeyID     string `json:"device_key_id"`
	DevicePublicKey string `json:"device_public_key"`
}

type passkeyVerifyRequest struct {
	ChallengeToken  string `json:"challenge_token"`
	Credential      string `json:"credential"`
	DeviceKeyID     string `json:"device_key_id"`
	DevicePublicKey string `json:"device_public_key"`
}

type passkeyRegisterOptionsRequest struct {
	CurrentPassword string `json:"current_password"`
	CurrentMFACode  string `json:"current_mfa_code"`
}

type passkeyRegisterVerifyRequest struct {
	ChallengeToken  string `json:"challenge_token"`
	Credential      string `json:"credential"`
	Name            string `json:"name"`
	CurrentPassword string `json:"current_password"`
	CurrentMFACode  string `json:"current_mfa_code"`
}

type deletePasskeyRequest struct {
	CurrentPassword string `json:"current_password"`
	CurrentMFACode  string `json:"current_mfa_code"`
}

type resendMFALoginRequest struct {
	ChallengeToken   string `json:"challenge_token"`
	Captcha          string `json:"captcha"`
	CaptchaTicket    string `json:"captcha_ticket"`
	CaptchaChallenge string `json:"captcha_challenge"`
	CaptchaSign      string `json:"captcha_sign"`
}

type confirmDeletionLoginRequest struct {
	ChallengeToken  string `json:"challenge_token"`
	DeviceKeyID     string `json:"device_key_id"`
	DevicePublicKey string `json:"device_public_key"`
}

type registerRequest struct {
	Country           string `json:"country"`
	Email             string `json:"email"`
	Code              string `json:"code"`
	Password          string `json:"password"`
	AgreementAccepted bool   `json:"agreement_accepted"`
	PrivacyAccepted   bool   `json:"privacy_accepted"`
	DeviceKeyID       string `json:"device_key_id"`
	DevicePublicKey   string `json:"device_public_key"`
}

type phoneBindingCodeRequest struct {
	ChallengeToken   string `json:"challenge_token"`
	Phone            string `json:"phone"`
	Captcha          string `json:"captcha"`
	CaptchaTicket    string `json:"captcha_ticket"`
	CaptchaChallenge string `json:"captcha_challenge"`
	CaptchaSign      string `json:"captcha_sign"`
}

type completePhoneBindingRequest struct {
	ChallengeToken  string `json:"challenge_token"`
	Phone           string `json:"phone"`
	Code            string `json:"code"`
	DeviceKeyID     string `json:"device_key_id"`
	DevicePublicKey string `json:"device_public_key"`
}

type sendLoginStepUpCodeRequest struct {
	ChallengeToken   string `json:"challenge_token"`
	Channel          string `json:"channel"`
	Captcha          string `json:"captcha"`
	CaptchaTicket    string `json:"captcha_ticket"`
	CaptchaChallenge string `json:"captcha_challenge"`
	CaptchaSign      string `json:"captcha_sign"`
}

type completeLoginStepUpRequest struct {
	ChallengeToken  string `json:"challenge_token"`
	EmailOTP        string `json:"email_otp"`
	SMSOTP          string `json:"sms_otp"`
	DeviceKeyID     string `json:"device_key_id"`
	DevicePublicKey string `json:"device_public_key"`
}

type completeLoginMFAEnrollmentRequest struct {
	ChallengeToken  string `json:"challenge_token"`
	Method          string `json:"method"`
	DeviceKeyID     string `json:"device_key_id"`
	DevicePublicKey string `json:"device_public_key"`
}

type updateProfileRequest struct {
	DisplayName      string  `json:"display_name"`
	Email            string  `json:"email"`
	Phone            string  `json:"phone"`
	Code             string  `json:"code"`
	CurrentPhoneCode string  `json:"current_phone_code"`
	CurrentPassword  string  `json:"current_password"`
	Gender           *string `json:"gender"`
	PreferredLocale  *string `json:"preferred_locale"`
}

type updatePasswordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

type updateMFARequest struct {
	Enabled         bool   `json:"enabled"`
	Method          string `json:"method"`
	CurrentPassword string `json:"current_password"`
	CurrentMFACode  string `json:"current_mfa_code"`
}

type currentMFACodeRequest struct {
	CurrentPassword  string `json:"current_password"`
	Captcha          string `json:"captcha"`
	CaptchaTicket    string `json:"captcha_ticket"`
	CaptchaChallenge string `json:"captcha_challenge"`
	CaptchaSign      string `json:"captcha_sign"`
}

type resetPasswordRequest struct {
	Email       string `json:"email"`
	Code        string `json:"code"`
	NewPassword string `json:"new_password"`
}

type requestAccountDeletionRequest struct {
	CurrentPassword string `json:"current_password"`
	EmailCode       string `json:"email_code"`
	PhoneCode       string `json:"phone_code"`
}

type exportUserDataRequest struct {
	CurrentPassword string `json:"current_password"`
}

type updateSystemSettingsRequest struct {
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
	OIDCFirstPartyScope                  string `json:"oidc_first_party_scope"`
	OIDCAutoApproveClientIDs             string `json:"oidc_auto_approve_client_ids"`
	OIDCAutoApproveRedirectHosts         string `json:"oidc_auto_approve_redirect_hosts"`
	SMTPHost                             string `json:"smtp_host"`
	SMTPPort                             string `json:"smtp_port"`
	SMTPUsername                         string `json:"smtp_username"`
	SMTPPassword                         string `json:"smtp_password"`
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
	SMSSignature                         string `json:"sms_signature"`
	SMSLoginTemplate                     string `json:"sms_login_template"`
	SMSRegisterTemplate                  string `json:"sms_register_template"`
	SMSResetPasswordTemplate             string `json:"sms_reset_password_template"`
	SMSBindPhoneTemplate                 string `json:"sms_bind_phone_template"`
	SMSDeleteAccountTemplate             string `json:"sms_delete_account_template"`
	AliyunSMSAccessKeyID                 string `json:"aliyun_sms_access_key_id"`
	AliyunSMSAccessKeySecret             string `json:"aliyun_sms_access_key_secret"`
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

type testEmailRequest struct {
	Email string `json:"email"`
}

type testSMSRequest struct {
	Provider string `json:"provider"`
	Phone    string `json:"phone"`
	Content  string `json:"content"`
}

type smsCodeRequest struct {
	Phone            string `json:"phone"`
	Purpose          string `json:"purpose"`
	Captcha          string `json:"captcha"`
	CaptchaTicket    string `json:"captcha_ticket"`
	CaptchaChallenge string `json:"captcha_challenge"`
	CaptchaSign      string `json:"captcha_sign"`
}

type captchaPrecheckRequest struct {
	Flow    string `json:"flow"`
	Purpose string `json:"purpose"`
	Target  string `json:"target"`
}

type captchaImageRequest struct {
	Flow      string `json:"flow"`
	Purpose   string `json:"purpose"`
	Target    string `json:"target"`
	Challenge string `json:"challenge"`
	Sign      string `json:"sign"`
}

type firstPartyTokenExchangeRequest struct {
	Code         string `json:"code"`
	RedirectURI  string `json:"redirect_uri"`
	CodeVerifier string `json:"code_verifier"`
}

type firstPartyRefreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

type authorizeRequest struct {
	ClientID            string `json:"client_id"`
	RedirectURI         string `json:"redirect_uri"`
	ResponseType        string `json:"response_type"`
	Scope               string `json:"scope"`
	State               string `json:"state"`
	Nonce               string `json:"nonce"`
	CodeChallenge       string `json:"code_challenge"`
	CodeChallengeMethod string `json:"code_challenge_method"`
	Prompt              string `json:"prompt"`
	MaxAge              string `json:"max_age"`
	ACRValues           string `json:"acr_values"`
	ConsentAccepted     bool   `json:"consent_accepted"`
}

type qrLoginScanRequest struct {
	ScanToken string `json:"scan_token"`
}

type qrLoginConfirmRequest struct {
	ScanToken       string `json:"scan_token"`
	Confirm         bool   `json:"confirm"`
	DeviceKeyID     string `json:"device_key_id"`
	DevicePublicKey string `json:"device_public_key"`
}

type uploadSiteLogoResponse struct {
	URL string `json:"url"`
}

type createAppRequest struct {
	Name                   string   `json:"name"`
	IconURL                string   `json:"icon_url"`
	Description            string   `json:"description"`
	RedirectURIs           []string `json:"redirect_uris"`
	PostLogoutRedirectURIs []string `json:"post_logout_redirect_uris"`
	FrontChannelLogoutURI  string   `json:"frontchannel_logout_uri"`
	AllowGetSessionLogout  bool     `json:"allow_get_session_logout"`
	Scopes                 []string `json:"scopes"`
}

type reviewAppRequest struct {
	Approved bool   `json:"approved"`
	Comment  string `json:"comment"`
}

type setAppDisabledRequest struct {
	Disabled bool `json:"disabled"`
}

type freezeUserRequest struct {
	Frozen bool   `json:"frozen"`
	Reason string `json:"reason"`
}

type createAdminUserRequest struct {
	Email        string `json:"email"`
	DisplayName  string `json:"display_name"`
	Password     string `json:"password"`
	Role         string `json:"role"`
	Status       string `json:"status"`
	FreezeReason string `json:"freeze_reason"`
	Country      string `json:"country"`
}

type updateAdminUserRequest struct {
	Email        string  `json:"email"`
	DisplayName  string  `json:"display_name"`
	Phone        string  `json:"phone"`
	Password     string  `json:"password"`
	Role         string  `json:"role"`
	Status       string  `json:"status"`
	FreezeReason string  `json:"freeze_reason"`
	Country      string  `json:"country"`
	Gender       *string `json:"gender"`
}

type batchUsersRequest struct {
	UserIDs []string `json:"user_ids"`
}

type batchAuditLogsRequest struct {
	LogIDs []string `json:"log_ids"`
}

type batchSendLogsRequest struct {
	LogIDs []string `json:"log_ids"`
}

type batchPasskeyLogsRequest struct {
	Table     string   `json:"table"`
	RecordIDs []string `json:"record_ids"`
}

type batchAppsRequest struct {
	AppIDs []string `json:"app_ids"`
}

type upsertScopeRequest struct {
	Key                 string `json:"key"`
	DisplayName         string `json:"display_name"`
	Description         string `json:"description"`
	Enabled             bool   `json:"enabled"`
	DeveloperSelectable bool   `json:"developer_selectable"`
}

type batchConsentsRequest struct {
	ConsentIDs []string `json:"consent_ids"`
}

type developerGroupRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type developerManagedUserGroupsRequest struct {
	GroupIDs []string `json:"group_ids"`
}

type batchDeveloperManagedUserGroupsRequest struct {
	UserIDs  []string `json:"user_ids"`
	GroupIDs []string `json:"group_ids"`
	Mode     string   `json:"mode"`
}

type developerAppBindingsRequest struct {
	GroupIDs []string `json:"group_ids"`
}

type developerAppBanRequest struct {
	UserID    string `json:"user_id"`
	Reason    string `json:"reason"`
	ExpiresAt string `json:"expires_at"`
}

type batchDeveloperAccessLogsRequest struct {
	LogIDs []string `json:"log_ids"`
}

type batchFreezeUsersRequest struct {
	UserIDs []string `json:"user_ids"`
	Frozen  bool     `json:"frozen"`
	Reason  string   `json:"reason"`
}

type updateUserAnnouncementRequest struct {
	Enabled bool   `json:"enabled"`
	Content string `json:"content"`
}

type updateUserSecurityPolicyRequest struct {
	ForcePhoneBindingNextLogin  bool   `json:"force_phone_binding_next_login"`
	ForceMFAEnrollmentNextLogin bool   `json:"force_mfa_enrollment_next_login"`
	LoginStepUpMode             string `json:"login_step_up_mode"`
}

type installValidateDBRequest struct {
	DB struct {
		Driver   string `json:"driver"`
		Host     string `json:"host"`
		Port     string `json:"port"`
		Name     string `json:"name"`
		User     string `json:"user"`
		Password string `json:"password"`
		Charset  string `json:"charset"`
	} `json:"db"`
}

type installCompleteRequest struct {
	DB struct {
		Driver   string `json:"driver"`
		Host     string `json:"host"`
		Port     string `json:"port"`
		Name     string `json:"name"`
		User     string `json:"user"`
		Password string `json:"password"`
		Charset  string `json:"charset"`
	} `json:"db"`
	PublicBaseURL    string `json:"public_base_url"`
	FrontendBaseURL  string `json:"frontend_base_url"`
	Issuer           string `json:"issuer"`
	AdminEmail       string `json:"admin_email"`
	AdminDisplayName string `json:"admin_display_name"`
	AdminPassword    string `json:"admin_password"`
}
