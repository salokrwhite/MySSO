package risk

import (
	"encoding/json"
	"fmt"
	"net"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/service/common/authutil"
	"mysso/backend/internal/service/common/deps"
	"mysso/backend/internal/store"
)

type Service struct {
	deps *deps.Deps
}

func New(dependencies *deps.Deps) *Service {
	return &Service{deps: dependencies}
}

func (s *Service) AssessLogin(params LoginParams) (Assessment, error) {
	now := params.Now
	if now.IsZero() {
		now = time.Now().UTC()
	}
	cfg := s.Config()
	if !cfg.Enabled {
		return Assessment{Score: 0, Level: LevelLow, Action: ActionAllow}, nil
	}
	if cfg.EnableIPBlacklist {
		if entry, ok, err := s.IsIPBlacklisted(params.IP, now); err != nil {
			return Assessment{}, err
		} else if ok {
			return Assessment{
				Score:   100,
				Level:   LevelCritical,
				Action:  ActionBlock,
				Message: "IP address is blocked",
				Signals: []domain.RiskSignal{{Category: "ip", Name: "ip_blacklisted", Weight: 100, Detail: entry.Reason}},
			}, nil
		}
	}
	isTrustedIP := trustedIP(params.IP, cfg.TrustedIPs)

	score := 0
	signals := make([]domain.RiskSignal, 0, len(params.Client.Signals)+4)
	location := s.lookupIPLocation(params.IP)
	deviceProfile := domain.DeviceProfile{}
	hasDeviceProfile := false
	fingerprint := strings.TrimSpace(params.Client.Fingerprint)
	if cfg.EnableDeviceCheck && fingerprint != "" && validFingerprint(fingerprint) {
		profile, err := s.deps.Store.GetDeviceProfile(params.UserID, fingerprint)
		if err != nil && err != store.ErrNotFound {
			return Assessment{}, err
		}
		if err == nil {
			deviceProfile = profile
			hasDeviceProfile = true
		}
	}
	mitigationActive := false
	trustedDeviceActive := false
	if cfg.EnableRiskMitigation {
		if hasDeviceProfile && deviceProfile.TrustedUntil != nil && deviceProfile.TrustedUntil.After(now) {
			trustedDeviceActive = true
			mitigationActive = true
			signals = append(signals, domain.RiskSignal{Category: "trust", Name: "trusted_device", Detail: deviceProfile.TrustedUntil.Format(time.RFC3339)})
		}
		if hasDeviceProfile && deviceProfile.MitigatedUntil != nil && deviceProfile.MitigatedUntil.After(now) {
			mitigationActive = true
			signals = append(signals, domain.RiskSignal{Category: "trust", Name: "risk_mitigated_device", Detail: deviceProfile.MitigatedUntil.Format(time.RFC3339)})
		}
		if until, err := s.deps.Store.GetUserRiskFalsePositiveUntil(params.UserID, now); err != nil {
			return Assessment{}, err
		} else if until != nil {
			mitigationActive = true
			signals = append(signals, domain.RiskSignal{Category: "trust", Name: "false_positive_marked", Detail: until.Format(time.RFC3339)})
		}
	}
	if isTrustedIP {
		signals = append(signals, domain.RiskSignal{Category: "ip", Name: "trusted_ip", Detail: params.IP})
	}
	for _, signal := range params.Client.Signals {
		weight := clientSignalWeight(signal)
		if weight <= 0 {
			continue
		}
		score += weight
		signals = append(signals, domain.RiskSignal{Category: "client", Name: signal, Weight: weight})
	}

	if cfg.EnableDeviceCheck {
		if fingerprint == "" {
			score += 15
			signals = append(signals, domain.RiskSignal{Category: "device", Name: "missing_device_fingerprint", Weight: 15})
		} else if !validFingerprint(fingerprint) {
			score += 15
			signals = append(signals, domain.RiskSignal{Category: "device", Name: "invalid_device_fingerprint", Weight: 15})
		} else {
			if !hasDeviceProfile {
				weight := discountedWeight(10, cfg.NewDeviceDiscount, mitigationActive)
				score += weight
				signals = append(signals, domain.RiskSignal{Category: "device", Name: "new_device", Weight: 10})
			}
			deviceCount, err := s.deps.Store.CountUserDevicesSince(params.UserID, now.Add(-24*time.Hour))
			if err != nil {
				return Assessment{}, err
			}
			if deviceCount >= 3 {
				score += 15
				signals = append(signals, domain.RiskSignal{Category: "device", Name: "frequent_device_switch", Weight: 15})
			}
		}
	}

	if cfg.EnableGeoCheck {
		if location.Country != "" || location.Region != "" || location.City != "" || location.CountryCode != "" {
			signals = append(signals, domain.RiskSignal{Category: "geo", Name: "ip_location", Detail: formatLocation(location)})
		}
		if matched := matchHighRiskLocation(location, cfg.HighRiskCountries); matched != "" && !isTrustedIP {
			weight := discountedWeight(30, cfg.HighRiskGeoDiscount, mitigationActive)
			score += weight
			signals = append(signals, domain.RiskSignal{Category: "geo", Name: "high_risk_location", Weight: weight, Detail: matched})
		}
		last, err := s.deps.Store.GetLastLoginHistory(params.UserID)
		if err != nil && err != store.ErrNotFound {
			return Assessment{}, err
		}
		if err == nil && last.IPAddress != "" && last.IPAddress != params.IP && now.Sub(last.CreatedAt) < 2*time.Hour {
			weight := discountedWeight(12, cfg.IPChangeDiscount, mitigationActive)
			score += weight
			signals = append(signals, domain.RiskSignal{Category: "geo", Name: "ip_changed_quickly", Weight: weight, Detail: last.IPAddress + " -> " + params.IP})
		}
	}

	if cfg.EnableBehaviorCheck {
		if localHour(now) >= 2 && localHour(now) < 5 {
			score += 5
			signals = append(signals, domain.RiskSignal{Category: "behavior", Name: "unusual_time", Weight: 5})
		}
	}

	if mitigationActive {
		score -= cfg.MitigationScoreDiscount
		signals = append(signals, domain.RiskSignal{Category: "trust", Name: "risk_mitigation_discount", Weight: -cfg.MitigationScoreDiscount})
	}
	if trustedDeviceActive {
		score -= cfg.TrustedDeviceScoreDiscount
		signals = append(signals, domain.RiskSignal{Category: "trust", Name: "trusted_device_discount", Weight: -cfg.TrustedDeviceScoreDiscount})
	}
	score = clamp(score, 0, 100)
	if mitigationActive && score > 0 && score < cfg.CriticalThreshold && score < cfg.AutoBlockThreshold {
		previousScore := score
		score = 0
		signals = append(signals, domain.RiskSignal{Category: "trust", Name: "risk_mitigation_score_reset", Weight: -previousScore})
	}
	level := levelForScore(score, cfg)
	action := actionForLevel(score, level, cfg)
	return Assessment{Score: score, Level: level, Action: action, Message: messageForAction(action), Signals: signals, IPLocation: location}, nil
}

