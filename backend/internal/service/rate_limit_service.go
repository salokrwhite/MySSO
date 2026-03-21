package service

import (
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"

	"mysso/backend/internal/domain"
)

type SecurityFlowError struct {
	Code              string
	RetryAfterSeconds int
}

func (e *SecurityFlowError) Error() string {
	return e.Code
}

type SendChallengeResult struct {
	ChallengeToken  string
	ExpiresIn       int
	CaptchaRequired bool
}

type publicSendOptions struct {
	Channel        string
	Purpose        string
	Target         string
	ChallengeToken string
	CaptchaToken   string
	IP             string
	UserAgent      string
}

type RateLimitService struct {
	deps     *serviceDeps
	settings *SettingsService
}

type authAttemptOptions struct {
	Kind       string
	Identifier string
	IP         string
	DeviceID   string
}

type authAttemptPolicy struct {
	AccountLimit int
	IPLimit      int
	DeviceLimit  int
	Window       time.Duration
	LockDuration time.Duration
}

func (s *RateLimitService) CreateSendChallenge(purpose, channel, target, ip, userAgent string) (SendChallengeResult, error) {
	settings, err := s.settings.GetSystemSettings()
	if err != nil {
		return SendChallengeResult{}, err
	}
	channel = normalizeSendChannel(channel)
	purpose = strings.ToLower(strings.TrimSpace(purpose))
	target = normalizeTarget(channel, target)
	ip = strings.TrimSpace(ip)
	userAgent = strings.TrimSpace(userAgent)
	if channel == "" || purpose == "" {
		return SendChallengeResult{}, &SecurityFlowError{Code: "challenge_required"}
	}
	if !settings.SendChallengeEnabled {
		return SendChallengeResult{ExpiresIn: settings.ChallengeTokenTTLSeconds}, nil
	}
	challengeRequired, err := s.shouldRequireChallenge(settings, channel, ip)
	if err != nil {
		return SendChallengeResult{}, err
	}
	if !challengeRequired {
		return SendChallengeResult{ExpiresIn: settings.ChallengeTokenTTLSeconds}, nil
	}
	captchaRequired, err := s.shouldRequireCaptcha(settings, channel, ip)
	if err != nil {
		return SendChallengeResult{}, err
	}
	token, err := generateOpaqueToken(24)
	if err != nil {
		return SendChallengeResult{}, err
	}
	now := time.Now().UTC()
	ttlSeconds := settings.ChallengeTokenTTLSeconds
	challenge := domain.RequestChallenge{
		Token:         token,
		Purpose:       purpose,
		Channel:       channel,
		IPHash:        hashValue(ip),
		UAHash:        hashValue(userAgent),
		TargetHash:    hashValue(target),
		CaptchaPassed: !captchaRequired,
		ExpiresAt:     now.Add(time.Duration(ttlSeconds) * time.Second),
		CreatedAt:     now,
	}
	if err := s.deps.store.SaveRequestChallenge(challenge); err != nil {
		return SendChallengeResult{}, err
	}
	return SendChallengeResult{
		ChallengeToken:  token,
		ExpiresIn:       ttlSeconds,
		CaptchaRequired: captchaRequired,
	}, nil
}

