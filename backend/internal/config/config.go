package config

import (
	"fmt"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Install InstallConfig
	HTTP    HTTPConfig
	DB      DBConfig
	OIDC    OIDCConfig
	SMTP    SMTPConfig
	SMS     SMSConfig
}

type InstallConfig struct {
	Enabled        bool
	AllowRemote    bool
	AllowedDBHosts []string
}

type HTTPConfig struct {
	Addr               string
	PublicBase         string
	FrontendBase       string
	DeviceCookieSecret string
}

type DBConfig struct {
	Driver   string
	URL      string
	Host     string
	Port     string
	Name     string
	User     string
	Password string
	Charset  string
}

type OIDCConfig struct {
	Issuer                   string
	AuthorizationCodeTTL     time.Duration
	AccessTokenTTL           time.Duration
	RefreshTokenTTL          time.Duration
	DefaultMFACode           string
	DefaultSigningKeyID      string
	SigningPrivateKeyPath    string
	SigningPrivateKeyPEM     string
	AdditionalVerifyKeyIDs   []string
	AdditionalVerifyKeyPaths []string
	DefaultAudience          string
	FirstPartyClientID       string
	FirstPartyClientSecret   string
	FirstPartyScope          string
	AutoApproveClientIDs     []string
	AutoApproveHosts         []string
}

type SMTPConfig struct {
	Host                string
	Port                string
	Username            string
	Password            string
	From                string
	ForceSSL            bool
	VerificationCodeTTL time.Duration
}

type SMSConfig struct {
	Provider                    string
	TemplateProvider            string
	APIBase                     string
	Username                    string
	Password                    string
	Signature                   string
	LoginTemplate               string
	RegisterTemplate            string
	ResetPasswordTemplate       string
	BindPhoneTemplate           string
	DeleteAccountTemplate       string
	AliyunAccessKeyID           string
	AliyunAccessKeySecret       string
	AliyunEndpoint              string
	AliyunRegionID              string
	AliyunSignName              string
	AliyunLoginTemplateCode     string
	AliyunRegisterTemplateCode  string
	AliyunResetTemplateCode     string
	AliyunBindPhoneTemplateCode string
	AliyunDeleteTemplateCode    string
}

