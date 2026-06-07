package captcha

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/mojocn/base64Captcha"
)

const (
	DefaultTTL       = 5 * time.Minute
	MaxTTL           = 15 * time.Minute
	ChallengeTTL     = 2 * time.Minute
	MaxChallengeTTL  = 5 * time.Minute
	defaultMaxSize   = 10000
	contextMaxLength = 1024
)

var (
	ErrDisabled         = errors.New("captcha is disabled")
	ErrInvalid          = errors.New("captcha is invalid or expired")
	ErrInvalidChallenge = errors.New("captcha challenge is invalid or expired")
	ErrChallengeUsed    = errors.New("captcha challenge is already used")
)

type Settings struct {
	Enabled            bool
	Height             int
	Width              int
	Mode               int
	ComplexOfNoiseText int
	ComplexOfNoiseDot  int
	IsShowHollowLine   bool
	IsShowNoiseDot     bool
	IsShowNoiseText    bool
	IsShowSlimeLine    bool
	IsShowSineLine     bool
	Length             int
	TTL                time.Duration
}

type Response struct {
	Image  string `json:"image"`
	Ticket string `json:"ticket"`
}

type ChallengeRequest struct {
	Flow    string
	Purpose string
	Target  string
	Subject string
	IP      string
}

type ChallengeResponse struct {
	Challenge string `json:"challenge"`
	Sign      string `json:"sign"`
	ExpiresAt int64  `json:"expires_at"`
}

type entry struct {
	answer      string
	challengeID string
	expiresAt   time.Time
}

type challengeEntry struct {
	contextHash string
	expiresAt   time.Time
	generated   bool
	consumed    bool
}

type Service struct {
	mu         sync.Mutex
	items      map[string]entry
	challenges map[string]challengeEntry
	secret     []byte
	lastGC     time.Time
	maxSize    int
}

func NewService(secret string) *Service {
	secret = strings.TrimSpace(secret)
	if secret == "" {
		secret = runtimeSecret()
	}
	return &Service{
		items:      map[string]entry{},
		challenges: map[string]challengeEntry{},
		secret:     []byte(secret),
		maxSize:    defaultMaxSize,
	}
}

func runtimeSecret() string {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return uuid.NewString()
	}
	return base64.RawURLEncoding.EncodeToString(buf)
}

func NormalizeSettings(settings Settings) Settings {
	if settings.Height < 32 {
		settings.Height = 32
	}
	if settings.Height > 160 {
		settings.Height = 160
	}
	if settings.Width < 96 {
		settings.Width = 96
	}
	if settings.Width > 480 {
		settings.Width = 480
	}
	if settings.Mode < 0 || settings.Mode > 3 {
		settings.Mode = 3
	}
	if settings.ComplexOfNoiseText < 0 {
		settings.ComplexOfNoiseText = 0
	}
	if settings.ComplexOfNoiseText > 10 {
		settings.ComplexOfNoiseText = 10
	}
	if settings.ComplexOfNoiseDot < 0 {
		settings.ComplexOfNoiseDot = 0
	}
	if settings.ComplexOfNoiseDot > 10 {
		settings.ComplexOfNoiseDot = 10
	}
	if settings.Length < 4 {
		settings.Length = 4
	}
	if settings.Length > 8 {
		settings.Length = 8
	}
	if settings.TTL <= 0 {
		settings.TTL = DefaultTTL
	}
	if settings.TTL > MaxTTL {
		settings.TTL = MaxTTL
	}
	return settings
}

func (s *Service) CreateChallenge(req ChallengeRequest, ttl time.Duration) (*ChallengeResponse, error) {
	contextHash := req.contextHash()
	if contextHash == "" {
		return nil, ErrInvalidChallenge
	}
	if ttl <= 0 {
		ttl = ChallengeTTL
	}
	if ttl > MaxChallengeTTL {
		ttl = MaxChallengeTTL
	}
	id, err := randomTicket()
	if err != nil {
		return nil, err
	}
	now := time.Now().UTC()
	expiresAt := now.Add(ttl)

	s.mu.Lock()
	defer s.mu.Unlock()
	s.gcLocked(now)
	if len(s.challenges) >= s.maxSize {
		return nil, errors.New("captcha challenge store is full")
	}
	s.challenges[id] = challengeEntry{
		contextHash: contextHash,
		expiresAt:   expiresAt,
	}
	return &ChallengeResponse{
		Challenge: id,
		Sign:      s.sign(id, contextHash, expiresAt.Unix()),
		ExpiresAt: expiresAt.Unix(),
	}, nil
}

