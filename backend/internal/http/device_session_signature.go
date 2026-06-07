package http

import (
	"bytes"
	"crypto/ecdsa"
	"crypto/rand"
	"crypto/sha256"
	"crypto/x509"
	"encoding/asn1"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"io"
	"math/big"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"mysso/backend/internal/domain"
)

const (
	deviceSignatureTimestampSkew = 5 * time.Minute
	headerDeviceKeyID            = "X-Device-Key-ID"
	headerDeviceTimestamp        = "X-Device-Timestamp"
	headerDeviceNonce            = "X-Device-Nonce"
	headerDeviceBodySHA256       = "X-Device-Body-SHA256"
	headerDeviceSignature        = "X-Device-Signature"
)

func (s *Server) requireDeviceSessionSignature(c *gin.Context, session domain.Session) bool {
	publicKeyPEM := strings.TrimSpace(session.DevicePublicKey)
	if publicKeyPEM == "" {
		return true
	}
	keyID := strings.TrimSpace(c.GetHeader(headerDeviceKeyID))
	if keyID == "" || keyID != strings.TrimSpace(session.DeviceKeyID) {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "device signature required"})
		return false
	}

	timestampRaw := strings.TrimSpace(c.GetHeader(headerDeviceTimestamp))
	nonce := strings.TrimSpace(c.GetHeader(headerDeviceNonce))
	bodyHash := strings.ToLower(strings.TrimSpace(c.GetHeader(headerDeviceBodySHA256)))
	signatureRaw := strings.TrimSpace(c.GetHeader(headerDeviceSignature))
	if timestampRaw == "" || nonce == "" || bodyHash == "" || signatureRaw == "" {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "device signature required"})
		return false
	}

	timestamp, err := time.Parse(time.RFC3339Nano, timestampRaw)
	if err != nil || time.Since(timestamp) > deviceSignatureTimestampSkew || time.Until(timestamp) > deviceSignatureTimestampSkew {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "device signature expired"})
		return false
	}

	bodyBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "failed to read request body"})
		return false
	}
	c.Request.Body = io.NopCloser(bytes.NewReader(bodyBytes))
	sum := sha256.Sum256(bodyBytes)
	actualBodyHash := hex.EncodeToString(sum[:])
	if bodyHash != actualBodyHash {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "device signature body mismatch"})
		return false
	}

	pub, err := parseECDSAPublicKeyPEM(publicKeyPEM)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid device public key"})
		return false
	}
	signed := deviceSignaturePayload(c.Request.Method, c.Request.URL.RequestURI(), timestampRaw, nonce, bodyHash)
	digest := sha256.Sum256([]byte(signed))
	signature, err := base64.RawURLEncoding.DecodeString(signatureRaw)
	if err != nil {
		signature, err = base64.StdEncoding.DecodeString(signatureRaw)
	}
	if err != nil || !ecdsa.VerifyASN1(pub, digest[:], signature) {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid device signature"})
		return false
	}
	replayKey := deviceSignatureReplayKey(session, keyID, nonce)
	if s.deviceReplayCache != nil && !s.deviceReplayCache.markIfNew(replayKey, deviceSignatureTimestampSkew*2, time.Now().UTC()) {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "device signature replay detected"})
		return false
	}
	return true
}

func deviceSignatureReplayKey(session domain.Session, keyID, nonce string) string {
	return strings.TrimSpace(session.Token) + ":" + strings.TrimSpace(keyID) + ":" + strings.TrimSpace(nonce)
}

func deviceSignaturePayload(method, requestURI, timestamp, nonce, bodyHash string) string {
	return strings.ToUpper(strings.TrimSpace(method)) + "\n" +
		strings.TrimSpace(requestURI) + "\n" +
		strings.TrimSpace(timestamp) + "\n" +
		strings.TrimSpace(nonce) + "\n" +
		strings.ToLower(strings.TrimSpace(bodyHash))
}

func parseECDSAPublicKeyPEM(value string) (*ecdsa.PublicKey, error) {
	der, err := base64.StdEncoding.DecodeString(strings.TrimSpace(value))
	if err != nil {
		return nil, err
	}
	key, err := x509.ParsePKIXPublicKey(der)
	if err != nil {
		return nil, err
	}
	ecdsaKey, ok := key.(*ecdsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("not ecdsa public key")
	}
	return ecdsaKey, nil
}

func signDevicePayloadForTest(privateKey *ecdsa.PrivateKey, payload string) (string, error) {
	digest := sha256.Sum256([]byte(payload))
	r, s, err := ecdsa.Sign(rand.Reader, privateKey, digest[:])
	if err != nil {
		return "", err
	}
	signature, err := encodeECDSASignature(r, s)
	if err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(signature), nil
}

func encodeECDSASignature(r, s *big.Int) ([]byte, error) {
	return asn1.Marshal(struct {
		R, S *big.Int
	}{r, s})
}
