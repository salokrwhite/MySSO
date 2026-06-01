package install

import (
	"bufio"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"database/sql"
	"encoding/hex"
	"encoding/pem"
	"errors"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"

	"mysso/backend/internal/appdefaults"
	"mysso/backend/internal/config"
	"mysso/backend/internal/security"
	storemysql "mysso/backend/internal/store/mysql"
)

var ErrAlreadyInstalled = errors.New("system already installed")

type Status struct {
	Installed           bool   `json:"installed"`
	ConfiguredDB        bool   `json:"configured_db"`
	Step                string `json:"step"`
	DefaultPublicBase   string `json:"default_public_base_url"`
	DefaultIssuer       string `json:"default_issuer"`
	DefaultFrontendBase string `json:"default_frontend_base_url"`
}

type CompleteRequest struct {
	DB               config.DBConfig `json:"db"`
	PublicBaseURL    string          `json:"public_base_url"`
	FrontendBaseURL  string          `json:"frontend_base_url"`
	Issuer           string          `json:"issuer"`
	AdminEmail       string          `json:"admin_email"`
	AdminDisplayName string          `json:"admin_display_name"`
	AdminPassword    string          `json:"admin_password"`
}

type Service struct {
	cfg config.Config
}

func NewService(cfg config.Config) *Service {
	return &Service{cfg: cfg}
}

func (s *Service) Status() Status {
	if !s.cfg.DB.IsConfigured() {
		return Status{Installed: false, ConfiguredDB: false, Step: "database", DefaultPublicBase: s.cfg.HTTP.PublicBase, DefaultIssuer: s.cfg.OIDC.Issuer, DefaultFrontendBase: s.cfg.HTTP.FrontendBase}
	}
	db, err := openDB(s.cfg.DB)
	if err != nil {
		return Status{Installed: false, ConfiguredDB: true, Step: "database", DefaultPublicBase: s.cfg.HTTP.PublicBase, DefaultIssuer: s.cfg.OIDC.Issuer, DefaultFrontendBase: s.cfg.HTTP.FrontendBase}
	}
	defer db.Close()
	installed, err := isInstalled(db)
	if err != nil {
		return Status{Installed: false, ConfiguredDB: true, Step: "migrate", DefaultPublicBase: s.cfg.HTTP.PublicBase, DefaultIssuer: s.cfg.OIDC.Issuer, DefaultFrontendBase: s.cfg.HTTP.FrontendBase}
	}
	if installed {
		return Status{Installed: true, ConfiguredDB: true, Step: "complete", DefaultPublicBase: s.cfg.HTTP.PublicBase, DefaultIssuer: s.cfg.OIDC.Issuer, DefaultFrontendBase: s.cfg.HTTP.FrontendBase}
	}
	return Status{Installed: false, ConfiguredDB: true, Step: "admin", DefaultPublicBase: s.cfg.HTTP.PublicBase, DefaultIssuer: s.cfg.OIDC.Issuer, DefaultFrontendBase: s.cfg.HTTP.FrontendBase}
}

func (s *Service) ValidateDB(dbCfg config.DBConfig) error {
	if err := s.validateInstallDBTarget(dbCfg); err != nil {
		return err
	}
	db, err := openDB(dbCfg)
	if err != nil {
		return err
	}
	defer db.Close()
	return nil
}

func (s *Service) Complete(req CompleteRequest) error {
	if err := s.validateInstallDBTarget(req.DB); err != nil {
		return err
	}
	db, err := openDB(req.DB)
	if err != nil {
		return err
	}
	defer db.Close()

	installed, err := isInstalled(db)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return err
	}
	if installed {
		return ErrAlreadyInstalled
	}
	if err := runMigrations(db); err != nil {
		return err
	}
	installed, err = isInstalled(db)
	if err == nil && installed {
		return ErrAlreadyInstalled
	}
	runtimeCfg, err := buildInstallRuntimeConfig(s.cfg, req)
	if err != nil {
		return err
	}
	if err := ensureSigningKeyMaterial(&runtimeCfg); err != nil {
		return err
	}
	if err := seedInitialData(db, req, runtimeCfg); err != nil {
		return err
	}
	return writeEnvFile(req, runtimeCfg)
}

func openDB(dbCfg config.DBConfig) (*sql.DB, error) {
	if !dbCfg.IsConfigured() {
		return nil, fmt.Errorf("database config incomplete")
	}
	return storemysql.Open(dbCfg)
}