func (s *Service) AssessSecurityOperation(user domain.User, ip, deviceID, operation string) (Assessment, error) {
	if user.Role == domain.RoleAdmin {
		return Assessment{Score: 0, Level: LevelLow, Action: ActionAllow}, nil
	}
	return s.AssessLogin(LoginParams{
		UserID: user.ID,
		IP:     ip,
		Client: ClientInfo{
			Fingerprint: strings.TrimSpace(deviceID),
			ClientType:  "web",
			Signals:     []string{strings.TrimSpace(operation)},
		},
	})
}

func (s *Service) RecordLogin(userID, ip, deviceKeyID string, client ClientInfo, assessment Assessment, success bool) {
	now := time.Now().UTC()
	eventType := "login"
	if !success {
		eventType = "login_failed"
	}
	_ = s.deps.Store.InsertRiskEvent(domain.RiskEvent{
		ID:                uuid.NewString(),
		UserID:            userID,
		EventType:         eventType,
		RiskScore:         assessment.Score,
		RiskLevel:         assessment.Level,
		ActionTaken:       assessment.Action,
		IPAddress:         strings.TrimSpace(ip),
		IPCountry:         assessment.IPLocation.Country,
		IPRegion:          assessment.IPLocation.Region,
		IPCity:            assessment.IPLocation.City,
		DeviceFingerprint: strings.TrimSpace(client.Fingerprint),
		DeviceKeyID:       strings.TrimSpace(deviceKeyID),
		ClientType:        normalizeClientType(client.ClientType),
		UserAgent:         strings.TrimSpace(client.UserAgent),
		Signals:           assessment.Signals,
		CreatedAt:         now,
	})
	_ = s.deps.Store.InsertLoginHistory(domain.LoginHistory{
		ID:                uuid.NewString(),
		UserID:            userID,
		IPAddress:         strings.TrimSpace(ip),
		IPCountry:         assessment.IPLocation.Country,
		IPRegion:          assessment.IPLocation.Region,
		IPCity:            assessment.IPLocation.City,
		DeviceFingerprint: strings.TrimSpace(client.Fingerprint),
		DeviceKeyID:       strings.TrimSpace(deviceKeyID),
		ClientType:        normalizeClientType(client.ClientType),
		RiskScore:         assessment.Score,
		RiskLevel:         assessment.Level,
		Success:           success,
		CreatedAt:         now,
	})
	if success && strings.TrimSpace(client.Fingerprint) != "" {
		_ = s.deps.Store.UpsertDeviceProfile(domain.DeviceProfile{
			ID:                uuid.NewString(),
			UserID:            userID,
			DeviceFingerprint: strings.TrimSpace(client.Fingerprint),
			DeviceKeyID:       strings.TrimSpace(deviceKeyID),
			ClientType:        normalizeClientType(client.ClientType),
			FirstIP:           strings.TrimSpace(ip),
			LastIP:            strings.TrimSpace(ip),
			FirstSeenAt:       now,
			LastSeenAt:        now,
			LastRiskScore:     assessment.Score,
			LastRiskLevel:     assessment.Level,
		})
	}
}

