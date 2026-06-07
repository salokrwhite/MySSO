package auth

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"mysso/backend/internal/domain"
	riskservice "mysso/backend/internal/service/risk"
	"mysso/backend/internal/service/settings"
)

const qrLoginChallengeTTL = 2 * time.Minute

type QRLoginCreateResult struct {
	ChallengeToken string
	ScanToken      string
	PollNonce      string
	ExpiresAt      time.Time
}

type QRLoginStatusResult struct {
	Status    domain.QRLoginStatus
	ExpiresAt time.Time
	User      domain.User
	Session   domain.Session
	Flow      PasswordLoginResult
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
	pollNonce, err := randomURLToken(32)
	if err != nil {
		return QRLoginCreateResult{}, err
	}
	challenge := domain.QRLoginChallenge{
		ChallengeToken: challengeToken,
		ScanToken:      scanToken,
		Status:         domain.QRLoginStatusPending,
		PollNonce:      pollNonce,
		IP:             strings.TrimSpace(ip),
		UserAgent:      trimForStorage(userAgent, 1024),
		ExpiresAt:      now.Add(qrLoginChallengeTTL),
		CreatedAt:      now,
		UpdatedAt:      now,
	}
	if err := s.deps.Store.SaveQRLoginChallenge(challenge); err != nil {
		return QRLoginCreateResult{}, err
	}
	return QRLoginCreateResult{ChallengeToken: challengeToken, ScanToken: scanToken, PollNonce: pollNonce, ExpiresAt: challenge.ExpiresAt}, nil
}

func (s *AuthService) GetQRLoginStatus(challengeToken, pollNonce string) (QRLoginStatusResult, error) {
	if s.settings == nil || !s.settings.IsQRLoginEnabled() {
		return QRLoginStatusResult{}, fmt.Errorf("qr login is disabled")
	}
	challenge, err := s.deps.Store.GetQRLoginChallengeByChallengeToken(strings.TrimSpace(challengeToken))
	if err != nil {
		return QRLoginStatusResult{}, fmt.Errorf("qr login challenge expired or invalid")
	}
	if strings.TrimSpace(challenge.PollNonce) == "" || strings.TrimSpace(pollNonce) == "" || challenge.PollNonce != strings.TrimSpace(pollNonce) {
		return QRLoginStatusResult{}, fmt.Errorf("qr login challenge expired or invalid")
	}
	result := QRLoginStatusResult{Status: challenge.Status, ExpiresAt: challenge.ExpiresAt}
	if challenge.Status != domain.QRLoginStatusConfirmed {
		return result, nil
	}
	if strings.TrimSpace(challenge.FlowResultJSON) != "" {
		flow, err := decodeQRLoginFlowResult(challenge.FlowResultJSON)
		if err != nil {
			return QRLoginStatusResult{}, fmt.Errorf("qr login result expired or invalid")
		}
		_ = s.deps.Store.DeleteQRLoginChallenge(challenge.ChallengeToken)
		result.Flow = flow
		result.User = flow.User
		result.Session = flow.Session
		return result, nil
	}
	if strings.TrimSpace(challenge.SessionToken) == "" {
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
	challenge.UpdatedAt = now
	if !confirm {
		challenge.Status = domain.QRLoginStatusCancelled
		if err := s.deps.Store.UpdateQRLoginChallenge(challenge); err != nil {
			return QRLoginStatusResult{}, err
		}
		return QRLoginStatusResult{Status: challenge.Status, ExpiresAt: challenge.ExpiresAt, User: user}, nil
	}
	targetIP := strings.TrimSpace(challenge.IP)
	if targetIP == "" {
		targetIP = strings.TrimSpace(ip)
	}
	flow, err := s.continuePostAuthenticationWithRiskOptions(
		user,
		targetIP,
		"qr_login",
		"urn:mysso:acr:qr-login",
		riskservice.ClientInfo{ClientType: "web", UserAgent: strings.TrimSpace(challenge.UserAgent)},
		postAuthRiskOptions{RiskCaptchaAllowed: false},
	)
	if err != nil {
		return QRLoginStatusResult{}, err
	}
	challenge.Status = domain.QRLoginStatusConfirmed
	challenge.UserID = flow.User.ID
	challenge.UserEmail = flow.User.Email
	challenge.UserDisplayName = flow.User.DisplayName
	challenge.UserRole = flow.User.Role
	challenge.SessionToken = flow.Session.Token
	if flow.RequiresMFA || flow.RequiresDeletionConfirmation || flow.RequiresPhoneBinding || flow.RequiresStepUpVerification || flow.RequiresMFAEnrollmentSetup {
		flowJSON, err := encodeQRLoginFlowResult(flow)
		if err != nil {
			return QRLoginStatusResult{}, err
		}
		challenge.FlowResultJSON = flowJSON
	}
	if err := s.deps.Store.UpdateQRLoginChallenge(challenge); err != nil {
		s.cleanupQRLoginFlowResult(flow)
		return QRLoginStatusResult{}, err
	}
	s.audit.Record(flow.User.ID, flow.User.Role, "user.qr_login.confirm", flow.User.ID, map[string]any{
		"target_ip":    targetIP,
		"confirmer_ip": strings.TrimSpace(ip),
	})
	s.deps.AppendUserOperationLog(flow.User.ID, "user.qr_login.confirm", flow.User.ID, map[string]any{
		"target_ip":    targetIP,
		"confirmer_ip": strings.TrimSpace(ip),
	})
	return QRLoginStatusResult{Status: challenge.Status, ExpiresAt: challenge.ExpiresAt, User: flow.User, Session: flow.Session, Flow: flow}, nil
}

func encodeQRLoginFlowResult(result PasswordLoginResult) (string, error) {
	data, err := json.Marshal(result)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

func decodeQRLoginFlowResult(raw string) (PasswordLoginResult, error) {
	var result PasswordLoginResult
	if err := json.Unmarshal([]byte(raw), &result); err != nil {
		return PasswordLoginResult{}, err
	}
	return result, nil
}

func (s *AuthService) cleanupQRLoginFlowResult(result PasswordLoginResult) {
	if strings.TrimSpace(result.Session.Token) != "" {
		_ = s.deps.Store.DeleteSession(result.Session.Token)
	}
	if strings.TrimSpace(result.ChallengeToken) != "" {
		_ = s.deps.Store.DeleteMFALoginChallenge(result.ChallengeToken)
	}
	if strings.TrimSpace(result.DeletionChallengeToken) != "" {
		_ = s.deps.Store.DeleteDeletionLoginChallenge(result.DeletionChallengeToken)
	}
	if strings.TrimSpace(result.PhoneBindingChallengeToken) != "" {
		_ = s.deps.Store.DeletePhoneBindingChallenge(result.PhoneBindingChallengeToken)
	}
	if strings.TrimSpace(result.StepUpChallengeToken) != "" {
		_ = s.deps.Store.DeleteLoginStepUpChallenge(result.StepUpChallengeToken)
	}
	if strings.TrimSpace(result.MFAEnrollmentChallengeToken) != "" {
		_ = s.deps.Store.DeleteLoginMFAEnrollmentChallenge(result.MFAEnrollmentChallengeToken)
	}
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