func Default() Config {
	_ = godotenv.Load(".env")

	publicBase := getEnv("PUBLIC_BASE_URL", "http://localhost:8080")
	frontendBase := getEnv("FRONTEND_BASE_URL", "http://localhost:5173")
	return Config{
		Install: InstallConfig{
			Enabled:        getEnvBool("INSTALL_ENABLED", false),
			AllowRemote:    getEnvBool("INSTALL_ALLOW_REMOTE", false),
			AllowedDBHosts: getEnvCSV("INSTALL_ALLOWED_DB_HOSTS"),
		},
		HTTP: HTTPConfig{
			Addr:               getEnv("HTTP_ADDR", ":8080"),
			PublicBase:         publicBase,
			FrontendBase:       frontendBase,
			DeviceCookieSecret: getEnv("DEVICE_COOKIE_SECRET", ""),
		},
		DB: DBConfig{
			Driver:   getEnv("DB_DRIVER", "mysql"),
			URL:      getEnv("DATABASE_URL", ""),
			Host:     getEnv("DB_HOST", "127.0.0.1"),
			Port:     getEnv("DB_PORT", "3306"),
			Name:     getEnv("DB_NAME", ""),
			User:     getEnv("DB_USER", ""),
			Password: getEnv("DB_PASSWORD", ""),
			Charset:  getEnv("DB_CHARSET", "utf8mb4"),
		},
		OIDC: OIDCConfig{
			Issuer:                   getEnv("OIDC_ISSUER", publicBase),
			AuthorizationCodeTTL:     getEnvDurationMinutes("OIDC_AUTH_CODE_TTL_MINUTES", 5),
			AccessTokenTTL:           getEnvDurationMinutes("OIDC_ACCESS_TOKEN_TTL_MINUTES", 15),
			RefreshTokenTTL:          getEnvDurationHours("OIDC_REFRESH_TOKEN_TTL_HOURS", 24),
			DefaultMFACode:           getEnv("DEFAULT_MFA_CODE", ""),
			DefaultSigningKeyID:      getEnv("OIDC_SIGNING_KEY_ID", "default-rsa-key"),
			SigningPrivateKeyPath:    getEnv("OIDC_SIGNING_PRIVATE_KEY_PATH", "data/oidc_signing_key.pem"),
			SigningPrivateKeyPEM:     normalizePEMEnv(getEnv("OIDC_SIGNING_PRIVATE_KEY_PEM", "")),
			AdditionalVerifyKeyIDs:   getEnvCSV("OIDC_ADDITIONAL_VERIFY_KEY_IDS"),
			AdditionalVerifyKeyPaths: getEnvCSV("OIDC_ADDITIONAL_VERIFY_KEY_PATHS"),
			DefaultAudience:          getEnv("OIDC_DEFAULT_AUDIENCE", "mysso-resource"),
			FirstPartyClientID:       getEnv("OIDC_FIRST_PARTY_CLIENT_ID", "demo-client"),
			FirstPartyClientSecret:   getEnv("OIDC_FIRST_PARTY_CLIENT_SECRET", ""),
			FirstPartyScope:          getEnv("OIDC_FIRST_PARTY_SCOPE", "openid profile email gateway.read"),
			AutoApproveClientIDs:     getEnvCSV("OIDC_AUTO_APPROVE_CLIENT_IDS"),
			AutoApproveHosts:         getEnvCSV("OIDC_AUTO_APPROVE_REDIRECT_HOSTS"),
		},
		SMTP: SMTPConfig{
			Host:                getEnv("SMTP_HOST", ""),
			Port:                getEnv("SMTP_PORT", "587"),
			Username:            getEnv("SMTP_USERNAME", ""),
			Password:            getEnv("SMTP_PASSWORD", ""),
			From:                getEnv("SMTP_FROM", ""),
			ForceSSL:            getEnvBool("SMTP_FORCE_SSL", false),
			VerificationCodeTTL: getEnvDurationMinutes("SMTP_VERIFICATION_CODE_TTL_MINUTES", 10),
		},
		SMS: SMSConfig{
			Provider:                    getEnv("SMS_PROVIDER", ""),
			TemplateProvider:            getEnv("SMS_TEMPLATE_PROVIDER", ""),
			APIBase:                     getEnv("SMS_API_BASE", "http://api.smsbao.com/"),
			Username:                    getEnv("SMS_USERNAME", ""),
			Password:                    getEnv("SMS_PASSWORD", ""),
			Signature:                   getEnv("SMS_SIGNATURE", ""),
			LoginTemplate:               getEnv("SMS_LOGIN_TEMPLATE", ""),
			RegisterTemplate:            getEnv("SMS_REGISTER_TEMPLATE", ""),
			ResetPasswordTemplate:       getEnv("SMS_RESET_PASSWORD_TEMPLATE", ""),
			BindPhoneTemplate:           getEnv("SMS_BIND_PHONE_TEMPLATE", ""),
			DeleteAccountTemplate:       getEnv("SMS_DELETE_ACCOUNT_TEMPLATE", ""),
			AliyunAccessKeyID:           getEnv("ALIYUN_SMS_ACCESS_KEY_ID", ""),
			AliyunAccessKeySecret:       getEnv("ALIYUN_SMS_ACCESS_KEY_SECRET", ""),
			AliyunEndpoint:              getEnv("ALIYUN_SMS_ENDPOINT", "dypnsapi.aliyuncs.com"),
			AliyunRegionID:              getEnv("ALIYUN_SMS_REGION_ID", "cn-hangzhou"),
			AliyunSignName:              getEnv("ALIYUN_SMS_SIGN_NAME", ""),
			AliyunLoginTemplateCode:     getEnv("ALIYUN_SMS_LOGIN_TEMPLATE_CODE", ""),
			AliyunRegisterTemplateCode:  getEnv("ALIYUN_SMS_REGISTER_TEMPLATE_CODE", ""),
			AliyunResetTemplateCode:     getEnv("ALIYUN_SMS_RESET_TEMPLATE_CODE", ""),
			AliyunBindPhoneTemplateCode: getEnv("ALIYUN_SMS_BIND_PHONE_TEMPLATE_CODE", ""),
			AliyunDeleteTemplateCode:    getEnv("ALIYUN_SMS_DELETE_TEMPLATE_CODE", ""),
		},
	}
}