func isInstalled(db *sql.DB) (bool, error) {
	var count int
	err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.tables
		WHERE table_schema = DATABASE() AND table_name = 'system_settings'
	`).Scan(&count)
	if err != nil {
		return false, err
	}
	if count == 0 {
		return false, nil
	}
	var value string
	err = db.QueryRow(`SELECT setting_value FROM system_settings WHERE setting_key = 'installed'`).Scan(&value)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, err
	}
	return value == "true", nil
}

func runMigrations(db *sql.DB) error {
	files, err := filepath.Glob(filepath.Join("migrations", "*.sql"))
	if err != nil {
		return err
	}
	sort.Strings(files)
	for _, migrationPath := range files {
		content, err := os.ReadFile(migrationPath)
		if err != nil {
			return err
		}
		for _, stmt := range splitSQLStatements(string(content)) {
			if strings.TrimSpace(stmt) == "" {
				continue
			}
			if _, err := db.Exec(stmt); err != nil {
				return fmt.Errorf("run migration %s: %w", filepath.Base(migrationPath), err)
			}
		}
	}
	return nil
}

func seedInitialData(db *sql.DB, req CompleteRequest, cfg config.Config) error {
	now := time.Now().UTC()
	passwordHash, err := security.HashPassword(req.AdminPassword)
	if err != nil {
		return err
	}
	adminID := uuid.NewString()
	if _, err := db.Exec(`
		INSERT INTO users (id, country, gender, email, phone, display_name, password_hash, role, status, freeze_reason, mfa_enabled, mfa_method, mfa_secret, auth_version, last_login_at, last_device_ip, created_at, updated_at)
		VALUES (?, '', '', ?, '', ?, ?, 'admin', 'active', '', ?, '', ?, 1, NULL, '', ?, ?)
	`, adminID, req.AdminEmail, req.AdminDisplayName, passwordHash, false, "", now, now); err != nil {
		return fmt.Errorf("create admin: %w", err)
	}
	if err := ensureDefaultGatewayPolicy(db, now); err != nil {
		return err
	}
	if err := seedDefaultScopeDefinitions(db); err != nil {
		return err
	}
	if err := upsertSetting(db, "installed", "true", now); err != nil {
		return err
	}
	if err := upsertSetting(db, "installed_at", now.Format(time.RFC3339), now); err != nil {
		return err
	}
	if err := upsertSetting(db, "public_base_url", req.PublicBaseURL, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "site_name", appdefaults.DefaultSiteName, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "allow_user_registration", strconv.FormatBool(appdefaults.DefaultAllowUserRegistration), now); err != nil {
		return err
	}
	if err := upsertSetting(db, "site_logo_data_url", appdefaults.DefaultSiteLogoDataURL, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "site_icp_record_number", appdefaults.DefaultSiteICPRecordNumber, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "site_public_security_record_number", appdefaults.DefaultSitePublicSecurityRecordNumber, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "home_page_announcement_enabled", strconv.FormatBool(appdefaults.DefaultHomePageAnnouncementEnabled), now); err != nil {
		return err
	}
	if err := upsertSetting(db, "home_page_announcement_content", appdefaults.DefaultHomePageAnnouncementContent, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "user_center_announcement_enabled", strconv.FormatBool(appdefaults.DefaultUserCenterAnnouncementEnabled), now); err != nil {
		return err
	}
	if err := upsertSetting(db, "user_center_announcement_content", appdefaults.DefaultUserCenterAnnouncementContent, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "developer_announcement_enabled", strconv.FormatBool(appdefaults.DefaultDeveloperAnnouncementEnabled), now); err != nil {
		return err
	}
	if err := upsertSetting(db, "developer_announcement_content", appdefaults.DefaultDeveloperAnnouncementContent, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "frontend_base_url", cfg.HTTP.FrontendBase, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "oidc_first_party_client_id", cfg.OIDC.FirstPartyClientID, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "oidc_first_party_client_secret", cfg.OIDC.FirstPartyClientSecret, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "oidc_first_party_scope", cfg.OIDC.FirstPartyScope, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "oidc_auto_approve_client_ids", appdefaults.DefaultOIDCAutoApproveClientIDs, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "oidc_auto_approve_redirect_hosts", appdefaults.DefaultOIDCAutoApproveRedirectHosts, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "oidc_issuer", req.Issuer, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "smtp_host", cfg.SMTP.Host, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "smtp_port", cfg.SMTP.Port, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "smtp_username", cfg.SMTP.Username, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "smtp_password", cfg.SMTP.Password, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "smtp_from", cfg.SMTP.From, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "smtp_force_ssl", strconv.FormatBool(cfg.SMTP.ForceSSL), now); err != nil {
		return err
	}
	if err := upsertSetting(db, "smtp_verification_code_ttl_minutes", strconv.Itoa(int(cfg.SMTP.VerificationCodeTTL.Minutes())), now); err != nil {
		return err
	}
	if err := upsertSetting(db, "smtp_verification_code_cooldown_seconds", strconv.Itoa(appdefaults.DefaultVerificationCodeCooldownSeconds), now); err != nil {
		return err
	}
	if err := upsertSetting(db, "login_code_subject_template", appdefaults.DefaultLoginCodeSubjectTemplate, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "login_code_body_template", appdefaults.DefaultLoginCodeBodyTemplate, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "login_code_subject_template_en", appdefaults.DefaultLoginCodeSubjectTemplateEN, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "login_code_body_template_en", appdefaults.DefaultLoginCodeBodyTemplateEN, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "register_code_subject_template", appdefaults.DefaultRegisterCodeSubjectTemplate, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "register_code_body_template", appdefaults.DefaultRegisterCodeBodyTemplate, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "register_code_subject_template_en", appdefaults.DefaultRegisterCodeSubjectTemplateEN, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "register_code_body_template_en", appdefaults.DefaultRegisterCodeBodyTemplateEN, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "reset_password_code_subject_template", appdefaults.DefaultResetPasswordCodeSubjectTemplate, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "reset_password_code_body_template", appdefaults.DefaultResetPasswordCodeBodyTemplate, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "reset_password_code_subject_template_en", appdefaults.DefaultResetPasswordCodeSubjectTemplateEN, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "reset_password_code_body_template_en", appdefaults.DefaultResetPasswordCodeBodyTemplateEN, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "delete_account_code_subject_template", appdefaults.DefaultDeleteAccountCodeSubjectTemplate, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "delete_account_code_body_template", appdefaults.DefaultDeleteAccountCodeBodyTemplate, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "delete_account_code_subject_template_en", appdefaults.DefaultDeleteAccountCodeSubjectTemplateEN, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "delete_account_code_body_template_en", appdefaults.DefaultDeleteAccountCodeBodyTemplateEN, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "change_email_code_subject_template", appdefaults.DefaultChangeEmailCodeSubjectTemplate, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "change_email_code_body_template", appdefaults.DefaultChangeEmailCodeBodyTemplate, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "change_email_code_subject_template_en", appdefaults.DefaultChangeEmailCodeSubjectTemplateEN, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "change_email_code_body_template_en", appdefaults.DefaultChangeEmailCodeBodyTemplateEN, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "sms_provider", appdefaults.DefaultSMSProvider, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "sms_template_provider", appdefaults.DefaultSMSTemplateProvider, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "sms_api_base", appdefaults.DefaultSMSAPIBase, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "sms_username", "", now); err != nil {
		return err
	}
	if err := upsertSetting(db, "sms_password", "", now); err != nil {
		return err
	}
	if err := upsertSetting(db, "sms_signature", appdefaults.DefaultSMSSignature, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "sms_login_template", appdefaults.DefaultSMSLoginTemplate, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "sms_register_template", appdefaults.DefaultSMSRegisterTemplate, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "sms_reset_password_template", appdefaults.DefaultSMSResetPasswordTemplate, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "sms_bind_phone_template", appdefaults.DefaultSMSBindPhoneTemplate, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "sms_delete_account_template", appdefaults.DefaultSMSDeleteAccountTemplate, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "aliyun_sms_access_key_id", "", now); err != nil {
		return err
	}
	if err := upsertSetting(db, "aliyun_sms_access_key_secret", "", now); err != nil {
		return err
	}
	if err := upsertSetting(db, "aliyun_sms_endpoint", appdefaults.DefaultAliyunSMSEndpoint, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "aliyun_sms_region_id", appdefaults.DefaultAliyunSMSRegionID, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "aliyun_sms_sign_name", appdefaults.DefaultAliyunSMSSignName, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "aliyun_sms_login_template_code", appdefaults.DefaultAliyunSMSLoginTemplateCode, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "aliyun_sms_register_template_code", appdefaults.DefaultAliyunSMSRegisterTemplateCode, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "aliyun_sms_reset_template_code", appdefaults.DefaultAliyunSMSResetTemplateCode, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "aliyun_sms_bind_phone_template_code", appdefaults.DefaultAliyunSMSBindPhoneTemplateCode, now); err != nil {
		return err
	}
	if err := upsertSetting(db, "aliyun_sms_delete_template_code", appdefaults.DefaultAliyunSMSDeleteTemplateCode, now); err != nil {
		return err
	}
	appID := uuid.NewString()
	hashedFirstPartySecret, err := security.HashPassword(cfg.OIDC.FirstPartyClientSecret)
	if err != nil {
		return fmt.Errorf("hash first-party client secret: %w", err)
	}
	if _, err := db.Exec(`
		INSERT INTO client_apps (id, owner_user_id, name, icon_url, client_id, client_secret, description, frontchannel_logout_uri, status, review_comment, created_at, updated_at)
		VALUES (?, ?, ?, '', ?, ?, ?, '', 'approved', '', ?, ?)
	`, appID, appdefaults.FirstPartyClientOwnerID, appdefaults.FirstPartyWebPortalName, cfg.OIDC.FirstPartyClientID, hashedFirstPartySecret, appdefaults.FirstPartyWebPortalDescription, now, now); err != nil {
		return fmt.Errorf("create first-party app: %w", err)
	}
	if _, err := db.Exec(`INSERT INTO client_redirect_uris (app_id, redirect_uri) VALUES (?, ?)`, appID, strings.TrimRight(cfg.HTTP.FrontendBase, "/")+"/callback"); err != nil {
		return fmt.Errorf("create first-party redirect uri: %w", err)
	}
	if _, err := db.Exec(`INSERT INTO client_post_logout_redirect_uris (app_id, post_logout_redirect_uri) VALUES (?, ?)`, appID, strings.TrimRight(cfg.HTTP.FrontendBase, "/")+"/login"); err != nil {
		return fmt.Errorf("create first-party post logout redirect uri: %w", err)
	}
	for _, scope := range strings.Fields(strings.TrimSpace(cfg.OIDC.FirstPartyScope)) {
		if _, err := db.Exec(`INSERT INTO client_scopes (app_id, scope) VALUES (?, ?)`, appID, scope); err != nil {
			return fmt.Errorf("create first-party scope: %w", err)
		}
	}
	return nil
}

func ApplyRuntimeSettings(db *sql.DB, cfg *config.Config) error {
	if db == nil || cfg == nil {
		return nil
	}
	if err := ensureUserGenderColumn(db); err != nil {
		return err
	}
	if err := ensureUserMFAMethodColumn(db); err != nil {
		return err
	}
	if err := ensureUserAuthVersionColumn(db); err != nil {
		return err
	}
	if err := ensureUserFreezeReasonColumn(db); err != nil {
		return err
	}
	if err := ensureUserDeletionColumns(db); err != nil {
		return err
	}
	if err := ensureSessionAuthColumns(db); err != nil {
		return err
	}
	if err := ensureAuthorizationCodeOIDCColumns(db); err != nil {
		return err
	}
	if err := ensureRefreshTokenRotationColumns(db); err != nil {
		return err
	}
	if err := ensureCleanupIndexes(db); err != nil {
		return err
	}
	if err := ensureConsentIndexes(db); err != nil {
		return err
	}
	if err := ensureEmailLookupIndexes(db); err != nil {
		return err
	}
	if err := ensureStabilityIndexes(db); err != nil {
		return err
	}
	if err := ensureSMSVerificationCodesTable(db); err != nil {
		return err
	}
	if err := ensureAuthChallengesTable(db); err != nil {
		return err
	}
	if err := migrateLegacyAuthChallenges(db); err != nil {
		return err
	}
	if err := ensurePasskeysTable(db); err != nil {
		return err
	}
	if err := ensurePasskeyUsageLogsTable(db); err != nil {
		return err
	}
	if err := ensureClientAppIconColumn(db); err != nil {
		return err
	}
	if err := ensureClientAppFrontChannelLogoutColumn(db); err != nil {
		return err
	}
	if err := ensureClientAppAllowGetSessionLogoutColumn(db); err != nil {
		return err
	}
	if err := ensureClientPostLogoutRedirectURIsTable(db); err != nil {
		return err
	}
	if err := ensureEmailSendLogsTable(db); err != nil {
		return err
	}
	if err := ensurePhoneSendLogsTable(db); err != nil {
		return err
	}
	if err := ensureScopeDefinitionsTable(db); err != nil {
		return err
	}
	if err := ensureDefaultGatewayPolicy(db, time.Now().UTC()); err != nil {
		return err
	}
	if err := seedDefaultScopeDefinitions(db); err != nil {
		return err
	}

	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.tables
		WHERE table_schema = DATABASE() AND table_name = 'system_settings'
	`).Scan(&count); err != nil {
		return err
	}
	if count == 0 {
		return nil
	}

	rows, err := db.Query(`
		SELECT setting_key, setting_value
		FROM system_settings
		WHERE setting_key IN (
			'public_base_url',
			'frontend_base_url',
			'site_name',
			'site_logo_data_url',
			'site_icp_record_number',
			'site_public_security_record_number',
			'oidc_issuer',
			'smtp_host',
			'smtp_port',
			'smtp_username',
			'smtp_password',
			'smtp_from',
			'smtp_force_ssl',
			'smtp_verification_code_ttl_minutes',
			'sms_provider',
			'sms_template_provider',
			'sms_api_base',
			'sms_username',
			'sms_password',
			'sms_signature',
			'sms_login_template',
			'sms_register_template',
			'sms_reset_password_template',
			'sms_bind_phone_template',
			'sms_delete_account_template',
			'aliyun_sms_access_key_id',
			'aliyun_sms_access_key_secret',
			'aliyun_sms_endpoint',
			'aliyun_sms_region_id',
			'aliyun_sms_sign_name',
			'aliyun_sms_login_template_code',
			'aliyun_sms_register_template_code',
			'aliyun_sms_reset_template_code',
			'aliyun_sms_bind_phone_template_code',
			'aliyun_sms_delete_template_code'
		)
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	settings := map[string]string{}
	for rows.Next() {
		var key, value string
		if err := rows.Scan(&key, &value); err != nil {
			return err
		}
		settings[key] = value
	}

	if value := strings.TrimSpace(settings["public_base_url"]); value != "" {
		cfg.HTTP.PublicBase = value
	}
	if value := strings.TrimSpace(settings["frontend_base_url"]); value != "" {
		cfg.HTTP.FrontendBase = value
	}
	if value := strings.TrimSpace(settings["oidc_issuer"]); value != "" {
		cfg.OIDC.Issuer = value
	}
	if value := strings.TrimSpace(settings["smtp_host"]); value != "" {
		cfg.SMTP.Host = value
	}
	if value := strings.TrimSpace(settings["smtp_port"]); value != "" {
		cfg.SMTP.Port = value
	}
	if value := strings.TrimSpace(settings["smtp_username"]); value != "" {
		cfg.SMTP.Username = value
	}
	if value := settings["smtp_password"]; value != "" {
		cfg.SMTP.Password = value
	}
	if value := strings.TrimSpace(settings["smtp_from"]); value != "" {
		cfg.SMTP.From = value
	}
	if value := strings.TrimSpace(settings["smtp_force_ssl"]); value != "" {
		if enabled, err := strconv.ParseBool(value); err == nil {
			cfg.SMTP.ForceSSL = enabled
		}
	}
	if value := strings.TrimSpace(settings["smtp_verification_code_ttl_minutes"]); value != "" {
		if minutes, err := strconv.Atoi(value); err == nil && minutes > 0 {
			cfg.SMTP.VerificationCodeTTL = time.Duration(minutes) * time.Minute
		}
	}
	if value := strings.TrimSpace(settings["sms_provider"]); value != "" {
		cfg.SMS.Provider = value
	}
	if value := strings.TrimSpace(settings["sms_template_provider"]); value != "" {
		cfg.SMS.TemplateProvider = value
	}
	if value := strings.TrimSpace(settings["sms_api_base"]); value != "" {
		cfg.SMS.APIBase = value
	}
	if value := strings.TrimSpace(settings["sms_username"]); value != "" {
		cfg.SMS.Username = value
	}
	if value := settings["sms_password"]; value != "" {
		cfg.SMS.Password = value
	}
	if value := strings.TrimSpace(settings["sms_signature"]); value != "" {
		cfg.SMS.Signature = value
	}
	if value := settings["sms_login_template"]; value != "" {
		cfg.SMS.LoginTemplate = value
	}
	if value := settings["sms_register_template"]; value != "" {
		cfg.SMS.RegisterTemplate = value
	}
	if value := settings["sms_reset_password_template"]; value != "" {
		cfg.SMS.ResetPasswordTemplate = value
	}
	if value := settings["sms_bind_phone_template"]; value != "" {
		cfg.SMS.BindPhoneTemplate = value
	}
	if value := settings["sms_delete_account_template"]; value != "" {
		cfg.SMS.DeleteAccountTemplate = value
	}
	if value := strings.TrimSpace(settings["aliyun_sms_access_key_id"]); value != "" {
		cfg.SMS.AliyunAccessKeyID = value
	}
	if value := settings["aliyun_sms_access_key_secret"]; value != "" {
		cfg.SMS.AliyunAccessKeySecret = value
	}
	if value := strings.TrimSpace(settings["aliyun_sms_endpoint"]); value != "" {
		cfg.SMS.AliyunEndpoint = value
	}
	if value := strings.TrimSpace(settings["aliyun_sms_region_id"]); value != "" {
		cfg.SMS.AliyunRegionID = value
	}
	if value := strings.TrimSpace(settings["aliyun_sms_sign_name"]); value != "" {
		cfg.SMS.AliyunSignName = value
	}
	if value := strings.TrimSpace(settings["aliyun_sms_login_template_code"]); value != "" {
		cfg.SMS.AliyunLoginTemplateCode = value
	}
	if value := strings.TrimSpace(settings["aliyun_sms_register_template_code"]); value != "" {
		cfg.SMS.AliyunRegisterTemplateCode = value
	}
	if value := strings.TrimSpace(settings["aliyun_sms_reset_template_code"]); value != "" {
		cfg.SMS.AliyunResetTemplateCode = value
	}
	if value := strings.TrimSpace(settings["aliyun_sms_bind_phone_template_code"]); value != "" {
		cfg.SMS.AliyunBindPhoneTemplateCode = value
	}
	if value := strings.TrimSpace(settings["aliyun_sms_delete_template_code"]); value != "" {
		cfg.SMS.AliyunDeleteTemplateCode = value
	}
	return nil
}

func ensureUserGenderColumn(db *sql.DB) error {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.columns
		WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'gender'
	`).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	_, err := db.Exec(`ALTER TABLE users ADD COLUMN gender VARCHAR(16) NOT NULL DEFAULT '' AFTER country`)
	return err
}