func (s *RateLimitService) ValidateAndRecordPublicSend(opts publicSendOptions) error {
	settings, err := s.settings.GetSystemSettings()
	if err != nil {
		return err
	}
	if !settings.RateLimitEnabled {
		return nil
	}
	now := time.Now().UTC()
	channel := normalizeSendChannel(opts.Channel)
	purpose := strings.ToLower(strings.TrimSpace(opts.Purpose))
	target := normalizeTarget(channel, opts.Target)
	ip := strings.TrimSpace(opts.IP)
	userAgent := strings.TrimSpace(opts.UserAgent)

	if err := s.ensureCircuitClosed(settings, channel, now); err != nil {
		_ = s.appendRateLimitEvent(channel, purpose, target, ip, userAgent, "blocked", "circuit_open")
		return err
	}
	challengeRequired, err := s.shouldRequireChallenge(settings, channel, ip)
	if err != nil {
		return err
	}
	if settings.SendChallengeEnabled && challengeRequired {
		challenge, err := s.validateChallenge(settings, opts, channel, purpose, target, ip, userAgent)
		if err != nil {
			_ = s.appendRateLimitEvent(channel, purpose, target, ip, userAgent, "blocked", err.Error())
			return err
		}
		if err := s.deps.store.ConsumeRequestChallenge(challenge.Token, now); err != nil {
			_ = s.appendRateLimitEvent(channel, purpose, target, ip, userAgent, "blocked", "challenge_required")
			return &SecurityFlowError{Code: "challenge_required"}
		}
	}
	if err := s.checkTargetCooldown(settings, channel, target, now); err != nil {
		_ = s.appendRateLimitEvent(channel, purpose, target, ip, userAgent, "blocked", err.Error())
		return err
	}
	if err := s.checkSourceLimits(settings, channel, ip, target, now); err != nil {
		_ = s.appendRateLimitEvent(channel, purpose, target, ip, userAgent, "blocked", err.Error())
		return err
	}
	if err := s.checkGlobalLimits(settings, channel, now); err != nil {
		_ = s.appendRateLimitEvent(channel, purpose, target, ip, userAgent, "blocked", err.Error())
		return err
	}
	if err := s.recordSendCounters(settings, channel, target, ip, now); err != nil {
		return err
	}
	_ = s.appendRateLimitEvent(channel, purpose, target, ip, userAgent, "sent", "sent")
	return nil
}

func (s *RateLimitService) CheckAdminTestSend(adminID, channel string) error {
	settings, err := s.settings.GetSystemSettings()
	if err != nil {
		return err
	}
	if !settings.RateLimitEnabled {
		return nil
	}
	now := time.Now().UTC()
	channel = normalizeSendChannel(channel)
	minuteKey := fmt.Sprintf("admin:test_%s:user:minute:%s", channel, strings.TrimSpace(adminID))
	dailyKey := fmt.Sprintf("admin:test_%s:user:day:%s:%s", channel, strings.TrimSpace(adminID), now.Format("20060102"))
	dayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	dayEnd := dayStart.Add(24 * time.Hour)
	if channel == "email" {
		if settings.AdminTestEmailMinuteLimit > 0 {
			counter, err := s.deps.store.GetRateLimitCounter(minuteKey)
			if err == nil && counter.Count >= settings.AdminTestEmailMinuteLimit {
				return &SecurityFlowError{Code: "rate_limit_exceeded"}
			}
		}
		if settings.AdminTestEmailDailyLimit > 0 {
			counter, err := s.deps.store.GetRateLimitCounter(dailyKey)
			if err == nil && counter.Count >= settings.AdminTestEmailDailyLimit {
				return &SecurityFlowError{Code: "rate_limit_exceeded"}
			}
		}
	} else {
		if settings.AdminTestSMSMinuteLimit > 0 {
			counter, err := s.deps.store.GetRateLimitCounter(minuteKey)
			if err == nil && counter.Count >= settings.AdminTestSMSMinuteLimit {
				return &SecurityFlowError{Code: "rate_limit_exceeded"}
			}
		}
		if settings.AdminTestSMSDailyLimit > 0 {
			counter, err := s.deps.store.GetRateLimitCounter(dailyKey)
			if err == nil && counter.Count >= settings.AdminTestSMSDailyLimit {
				return &SecurityFlowError{Code: "rate_limit_exceeded"}
			}
		}
	}
	if _, err := s.deps.store.IncrementRateLimitCounter(minuteKey, "minute", now.Truncate(time.Minute), now.Truncate(time.Minute).Add(time.Minute), 1); err != nil {
		return err
	}
	_, err = s.deps.store.IncrementRateLimitCounter(dailyKey, "day", dayStart, dayEnd, 1)
	return err
}

