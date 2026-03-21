package service

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"

	"mysso/backend/internal/config"
	"mysso/backend/internal/crypto"
	"mysso/backend/internal/domain"
	"mysso/backend/internal/notify"
	"mysso/backend/internal/store"
)

type serviceDeps struct {
	cfg   *config.Config
	store store.Store
	jwt   *crypto.JWTManager
	mail  notify.Mailer
	sms   notify.SMSSender
}

func (d *serviceDeps) lookupUserEmailByID(userID string) string {
	userID = strings.TrimSpace(userID)
	if userID == "" {
		return ""
	}
	user, err := d.store.GetUser(userID)
	if err != nil {
		return ""
	}
	return strings.TrimSpace(user.Email)
}

func (d *serviceDeps) lookupUserEmailByEmail(email string) string {
	email = strings.ToLower(strings.TrimSpace(email))
	if email == "" {
		return ""
	}
	user, err := d.store.FindUserByEmail(email)
	if err != nil {
		return email
	}
	return strings.TrimSpace(user.Email)
}

func (d *serviceDeps) lookupUserEmailByPhone(phone string) string {
	phone = strings.TrimSpace(phone)
	if phone == "" {
		return ""
	}
	user, err := d.store.FindUserByPhone(phone)
	if err != nil {
		return ""
	}
	return strings.TrimSpace(user.Email)
}

func (d *serviceDeps) appendEmailSendLog(targetEmail, content, accountEmail string) {
	d.store.AppendEmailSendLog(domain.EmailSendLog{
		ID:           uuid.NewString(),
		TargetEmail:  strings.TrimSpace(targetEmail),
		Content:      strings.TrimSpace(content),
		AccountEmail: strings.TrimSpace(accountEmail),
		CreatedAt:    time.Now().UTC(),
	})
}

func (d *serviceDeps) appendPhoneSendLog(targetPhone, content, accountEmail string) {
	d.store.AppendPhoneSendLog(domain.PhoneSendLog{
		ID:           uuid.NewString(),
		TargetPhone:  strings.TrimSpace(targetPhone),
		Content:      strings.TrimSpace(content),
		AccountEmail: strings.TrimSpace(accountEmail),
		CreatedAt:    time.Now().UTC(),
	})
}

func (d *serviceDeps) appendUserOperationLog(userID, action, targetID string, detail map[string]any) {
	userID = strings.TrimSpace(userID)
	action = strings.TrimSpace(action)
	if userID == "" || action == "" {
		return
	}
	d.store.AppendUserOperationLog(domain.UserOperationLog{
		ID:        uuid.NewString(),
		UserID:    userID,
		Action:    action,
		TargetID:  strings.TrimSpace(targetID),
		Detail:    detail,
		CreatedAt: time.Now().UTC(),
	})
}

type Services struct {
	Auth      *AuthService
	Passkey   *PasskeyService
	User      *UserService
	Settings  *SettingsService
	RateLimit *RateLimitService
	OAuth     *OAuthService
	Apps      *AppsService
	Admin     *AdminService
	Consent   *ConsentService
	Audit     *AuditService
}

func NewServices(cfg config.Config, dataStore store.Store) (*Services, error) {
	if err := ensureOIDCSigningKeyMaterial(cfg); err != nil {
		return nil, err
	}
	jwtManager, err := crypto.NewJWTManager(
		cfg.OIDC.Issuer,
		cfg.OIDC.DefaultSigningKeyID,
		cfg.OIDC.SigningPrivateKeyPEM,
		cfg.OIDC.SigningPrivateKeyPath,
		cfg.OIDC.AdditionalVerifyKeyIDs,
		cfg.OIDC.AdditionalVerifyKeyPaths,
	)
	if err != nil {
		return nil, err
	}

	cfgCopy := cfg
	deps := &serviceDeps{
		cfg:   &cfgCopy,
		store: dataStore,
		jwt:   jwtManager,
		mail:  notify.NewMailer(cfgCopy.SMTP),
		sms:   notify.NewSMSSender(cfgCopy.SMS),
	}

	services := &Services{}
	services.Audit = &AuditService{deps: deps}
	services.Settings = &SettingsService{deps: deps}
	services.RateLimit = &RateLimitService{deps: deps, settings: services.Settings}
	services.User = &UserService{deps: deps, audit: services.Audit, settings: services.Settings, rateLimit: services.RateLimit}
	services.Auth = &AuthService{deps: deps, audit: services.Audit, settings: services.Settings, user: services.User, rateLimit: services.RateLimit}
	services.Passkey = &PasskeyService{deps: deps, audit: services.Audit, settings: services.Settings, user: services.User, rateLimit: services.RateLimit}
	services.Settings.rateLimit = services.RateLimit
	services.OAuth = &OAuthService{deps: deps, audit: services.Audit, settings: services.Settings}
	services.Apps = &AppsService{deps: deps, audit: services.Audit}
	services.Admin = &AdminService{deps: deps, audit: services.Audit}
	services.Consent = &ConsentService{deps: deps, audit: services.Audit}
	if err := services.Apps.MigrateLegacyClientSecrets(); err != nil {
		return nil, err
	}
	if err := services.Apps.MigrateAppOAuthURLs(); err != nil {
		return nil, err
	}
	return services, nil
}

func ensureOIDCSigningKeyMaterial(cfg config.Config) error {
	if strings.TrimSpace(cfg.OIDC.SigningPrivateKeyPEM) != "" {
		return nil
	}
	path := strings.TrimSpace(cfg.OIDC.SigningPrivateKeyPath)
	if path == "" {
		return fmt.Errorf("missing OIDC signing private key configuration")
	}
	if _, err := os.Stat(path); err == nil {
		return nil
	} else if !os.IsNotExist(err) {
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