func ensureUserMFAMethodColumn(db *sql.DB) error {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.columns
		WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'mfa_method'
	`).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	_, err := db.Exec(`ALTER TABLE users ADD COLUMN mfa_method VARCHAR(32) NOT NULL DEFAULT '' AFTER mfa_enabled`)
	return err
}

func ensureUserAuthVersionColumn(db *sql.DB) error {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.columns
		WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'auth_version'
	`).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	if _, err := db.Exec(`ALTER TABLE users ADD COLUMN auth_version INT NOT NULL DEFAULT 1 AFTER mfa_secret`); err != nil {
		return err
	}
	_, err := db.Exec(`UPDATE users SET auth_version = 1 WHERE auth_version < 1`)
	return err
}

func ensureUserFreezeReasonColumn(db *sql.DB) error {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.columns
		WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'freeze_reason'
	`).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	_, err := db.Exec(`ALTER TABLE users ADD COLUMN freeze_reason VARCHAR(500) NOT NULL DEFAULT '' AFTER status`)
	return err
}

func ensureUserDeletionColumns(db *sql.DB) error {
	var requestedCount int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.columns
		WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'deletion_requested_at'
	`).Scan(&requestedCount); err != nil {
		return err
	}
	if requestedCount == 0 {
		if _, err := db.Exec(`ALTER TABLE users ADD COLUMN deletion_requested_at DATETIME NULL AFTER last_device_ip`); err != nil {
			return err
		}
	}
	var scheduledCount int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.columns
		WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'deletion_scheduled_at'
	`).Scan(&scheduledCount); err != nil {
		return err
	}
	if scheduledCount == 0 {
		if _, err := db.Exec(`ALTER TABLE users ADD COLUMN deletion_scheduled_at DATETIME NULL AFTER deletion_requested_at`); err != nil {
			return err
		}
	}
	return nil
}

func ensureSessionAuthColumns(db *sql.DB) error {
	var authenticatedAtCount int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.columns
		WHERE table_schema = DATABASE() AND table_name = 'sessions' AND column_name = 'authenticated_at'
	`).Scan(&authenticatedAtCount); err != nil {
		return err
	}
	if authenticatedAtCount == 0 {
		if _, err := db.Exec(`ALTER TABLE sessions ADD COLUMN authenticated_at DATETIME NULL AFTER role`); err != nil {
			return err
		}
		if _, err := db.Exec(`UPDATE sessions SET authenticated_at = DATE_SUB(expires_at, INTERVAL 24 HOUR) WHERE authenticated_at IS NULL`); err != nil {
			return err
		}
	}
	var acrCount int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.columns
		WHERE table_schema = DATABASE() AND table_name = 'sessions' AND column_name = 'acr'
	`).Scan(&acrCount); err != nil {
		return err
	}
	if acrCount == 0 {
		if _, err := db.Exec(`ALTER TABLE sessions ADD COLUMN acr VARCHAR(255) NOT NULL DEFAULT '' AFTER authenticated_at`); err != nil {
			return err
		}
	}
	return nil
}

func ensureAuthorizationCodeOIDCColumns(db *sql.DB) error {
	var authTimeCount int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.columns
		WHERE table_schema = DATABASE() AND table_name = 'authorization_codes' AND column_name = 'auth_time'
	`).Scan(&authTimeCount); err != nil {
		return err
	}
	if authTimeCount == 0 {
		if _, err := db.Exec(`ALTER TABLE authorization_codes ADD COLUMN auth_time DATETIME NULL AFTER state`); err != nil {
			return err
		}
	}
	var acrCount int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.columns
		WHERE table_schema = DATABASE() AND table_name = 'authorization_codes' AND column_name = 'acr'
	`).Scan(&acrCount); err != nil {
		return err
	}
	if acrCount == 0 {
		if _, err := db.Exec(`ALTER TABLE authorization_codes ADD COLUMN acr VARCHAR(255) NOT NULL DEFAULT '' AFTER auth_time`); err != nil {
			return err
		}
	}
	return nil
}

func ensureRefreshTokenRotationColumns(db *sql.DB) error {
	checks := []struct {
		column string
		query  string
	}{
		{column: "rotated_from_token", query: `ALTER TABLE refresh_tokens ADD COLUMN rotated_from_token VARCHAR(255) NOT NULL DEFAULT '' AFTER scopes`},
		{column: "replaced_by_token", query: `ALTER TABLE refresh_tokens ADD COLUMN replaced_by_token VARCHAR(255) NOT NULL DEFAULT '' AFTER rotated_from_token`},
		{column: "created_at", query: `ALTER TABLE refresh_tokens ADD COLUMN created_at DATETIME NULL AFTER replaced_by_token`},
		{column: "revoked_at", query: `ALTER TABLE refresh_tokens ADD COLUMN revoked_at DATETIME NULL AFTER revoked`},
	}
	for _, check := range checks {
		var count int
		if err := db.QueryRow(`
			SELECT COUNT(*) FROM information_schema.columns
			WHERE table_schema = DATABASE() AND table_name = 'refresh_tokens' AND column_name = ?
		`, check.column).Scan(&count); err != nil {
			return err
		}
		if count == 0 {
			if _, err := db.Exec(check.query); err != nil {
				return err
			}
		}
	}
	_, err := db.Exec(`UPDATE refresh_tokens SET created_at = DATE_SUB(expires_at, INTERVAL 24 HOUR) WHERE created_at IS NULL`)
	return err
}

func ensureCleanupIndexes(db *sql.DB) error {
	indexes := []struct {
		table string
		index string
		query string
	}{
		{
			table: "authorization_codes",
			index: "idx_authorization_codes_cleanup",
			query: `ALTER TABLE authorization_codes ADD INDEX idx_authorization_codes_cleanup (expires_at, used)`,
		},
		{
			table: "refresh_tokens",
			index: "idx_refresh_tokens_expires_at",
			query: `ALTER TABLE refresh_tokens ADD INDEX idx_refresh_tokens_expires_at (expires_at)`,
		},
		{
			table: "audit_logs",
			index: "idx_audit_logs_created_at",
			query: `ALTER TABLE audit_logs ADD INDEX idx_audit_logs_created_at (created_at)`,
		},
		{
			table: "user_operation_logs",
			index: "idx_user_operation_logs_created_at",
			query: `ALTER TABLE user_operation_logs ADD INDEX idx_user_operation_logs_created_at (created_at)`,
		},
	}

	for _, item := range indexes {
		if err := ensureIndex(db, item.table, item.index, item.query); err != nil {
			return err
		}
	}
	return nil
}

func ensureConsentIndexes(db *sql.DB) error {
	indexes := []struct {
		table string
		index string
		query string
	}{
		{
			table: "consents",
			index: "idx_consents_user_revoked_created_at",
			query: `ALTER TABLE consents ADD INDEX idx_consents_user_revoked_created_at (user_id, revoked_at, created_at)`,
		},
		{
			table: "consents",
			index: "idx_consents_client_id",
			query: `ALTER TABLE consents ADD INDEX idx_consents_client_id (client_id)`,
		},
		{
			table: "consents",
			index: "idx_consents_revoked_at",
			query: `ALTER TABLE consents ADD INDEX idx_consents_revoked_at (revoked_at)`,
		},
	}

	for _, item := range indexes {
		if err := ensureIndex(db, item.table, item.index, item.query); err != nil {
			return err
		}
	}
	return nil
}

func ensureEmailLookupIndexes(db *sql.DB) error {
	indexes := []struct {
		table string
		index string
		query string
	}{
		{
			table: "email_verification_codes",
			index: "idx_email_verification_latest",
			query: `ALTER TABLE email_verification_codes ADD INDEX idx_email_verification_latest (email, purpose, created_at)`,
		},
		{
			table: "sms_verification_codes",
			index: "idx_sms_verification_latest",
			query: `ALTER TABLE sms_verification_codes ADD INDEX idx_sms_verification_latest (phone, purpose, created_at)`,
		},
	}

	for _, item := range indexes {
		if err := ensureIndex(db, item.table, item.index, item.query); err != nil {
			return err
		}
	}
	return nil
}

func ensureStabilityIndexes(db *sql.DB) error {
	indexes := []struct {
		table string
		index string
		query string
	}{
		{
			table: "users",
			index: "idx_users_phone",
			query: `ALTER TABLE users ADD INDEX idx_users_phone (phone)`,
		},
		{
			table: "users",
			index: "idx_users_created_at",
			query: `ALTER TABLE users ADD INDEX idx_users_created_at (created_at)`,
		},
		{
			table: "users",
			index: "idx_users_deletion_scheduled_at",
			query: `ALTER TABLE users ADD INDEX idx_users_deletion_scheduled_at (deletion_scheduled_at)`,
		},
		{
			table: "client_apps",
			index: "idx_client_apps_created_at",
			query: `ALTER TABLE client_apps ADD INDEX idx_client_apps_created_at (created_at)`,
		},
	}

	for _, item := range indexes {
		if err := ensureIndex(db, item.table, item.index, item.query); err != nil {
			return err
		}
	}
	return nil
}

func ensureIndex(db *sql.DB, tableName, indexName, createQuery string) error {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*)
		FROM information_schema.statistics
		WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?
	`, tableName, indexName).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	_, err := db.Exec(createQuery)
	return err
}