func (s *RateLimitService) CheckAuthAttempt(opts authAttemptOptions) error {
	settings, err := s.settings.GetSystemSettings()
	if err != nil {
		return err
	}
	if !settings.RateLimitEnabled {
		return nil
	}

	retryAfter := 0
	now := time.Now().UTC()
	for _, counterKey := range s.authAttemptLockKeys(opts) {
		counter, err := s.deps.store.GetRateLimitCounter(counterKey)
		if err != nil || !counter.ExpiresAt.After(now) {
			continue
		}
		remaining := int(counter.ExpiresAt.Sub(now).Seconds())
		if remaining < 1 {
			remaining = 1
		}
		if remaining > retryAfter {
			retryAfter = remaining
		}
	}
	if retryAfter > 0 {
		_ = s.appendRateLimitEvent("auth", opts.Kind, opts.Identifier, opts.IP, opts.DeviceID, "blocked", "auth_attempt_locked")
		return &SecurityFlowError{Code: "rate_limit_exceeded", RetryAfterSeconds: retryAfter}
	}
	return nil
}

func (s *RateLimitService) RecordFailedAuthAttempt(opts authAttemptOptions) error {
	settings, err := s.settings.GetSystemSettings()
	if err != nil {
		return err
	}
	if !settings.RateLimitEnabled {
		return nil
	}

	policy := authAttemptPolicyForKind(opts.Kind, settings)
	now := time.Now().UTC()
	type dimension struct {
		counterKey string
		lockKey    string
		limit      int
		rule       string
	}
	dimensions := make([]dimension, 0, 3)
	if key := strings.TrimSpace(opts.Identifier); key != "" && policy.AccountLimit > 0 {
		dimensions = append(dimensions, dimension{
			counterKey: fmt.Sprintf("auth:%s:fail:account:%s", opts.Kind, hashValue(key)),
			lockKey:    fmt.Sprintf("auth:%s:lock:account:%s", opts.Kind, hashValue(key)),
			limit:      policy.AccountLimit,
			rule:       "account_consecutive_failures",
		})
	}
	if key := strings.TrimSpace(opts.IP); key != "" && policy.IPLimit > 0 {
		dimensions = append(dimensions, dimension{
			counterKey: fmt.Sprintf("auth:%s:fail:ip:%s", opts.Kind, hashValue(key)),
			lockKey:    fmt.Sprintf("auth:%s:lock:ip:%s", opts.Kind, hashValue(key)),
			limit:      policy.IPLimit,
			rule:       "ip_consecutive_failures",
		})
	}
	if key := strings.TrimSpace(opts.DeviceID); key != "" && policy.DeviceLimit > 0 {
		dimensions = append(dimensions, dimension{
			counterKey: fmt.Sprintf("auth:%s:fail:device:%s", opts.Kind, hashValue(key)),
			lockKey:    fmt.Sprintf("auth:%s:lock:device:%s", opts.Kind, hashValue(key)),
			limit:      policy.DeviceLimit,
			rule:       "device_consecutive_failures",
		})
	}

	triggered := false
	matchedRule := "auth_attempt_failed"
	for _, item := range dimensions {
		counter, err := s.deps.store.IncrementRateLimitCounter(item.counterKey, "auth_fail", time.Time{}, now.Add(policy.Window), 1)
		if err != nil {
			return err
		}
		if counter.Count < item.limit {
			continue
		}
		triggered = true
		matchedRule = item.rule
		if err := s.deps.store.SetRateLimitCounter(domain.RateLimitCounter{
			CounterKey:      item.lockKey,
			WindowType:      "auth_lock",
			Count:           counter.Count,
			WindowStartedAt: now,
			ExpiresAt:       now.Add(policy.LockDuration),
			UpdatedAt:       now,
		}); err != nil {
			return err
		}
	}

	if triggered {
		_ = s.appendRateLimitEvent("auth", opts.Kind, opts.Identifier, opts.IP, opts.DeviceID, "blocked", matchedRule)
		return &SecurityFlowError{Code: "rate_limit_exceeded", RetryAfterSeconds: int(policy.LockDuration.Seconds())}
	}
	_ = s.appendRateLimitEvent("auth", opts.Kind, opts.Identifier, opts.IP, opts.DeviceID, "failed", matchedRule)
	return nil
}