func (c DBConfig) IsConfigured() bool {
	if strings.TrimSpace(c.URL) != "" {
		return true
	}
	return c.Driver != "" && c.Host != "" && c.Port != "" && c.Name != "" && c.User != ""
}

func (c DBConfig) DSN() (string, error) {
	return c.DSNWithMultiStatements(false)
}

func (c DBConfig) DSNWithMultiStatements(enabled bool) (string, error) {
	if strings.TrimSpace(c.URL) != "" {
		return mysqlDSNFromURL(c.URL, enabled)
	}
	charset := c.Charset
	if charset == "" {
		charset = "utf8mb4"
	}
	return c.User + ":" + c.Password + "@tcp(" + c.Host + ":" + c.Port + ")/" + c.Name + "?parseTime=true&charset=" + charset + "&multiStatements=" + strconv.FormatBool(enabled), nil
}

func mysqlDSNFromURL(raw string, multiStatements bool) (string, error) {
	parsed, err := url.Parse(raw)
	if err != nil {
		return "", err
	}
	scheme := strings.ToLower(parsed.Scheme)
	if scheme != "mysql" {
		return "", url.InvalidHostError("unsupported database scheme: " + parsed.Scheme)
	}
	user := ""
	password := ""
	if parsed.User != nil {
		user = parsed.User.Username()
		password, _ = parsed.User.Password()
	}
	host := parsed.Hostname()
	port := parsed.Port()
	if port == "" {
		port = "3306"
	}
	dbName := strings.TrimPrefix(parsed.Path, "/")
	query := parsed.Query()
	if query.Get("parseTime") == "" {
		query.Set("parseTime", "true")
	}
	if query.Get("charset") == "" {
		query.Set("charset", "utf8mb4")
	}
	query.Set("multiStatements", strconv.FormatBool(multiStatements))
	return user + ":" + password + "@tcp(" + host + ":" + port + ")/" + dbName + "?" + query.Encode(), nil
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func getEnvDurationMinutes(key string, fallback int) time.Duration {
	value, err := strconv.Atoi(getEnv(key, strconv.Itoa(fallback)))
	if err != nil {
		return time.Duration(fallback) * time.Minute
	}
	return time.Duration(value) * time.Minute
}

func getEnvDurationHours(key string, fallback int) time.Duration {
	value, err := strconv.Atoi(getEnv(key, strconv.Itoa(fallback)))
	if err != nil {
		return time.Duration(fallback) * time.Hour
	}
	return time.Duration(value) * time.Hour
}

func getEnvBool(key string, fallback bool) bool {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func getEnvCSV(key string) []string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return nil
	}
	parts := strings.Split(value, ",")
	items := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		items = append(items, part)
	}
	return items
}

func normalizePEMEnv(value string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return ""
	}
	return strings.ReplaceAll(value, `\n`, "\n")
}

func (c Config) ValidateInstalledSecrets() error {
	deviceSecret := strings.TrimSpace(c.HTTP.DeviceCookieSecret)
	if deviceSecret == "" {
		return fmt.Errorf("missing DEVICE_COOKIE_SECRET")
	}
	if looksLikePlaceholderSecret(deviceSecret) {
		return fmt.Errorf("weak DEVICE_COOKIE_SECRET")
	}
	clientSecret := strings.TrimSpace(c.OIDC.FirstPartyClientSecret)
	if clientSecret == "" {
		return fmt.Errorf("missing OIDC_FIRST_PARTY_CLIENT_SECRET")
	}
	if looksLikePlaceholderSecret(clientSecret) {
		return fmt.Errorf("weak OIDC_FIRST_PARTY_CLIENT_SECRET")
	}
	return nil
}

func looksLikePlaceholderSecret(value string) bool {
	value = strings.ToLower(strings.TrimSpace(value))
	return value == "demo-secret" || value == "123456" || strings.Contains(value, "change-me")
}

func (c Config) ValidateInstallSecurity(installed bool) error {
	if installed || !c.Install.Enabled {
		return nil
	}
	return nil
}