func ensureSMSVerificationCodesTable(db *sql.DB) error {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.tables
		WHERE table_schema = DATABASE() AND table_name = 'sms_verification_codes'
	`).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	_, err := db.Exec(`
		CREATE TABLE sms_verification_codes (
			id VARCHAR(64) PRIMARY KEY,
			phone VARCHAR(32) NOT NULL,
			purpose VARCHAR(32) NOT NULL,
			code VARCHAR(16) NOT NULL,
			expires_at DATETIME NOT NULL,
			consumed TINYINT(1) NOT NULL DEFAULT 0,
			created_at DATETIME NOT NULL,
			INDEX idx_sms_verification_lookup (phone, purpose, code, consumed, expires_at)
		)
	`)
	return err
}

func ensureAuthChallengesTable(db *sql.DB) error {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.tables
		WHERE table_schema = DATABASE() AND table_name = 'auth_challenges'
	`).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return ensureAuthChallengeColumnsAndIndexes(db)
	}
	_, err := db.Exec(`
		CREATE TABLE auth_challenges (
			token VARCHAR(64) PRIMARY KEY,
			challenge_type VARCHAR(64) NOT NULL,
			user_id VARCHAR(64) NOT NULL DEFAULT '',
			channel VARCHAR(32) NOT NULL DEFAULT '',
			target VARCHAR(255) NOT NULL DEFAULT '',
			acr VARCHAR(255) NOT NULL DEFAULT '',
			payload_json JSON NULL,
			expires_at DATETIME NOT NULL,
			consumed_at DATETIME NULL,
			created_at DATETIME NOT NULL,
			INDEX idx_auth_challenges_type_expires (challenge_type, expires_at),
			INDEX idx_auth_challenges_type_user (challenge_type, user_id),
			INDEX idx_auth_challenges_user_id (user_id),
			INDEX idx_auth_challenges_type_created (challenge_type, created_at),
			INDEX idx_auth_challenges_consumed_at (consumed_at),
			INDEX idx_auth_challenges_expires_at (expires_at)
		)
	`)
	if err != nil {
		return err
	}
	return ensureAuthChallengeColumnsAndIndexes(db)
}