func (s *RateLimitService) CheckAndRecordAuthAction(opts authAttemptOptions) error {
	settings, err := s.settings.GetSystemSettings()
	if err != nil {
		return err
	}
	if !settings.RateLimitEnabled {
		return nil
	}

	policy := authAttemptPolicyForKind(opts.Kind, settings)
	now := time.Now().UTC()
	type dimension struct {
		counterKey string
		limit      int
		rule       string
	}
	dimensions := make([]dimension, 0, 3)
	if key := strings.TrimSpace(opts.Identifier); key != "" && policy.AccountLimit > 0 {
		dimensions = append(dimensions, dimension{
			counterKey: fmt.Sprintf("auth:%s:action:account:%s", opts.Kind, hashValue(key)),
			limit:      policy.AccountLimit,
			rule:       "account_action_limit",
		})
	}
	if key := strings.TrimSpace(opts.IP); key != "" && policy.IPLimit > 0 {
		dimensions = append(dimensions, dimension{
			counterKey: fmt.Sprintf("auth:%s:action:ip:%s", opts.Kind, hashValue(key)),
			limit:      policy.IPLimit,
			rule:       "ip_action_limit",
		})
	}
	if key := strings.TrimSpace(opts.DeviceID); key != "" && policy.DeviceLimit > 0 {
		dimensions = append(dimensions, dimension{
			counterKey: fmt.Sprintf("auth:%s:action:device:%s", opts.Kind, hashValue(key)),
			limit:      policy.DeviceLimit,
			rule:       "device_action_limit",
		})
	}

	retryAfter := 0
	matchedRule := "auth_action_limit"
	for _, item := range dimensions {
		counter, err := s.deps.store.GetRateLimitCounter(item.counterKey)
		if err != nil || !counter.ExpiresAt.After(now) {
			continue
		}
		if counter.Count < item.limit {
			continue
		}
		remaining := int(counter.ExpiresAt.Sub(now).Seconds())
		if remaining < 1 {
			remaining = 1
		}
		if remaining > retryAfter {
			retryAfter = remaining
			matchedRule = item.rule
		}
	}
	if retryAfter > 0 {
		_ = s.appendRateLimitEvent("auth", opts.Kind, opts.Identifier, opts.IP, opts.DeviceID, "blocked", matchedRule)
		return &SecurityFlowError{Code: "rate_limit_exceeded", RetryAfterSeconds: retryAfter}
	}

	for _, item := range dimensions {
		if _, err := s.deps.store.IncrementRateLimitCounter(item.counterKey, "auth_action", time.Time{}, now.Add(policy.Window), 1); err != nil {
			return err
		}
	}
	_ = s.appendRateLimitEvent("auth", opts.Kind, opts.Identifier, opts.IP, opts.DeviceID, "sent", "auth_action_recorded")
	return nil
}

func (s *RateLimitService) ResetAuthAttempts(opts authAttemptOptions) error {
	for _, counterKey := range s.authAttemptCounterKeys(opts) {
		if err := s.deps.store.DeleteRateLimitCounter(counterKey); err != nil {
			return err
		}
	}
	for _, counterKey := range s.authAttemptLockKeys(opts) {
		if err := s.deps.store.DeleteRateLimitCounter(counterKey); err != nil {
			return err
		}
	}
	return nil
}

func (s *RateLimitService) authAttemptCounterKeys(opts authAttemptOptions) []string {
	keys := make([]string, 0, 3)
	if key := strings.TrimSpace(opts.Identifier); key != "" {
		keys = append(keys, fmt.Sprintf("auth:%s:fail:account:%s", opts.Kind, hashValue(key)))
	}
	if key := strings.TrimSpace(opts.IP); key != "" {
		keys = append(keys, fmt.Sprintf("auth:%s:fail:ip:%s", opts.Kind, hashValue(key)))
	}
	if key := strings.TrimSpace(opts.DeviceID); key != "" {
		keys = append(keys, fmt.Sprintf("auth:%s:fail:device:%s", opts.Kind, hashValue(key)))
	}
	return keys
}

func (s *RateLimitService) authAttemptLockKeys(opts authAttemptOptions) []string {
	keys := make([]string, 0, 3)
	if key := strings.TrimSpace(opts.Identifier); key != "" {
		keys = append(keys, fmt.Sprintf("auth:%s:lock:account:%s", opts.Kind, hashValue(key)))
	}
	if key := strings.TrimSpace(opts.IP); key != "" {
		keys = append(keys, fmt.Sprintf("auth:%s:lock:ip:%s", opts.Kind, hashValue(key)))
	}
	if key := strings.TrimSpace(opts.DeviceID); key != "" {
		keys = append(keys, fmt.Sprintf("auth:%s:lock:device:%s", opts.Kind, hashValue(key)))
	}
	return keys
}