func (s *Service) Generate(settings Settings, challengeID, sign string, req ChallengeRequest) (*Response, error) {
	settings = NormalizeSettings(settings)
	if !settings.Enabled {
		return nil, ErrDisabled
	}
	contextHash := req.contextHash()
	if contextHash == "" {
		return nil, ErrInvalidChallenge
	}
	challengeID = strings.TrimSpace(challengeID)
	sign = strings.TrimSpace(sign)

	config := base64Captcha.ConfigCharacter{
		Height:             settings.Height,
		Width:              settings.Width,
		Mode:               settings.Mode,
		ComplexOfNoiseText: settings.ComplexOfNoiseText,
		ComplexOfNoiseDot:  settings.ComplexOfNoiseDot,
		IsShowHollowLine:   settings.IsShowHollowLine,
		IsShowNoiseDot:     settings.IsShowNoiseDot,
		IsShowNoiseText:    settings.IsShowNoiseText,
		IsShowSlimeLine:    settings.IsShowSlimeLine,
		IsShowSineLine:     settings.IsShowSineLine,
		CaptchaLen:         settings.Length,
	}
	charItem := base64Captcha.EngineCharCreate(config)
	ticket, err := randomTicket()
	if err != nil {
		return nil, err
	}

	now := time.Now().UTC()
	s.mu.Lock()
	defer s.mu.Unlock()
	s.gcLocked(now)
	if len(s.items) >= s.maxSize {
		return nil, errors.New("captcha store is full")
	}
	challenge, ok := s.challenges[challengeID]
	if !ok || now.After(challenge.expiresAt) || challenge.consumed || challenge.contextHash != contextHash {
		return nil, ErrInvalidChallenge
	}
	if challenge.generated {
		return nil, ErrChallengeUsed
	}
	if !s.verifySign(challengeID, contextHash, challenge.expiresAt.Unix(), sign) {
		return nil, ErrInvalidChallenge
	}
	challenge.generated = true
	s.challenges[challengeID] = challenge
	s.items[ticket] = entry{
		answer:      strings.ToLower(strings.TrimSpace(charItem.VerifyValue)),
		challengeID: challengeID,
		expiresAt:   now.Add(settings.TTL),
	}

	return &Response{
		Image:  base64Captcha.CaptchaWriteToBase64Encoding(charItem),
		Ticket: ticket,
	}, nil
}

func (s *Service) Verify(ticket, answer, challengeID, sign string, req ChallengeRequest) bool {
	ticket = strings.TrimSpace(ticket)
	answer = strings.ToLower(strings.TrimSpace(answer))
	challengeID = strings.TrimSpace(challengeID)
	sign = strings.TrimSpace(sign)
	contextHash := req.contextHash()
	if ticket == "" || answer == "" || challengeID == "" || sign == "" || contextHash == "" {
		return false
	}

	now := time.Now().UTC()
	s.mu.Lock()
	defer s.mu.Unlock()
	s.gcLocked(now)

	item, ok := s.items[ticket]
	if !ok {
		return false
	}
	delete(s.items, ticket)
	if now.After(item.expiresAt) {
		return false
	}
	challenge, ok := s.challenges[challengeID]
	if !ok || now.After(challenge.expiresAt) || challenge.consumed || !challenge.generated {
		return false
	}
	if item.challengeID != challengeID || challenge.contextHash != contextHash {
		return false
	}
	if !s.verifySign(challengeID, contextHash, challenge.expiresAt.Unix(), sign) {
		return false
	}
	if item.answer != answer {
		return false
	}
	challenge.consumed = true
	s.challenges[challengeID] = challenge
	delete(s.challenges, challengeID)
	return true
}

func (s *Service) gcLocked(now time.Time) {
	if now.Sub(s.lastGC) < time.Minute {
		return
	}
	for ticket, item := range s.items {
		if now.After(item.expiresAt) {
			delete(s.items, ticket)
		}
	}
	for challengeID, item := range s.challenges {
		if now.After(item.expiresAt) || item.consumed {
			delete(s.challenges, challengeID)
		}
	}
	s.lastGC = now
}

func (s *Service) sign(challengeID, contextHash string, expiresAt int64) string {
	mac := hmac.New(sha256.New, s.secret)
	_, _ = mac.Write([]byte(fmt.Sprintf("%s.%s.%d", challengeID, contextHash, expiresAt)))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}

func (s *Service) verifySign(challengeID, contextHash string, expiresAt int64, sign string) bool {
	expected, err := base64.RawURLEncoding.DecodeString(s.sign(challengeID, contextHash, expiresAt))
	if err != nil {
		return false
	}
	actual, err := base64.RawURLEncoding.DecodeString(strings.TrimSpace(sign))
	if err != nil {
		return false
	}
	return hmac.Equal(actual, expected)
}

func (r ChallengeRequest) contextHash() string {
	flow := normalizeContextPart(r.Flow)
	purpose := normalizeContextPart(r.Purpose)
	target := normalizeContextPart(r.Target)
	subject := normalizeContextPart(r.Subject)
	ip := normalizeContextPart(r.IP)
	if flow == "" || purpose == "" || target == "" || ip == "" {
		return ""
	}
	raw := strings.Join([]string{flow, purpose, target, subject, ip}, "\x00")
	if len(raw) > contextMaxLength {
		return ""
	}
	sum := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(sum[:])
}

func normalizeContextPart(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

func randomTicket() (string, error) {
	var buf [24]byte
	if _, err := rand.Read(buf[:]); err != nil {
		return "", err
	}
	return hex.EncodeToString(buf[:]), nil
}
