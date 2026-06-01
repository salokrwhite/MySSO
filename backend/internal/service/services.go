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

	"mysso/backend/internal/config"
	"mysso/backend/internal/crypto"
	"mysso/backend/internal/notify"
	"mysso/backend/internal/service/accesscontrol"
	"mysso/backend/internal/service/admin"
	"mysso/backend/internal/service/apps"
	"mysso/backend/internal/service/audit"
	"mysso/backend/internal/service/auth"
	"mysso/backend/internal/service/common/deps"
	"mysso/backend/internal/service/consent"
	"mysso/backend/internal/service/oauth"
	"mysso/backend/internal/service/passkey"
	"mysso/backend/internal/service/settings"
	"mysso/backend/internal/service/user"
	"mysso/backend/internal/store"
)

type Services struct {
	Auth          *auth.Service
	Passkey       *passkey.Service
	User          *user.Service
	Settings      *settings.Service
	OAuth         *oauth.Service
	Apps          *apps.Service
	AccessControl *accesscontrol.Service
	Admin         *admin.Service
	Consent       *consent.Service
	Audit         *audit.Service
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
	dependencies := &deps.Deps{
		Cfg:   &cfgCopy,
		Store: dataStore,
		JWT:   jwtManager,
		Mail:  notify.NewMailer(cfgCopy.SMTP),
		SMS:   notify.NewSMSSender(cfgCopy.SMS),
	}

	services := &Services{}
	services.Audit = audit.New(dependencies)
	services.Settings = settings.New(dependencies)
	services.AccessControl = accesscontrol.New(dependencies, services.Audit)
	services.User = user.New(dependencies, services.Audit, services.Settings)
	services.Auth = auth.New(dependencies, services.Audit, services.Settings, services.User)
	services.Passkey = passkey.New(dependencies, services.Audit, services.Settings, services.User)
	services.OAuth = oauth.New(dependencies, services.Audit, services.Settings, services.AccessControl)
	services.Apps = apps.New(dependencies, services.Audit)
	services.Admin = admin.New(dependencies, services.Audit)
	services.Consent = consent.New(dependencies, services.Audit, services.AccessControl)
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