func ensureAuthChallengeColumnsAndIndexes(db *sql.DB) error {
	columns := []struct {
		name  string
		query string
	}{
		{name: "challenge_type", query: `ALTER TABLE auth_challenges ADD COLUMN challenge_type VARCHAR(64) NOT NULL DEFAULT '' AFTER token`},
		{name: "user_id", query: `ALTER TABLE auth_challenges ADD COLUMN user_id VARCHAR(64) NOT NULL DEFAULT '' AFTER challenge_type`},
		{name: "channel", query: `ALTER TABLE auth_challenges ADD COLUMN channel VARCHAR(32) NOT NULL DEFAULT '' AFTER user_id`},
		{name: "target", query: `ALTER TABLE auth_challenges ADD COLUMN target VARCHAR(255) NOT NULL DEFAULT '' AFTER channel`},
		{name: "acr", query: `ALTER TABLE auth_challenges ADD COLUMN acr VARCHAR(255) NOT NULL DEFAULT '' AFTER target`},
		{name: "payload_json", query: `ALTER TABLE auth_challenges ADD COLUMN payload_json JSON NULL AFTER acr`},
		{name: "expires_at", query: `ALTER TABLE auth_challenges ADD COLUMN expires_at DATETIME NOT NULL AFTER payload_json`},
		{name: "consumed_at", query: `ALTER TABLE auth_challenges ADD COLUMN consumed_at DATETIME NULL AFTER expires_at`},
		{name: "created_at", query: `ALTER TABLE auth_challenges ADD COLUMN created_at DATETIME NOT NULL AFTER consumed_at`},
	}
	for _, column := range columns {
		if err := ensureColumn(db, "auth_challenges", column.name, column.query); err != nil {
			return err
		}
	}
	indexes := []struct {
		name  string
		query string
	}{
		{name: "idx_auth_challenges_type_expires", query: `ALTER TABLE auth_challenges ADD INDEX idx_auth_challenges_type_expires (challenge_type, expires_at)`},
		{name: "idx_auth_challenges_type_user", query: `ALTER TABLE auth_challenges ADD INDEX idx_auth_challenges_type_user (challenge_type, user_id)`},
		{name: "idx_auth_challenges_user_id", query: `ALTER TABLE auth_challenges ADD INDEX idx_auth_challenges_user_id (user_id)`},
		{name: "idx_auth_challenges_type_created", query: `ALTER TABLE auth_challenges ADD INDEX idx_auth_challenges_type_created (challenge_type, created_at)`},
		{name: "idx_auth_challenges_consumed_at", query: `ALTER TABLE auth_challenges ADD INDEX idx_auth_challenges_consumed_at (consumed_at)`},
		{name: "idx_auth_challenges_expires_at", query: `ALTER TABLE auth_challenges ADD INDEX idx_auth_challenges_expires_at (expires_at)`},
	}
	for _, index := range indexes {
		if err := ensureIndex(db, "auth_challenges", index.name, index.query); err != nil {
			return err
		}
	}
	return nil
}

func ensureColumn(db *sql.DB, tableName, columnName, alterQuery string) error {
	exists, err := columnExists(db, tableName, columnName)
	if err != nil {
		return err
	}
	if exists {
		return nil
	}
	_, err = db.Exec(alterQuery)
	return err
}