func (s *Service) RecordFailedAttempt(identifier, ip, deviceID, kind, reason string) {
	s.RecordFailedAttemptForUser("", identifier, ip, deviceID, kind, reason)
}

func (s *Service) RecordFailedAttemptForUser(userID, identifier, ip, deviceID, kind, reason string) {
	hash := authutil.HashValue(identifier)
	location := s.lookupIPLocation(ip)
	_ = s.deps.Store.InsertRiskEvent(domain.RiskEvent{
		ID:             uuid.NewString(),
		UserID:         strings.TrimSpace(userID),
		EventType:      "login_failed",
		IdentifierHash: hash,
		FailureReason:  strings.TrimSpace(reason),
		RiskScore:      0,
		RiskLevel:      LevelLow,
		ActionTaken:    "logged",
		IPAddress:      strings.TrimSpace(ip),
		IPCountry:      location.Country,
		IPRegion:       location.Region,
		IPCity:         location.City,
		ClientType:     "unknown",
		Signals: []domain.RiskSignal{
			{Category: "auth", Name: strings.TrimSpace(kind), Detail: hash},
			{Category: "auth", Name: "failure_reason", Detail: strings.TrimSpace(reason)},
			{Category: "auth", Name: "device_hash", Detail: authutil.HashValue(deviceID)},
		},
		CreatedAt: time.Now().UTC(),
	})
}

