package http

import (
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"

	riskservice "mysso/backend/internal/service/risk"
)

const clientRiskContextKey = "client_risk"

const (
	maxClientRiskHeaderLength = 1024
	maxClientRiskSignals      = 16
	maxClientRiskSignalLength = 64
	maxClientFingerprintLen   = 128
	maxClientRiskLevelLen     = 32
)

func riskHeaderMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		score, _ := strconv.Atoi(trimHeader(c.GetHeader("X-Device-Risk-Score"), 4))
		if score < 0 || score > 100 {
			score = 0
		}
		signals := splitHeaderList(c.GetHeader("X-Device-Risk-Signals"))
		clientType := strings.TrimSpace(c.GetHeader("X-Client-Type"))
		if clientType == "" {
			clientType = "web"
		}
		c.Set(clientRiskContextKey, riskservice.ClientInfo{
			Score:       score,
			Level:       sanitizeRiskLevel(c.GetHeader("X-Device-Risk-Level")),
			Fingerprint: trimHeader(c.GetHeader("X-Device-Fingerprint"), maxClientFingerprintLen),
			Signals:     signals,
			ClientType:  clientType,
			UserAgent:   c.Request.UserAgent(),
		})
		c.Next()
	}
}

func getClientRisk(c *gin.Context) riskservice.ClientInfo {
	value, _ := c.Get(clientRiskContextKey)
	client, _ := value.(riskservice.ClientInfo)
	if strings.TrimSpace(client.ClientType) == "" {
		client.ClientType = "web"
	}
	client.UserAgent = c.Request.UserAgent()
	return client
}

func clientRiskWithServerDevice(c *gin.Context, deviceID string) riskservice.ClientInfo {
	client := getClientRisk(c)
	if strings.EqualFold(strings.TrimSpace(client.ClientType), "web") {
		client.Fingerprint = strings.TrimSpace(deviceID)
	}
	return client
}

func splitHeaderList(raw string) []string {
	raw = trimHeader(raw, maxClientRiskHeaderLength)
	parts := strings.FieldsFunc(raw, func(r rune) bool { return r == ',' || r == ';' || r == ' ' })
	items := make([]string, 0, len(parts))
	for _, part := range parts {
		part = sanitizeRiskSignal(part)
		if part != "" && knownClientRiskSignal(part) {
			items = append(items, part)
		}
		if len(items) >= maxClientRiskSignals {
			break
		}
	}
	return items
}

func trimHeader(raw string, maxLen int) string {
	value := strings.TrimSpace(raw)
	if maxLen > 0 && len(value) > maxLen {
		value = value[:maxLen]
	}
	return value
}

func sanitizeRiskLevel(raw string) string {
	value := trimHeader(raw, maxClientRiskLevelLen)
	switch value {
	case "low", "medium", "high", "critical":
		return value
	default:
		return ""
	}
}

func sanitizeRiskSignal(raw string) string {
	value := trimHeader(raw, maxClientRiskSignalLength)
	for _, r := range value {
		if r >= 'a' && r <= 'z' || r >= '0' && r <= '9' || r == '_' || r == '-' || r == ':' {
			continue
		}
		return ""
	}
	return value
}

func knownClientRiskSignal(signal string) bool {
	switch signal {
	case "root_detected", "debugger_attached",
		"emulator_detected",
		"package_mismatch", "signature_mismatch",
		"unknown_installer", "native_lib_missing", "native_lib_unexpected_path",
		"vpn_active", "proxy_set", "selinux_permissive", "mock_location",
		"dev_mode_on", "usb_debug_on", "custom_rom":
		return true
	default:
		return false
	}
}