func columnExists(db *sql.DB, tableName, columnName string) (bool, error) {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.columns
		WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?
	`, tableName, columnName).Scan(&count); err != nil {
		return false, err
	}
	return count > 0, nil
}

func migrateLegacyAuthChallenges(db *sql.DB) error {
	migrations := []struct {
		table string
		query string
	}{
		{
			table: "mfa_login_challenges",
			query: `
				INSERT IGNORE INTO auth_challenges (token, challenge_type, user_id, channel, target, acr, payload_json, expires_at, consumed_at, created_at)
				SELECT token, 'mfa_login', user_id, method, target, '', NULL, expires_at, NULL, created_at
				FROM mfa_login_challenges
				WHERE expires_at >= UTC_TIMESTAMP()
			`,
		},
		{
			table: "passkey_registration_challenges",
			query: `
				INSERT IGNORE INTO auth_challenges (token, challenge_type, user_id, channel, target, acr, payload_json, expires_at, consumed_at, created_at)
				SELECT token, 'passkey_registration', user_id, '', '', '', session_data_json, expires_at, NULL, created_at
				FROM passkey_registration_challenges
				WHERE expires_at >= UTC_TIMESTAMP()
			`,
		},
		{
			table: "passkey_login_challenges",
			query: `
				INSERT IGNORE INTO auth_challenges (token, challenge_type, user_id, channel, target, acr, payload_json, expires_at, consumed_at, created_at)
				SELECT token, 'passkey_login', '', '', '', '', session_data_json, expires_at, NULL, created_at
				FROM passkey_login_challenges
				WHERE expires_at >= UTC_TIMESTAMP()
			`,
		},
		{
			table: "phone_binding_challenges",
			query: `
				INSERT IGNORE INTO auth_challenges (token, challenge_type, user_id, channel, target, acr, payload_json, expires_at, consumed_at, created_at)
				SELECT token, 'phone_binding', user_id, '', reason, acr, NULL, expires_at, NULL, created_at
				FROM phone_binding_challenges
				WHERE expires_at >= UTC_TIMESTAMP()
			`,
		},
		{
			table: "login_step_up_challenges",
			query: `
				INSERT IGNORE INTO auth_challenges (token, challenge_type, user_id, channel, target, acr, payload_json, expires_at, consumed_at, created_at)
				SELECT token, 'login_step_up', user_id, login_method, '', acr,
					JSON_OBJECT('effective_mode', effective_mode, 'email_target', email_target, 'phone_target', phone_target),
					expires_at, NULL, created_at
				FROM login_step_up_challenges
				WHERE expires_at >= UTC_TIMESTAMP()
			`,
		},
		{
			table: "login_mfa_enrollment_challenges",
			query: `
				INSERT IGNORE INTO auth_challenges (token, challenge_type, user_id, channel, target, acr, payload_json, expires_at, consumed_at, created_at)
				SELECT token, 'login_mfa_enrollment', user_id, login_method, '', acr, NULL, expires_at, NULL, created_at
				FROM login_mfa_enrollment_challenges
				WHERE expires_at >= UTC_TIMESTAMP()
			`,
		},
		{
			table: "request_challenges",
			query: `
				INSERT IGNORE INTO auth_challenges (token, challenge_type, user_id, channel, target, acr, payload_json, expires_at, consumed_at, created_at)
				SELECT token, 'request', '', channel, purpose, '',
					JSON_OBJECT('ip_hash', ip_hash, 'ua_hash', ua_hash, 'target_hash', target_hash, 'captcha_passed', captcha_passed),
					expires_at, consumed_at, created_at
				FROM request_challenges
				WHERE consumed_at IS NULL AND expires_at >= UTC_TIMESTAMP()
			`,
		},
	}
	for _, migration := range migrations {
		exists, err := tableExists(db, migration.table)
		if err != nil {
			return err
		}
		if !exists {
			continue
		}
		if _, err := db.Exec(migration.query); err != nil {
			return err
		}
	}
	if err := migrateLegacyDeletionLoginChallenges(db); err != nil {
		return err
	}
	return nil
}

func migrateLegacyDeletionLoginChallenges(db *sql.DB) error {
	exists, err := tableExists(db, "deletion_login_challenges")
	if err != nil {
		return err
	}
	if !exists {
		return nil
	}
	hasACR, err := columnExists(db, "deletion_login_challenges", "acr")
	if err != nil {
		return err
	}
	acrExpr := "''"
	if hasACR {
		acrExpr = "acr"
	}
	_, err = db.Exec(fmt.Sprintf(`
		INSERT IGNORE INTO auth_challenges (token, challenge_type, user_id, channel, target, acr, payload_json, expires_at, consumed_at, created_at)
		SELECT token, 'deletion_login', user_id, '', '', %s,
			JSON_OBJECT('deletion_scheduled_at', DATE_FORMAT(deletion_scheduled_at, '%%Y-%%m-%%dT%%H:%%i:%%sZ')),
			expires_at, NULL, created_at
		FROM deletion_login_challenges
		WHERE expires_at >= UTC_TIMESTAMP()
	`, acrExpr))
	return err
}

func tableExists(db *sql.DB, tableName string) (bool, error) {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.tables
		WHERE table_schema = DATABASE() AND table_name = ?
	`, tableName).Scan(&count); err != nil {
		return false, err
	}
	return count > 0, nil
}

func ensurePasskeysTable(db *sql.DB) error {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.tables
		WHERE table_schema = DATABASE() AND table_name = 'passkeys'
	`).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	_, err := db.Exec(`
		CREATE TABLE passkeys (
			id VARCHAR(64) PRIMARY KEY,
			user_id VARCHAR(64) NOT NULL,
			name VARCHAR(255) NOT NULL,
			credential_id VARCHAR(512) NOT NULL,
			credential_json JSON NOT NULL,
			sign_count INT UNSIGNED NOT NULL DEFAULT 0,
			aaguid VARCHAR(64) NOT NULL DEFAULT '',
			transports_json JSON NULL,
			last_used_at DATETIME NULL,
			created_at DATETIME NOT NULL,
			updated_at DATETIME NOT NULL,
			UNIQUE KEY uniq_passkeys_credential_id (credential_id),
			INDEX idx_passkeys_user_id (user_id)
		)
	`)
	return err
}

func ensurePasskeyUsageLogsTable(db *sql.DB) error {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.tables
		WHERE table_schema = DATABASE() AND table_name = 'passkey_usage_logs'
	`).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	_, err := db.Exec(`
		CREATE TABLE passkey_usage_logs (
			id VARCHAR(64) PRIMARY KEY,
			user_id VARCHAR(64) NOT NULL,
			passkey_id VARCHAR(64) NOT NULL,
			credential_id VARCHAR(512) NOT NULL,
			event_type VARCHAR(32) NOT NULL,
			source_ip VARCHAR(64) NOT NULL DEFAULT '',
			user_agent TEXT NOT NULL,
			result VARCHAR(32) NOT NULL,
			failure_reason VARCHAR(255) NOT NULL DEFAULT '',
			created_at DATETIME NOT NULL,
			INDEX idx_passkey_usage_logs_user_id (user_id),
			INDEX idx_passkey_usage_logs_passkey_id (passkey_id),
			INDEX idx_passkey_usage_logs_created_at (created_at)
		)
	`)
	return err
}

func ensureClientAppIconColumn(db *sql.DB) error {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.columns
		WHERE table_schema = DATABASE() AND table_name = 'client_apps' AND column_name = 'icon_url'
	`).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	_, err := db.Exec(`ALTER TABLE client_apps ADD COLUMN icon_url VARCHAR(255) NOT NULL DEFAULT '' AFTER name`)
	return err
}

func ensureClientAppFrontChannelLogoutColumn(db *sql.DB) error {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.columns
		WHERE table_schema = DATABASE() AND table_name = 'client_apps' AND column_name = 'frontchannel_logout_uri'
	`).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	_, err := db.Exec(`ALTER TABLE client_apps ADD COLUMN frontchannel_logout_uri VARCHAR(255) NOT NULL DEFAULT '' AFTER description`)
	return err
}

func ensureClientAppAllowGetSessionLogoutColumn(db *sql.DB) error {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.columns
		WHERE table_schema = DATABASE() AND table_name = 'client_apps' AND column_name = 'allow_get_session_logout'
	`).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	_, err := db.Exec(`ALTER TABLE client_apps ADD COLUMN allow_get_session_logout TINYINT(1) NOT NULL DEFAULT 0 AFTER frontchannel_logout_uri`)
	return err
}

func ensureClientPostLogoutRedirectURIsTable(db *sql.DB) error {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.tables
		WHERE table_schema = DATABASE() AND table_name = 'client_post_logout_redirect_uris'
	`).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	_, err := db.Exec(`
		CREATE TABLE client_post_logout_redirect_uris (
			id BIGINT PRIMARY KEY AUTO_INCREMENT,
			app_id VARCHAR(64) NOT NULL,
			post_logout_redirect_uri VARCHAR(255) NOT NULL,
			INDEX idx_client_post_logout_redirect_uris_app_id (app_id)
		)
	`)
	return err
}

func ensureEmailSendLogsTable(db *sql.DB) error {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.tables
		WHERE table_schema = DATABASE() AND table_name = 'email_send_logs'
	`).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	_, err := db.Exec(`
		CREATE TABLE email_send_logs (
			id VARCHAR(64) PRIMARY KEY,
			target_email VARCHAR(255) NOT NULL,
			content TEXT NOT NULL,
			account_email VARCHAR(255) NOT NULL DEFAULT '',
			created_at DATETIME NOT NULL,
			INDEX idx_email_send_logs_created_at (created_at)
		)
	`)
	return err
}

func ensurePhoneSendLogsTable(db *sql.DB) error {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.tables
		WHERE table_schema = DATABASE() AND table_name = 'phone_send_logs'
	`).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	_, err := db.Exec(`
		CREATE TABLE phone_send_logs (
			id VARCHAR(64) PRIMARY KEY,
			target_phone VARCHAR(32) NOT NULL,
			content TEXT NOT NULL,
			account_email VARCHAR(255) NOT NULL DEFAULT '',
			created_at DATETIME NOT NULL,
			INDEX idx_phone_send_logs_created_at (created_at)
		)
	`)
	return err
}