func (s *Service) CheckAttempt(identifier, ip string) error {
	cfg := s.Config()
	if !cfg.Enabled {
		return nil
	}
	now := time.Now().UTC()
	if cfg.EnableIPBlacklist {
		if entry, ok, err := s.IsIPBlacklisted(ip, now); err != nil {
			return err
		} else if ok {
			return fmt.Errorf("ip blocked: %s", entry.Reason)
		}
	}
	maxFailed := cfg.MaxFailedLogins
	if maxFailed <= 0 {
		maxFailed = 5
	}
	lockoutMinutes := cfg.LockoutMinutes
	if lockoutMinutes <= 0 {
		lockoutMinutes = 15
	}
	count, err := s.deps.Store.CountFailedLogins(authutil.HashValue(identifier), ip, now.Add(-time.Duration(lockoutMinutes)*time.Minute))
	if err != nil {
		return err
	}
	if count >= maxFailed {
		return fmt.Errorf("too many failed attempts, please try again later")
	}
	return nil
}

func (s *Service) Config() Config {
	values, err := s.deps.Store.GetSettings(
		"risk_control_enabled",
		"risk_medium_threshold",
		"risk_high_threshold",
		"risk_critical_threshold",
		"risk_auto_block_threshold",
		"risk_max_failed_logins",
		"risk_lockout_minutes",
		"risk_score_window_days",
		"risk_failed_login_score_weight",
		"risk_failed_login_score_cap",
		"risk_enable_geo_check",
		"risk_enable_device_check",
		"risk_enable_behavior_check",
		"risk_enable_ip_blacklist",
		"risk_enable_mitigation",
		"risk_allow_block_step_up",
		"risk_trusted_device_days",
		"risk_mitigation_hours",
		"risk_trusted_device_score_discount",
		"risk_mitigation_score_discount",
		"risk_high_risk_geo_discount",
		"risk_new_device_discount",
		"risk_ip_change_discount",
		"risk_high_risk_countries",
		"risk_trusted_ips",
	)
	if err != nil {
		values = map[string]string{}
	}
	return Config{
		Enabled:                    parseBool(values["risk_control_enabled"], false),
		MediumThreshold:            parseInt(values["risk_medium_threshold"], 30),
		HighThreshold:              parseInt(values["risk_high_threshold"], 60),
		CriticalThreshold:          parseInt(values["risk_critical_threshold"], 80),
		AutoBlockThreshold:         parseInt(values["risk_auto_block_threshold"], 90),
		MaxFailedLogins:            parseInt(values["risk_max_failed_logins"], 5),
		LockoutMinutes:             parseInt(values["risk_lockout_minutes"], 15),
		ScoreWindowDays:            clamp(parseInt(values["risk_score_window_days"], 30), 1, 365),
		FailedLoginScoreWeight:     clamp(parseInt(values["risk_failed_login_score_weight"], 5), 0, 100),
		FailedLoginScoreCap:        clamp(parseInt(values["risk_failed_login_score_cap"], 30), 0, 100),
		EnableGeoCheck:             parseBool(values["risk_enable_geo_check"], true),
		EnableDeviceCheck:          parseBool(values["risk_enable_device_check"], true),
		EnableBehaviorCheck:        parseBool(values["risk_enable_behavior_check"], true),
		EnableIPBlacklist:          parseBool(values["risk_enable_ip_blacklist"], true),
		EnableRiskMitigation:       parseBool(values["risk_enable_mitigation"], true),
		AllowBlockStepUp:           parseBool(values["risk_allow_block_step_up"], true),
		TrustedDeviceDays:          parseInt(values["risk_trusted_device_days"], 30),
		MitigationHours:            parseInt(values["risk_mitigation_hours"], 72),
		TrustedDeviceScoreDiscount: parseInt(values["risk_trusted_device_score_discount"], 20),
		MitigationScoreDiscount:    parseInt(values["risk_mitigation_score_discount"], 15),
		HighRiskGeoDiscount:        parseInt(values["risk_high_risk_geo_discount"], 20),
		NewDeviceDiscount:          parseInt(values["risk_new_device_discount"], 10),
		IPChangeDiscount:           parseInt(values["risk_ip_change_discount"], 8),
		HighRiskCountries:          parseJSONList(values["risk_high_risk_countries"]),
		TrustedIPs:                 parseJSONList(values["risk_trusted_ips"]),
	}
}