func authAttemptPolicyForKind(kind string, settings SystemSettings) authAttemptPolicy {
	accountLimit := settings.PasswordLoginAccountAttemptLimit
	switch strings.TrimSpace(kind) {
	case "email_otp_login", "sms_otp_login", "email_code_verify", "sms_code_verify", "register_code_verify":
		accountLimit = settings.OTPLoginAccountAttemptLimit
	case "mfa_login", "mfa_reauth", "mfa_resend":
		accountLimit = settings.MFALoginAccountAttemptLimit
	case "password_reauth":
		accountLimit = settings.PasswordLoginAccountAttemptLimit
	}
	return authAttemptPolicy{
		AccountLimit: accountLimit,
		IPLimit:      settings.AuthAttemptIPLimit,
		DeviceLimit:  settings.AuthAttemptDeviceLimit,
		Window:       time.Duration(settings.AuthAttemptWindowMinutes) * time.Minute,
		LockDuration: time.Duration(settings.AuthAttemptLockMinutes) * time.Minute,
	}
}

func (s *RateLimitService) shouldRequireChallenge(settings SystemSettings, channel, ip string) (bool, error) {
	if !settings.SendChallengeEnabled {
		return false, nil
	}
	if settings.ChallengeRequiredAfterIPMinuteCount <= 0 {
		return true, nil
	}
	minuteKey := fmt.Sprintf("%s:ip:minute:%s", channel, strings.TrimSpace(ip))
	counter, err := s.deps.store.GetRateLimitCounter(minuteKey)
	if err != nil {
		return false, nil
	}
	return counter.Count+1 >= settings.ChallengeRequiredAfterIPMinuteCount, nil
}

func (s *RateLimitService) shouldRequireCaptcha(settings SystemSettings, channel, ip string) (bool, error) {
	if settings.CaptchaRequiredAfterIPHourCount <= 0 {
		return false, nil
	}
	hourKey := fmt.Sprintf("%s:ip:hour:%s", channel, strings.TrimSpace(ip))
	counter, err := s.deps.store.GetRateLimitCounter(hourKey)
	if err != nil {
		return false, nil
	}
	return counter.Count >= settings.CaptchaRequiredAfterIPHourCount, nil
}

func (s *RateLimitService) validateChallenge(settings SystemSettings, opts publicSendOptions, channel, purpose, target, ip, userAgent string) (domain.RequestChallenge, error) {
	challengeToken := strings.TrimSpace(opts.ChallengeToken)
	if challengeToken == "" {
		return domain.RequestChallenge{}, &SecurityFlowError{Code: "challenge_required"}
	}
	challenge, err := s.deps.store.GetRequestChallenge(challengeToken)
	if err != nil {
		return domain.RequestChallenge{}, &SecurityFlowError{Code: "challenge_required"}
	}
	if challenge.Channel != channel || challenge.Purpose != purpose {
		return domain.RequestChallenge{}, &SecurityFlowError{Code: "challenge_required"}
	}
	if challenge.IPHash != hashValue(ip) || challenge.UAHash != hashValue(userAgent) {
		return domain.RequestChallenge{}, &SecurityFlowError{Code: "challenge_required"}
	}
	if challenge.TargetHash != "" && challenge.TargetHash != hashValue(target) {
		return domain.RequestChallenge{}, &SecurityFlowError{Code: "challenge_required"}
	}
	if !challenge.CaptchaPassed {
		if strings.TrimSpace(opts.CaptchaToken) == "" {
			return domain.RequestChallenge{}, &SecurityFlowError{Code: "captcha_required"}
		}
	}
	return challenge, nil
}