func ensureScopeDefinitionsTable(db *sql.DB) error {
	var count int
	if err := db.QueryRow(`
		SELECT COUNT(*) FROM information_schema.tables
		WHERE table_schema = DATABASE() AND table_name = 'scope_definitions'
	`).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	_, err := db.Exec(`
		CREATE TABLE scope_definitions (
			scope_key VARCHAR(128) PRIMARY KEY,
			display_name VARCHAR(128) NOT NULL,
			description TEXT NOT NULL,
			enabled TINYINT(1) NOT NULL DEFAULT 1,
			developer_selectable TINYINT(1) NOT NULL DEFAULT 1,
			is_system TINYINT(1) NOT NULL DEFAULT 0,
			updated_at DATETIME NOT NULL
		)
	`)
	return err
}

func seedDefaultScopeDefinitions(db *sql.DB) error {
	now := time.Now().UTC()
	items := []struct {
		key                 string
		displayName         string
		description         string
		developerSelectable bool
	}{
		{"openid", "基础登录", "确认用户身份并建立 OIDC 登录会话。", true},
		{"profile", "公开资料", "允许读取昵称、头像等公开资料。", true},
		{"email", "邮箱资料", "允许读取账号邮箱地址。", true},
		{"phone", "手机号资料", "允许读取账号绑定手机号。", true},
		{"role", "账号角色信息", "允许读取账号当前角色标识，例如 user、developer、admin。", true},
		{"gateway.read", "网关受保护资源读取", "允许访问系统里受 scope 保护的网关或 API 资源。", true},
	}
	for _, item := range items {
		if _, err := db.Exec(`
			INSERT INTO scope_definitions (scope_key, display_name, description, enabled, developer_selectable, is_system, updated_at)
			VALUES (?, ?, ?, 1, ?, 1, ?)
			ON DUPLICATE KEY UPDATE
				display_name = VALUES(display_name),
				description = VALUES(description),
				is_system = VALUES(is_system),
				updated_at = VALUES(updated_at)
		`, item.key, item.displayName, item.description, item.developerSelectable, now); err != nil {
			return err
		}
	}
	return nil
}

func upsertSetting(db *sql.DB, key, value string, updatedAt time.Time) error {
	_, err := db.Exec(`
		INSERT INTO system_settings (setting_key, setting_value, updated_at)
		VALUES (?, ?, ?)
		ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = VALUES(updated_at)
	`, key, value, updatedAt)
	return err
}

func ensureDefaultGatewayPolicy(db *sql.DB, updatedAt time.Time) error {
	if db == nil {
		return nil
	}

	const (
		policyName        = "Read Gateway Metrics"
		policyPath        = "/api/gateway/protected"
		policyMethod      = "GET"
		policyScopes      = `["gateway.read"]`
		policyClaims      = `["sub","scope"]`
		policyDescription = "Demo protected route."
	)

	rows, err := db.Query(`
		SELECT id
		FROM gateway_policies
		WHERE name = ? AND path = ? AND method = ?
		ORDER BY updated_at ASC, id ASC
	`, policyName, policyPath, policyMethod)
	if err != nil {
		return fmt.Errorf("query default gateway policy: %w", err)
	}
	defer rows.Close()

	ids := make([]string, 0, 1)
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return fmt.Errorf("scan default gateway policy: %w", err)
		}
		ids = append(ids, id)
	}

	if len(ids) == 0 {
		policyID := uuid.NewString()
		if _, err := db.Exec(`
			INSERT INTO gateway_policies (id, name, path, method, scopes, claims, enabled, description, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
		`, policyID, policyName, policyPath, policyMethod, policyScopes, policyClaims, policyDescription, updatedAt); err != nil {
			return fmt.Errorf("create default gateway policy: %w", err)
		}
		return nil
	}

	if _, err := db.Exec(`
		UPDATE gateway_policies
		SET scopes = ?, claims = ?, enabled = 1, description = ?, updated_at = ?
		WHERE id = ?
	`, policyScopes, policyClaims, policyDescription, updatedAt, ids[0]); err != nil {
		return fmt.Errorf("update default gateway policy: %w", err)
	}

	for _, duplicateID := range ids[1:] {
		if _, err := db.Exec(`DELETE FROM gateway_policies WHERE id = ?`, duplicateID); err != nil {
			return fmt.Errorf("delete duplicate gateway policy: %w", err)
		}
	}
	return nil
}

func writeEnvFile(req CompleteRequest, cfg config.Config) error {
	envPath := filepath.Join(".env")
	databaseURL := buildDatabaseURL(req.DB)
	lines := map[string]string{
		"HTTP_ADDR":                           sdefault(strings.TrimSpace(cfg.HTTP.Addr), ":8080"),
		"PUBLIC_BASE_URL":                     req.PublicBaseURL,
		"FRONTEND_BASE_URL":                   cfg.HTTP.FrontendBase,
		"DEVICE_COOKIE_SECRET":                cfg.HTTP.DeviceCookieSecret,
		"OIDC_ISSUER":                         req.Issuer,
		"OIDC_AUTH_CODE_TTL_MINUTES":          "5",
		"OIDC_ACCESS_TOKEN_TTL_MINUTES":       "15",
		"OIDC_REFRESH_TOKEN_TTL_HOURS":        "24",
		"OIDC_SIGNING_KEY_ID":                 "default-rsa-key",
		"OIDC_SIGNING_PRIVATE_KEY_PATH":       sdefault(strings.TrimSpace(cfg.OIDC.SigningPrivateKeyPath), "data/oidc_signing_key.pem"),
		"OIDC_SIGNING_PRIVATE_KEY_PEM":        "",
		"OIDC_ADDITIONAL_VERIFY_KEY_IDS":      "",
		"OIDC_ADDITIONAL_VERIFY_KEY_PATHS":    "",
		"OIDC_DEFAULT_AUDIENCE":               "mysso-resource",
		"OIDC_FIRST_PARTY_CLIENT_ID":          cfg.OIDC.FirstPartyClientID,
		"OIDC_FIRST_PARTY_CLIENT_SECRET":      cfg.OIDC.FirstPartyClientSecret,
		"OIDC_FIRST_PARTY_SCOPE":              cfg.OIDC.FirstPartyScope,
		"DB_DRIVER":                           req.DB.Driver,
		"DATABASE_URL":                        databaseURL,
		"SMTP_HOST":                           "",
		"SMTP_PORT":                           appdefaults.DefaultSMTPPort,
		"SMTP_USERNAME":                       "",
		"SMTP_PASSWORD":                       "",
		"SMTP_FROM":                           "",
		"SMTP_FORCE_SSL":                      "false",
		"SMTP_VERIFICATION_CODE_TTL_MINUTES":  strconv.Itoa(appdefaults.DefaultVerificationCodeTTLMinutes),
		"SMS_PROVIDER":                        appdefaults.DefaultSMSProvider,
		"SMS_TEMPLATE_PROVIDER":               appdefaults.DefaultSMSTemplateProvider,
		"SMS_API_BASE":                        appdefaults.DefaultSMSAPIBase,
		"SMS_USERNAME":                        "",
		"SMS_PASSWORD":                        "",
		"SMS_SIGNATURE":                       appdefaults.DefaultSMSSignature,
		"SMS_LOGIN_TEMPLATE":                  appdefaults.DefaultSMSLoginTemplate,
		"SMS_REGISTER_TEMPLATE":               appdefaults.DefaultSMSRegisterTemplate,
		"SMS_RESET_PASSWORD_TEMPLATE":         appdefaults.DefaultSMSResetPasswordTemplate,
		"SMS_BIND_PHONE_TEMPLATE":             appdefaults.DefaultSMSBindPhoneTemplate,
		"SMS_DELETE_ACCOUNT_TEMPLATE":         appdefaults.DefaultSMSDeleteAccountTemplate,
		"ALIYUN_SMS_ACCESS_KEY_ID":            "",
		"ALIYUN_SMS_ACCESS_KEY_SECRET":        "",
		"ALIYUN_SMS_ENDPOINT":                 appdefaults.DefaultAliyunSMSEndpoint,
		"ALIYUN_SMS_REGION_ID":                appdefaults.DefaultAliyunSMSRegionID,
		"ALIYUN_SMS_SIGN_NAME":                appdefaults.DefaultAliyunSMSSignName,
		"ALIYUN_SMS_LOGIN_TEMPLATE_CODE":      appdefaults.DefaultAliyunSMSLoginTemplateCode,
		"ALIYUN_SMS_REGISTER_TEMPLATE_CODE":   appdefaults.DefaultAliyunSMSRegisterTemplateCode,
		"ALIYUN_SMS_RESET_TEMPLATE_CODE":      appdefaults.DefaultAliyunSMSResetTemplateCode,
		"ALIYUN_SMS_BIND_PHONE_TEMPLATE_CODE": appdefaults.DefaultAliyunSMSBindPhoneTemplateCode,
		"ALIYUN_SMS_DELETE_TEMPLATE_CODE":     appdefaults.DefaultAliyunSMSDeleteTemplateCode,
	}
	order := []string{
		"HTTP_ADDR",
		"PUBLIC_BASE_URL",
		"FRONTEND_BASE_URL",
		"DEVICE_COOKIE_SECRET",
		"OIDC_ISSUER",
		"OIDC_AUTH_CODE_TTL_MINUTES",
		"OIDC_ACCESS_TOKEN_TTL_MINUTES",
		"OIDC_REFRESH_TOKEN_TTL_HOURS",
		"OIDC_SIGNING_KEY_ID",
		"OIDC_DEFAULT_AUDIENCE",
		"OIDC_FIRST_PARTY_CLIENT_ID",
		"OIDC_FIRST_PARTY_CLIENT_SECRET",
		"OIDC_FIRST_PARTY_SCOPE",
		"DB_DRIVER",
		"DATABASE_URL",
		"SMTP_HOST",
		"SMTP_PORT",
		"SMTP_USERNAME",
		"SMTP_PASSWORD",
		"SMTP_FROM",
		"SMTP_FORCE_SSL",
		"SMTP_VERIFICATION_CODE_TTL_MINUTES",
		"SMS_PROVIDER",
		"SMS_TEMPLATE_PROVIDER",
		"SMS_API_BASE",
		"SMS_USERNAME",
		"SMS_PASSWORD",
		"SMS_SIGNATURE",
		"SMS_LOGIN_TEMPLATE",
		"SMS_REGISTER_TEMPLATE",
		"SMS_RESET_PASSWORD_TEMPLATE",
		"SMS_BIND_PHONE_TEMPLATE",
		"SMS_DELETE_ACCOUNT_TEMPLATE",
		"ALIYUN_SMS_ACCESS_KEY_ID",
		"ALIYUN_SMS_ACCESS_KEY_SECRET",
		"ALIYUN_SMS_ENDPOINT",
		"ALIYUN_SMS_REGION_ID",
		"ALIYUN_SMS_SIGN_NAME",
		"ALIYUN_SMS_LOGIN_TEMPLATE_CODE",
		"ALIYUN_SMS_REGISTER_TEMPLATE_CODE",
		"ALIYUN_SMS_RESET_TEMPLATE_CODE",
		"ALIYUN_SMS_BIND_PHONE_TEMPLATE_CODE",
		"ALIYUN_SMS_DELETE_TEMPLATE_CODE",
	}
	builder := strings.Builder{}
	for _, key := range order {
		builder.WriteString(key)
		builder.WriteString("=")
		builder.WriteString(lines[key])
		builder.WriteString("\n")
	}
	return os.WriteFile(envPath, []byte(builder.String()), 0600)
}

