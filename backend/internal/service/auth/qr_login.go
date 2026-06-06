package auth

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"strings"
	"time"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/service/settings"
)

const qrLoginChallengeTTL = 2 * time.Minute

type QRLoginCreateResult struct {
	ChallengeToken string
	ScanToken      string
	ExpiresAt      time.Time
}

type QRLoginStatusResult struct {
	Status    domain.QRLoginStatus
	ExpiresAt time.Time
	User      domain.User
	Session   domain.Session
}

func (s *AuthService) CreateQRLoginChallenge(ip, userAgent string) (QRLoginCreateResult, error) {
	if s.settings == nil || !s.settings.IsQRLoginEnabled() {
		return QRLoginCreateResult{}, fmt.Errorf("qr login is disabled")
	}
	now := time.Now().UTC()
	challengeToken, err := randomURLToken(32)
	if err != nil {
		return QRLoginCreateResult{}, err
	}
	scanToken, err := randomURLToken(32)
	if err != nil {
		return QRLoginCreateResult{}, err
	}
	challenge := domain.QRLoginChallenge{
		ChallengeToken: challengeToken,
		ScanToken:      scanToken,
		Status:         domain.QRLoginStatusPending,
		IP:             strings.TrimSpace(ip),
		UserAgent:      trimForStorage(userAgent, 1024),
		ExpiresAt:      now.Add(qrLoginChallengeTTL),
		CreatedAt:      now,
		UpdatedAt:      now,
	}
	if err := s.deps.Store.SaveQRLoginChallenge(challenge); err != nil {
		return QRLoginCreateResult{}, err
	}
	return QRLoginCreateResult{ChallengeToken: challengeToken, ScanToken: scanToken, ExpiresAt: challenge.ExpiresAt}, nil
}

func (s *AuthService) GetQRLoginStatus(challengeToken string) (QRLoginStatusResult, error) {
	if s.settings == nil || !s.settings.IsQRLoginEnabled() {
		return QRLoginStatusResult{}, fmt.Errorf("qr login is disabled")
	}
	challenge, err := s.deps.Store.GetQRLoginChallengeByChallengeToken(strings.TrimSpace(challengeToken))
	if err != nil {
		return QRLoginStatusResult{}, fmt.Errorf("qr login challenge expired or invalid")
	}
	result := QRLoginStatusResult{Status: challenge.Status, ExpiresAt: challenge.ExpiresAt}
	if challenge.Status != domain.QRLoginStatusConfirmed || strings.TrimSpace(challenge.SessionToken) == "" {
		return result, nil
	}
	session, err := s.deps.Store.GetSession(challenge.SessionToken)
	if err != nil || session.ExpiresAt.Before(time.Now().UTC()) {
		return QRLoginStatusResult{}, fmt.Errorf("qr login session expired")
	}
	user, err := s.deps.Store.GetUser(session.UserID)
	if err != nil {
		return QRLoginStatusResult{}, fmt.Errorf("user not found")
	}
	_ = s.deps.Store.DeleteQRLoginChallenge(challenge.ChallengeToken)
	result.Session = session
	result.User = user
	return result, nil
}

func (s *AuthService) ScanQRLogin(scanToken, sessionToken string) (QRLoginStatusResult, error) {
	if s.settings == nil || !s.settings.IsQRLoginEnabled() {
		return QRLoginStatusResult{}, fmt.Errorf("qr login is disabled")
	}
	challenge, err := s.deps.Store.GetQRLoginChallengeByScanToken(strings.TrimSpace(scanToken))
	if err != nil {
		return QRLoginStatusResult{}, fmt.Errorf("qr login challenge expired or invalid")
	}
	if challenge.Status != domain.QRLoginStatusPending {
		return QRLoginStatusResult{}, fmt.Errorf("qr login challenge is not pending")
	}
	user, _, err := s.CurrentUser(sessionToken)
	if err != nil {
		return QRLoginStatusResult{}, err
	}
	now := time.Now().UTC()
	challenge.Status = domain.QRLoginStatusScanned
	challenge.UserID = user.ID
	challenge.UserEmail = user.Email
	challenge.UserDisplayName = user.DisplayName
	challenge.UserRole = user.Role
	challenge.UpdatedAt = now
	if err := s.deps.Store.ClaimPendingQRLoginChallenge(challenge); err != nil {
		return QRLoginStatusResult{}, fmt.Errorf("qr login challenge is not pending")
	}
	return QRLoginStatusResult{Status: challenge.Status, ExpiresAt: challenge.ExpiresAt, User: user}, nil
}