func (s *Service) Stats() (map[string]any, error) {
	levels, err := s.deps.Store.CountRiskEventsByLevel(time.Now().UTC().Add(-24 * time.Hour))
	if err != nil {
		return nil, err
	}
	blacklist, err := s.deps.Store.ListIPBlacklist()
	if err != nil {
		return nil, err
	}
	return map[string]any{"levels_24h": levels, "ip_blacklist_count": len(blacklist), "config": s.Config()}, nil
}

func (s *Service) ListRiskEvents(page, pageSize int, userID, eventType, level string) ([]domain.RiskEvent, int, error) {
	return s.deps.Store.ListRiskEvents(page, pageSize, userID, eventType, level)
}

func (s *Service) ListRiskAccountSummaries(page, pageSize int, userID, level string) ([]domain.RiskAccountSummary, int, error) {
	cfg := s.Config()
	return s.deps.Store.ListRiskAccountSummaries(
		page,
		pageSize,
		userID,
		level,
		cfg.MediumThreshold,
		cfg.HighThreshold,
		cfg.CriticalThreshold,
		cfg.ScoreWindowDays,
		cfg.FailedLoginScoreWeight,
		cfg.FailedLoginScoreCap,
	)
}

func (s *Service) DeleteRiskEvents(deleteAll bool, startAt, endAt *time.Time) (int64, error) {
	if deleteAll {
		return s.deps.Store.DeleteRiskEvents(nil, nil)
	}
	if startAt == nil || endAt == nil {
		return 0, fmt.Errorf("start_at and end_at are required")
	}
	if endAt.Before(*startAt) {
		return 0, fmt.Errorf("end_at must be after start_at")
	}
	return s.deps.Store.DeleteRiskEvents(startAt, endAt)
}

func (s *Service) ListIPBlacklist() ([]domain.IPBlacklistEntry, error) {
	return s.deps.Store.ListIPBlacklist()
}

func (s *Service) TrustDeviceAfterVerification(userID, fingerprint, reason string) error {
	cfg := s.Config()
	if !cfg.Enabled || !cfg.EnableRiskMitigation {
		return nil
	}
	fingerprint = strings.TrimSpace(fingerprint)
	if !validFingerprint(fingerprint) {
		return nil
	}
	now := time.Now().UTC()
	var trustedUntil *time.Time
	if cfg.TrustedDeviceDays > 0 {
		t := now.Add(time.Duration(cfg.TrustedDeviceDays) * 24 * time.Hour)
		trustedUntil = &t
	}
	var mitigatedUntil *time.Time
	if cfg.MitigationHours > 0 {
		t := now.Add(time.Duration(cfg.MitigationHours) * time.Hour)
		mitigatedUntil = &t
	}
	if trustedUntil == nil && mitigatedUntil == nil {
		return nil
	}
	return s.deps.Store.TrustDevice(strings.TrimSpace(userID), fingerprint, strings.TrimSpace(reason), "system", trustedUntil, mitigatedUntil)
}

func (s *Service) ClearUserRiskProfile(userID string) (*time.Time, error) {
	if err := s.ValidateUserRiskTarget(userID); err != nil {
		return nil, err
	}
	userID = strings.TrimSpace(userID)
	if err := s.deps.Store.ClearUserRiskProfile(userID); err != nil {
		return nil, err
	}
	cfg := s.Config()
	if !cfg.Enabled || !cfg.EnableRiskMitigation {
		return nil, nil
	}
	hours := cfg.MitigationHours
	if hours <= 0 {
		return nil, nil
	}
	hours = clamp(hours, 1, 8760)
	mitigatedUntil := time.Now().UTC().Add(time.Duration(hours) * time.Hour)
	if err := s.deps.Store.SetUserRiskFalsePositive(userID, "admin_clear_profile", mitigatedUntil); err != nil {
		return nil, err
	}
	return &mitigatedUntil, nil
}