func ensureSigningKeyMaterial(cfg *config.Config) error {
	if cfg == nil {
		return fmt.Errorf("missing install runtime config")
	}
	if strings.TrimSpace(cfg.OIDC.SigningPrivateKeyPEM) != "" {
		return nil
	}

	path := strings.TrimSpace(cfg.OIDC.SigningPrivateKeyPath)
	if path == "" {
		path = filepath.Join("data", "oidc_signing_key.pem")
		cfg.OIDC.SigningPrivateKeyPath = path
	}

	if _, err := os.Stat(path); err == nil {
		return nil
	} else if !errors.Is(err, os.ErrNotExist) {
		return fmt.Errorf("stat OIDC signing private key file: %w", err)
	}

	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return fmt.Errorf("generate OIDC signing private key: %w", err)
	}
	encodedKey, err := x509.MarshalPKCS8PrivateKey(privateKey)
	if err != nil {
		return fmt.Errorf("marshal OIDC signing private key: %w", err)
	}
	if err := os.MkdirAll(filepath.Dir(path), 0700); err != nil {
		return fmt.Errorf("create OIDC signing key directory: %w", err)
	}
	if err := os.WriteFile(path, pem.EncodeToMemory(&pem.Block{
		Type:  "PRIVATE KEY",
		Bytes: encodedKey,
	}), 0600); err != nil {
		return fmt.Errorf("write OIDC signing private key file: %w", err)
	}
	return nil
}

func generateEnvSecret(byteLength int) (string, error) {
	buf := make([]byte, byteLength)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return hex.EncodeToString(buf), nil
}

func buildInstallRuntimeConfig(base config.Config, req CompleteRequest) (config.Config, error) {
	cfg := base
	cfg.DB = req.DB
	cfg.HTTP.PublicBase = strings.TrimSpace(req.PublicBaseURL)
	cfg.HTTP.FrontendBase = strings.TrimSpace(req.FrontendBaseURL)
	cfg.OIDC.Issuer = strings.TrimSpace(req.Issuer)
	if requiresGeneratedSecret(cfg.HTTP.DeviceCookieSecret) {
		deviceSecret, err := generateEnvSecret(32)
		if err != nil {
			return config.Config{}, err
		}
		cfg.HTTP.DeviceCookieSecret = deviceSecret
	}
	if strings.TrimSpace(cfg.OIDC.FirstPartyClientID) == "" {
		cfg.OIDC.FirstPartyClientID = appdefaults.DefaultFirstPartyClientID
	}
	if strings.TrimSpace(cfg.OIDC.FirstPartyScope) == "" {
		cfg.OIDC.FirstPartyScope = appdefaults.DefaultFirstPartyScope
	}
	if requiresGeneratedSecret(cfg.OIDC.FirstPartyClientSecret) {
		clientSecret, err := generateEnvSecret(32)
		if err != nil {
			return config.Config{}, err
		}
		cfg.OIDC.FirstPartyClientSecret = clientSecret
	}
	return cfg, nil
}

func requiresGeneratedSecret(value string) bool {
	value = strings.ToLower(strings.TrimSpace(value))
	return value == "" || value == "demo-secret" || value == "123456" || strings.Contains(value, "change-me")
}

func (s *Service) validateInstallDBTarget(dbCfg config.DBConfig) error {
	host := strings.ToLower(strings.TrimSpace(dbCfg.Host))
	if host == "" && strings.TrimSpace(dbCfg.URL) == "" {
		return fmt.Errorf("database host is required")
	}
	allowedHosts := s.cfg.Install.AllowedDBHosts
	if len(allowedHosts) == 0 {
		allowedHosts = []string{"127.0.0.1", "localhost", "::1"}
	}
	for _, item := range allowedHosts {
		if strings.EqualFold(strings.TrimSpace(item), host) {
			return nil
		}
	}
	return fmt.Errorf("database host is not allowed during installation")
}

func buildDatabaseURL(cfg config.DBConfig) string {
	if strings.TrimSpace(cfg.URL) != "" {
		return cfg.URL
	}
	charset := sdefault(cfg.Charset, "utf8mb4")
	userInfo := url.UserPassword(cfg.User, cfg.Password).String()
	return fmt.Sprintf("mysql://%s@%s:%s/%s?charset=%s",
		userInfo,
		cfg.Host,
		cfg.Port,
		url.PathEscape(cfg.Name),
		url.QueryEscape(charset),
	)
}

func splitSQLStatements(content string) []string {
	scanner := bufio.NewScanner(strings.NewReader(content))
	scanner.Buffer(make([]byte, 1024), 1024*1024)
	statements := []string{}
	var current strings.Builder
	for scanner.Scan() {
		line := scanner.Text()
		current.WriteString(line)
		current.WriteString("\n")
		if strings.HasSuffix(strings.TrimSpace(line), ";") {
			statements = append(statements, strings.TrimSuffix(strings.TrimSpace(current.String()), ";"))
			current.Reset()
		}
	}
	if strings.TrimSpace(current.String()) != "" {
		statements = append(statements, strings.TrimSpace(current.String()))
	}
	return statements
}

func sdefault(value, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return value
}
