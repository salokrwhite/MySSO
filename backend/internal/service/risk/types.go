package risk

import (
	"strings"
	"time"

	"mysso/backend/internal/domain"
)

const (
	LevelLow      = "low"
	LevelMedium   = "medium"
	LevelHigh     = "high"
	LevelCritical = "critical"

	ActionAllow   = "allow"
	ActionCaptcha = "captcha"
	ActionStepUp  = "step_up"
	ActionBlock   = "block"
)

type ClientInfo struct {
	Score       int
	Level       string
	Fingerprint string
	Signals     []string
	ClientType  string
	UserAgent   string
}

type LoginParams struct {
	UserID      string
	IP          string
	DeviceKeyID string
	Client      ClientInfo
	Now         time.Time
}

type IPLocation struct {
	Country     string
	Region      string
	City        string
	ISP         string
	CountryCode string
}

type Assessment struct {
	Score      int
	Level      string
	Action     string
	Message    string
	Signals    []domain.RiskSignal
	IPLocation IPLocation
}

type Config struct {
	Enabled                    bool
	MediumThreshold            int
	HighThreshold              int
	CriticalThreshold          int
	AutoBlockThreshold         int
	MaxFailedLogins            int
	LockoutMinutes             int
	ScoreWindowDays            int
	FailedLoginScoreWeight     int
	FailedLoginScoreCap        int
	EnableGeoCheck             bool
	EnableDeviceCheck          bool
	EnableBehaviorCheck        bool
	EnableIPBlacklist          bool
	EnableRiskMitigation       bool
	AllowBlockStepUp           bool
	TrustedDeviceDays          int
	MitigationHours            int
	TrustedDeviceScoreDiscount int
	MitigationScoreDiscount    int
	HighRiskGeoDiscount        int
	NewDeviceDiscount          int
	IPChangeDiscount           int
	HighRiskCountries          []string
	TrustedIPs                 []string
}

func normalizeClientType(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	if value == "app" || value == "web" {
		return value
	}
	return "web"
}