func (s *Service) MarkUserRiskFalsePositive(userID, note string, hours int) error {
	if err := s.ValidateUserRiskTarget(userID); err != nil {
		return err
	}
	if hours <= 0 {
		hours = s.Config().MitigationHours
	}
	if hours <= 0 {
		hours = 72
	}
	hours = clamp(hours, 1, 8760)
	return s.deps.Store.SetUserRiskFalsePositive(strings.TrimSpace(userID), strings.TrimSpace(note), time.Now().UTC().Add(time.Duration(hours)*time.Hour))
}

func (s *Service) ValidateUserRiskTarget(userID string) error {
	userID = strings.TrimSpace(userID)
	if userID == "" {
		return fmt.Errorf("user_id is required")
	}
	user, err := s.deps.Store.GetUser(userID)
	if err != nil {
		return fmt.Errorf("user not found")
	}
	if user.Role == domain.RoleAdmin {
		return fmt.Errorf("risk control profile is not applied to administrator accounts")
	}
	return nil
}

func (s *Service) AddIPBlacklist(entry domain.IPBlacklistEntry) error {
	ip := strings.TrimSpace(entry.IPAddress)
	if !validIPOrCIDR(ip) {
		return fmt.Errorf("ip address must be a valid IP or CIDR")
	}
	entry.IPAddress = ip
	return s.deps.Store.AddIPBlacklist(entry)
}

func (s *Service) RemoveIPBlacklist(ip string) error {
	return s.deps.Store.RemoveIPBlacklist(ip)
}

func (s *Service) IsIPBlacklisted(ip string, now time.Time) (domain.IPBlacklistEntry, bool, error) {
	if entry, ok, err := s.deps.Store.IsIPBlacklisted(ip, now); err != nil || ok {
		return entry, ok, err
	}
	items, err := s.deps.Store.ListIPBlacklist()
	if err != nil {
		return domain.IPBlacklistEntry{}, false, err
	}
	parsed := net.ParseIP(strings.TrimSpace(ip))
	if parsed == nil {
		return domain.IPBlacklistEntry{}, false, nil
	}
	for _, item := range items {
		if item.ExpiresAt != nil && !item.ExpiresAt.After(now) {
			continue
		}
		if _, cidr, err := net.ParseCIDR(strings.TrimSpace(item.IPAddress)); err == nil && cidr.Contains(parsed) {
			return item, true, nil
		}
	}
	return domain.IPBlacklistEntry{}, false, nil
}

func (s *Service) lookupIPLocation(ip string) IPLocation {
	if s == nil || s.deps == nil || s.deps.GeoIP == nil {
		return IPLocation{}
	}
	loc, ok := s.deps.GeoIP.Lookup(ip)
	if !ok {
		return IPLocation{}
	}
	return IPLocation{
		Country:     strings.TrimSpace(loc.Country),
		Region:      strings.TrimSpace(loc.Region),
		City:        strings.TrimSpace(loc.City),
		ISP:         strings.TrimSpace(loc.ISP),
		CountryCode: strings.ToUpper(strings.TrimSpace(loc.CountryCode)),
	}
}

func matchHighRiskLocation(location IPLocation, rules []string) string {
	fields := []string{
		strings.ToUpper(location.CountryCode),
		location.Country,
		location.Region,
		location.City,
		formatLocation(location),
	}
	for _, rule := range rules {
		rawRule := strings.TrimSpace(rule)
		if rawRule == "" {
			continue
		}
		upperRule := strings.ToUpper(rawRule)
		for _, field := range fields {
			field = strings.TrimSpace(field)
			if field == "" {
				continue
			}
			if strings.EqualFold(field, rawRule) || strings.Contains(strings.ToUpper(field), upperRule) {
				return rawRule
			}
		}
	}
	return ""
}

