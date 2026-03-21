package crypto

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"fmt"
	"os"
	"sort"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWTManager struct {
	keyID            string
	issuer           string
	privateKey       *rsa.PrivateKey
	verificationKeys map[string]*rsa.PublicKey
}

func NewJWTManager(issuer, keyID, privateKeyPEM, privateKeyPath string, additionalVerifyKeyIDs, additionalVerifyKeyPaths []string) (*JWTManager, error) {
	privateKey, err := loadPrivateKey(strings.TrimSpace(privateKeyPEM), strings.TrimSpace(privateKeyPath))
	if err != nil {
		return nil, err
	}
	verificationKeys, err := loadVerificationKeys(strings.TrimSpace(keyID), privateKey, additionalVerifyKeyIDs, additionalVerifyKeyPaths)
	if err != nil {
		return nil, err
	}
	return &JWTManager{
		keyID:            strings.TrimSpace(keyID),
		issuer:           issuer,
		privateKey:       privateKey,
		verificationKeys: verificationKeys,
	}, nil
}

func (m *JWTManager) Sign(subject, audience string, ttl time.Duration, claims map[string]any) (string, error) {
	now := time.Now().UTC()
	tokenClaims := jwt.MapClaims{
		"iss": m.issuer,
		"sub": subject,
		"aud": audience,
		"iat": now.Unix(),
		"exp": now.Add(ttl).Unix(),
	}
	for k, v := range claims {
		tokenClaims[k] = v
	}
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, tokenClaims)
	token.Header["kid"] = m.keyID
	return token.SignedString(m.privateKey)
}

func (m *JWTManager) Parse(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		if token.Method == nil || token.Method.Alg() != jwt.SigningMethodRS256.Alg() {
			return nil, fmt.Errorf("unexpected signing method")
		}
		kid, _ := token.Header["kid"].(string)
		kid = strings.TrimSpace(kid)
		if kid == "" {
			if len(m.verificationKeys) == 1 {
				for _, publicKey := range m.verificationKeys {
					return publicKey, nil
				}
			}
			return nil, fmt.Errorf("missing key id")
		}
		publicKey, ok := m.verificationKeys[kid]
		if !ok {
			return nil, fmt.Errorf("unknown key id")
		}
		return publicKey, nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}
	return claims, nil
}

func (m *JWTManager) JWKS() map[string]any {
	keyIDs := make([]string, 0, len(m.verificationKeys))
	for keyID := range m.verificationKeys {
		keyIDs = append(keyIDs, keyID)
	}
	sort.Strings(keyIDs)
	keys := make([]map[string]any, 0, len(keyIDs))
	for _, keyID := range keyIDs {
		publicKey := m.verificationKeys[keyID]
		e := base64.RawURLEncoding.EncodeToString([]byte{byte(publicKey.E >> 16), byte(publicKey.E >> 8), byte(publicKey.E)})
		n := base64.RawURLEncoding.EncodeToString(publicKey.N.Bytes())
		keys = append(keys, map[string]any{
			"kty": "RSA",
			"use": "sig",
			"alg": "RS256",
			"kid": keyID,
			"n":   n,
			"e":   e,
		})
	}
	return map[string]any{"keys": keys}
}

func loadPrivateKey(privateKeyPEM, privateKeyPath string) (*rsa.PrivateKey, error) {
	if privateKeyPEM != "" {
		privateKey, err := parseRSAPrivateKeyPEM([]byte(privateKeyPEM))
		if err != nil {
			return nil, fmt.Errorf("parse OIDC signing private key pem: %w", err)
		}
		return privateKey, nil
	}
	if privateKeyPath == "" {
		return nil, fmt.Errorf("missing OIDC signing private key configuration")
	}
	data, err := os.ReadFile(privateKeyPath)
	if err != nil {
		return nil, fmt.Errorf("read OIDC signing private key file: %w", err)
	}
	privateKey, err := parseRSAPrivateKeyPEM(data)
	if err != nil {
		return nil, fmt.Errorf("parse OIDC signing private key file: %w", err)
	}
	return privateKey, nil
}

func parseRSAPrivateKeyPEM(data []byte) (*rsa.PrivateKey, error) {
	block, _ := pem.Decode(data)
	if block == nil {
		return nil, fmt.Errorf("invalid pem data")
	}
	if key, err := x509.ParsePKCS1PrivateKey(block.Bytes); err == nil {
		return key, nil
	}
	parsedKey, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	key, ok := parsedKey.(*rsa.PrivateKey)
	if !ok {
		return nil, fmt.Errorf("private key is not RSA")
	}
	return key, nil
}

func parseRSAPublicKeyPEM(data []byte) (*rsa.PublicKey, error) {
	block, _ := pem.Decode(data)
	if block == nil {
		return nil, fmt.Errorf("invalid pem data")
	}
	if key, err := x509.ParsePKIXPublicKey(block.Bytes); err == nil {
		rsaKey, ok := key.(*rsa.PublicKey)
		if !ok {
			return nil, fmt.Errorf("public key is not RSA")
		}
		return rsaKey, nil
	}
	if key, err := x509.ParsePKCS1PublicKey(block.Bytes); err == nil {
		return key, nil
	}
	if key, err := parseRSAPrivateKeyPEM(data); err == nil {
		return &key.PublicKey, nil
	}
	certificate, err := x509.ParseCertificate(block.Bytes)
	if err != nil {
		return nil, err
	}
	rsaKey, ok := certificate.PublicKey.(*rsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("certificate public key is not RSA")
	}
	return rsaKey, nil
}

func loadVerificationKeys(activeKeyID string, activePrivateKey *rsa.PrivateKey, additionalIDs, additionalPaths []string) (map[string]*rsa.PublicKey, error) {
	if activeKeyID == "" {
		return nil, fmt.Errorf("missing OIDC signing key id")
	}
	if len(additionalIDs) != len(additionalPaths) {
		return nil, fmt.Errorf("OIDC_ADDITIONAL_VERIFY_KEY_IDS and OIDC_ADDITIONAL_VERIFY_KEY_PATHS length mismatch")
	}
	keys := map[string]*rsa.PublicKey{
		activeKeyID: &activePrivateKey.PublicKey,
	}
	for index := range additionalIDs {
		keyID := strings.TrimSpace(additionalIDs[index])
		keyPath := strings.TrimSpace(additionalPaths[index])
		if keyID == "" || keyPath == "" {
			return nil, fmt.Errorf("additional verify key id and path must not be empty")
		}
		if _, exists := keys[keyID]; exists {
			return nil, fmt.Errorf("duplicate verify key id: %s", keyID)
		}
		data, err := os.ReadFile(keyPath)
		if err != nil {
			return nil, fmt.Errorf("read additional verify key %s: %w", keyID, err)
		}
		publicKey, err := parseRSAPublicKeyPEM(data)
		if err != nil {
			return nil, fmt.Errorf("parse additional verify key %s: %w", keyID, err)
		}
		keys[keyID] = publicKey
	}
	return keys, nil
}
