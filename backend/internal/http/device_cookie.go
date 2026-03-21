package http

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	deviceCookieName    = "mysso_device"
	deviceCookieVersion = "v1"
	deviceCookieTTL     = 180 * 24 * time.Hour
)

func (s *Server) ensureDeviceIDCookie(c *gin.Context) string {
	if cookie, err := c.Cookie(deviceCookieName); err == nil {
		if deviceID, ok := s.parseDeviceCookie(strings.TrimSpace(cookie), time.Now().UTC()); ok {
			return deviceID
		}
	}
	deviceID := uuid.NewString()
	s.setDeviceIDCookie(c, deviceID)
	return deviceID
}

func (s *Server) setDeviceIDCookie(c *gin.Context, deviceID string) {
	expiresAt := time.Now().UTC().Add(deviceCookieTTL)
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(
		deviceCookieName,
		s.buildDeviceCookieValue(deviceID, expiresAt),
		int(deviceCookieTTL.Seconds()),
		"/",
		"",
		s.shouldUseSecureSessionCookie(c),
		true,
	)
}

func (s *Server) buildDeviceCookieValue(deviceID string, expiresAt time.Time) string {
	payload := strings.Join([]string{
		deviceCookieVersion,
		strings.TrimSpace(deviceID),
		strconv.FormatInt(expiresAt.Unix(), 10),
	}, ".")
	return payload + "." + s.signDeviceCookiePayload(payload)
}

func (s *Server) parseDeviceCookie(value string, now time.Time) (string, bool) {
	parts := strings.Split(strings.TrimSpace(value), ".")
	if len(parts) != 4 || parts[0] != deviceCookieVersion {
		return "", false
	}
	deviceID := strings.TrimSpace(parts[1])
	if deviceID == "" {
		return "", false
	}
	expiresUnix, err := strconv.ParseInt(parts[2], 10, 64)
	if err != nil || expiresUnix <= now.Unix() {
		return "", false
	}
	payload := strings.Join(parts[:3], ".")
	expectedSig := s.signDeviceCookiePayload(payload)
	if !hmac.Equal([]byte(parts[3]), []byte(expectedSig)) {
		return "", false
	}
	return deviceID, true
}

func (s *Server) signDeviceCookiePayload(payload string) string {
	mac := hmac.New(sha256.New, s.deviceCookieSigningKey())
	_, _ = mac.Write([]byte(payload))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}

func (s *Server) deviceCookieSigningKey() []byte {
	secret := strings.TrimSpace(s.cfg.HTTP.DeviceCookieSecret)
	if secret == "" {
		secret = strings.TrimSpace(s.cfg.OIDC.FirstPartyClientSecret)
	}
	if secret == "" {
		secret = strings.TrimSpace(s.cfg.OIDC.Issuer) + "|" + strings.TrimSpace(s.cfg.OIDC.DefaultSigningKeyID) + "|mysso-device-cookie"
	}
	sum := sha256.Sum256([]byte("mysso-device-cookie:v1:" + secret))
	return sum[:]
}
