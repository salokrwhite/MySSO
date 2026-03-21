package crypto

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func TestNewJWTManagerRequiresExistingPrivateKey(t *testing.T) {
	t.Parallel()

	_, err := NewJWTManager("https://issuer.example", "active-key", "", filepath.Join(t.TempDir(), "missing.pem"), nil, nil)
	if err == nil {
		t.Fatalf("expected error when signing private key file is missing")
	}
}

func TestJWTManagerSupportsKeyRotation(t *testing.T) {
	t.Parallel()

	tempDir := t.TempDir()
	oldPrivateKey := mustGenerateRSAKey(t)
	newPrivateKey := mustGenerateRSAKey(t)

	oldPrivateKeyPath := filepath.Join(tempDir, "old-key.pem")
	newPrivateKeyPath := filepath.Join(tempDir, "new-key.pem")
	oldPublicKeyPath := filepath.Join(tempDir, "old-key.pub.pem")

	writePrivateKeyPEM(t, oldPrivateKeyPath, oldPrivateKey)
	writePrivateKeyPEM(t, newPrivateKeyPath, newPrivateKey)
	writePublicKeyPEM(t, oldPublicKeyPath, &oldPrivateKey.PublicKey)

	oldManager, err := NewJWTManager("https://issuer.example", "old-key", "", oldPrivateKeyPath, nil, nil)
	if err != nil {
		t.Fatalf("create old jwt manager: %v", err)
	}
	rotatedManager, err := NewJWTManager(
		"https://issuer.example",
		"new-key",
		"",
		newPrivateKeyPath,
		[]string{"old-key"},
		[]string{oldPublicKeyPath},
	)
	if err != nil {
		t.Fatalf("create rotated jwt manager: %v", err)
	}

	oldToken, err := oldManager.Sign("user-1", "mysso-resource", time.Minute, map[string]any{"scope": "openid"})
	if err != nil {
		t.Fatalf("sign old token: %v", err)
	}
	newToken, err := rotatedManager.Sign("user-1", "mysso-resource", time.Minute, map[string]any{"scope": "openid"})
	if err != nil {
		t.Fatalf("sign new token: %v", err)
	}

	if _, err := rotatedManager.Parse(oldToken); err != nil {
		t.Fatalf("expected rotated manager to verify old token: %v", err)
	}
	if _, err := rotatedManager.Parse(newToken); err != nil {
		t.Fatalf("expected rotated manager to verify new token: %v", err)
	}

	jwks := rotatedManager.JWKS()
	keys, ok := jwks["keys"].([]map[string]any)
	if !ok {
		t.Fatalf("expected jwks keys slice")
	}
	if len(keys) != 2 {
		t.Fatalf("expected 2 jwks keys, got %d", len(keys))
	}
}

func TestParseRejectsUnexpectedSigningMethod(t *testing.T) {
	t.Parallel()

	privateKey := mustGenerateRSAKey(t)
	privateKeyPath := filepath.Join(t.TempDir(), "active-key.pem")
	writePrivateKeyPEM(t, privateKeyPath, privateKey)

	manager, err := NewJWTManager("https://issuer.example", "active-key", "", privateKeyPath, nil, nil)
	if err != nil {
		t.Fatalf("create jwt manager: %v", err)
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"iss": "https://issuer.example",
		"sub": "user-1",
		"aud": "mysso-resource",
		"iat": time.Now().UTC().Unix(),
		"exp": time.Now().UTC().Add(time.Minute).Unix(),
	})
	token.Header["kid"] = "active-key"
	tokenString, err := token.SignedString([]byte("not-rsa"))
	if err != nil {
		t.Fatalf("sign hs256 token: %v", err)
	}

	if _, err := manager.Parse(tokenString); err == nil {
		t.Fatalf("expected parse to reject unexpected signing method")
	}
}

func mustGenerateRSAKey(t *testing.T) *rsa.PrivateKey {
	t.Helper()
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("generate rsa key: %v", err)
	}
	return privateKey
}

func writePrivateKeyPEM(t *testing.T, path string, privateKey *rsa.PrivateKey) {
	t.Helper()
	encoded, err := x509.MarshalPKCS8PrivateKey(privateKey)
	if err != nil {
		t.Fatalf("marshal private key: %v", err)
	}
	writePEMFile(t, path, "PRIVATE KEY", encoded)
}

func writePublicKeyPEM(t *testing.T, path string, publicKey *rsa.PublicKey) {
	t.Helper()
	encoded, err := x509.MarshalPKIXPublicKey(publicKey)
	if err != nil {
		t.Fatalf("marshal public key: %v", err)
	}
	writePEMFile(t, path, "PUBLIC KEY", encoded)
}

func writePEMFile(t *testing.T, path, blockType string, data []byte) {
	t.Helper()
	file, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0o600)
	if err != nil {
		t.Fatalf("open pem file: %v", err)
	}
	defer file.Close()
	if err := pem.Encode(file, &pem.Block{Type: blockType, Bytes: data}); err != nil {
		t.Fatalf("encode pem file: %v", err)
	}
}