func (s *RateLimitService) checkTargetCooldown(settings SystemSettings, channel, target string, now time.Time) error {
	var cooldown int
	var key string
	switch channel {
	case "email":
		cooldown = settings.EmailTargetCooldownSeconds
		key = fmt.Sprintf("email:target:cooldown:%s", hashValue(target))
	case "sms":
		cooldown = settings.SMSTargetCooldownSeconds
		key = fmt.Sprintf("sms:target:cooldown:%s", hashValue(target))
	default:
		return nil
	}
	if cooldown <= 0 {
		return nil
	}
	counter, err := s.deps.store.GetRateLimitCounter(key)
	if err == nil && counter.ExpiresAt.After(now) {
		retryAfter := int(counter.ExpiresAt.Sub(now).Seconds())
		if retryAfter < 1 {
			retryAfter = 1
		}
		return &SecurityFlowError{Code: "cooldown_active", RetryAfterSeconds: retryAfter}
	}
	return nil
}

func (s *RateLimitService) checkSourceLimits(settings SystemSettings, channel, ip, target string, now time.Time) error {
	var minuteLimit, hourLimit, uniqueLimit int
	switch channel {
	case "email":
		minuteLimit = settings.EmailIPMinuteLimit
		hourLimit = settings.EmailIPHourLimit
		uniqueLimit = settings.EmailIPHourUniqueTargetLimit
	case "sms":
		minuteLimit = settings.SMSIPMinuteLimit
		hourLimit = settings.SMSIPHourLimit
		uniqueLimit = settings.SMSIPHourUniqueTargetLimit
	default:
		return nil
	}
	minuteKey := fmt.Sprintf("%s:ip:minute:%s", channel, ip)
	hourKey := fmt.Sprintf("%s:ip:hour:%s", channel, ip)
	if minuteLimit > 0 {
		counter, err := s.deps.store.GetRateLimitCounter(minuteKey)
		if err == nil && counter.Count >= minuteLimit {
			return &SecurityFlowError{Code: "rate_limit_exceeded"}
		}
	}
	if hourLimit > 0 {
		counter, err := s.deps.store.GetRateLimitCounter(hourKey)
		if err == nil && counter.Count >= hourLimit {
			return &SecurityFlowError{Code: "rate_limit_exceeded"}
		}
	}
	if uniqueLimit > 0 {
		uniqueKey := fmt.Sprintf("%s:ip:unique_target:hour:%s:%s", channel, ip, hashValue(target))
		if _, err := s.deps.store.GetRateLimitCounter(uniqueKey); err != nil {
			count, countErr := s.deps.store.CountActiveRateLimitCountersByPrefix(fmt.Sprintf("%s:ip:unique_target:hour:%s:", channel, ip), now)
			if countErr != nil {
				return countErr
			}
			if count >= uniqueLimit {
				return &SecurityFlowError{Code: "rate_limit_exceeded"}
			}
		}
	}
	return nil
}

func (s *RateLimitService) checkGlobalLimits(settings SystemSettings, channel string, now time.Time) error {
	var minuteLimit, hourLimit, fuseMinutes int
	switch channel {
	case "email":
		minuteLimit = settings.EmailGlobalMinuteLimit
		hourLimit = settings.EmailGlobalHourLimit
		fuseMinutes = settings.EmailFuseMinutes
	case "sms":
		minuteLimit = settings.SMSGlobalMinuteLimit
		hourLimit = settings.SMSGlobalHourLimit
		fuseMinutes = settings.SMSFuseMinutes
	default:
		return nil
	}
	minuteKey := fmt.Sprintf("%s:global:minute:%s", channel, now.Format("200601021504"))
	hourKey := fmt.Sprintf("%s:global:hour:%s", channel, now.Format("2006010215"))
	if minuteLimit > 0 {
		counter, err := s.deps.store.GetRateLimitCounter(minuteKey)
		if err == nil && counter.Count >= minuteLimit {
			_ = s.openCircuit(channel, fuseMinutes, now)
			return &SecurityFlowError{Code: "circuit_open"}
		}
	}
	if hourLimit > 0 {
		counter, err := s.deps.store.GetRateLimitCounter(hourKey)
		if err == nil && counter.Count >= hourLimit {
			_ = s.openCircuit(channel, fuseMinutes, now)
			return &SecurityFlowError{Code: "circuit_open"}
		}
	}
	return nil
}