func formatLocation(location IPLocation) string {
	parts := make([]string, 0, 4)
	for _, part := range []string{location.Country, location.Region, location.City, location.ISP} {
		part = strings.TrimSpace(part)
		if part != "" {
			parts = append(parts, part)
		}
	}
	if location.CountryCode != "" {
		parts = append(parts, strings.ToUpper(location.CountryCode))
	}
	return strings.Join(parts, "|")
}

func clientSignalWeight(signal string) int {
	switch strings.TrimSpace(signal) {
	case "root_detected", "debugger_attached":
		return 25
	case "emulator_detected":
		return 20
	case "package_mismatch", "signature_mismatch":
		return 30
	case "unknown_installer", "native_lib_missing", "native_lib_unexpected_path":
		return 15
	case "vpn_active", "proxy_set", "selinux_permissive", "mock_location":
		return 10
	case "dev_mode_on", "usb_debug_on", "custom_rom":
		return 5
	default:
		return 0
	}
}

func levelForScore(score int, cfg Config) string {
	switch {
	case score >= cfg.CriticalThreshold:
		return LevelCritical
	case score >= cfg.HighThreshold:
		return LevelHigh
	case score >= cfg.MediumThreshold:
		return LevelMedium
	default:
		return LevelLow
	}
}

func actionForLevel(score int, level string, cfg Config) string {
	if score >= cfg.AutoBlockThreshold || level == LevelCritical {
		return ActionBlock
	}
	if level == LevelHigh {
		return ActionStepUp
	}
	if level == LevelMedium {
		return ActionCaptcha
	}
	return ActionAllow
}

func messageForAction(action string) string {
	switch action {
	case ActionBlock:
		return "Access denied due to account risk"
	case ActionStepUp:
		return "Additional verification is required"
	case ActionCaptcha:
		return "Additional verification is required"
	default:
		return ""
	}
}

func discountedWeight(weight, discount int, active bool) int {
	if !active || discount <= 0 {
		return weight
	}
	return clamp(weight-discount, 0, weight)
}

func validFingerprint(value string) bool {
	value = strings.TrimSpace(value)
	if len(value) < 16 || len(value) > 128 {
		return false
	}
	for _, r := range value {
		if r >= 'a' && r <= 'z' || r >= 'A' && r <= 'Z' || r >= '0' && r <= '9' || r == '-' || r == '_' || r == ':' {
			continue
		}
		return false
	}
	return true
}

func validIPOrCIDR(value string) bool {
	value = strings.TrimSpace(value)
	if value == "" {
		return false
	}
	if net.ParseIP(value) != nil {
		return true
	}
	_, _, err := net.ParseCIDR(value)
	return err == nil
}

func trustedIP(ip string, trusted []string) bool {
	parsed := net.ParseIP(strings.TrimSpace(ip))
	if parsed == nil {
		return false
	}
	for _, item := range trusted {
		item = strings.TrimSpace(item)
		if item == "" {
			continue
		}
		if _, cidr, err := net.ParseCIDR(item); err == nil && cidr.Contains(parsed) {
			return true
		}
		if item == ip {
			return true
		}
	}
	return false
}

func parseBool(raw string, fallback bool) bool {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return fallback
	}
	value, err := strconv.ParseBool(raw)
	if err != nil {
		return fallback
	}
	return value
}

func parseInt(raw string, fallback int) int {
	value, err := strconv.Atoi(strings.TrimSpace(raw))
	if err != nil {
		return fallback
	}
	return value
}

func parseJSONList(raw string) []string {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil
	}
	var items []string
	if err := json.Unmarshal([]byte(raw), &items); err == nil {
		return items
	}
	parts := strings.FieldsFunc(raw, func(r rune) bool { return r == ',' || r == '\n' || r == ';' })
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		if part = strings.TrimSpace(part); part != "" {
			out = append(out, part)
		}
	}
	return out
}

func clamp(value, minValue, maxValue int) int {
	if value < minValue {
		return minValue
	}
	if value > maxValue {
		return maxValue
	}
	return value
}

func localHour(t time.Time) int {
	return t.In(time.FixedZone("UTC+8", 8*60*60)).Hour()
}