func (s *AuthService) ConfirmQRLogin(scanToken, sessionToken, ip, userAgent string, confirm bool, binding ...settings.DeviceBindingInput) (QRLoginStatusResult, error) {
	if s.settings == nil || !s.settings.IsQRLoginEnabled() {
		return QRLoginStatusResult{}, fmt.Errorf("qr login is disabled")
	}
	challenge, err := s.deps.Store.GetQRLoginChallengeByScanToken(strings.TrimSpace(scanToken))
	if err != nil {
		return QRLoginStatusResult{}, fmt.Errorf("qr login challenge expired or invalid")
	}
	if challenge.Status != domain.QRLoginStatusPending && challenge.Status != domain.QRLoginStatusScanned {
		return QRLoginStatusResult{}, fmt.Errorf("qr login challenge is not confirmable")
	}
	user, _, err := s.CurrentUser(sessionToken)
	if err != nil {
		return QRLoginStatusResult{}, err
	}
	if strings.TrimSpace(challenge.UserID) != "" && challenge.UserID != user.ID {
		return QRLoginStatusResult{}, fmt.Errorf("qr login user mismatch")
	}
	now := time.Now().UTC()
	challenge.UserID = user.ID
	challenge.UserEmail = user.Email
	challenge.UserDisplayName = user.DisplayName
	challenge.UserRole = user.Role
	challenge.IP = strings.TrimSpace(ip)
	challenge.UserAgent = trimForStorage(userAgent, 1024)
	challenge.UpdatedAt = now
	if !confirm {
		challenge.Status = domain.QRLoginStatusCancelled
		if err := s.deps.Store.UpdateQRLoginChallenge(challenge); err != nil {
			return QRLoginStatusResult{}, err
		}
		return QRLoginStatusResult{Status: challenge.Status, ExpiresAt: challenge.ExpiresAt, User: user}, nil
	}
	session, updatedUser, err := createLoginSession(s.deps, s.audit, user, ip, "urn:mysso:acr:qr-login", binding...)
	if err != nil {
		return QRLoginStatusResult{}, err
	}
	challenge.Status = domain.QRLoginStatusConfirmed
	challenge.SessionToken = session.Token
	if err := s.deps.Store.UpdateQRLoginChallenge(challenge); err != nil {
		_ = s.deps.Store.DeleteSession(session.Token)
		return QRLoginStatusResult{}, err
	}
	s.audit.Record(updatedUser.ID, updatedUser.Role, "user.qr_login.confirm", updatedUser.ID, map[string]any{
		"ip": ip,
	})
	s.deps.AppendUserOperationLog(updatedUser.ID, "user.qr_login.confirm", updatedUser.ID, map[string]any{
		"ip": ip,
	})
	return QRLoginStatusResult{Status: challenge.Status, ExpiresAt: challenge.ExpiresAt, User: updatedUser, Session: session}, nil
}

func randomURLToken(byteLength int) (string, error) {
	buf := make([]byte, byteLength)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buf), nil
}

func trimForStorage(value string, maxLength int) string {
	value = strings.TrimSpace(value)
	if maxLength <= 0 || len(value) <= maxLength {
		return value
	}
	return value[:maxLength]
}