func (s *RateLimitService) recordSendCounters(settings SystemSettings, channel, target, ip string, now time.Time) error {
	minuteStart := now.Truncate(time.Minute)
	hourStart := now.Truncate(time.Hour)
	if _, err := s.deps.store.IncrementRateLimitCounter(fmt.Sprintf("%s:ip:minute:%s", channel, ip), "minute", minuteStart, minuteStart.Add(time.Minute), 1); err != nil {
		return err
	}
	if _, err := s.deps.store.IncrementRateLimitCounter(fmt.Sprintf("%s:ip:hour:%s", channel, ip), "hour", hourStart, hourStart.Add(time.Hour), 1); err != nil {
		return err
	}
	uniqueKey := fmt.Sprintf("%s:ip:unique_target:hour:%s:%s", channel, ip, hashValue(target))
	if _, err := s.deps.store.GetRateLimitCounter(uniqueKey); err != nil {
		if err := s.deps.store.SetRateLimitCounter(domain.RateLimitCounter{
			CounterKey:      uniqueKey,
			WindowType:      "hour",
			Count:           1,
			WindowStartedAt: hourStart,
			ExpiresAt:       hourStart.Add(time.Hour),
			UpdatedAt:       now,
		}); err != nil {
			return err
		}
	}
	if _, err := s.deps.store.IncrementRateLimitCounter(fmt.Sprintf("%s:global:minute:%s", channel, now.Format("200601021504")), "minute", minuteStart, minuteStart.Add(time.Minute), 1); err != nil {
		return err
	}
	if _, err := s.deps.store.IncrementRateLimitCounter(fmt.Sprintf("%s:global:hour:%s", channel, now.Format("2006010215")), "hour", hourStart, hourStart.Add(time.Hour), 1); err != nil {
		return err
	}
	targetCooldownKey := fmt.Sprintf("%s:target:cooldown:%s", channel, hashValue(target))
	cooldownSeconds := settings.EmailTargetCooldownSeconds
	if channel == "sms" {
		cooldownSeconds = settings.SMSTargetCooldownSeconds
	}
	if cooldownSeconds > 0 {
		if err := s.deps.store.SetRateLimitCounter(domain.RateLimitCounter{
			CounterKey:      targetCooldownKey,
			WindowType:      "cooldown",
			Count:           1,
			WindowStartedAt: now,
			ExpiresAt:       now.Add(time.Duration(cooldownSeconds) * time.Second),
			UpdatedAt:       now,
		}); err != nil {
			return err
		}
	}
	return nil
}

func (s *RateLimitService) ensureCircuitClosed(settings SystemSettings, channel string, now time.Time) error {
	counter, err := s.deps.store.GetRateLimitCounter(fmt.Sprintf("%s:fuse", channel))
	if err != nil {
		return nil
	}
	if counter.ExpiresAt.After(now) {
		return &SecurityFlowError{Code: "circuit_open", RetryAfterSeconds: int(counter.ExpiresAt.Sub(now).Seconds())}
	}
	return nil
}

func (s *RateLimitService) openCircuit(channel string, fuseMinutes int, now time.Time) error {
	if fuseMinutes <= 0 {
		return nil
	}
	return s.deps.store.SetRateLimitCounter(domain.RateLimitCounter{
		CounterKey:      fmt.Sprintf("%s:fuse", channel),
		WindowType:      "fuse",
		Count:           1,
		WindowStartedAt: now,
		ExpiresAt:       now.Add(time.Duration(fuseMinutes) * time.Minute),
		UpdatedAt:       now,
	})
}

func (s *RateLimitService) appendRateLimitEvent(channel, purpose, target, ip, userAgent, result, rule string) error {
	return s.deps.store.AppendRateLimitEvent(domain.RateLimitEvent{
		ID:            uuid.NewString(),
		Channel:       channel,
		Purpose:       purpose,
		TargetHash:    hashValue(target),
		SourceIP:      strings.TrimSpace(ip),
		UserAgentHash: hashValue(userAgent),
		Result:        result,
		MatchedRule:   rule,
		CreatedAt:     time.Now().UTC(),
	})
}

func normalizeSendChannel(channel string) string {
	switch strings.ToLower(strings.TrimSpace(channel)) {
	case "email":
		return "email"
	case "sms":
		return "sms"
	default:
		return ""
	}
}

func normalizeTarget(channel, target string) string {
	target = strings.TrimSpace(target)
	if channel == "email" {
		return strings.ToLower(target)
	}
	return target
}
