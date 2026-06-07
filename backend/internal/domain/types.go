package domain

import "time"

type Role string

const (
	RoleAdmin     Role = "admin"
	RoleDeveloper Role = "developer"
	RoleUser      Role = "user"
)

type UserStatus string

const (
	UserActive  UserStatus = "active"
	UserFrozen  UserStatus = "frozen"
	UserPending UserStatus = "pending"
)

type User struct {
	ID                  string     `json:"id"`
	Country             string     `json:"country,omitempty"`
	Gender              string     `json:"gender,omitempty"`
	PreferredLocale     string     `json:"preferred_locale,omitempty"`
	Email               string     `json:"email"`
	Phone               string     `json:"phone"`
	DisplayName         string     `json:"display_name"`
	Password            string     `json:"-"`
	Role                Role       `json:"role"`
	Status              UserStatus `json:"status"`
	FreezeReason        string     `json:"freeze_reason,omitempty"`
	MFAEnabled          bool       `json:"mfa_enabled"`
	MFAMethod           string     `json:"mfa_method,omitempty"`
	MFASecret           string     `json:"-"`
	AuthVersion         int        `json:"-"`
	LastLoginAt         *time.Time `json:"last_login_at,omitempty"`
	CreatedAt           time.Time  `json:"created_at"`
	LastDeviceIP        string     `json:"last_device_ip,omitempty"`
	DeletionRequestedAt *time.Time `json:"deletion_requested_at,omitempty"`
	DeletionScheduledAt *time.Time `json:"deletion_scheduled_at,omitempty"`
}

type Passkey struct {
	ID             string     `json:"id"`
	UserID         string     `json:"user_id"`
	Name           string     `json:"name"`
	CredentialID   string     `json:"credential_id"`
	CredentialJSON string     `json:"-"`
	SignCount      uint32     `json:"-"`
	AAGUID         string     `json:"-"`
	TransportsJSON string     `json:"-"`
	Transports     []string   `json:"-"`
	LastUsedAt     *time.Time `json:"last_used_at,omitempty"`
	LastUsedIP     string     `json:"last_used_ip,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type PasskeyRegistrationChallenge struct {
	Token           string
	UserID          string
	SessionDataJSON string
	ExpiresAt       time.Time
	CreatedAt       time.Time
}

type PasskeyLoginChallenge struct {
	Token           string
	SessionDataJSON string
	ExpiresAt       time.Time
	CreatedAt       time.Time
}

type PasskeyUsageLog struct {
	ID            string    `json:"id"`
	UserID        string    `json:"user_id"`
	PasskeyID     string    `json:"passkey_id"`
	CredentialID  string    `json:"credential_id"`
	EventType     string    `json:"event_type"`
	SourceIP      string    `json:"source_ip"`
	UserAgent     string    `json:"user_agent"`
	Result        string    `json:"result"`
	FailureReason string    `json:"failure_reason"`
	CreatedAt     time.Time `json:"created_at"`
}

type PhoneBindingChallenge struct {
	Token          string
	UserID         string
	Reason         string
	ACR            string
	RiskClientJSON string
	ExpiresAt      time.Time
	CreatedAt      time.Time
}

type LoginStepUpMode string

const (
	LoginStepUpModeNone        LoginStepUpMode = "none"
	LoginStepUpModeEmail       LoginStepUpMode = "email"
	LoginStepUpModeSMS         LoginStepUpMode = "sms"
	LoginStepUpModeEmailAndSMS LoginStepUpMode = "email_and_sms"
)

type UserSecurityPolicy struct {
	UserID                      string          `json:"user_id"`
	ForcePhoneBindingNextLogin  bool            `json:"force_phone_binding_next_login"`
	ForceMFAEnrollmentNextLogin bool            `json:"force_mfa_enrollment_next_login"`
	LoginStepUpMode             LoginStepUpMode `json:"login_step_up_mode"`
	PhoneBindingRiskMode        string          `json:"phone_binding_risk_mode"`
	PhoneBindingRiskRequired    bool            `json:"phone_binding_risk_required"`
	PhoneBindingRiskLoginCount  int             `json:"phone_binding_risk_login_count"`
	CreatedAt                   time.Time       `json:"created_at"`
	UpdatedAt                   time.Time       `json:"updated_at"`
}

type LoginStepUpChallenge struct {
	Token          string
	UserID         string
	LoginMethod    string
	ACR            string
	EffectiveMode  LoginStepUpMode
	EmailTarget    string
	PhoneTarget    string
	RiskClientJSON string
	ExpiresAt      time.Time
	CreatedAt      time.Time
}

type LoginMFAEnrollmentChallenge struct {
	Token               string
	UserID              string
	LoginMethod         string
	ACR                 string
	RiskClientJSON      string
	RiskStepUpSatisfied bool
	ExpiresAt           time.Time
	CreatedAt           time.Time
}

type AppStatus string

const (
	AppDraft    AppStatus = "draft"
	AppPending  AppStatus = "pending_review"
	AppApproved AppStatus = "approved"
	AppRejected AppStatus = "rejected"
	AppDisabled AppStatus = "disabled"
)

type ClientApp struct {
	ID                     string    `json:"id"`
	Name                   string    `json:"name"`
	IconURL                string    `json:"icon_url"`
	OwnerUserID            string    `json:"owner_user_id"`
	ClientID               string    `json:"client_id"`
	ClientSecret           string    `json:"-"`
	HasClientSecret        bool      `json:"has_client_secret"`
	RedirectURIs           []string  `json:"redirect_uris"`
	PostLogoutRedirectURIs []string  `json:"post_logout_redirect_uris"`
	FrontChannelLogoutURI  string    `json:"frontchannel_logout_uri"`
	AllowGetSessionLogout  bool      `json:"allow_get_session_logout"`
	Scopes                 []string  `json:"scopes"`
	Status                 AppStatus `json:"status"`
	Description            string    `json:"description"`
	CreatedAt              time.Time `json:"created_at"`
	UpdatedAt              time.Time `json:"updated_at"`
	ReviewComment          string    `json:"review_comment,omitempty"`
}

type Session struct {
	Token           string    `json:"token"`
	UserID          string    `json:"user_id"`
	Role            Role      `json:"role"`
	AuthenticatedAt time.Time `json:"authenticated_at"`
	ACR             string    `json:"acr,omitempty"`
	DeviceKeyID     string    `json:"device_key_id,omitempty"`
	DevicePublicKey string    `json:"-"`
	ExpiresAt       time.Time `json:"expires_at"`
}

type AuthorizationCode struct {
	Code              string
	UserID            string
	ClientID          string
	RedirectURI       string
	Scopes            []string
	CodeChallenge     string
	CodeChallengeMeth string
	Nonce             string
	State             string
	AuthTime          time.Time
	ACR               string
	ExpiresAt         time.Time
	Used              bool
}

type EmailVerificationCode struct {
	ID        string
	Email     string
	Country   string
	Purpose   string
	Code      string
	ExpiresAt time.Time
	Consumed  bool
	CreatedAt time.Time
}

type SMSVerificationCode struct {
	ID        string
	Phone     string
	Purpose   string
	Code      string
	ExpiresAt time.Time
	Consumed  bool
	CreatedAt time.Time
}

type EmailSendLog struct {
	ID           string    `json:"id"`
	TargetEmail  string    `json:"target_email"`
	Content      string    `json:"content"`
	AccountEmail string    `json:"account_email"`
	CreatedAt    time.Time `json:"created_at"`
}

type PhoneSendLog struct {
	ID           string    `json:"id"`
	TargetPhone  string    `json:"target_phone"`
	Content      string    `json:"content"`
	AccountEmail string    `json:"account_email"`
	CreatedAt    time.Time `json:"created_at"`
}

type AuthChallenge struct {
	Token         string
	ChallengeType string
	LookupToken   string
	Status        string
	UserID        string
	Channel       string
	Target        string
	ACR           string
	PayloadJSON   string
	ExpiresAt     time.Time
	ConsumedAt    *time.Time
	CreatedAt     time.Time
	UpdatedAt     *time.Time
}

type QRLoginStatus string

const (
	QRLoginStatusPending   QRLoginStatus = "pending"
	QRLoginStatusScanned   QRLoginStatus = "scanned"
	QRLoginStatusConfirmed QRLoginStatus = "confirmed"
	QRLoginStatusCancelled QRLoginStatus = "cancelled"
)

type QRLoginChallenge struct {
	ChallengeToken  string
	ScanToken       string
	Status          QRLoginStatus
	UserID          string
	UserEmail       string
	UserDisplayName string
	UserRole        Role
	SessionToken    string
	FlowResultJSON  string
	PollNonce       string
	IP              string
	UserAgent       string
	ExpiresAt       time.Time
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

type MFALoginChallenge struct {
	Token          string
	UserID         string
	Method         string
	Target         string
	RiskClientJSON string
	ExpiresAt      time.Time
	CreatedAt      time.Time
}

type DeletionLoginChallenge struct {
	Token               string
	UserID              string
	ACR                 string
	RiskClientJSON      string
	DeletionScheduledAt time.Time
	ExpiresAt           time.Time
	CreatedAt           time.Time
}

type Consent struct {
	ID                 string     `json:"id"`
	UserID             string     `json:"user_id"`
	ClientID           string     `json:"client_id"`
	AppName            string     `json:"app_name"`
	IconURL            string     `json:"icon_url"`
	Scopes             []string   `json:"scopes"`
	CreatedAt          time.Time  `json:"created_at"`
	RevokedAt          time.Time  `json:"revoked_at,omitempty"`
	AccessStatus       string     `json:"access_status,omitempty"`
	RestrictionReason  string     `json:"restriction_reason,omitempty"`
	RestrictedAt       *time.Time `json:"restricted_at,omitempty"`
	RestrictionExpires *time.Time `json:"expires_at,omitempty"`
}

type RefreshToken struct {
	Token           string     `json:"token"`
	UserID          string     `json:"user_id"`
	ClientID        string     `json:"client_id"`
	Scopes          []string   `json:"scopes"`
	RotatedFrom     string     `json:"rotated_from,omitempty"`
	ReplacedByToken string     `json:"replaced_by_token,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	ExpiresAt       time.Time  `json:"expires_at"`
	Revoked         bool       `json:"revoked"`
	RevokedAt       *time.Time `json:"revoked_at,omitempty"`
}

type AuditLog struct {
	ID        string         `json:"id"`
	ActorID   string         `json:"actor_id"`
	ActorRole Role           `json:"actor_role"`
	Action    string         `json:"action"`
	TargetID  string         `json:"target_id"`
	Detail    map[string]any `json:"detail"`
	CreatedAt time.Time      `json:"created_at"`
}

type UserOperationLog struct {
	ID        string         `json:"id"`
	UserID    string         `json:"user_id"`
	Action    string         `json:"action"`
	TargetID  string         `json:"target_id"`
	Detail    map[string]any `json:"detail"`
	CreatedAt time.Time      `json:"created_at"`
}

type RiskSignal struct {
	Category string `json:"category"`
	Name     string `json:"name"`
	Weight   int    `json:"weight"`
	Detail   string `json:"detail,omitempty"`
}

type RiskEvent struct {
	ID                string       `json:"id"`
	UserID            string       `json:"user_id"`
	Email             string       `json:"email,omitempty"`
	DisplayName       string       `json:"display_name,omitempty"`
	EventType         string       `json:"event_type"`
	IdentifierHash    string       `json:"identifier_hash,omitempty"`
	FailureReason     string       `json:"failure_reason,omitempty"`
	RiskScore         int          `json:"risk_score"`
	RiskLevel         string       `json:"risk_level"`
	ActionTaken       string       `json:"action_taken"`
	IPAddress         string       `json:"ip_address"`
	IPCountry         string       `json:"ip_country,omitempty"`
	IPRegion          string       `json:"ip_region,omitempty"`
	IPCity            string       `json:"ip_city,omitempty"`
	DeviceFingerprint string       `json:"device_fingerprint,omitempty"`
	DeviceKeyID       string       `json:"device_key_id,omitempty"`
	ClientType        string       `json:"client_type"`
	UserAgent         string       `json:"user_agent,omitempty"`
	Signals           []RiskSignal `json:"signals,omitempty"`
	CreatedAt         time.Time    `json:"created_at"`
}

type RiskAccountSummary struct {
	UserID             string     `json:"user_id"`
	Email              string     `json:"email,omitempty"`
	DisplayName        string     `json:"display_name,omitempty"`
	Role               Role       `json:"role,omitempty"`
	Status             UserStatus `json:"status,omitempty"`
	Phone              string     `json:"phone,omitempty"`
	MFAEnabled         bool       `json:"mfa_enabled"`
	LastLoginAt        *time.Time `json:"last_login_at,omitempty"`
	LastDeviceIP       string     `json:"last_device_ip,omitempty"`
	CreatedAt          time.Time  `json:"created_at,omitempty"`
	ComprehensiveScore int        `json:"comprehensive_score"`
	RiskLevel          string     `json:"risk_level"`
	EventCount         int        `json:"event_count"`
	LoginSuccessCount  int        `json:"login_success_count"`
	LoginFailureCount  int        `json:"login_failure_count"`
	BlockedCount       int        `json:"blocked_count"`
	StepUpCount        int        `json:"step_up_count"`
	CaptchaCount       int        `json:"captcha_count"`
	DeviceCount        int        `json:"device_count"`
	LastEventType      string     `json:"last_event_type,omitempty"`
	LastActionTaken    string     `json:"last_action_taken,omitempty"`
	LastIPAddress      string     `json:"last_ip_address,omitempty"`
	LastIPCountry      string     `json:"last_ip_country,omitempty"`
	LastIPRegion       string     `json:"last_ip_region,omitempty"`
	LastIPCity         string     `json:"last_ip_city,omitempty"`
	LastClientType     string     `json:"last_client_type,omitempty"`
	LastEventAt        *time.Time `json:"last_event_at,omitempty"`
	TrustedUntil       *time.Time `json:"trusted_until,omitempty"`
	MitigatedUntil     *time.Time `json:"mitigated_until,omitempty"`
	FalsePositiveUntil *time.Time `json:"false_positive_until,omitempty"`
	FalsePositiveNote  string     `json:"false_positive_note,omitempty"`
}

type DeviceProfile struct {
	ID                string     `json:"id"`
	UserID            string     `json:"user_id"`
	DeviceFingerprint string     `json:"device_fingerprint"`
	DeviceKeyID       string     `json:"device_key_id,omitempty"`
	ClientType        string     `json:"client_type"`
	FirstIP           string     `json:"first_ip,omitempty"`
	LastIP            string     `json:"last_ip,omitempty"`
	FirstSeenAt       time.Time  `json:"first_seen_at"`
	LastSeenAt        time.Time  `json:"last_seen_at"`
	LastRiskScore     int        `json:"last_risk_score"`
	LastRiskLevel     string     `json:"last_risk_level"`
	BlockedAt         *time.Time `json:"blocked_at,omitempty"`
	TrustedUntil      *time.Time `json:"trusted_until,omitempty"`
	MitigatedUntil    *time.Time `json:"mitigated_until,omitempty"`
	TrustReason       string     `json:"trust_reason,omitempty"`
	TrustUpdatedBy    string     `json:"trust_updated_by,omitempty"`
}

type LoginHistory struct {
	ID                string    `json:"id"`
	UserID            string    `json:"user_id"`
	IPAddress         string    `json:"ip_address"`
	IPCountry         string    `json:"ip_country,omitempty"`
	IPRegion          string    `json:"ip_region,omitempty"`
	IPCity            string    `json:"ip_city,omitempty"`
	DeviceFingerprint string    `json:"device_fingerprint,omitempty"`
	DeviceKeyID       string    `json:"device_key_id,omitempty"`
	ClientType        string    `json:"client_type"`
	RiskScore         int       `json:"risk_score"`
	RiskLevel         string    `json:"risk_level"`
	Success           bool      `json:"success"`
	CreatedAt         time.Time `json:"created_at"`
}

type IPBlacklistEntry struct {
	ID        string     `json:"id"`
	IPAddress string     `json:"ip_address"`
	Reason    string     `json:"reason"`
	CreatedBy string     `json:"created_by"`
	CreatedAt time.Time  `json:"created_at"`
	ExpiresAt *time.Time `json:"expires_at,omitempty"`
}

type GatewayPolicy struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Path        string    `json:"path"`
	Method      string    `json:"method"`
	Scopes      []string  `json:"scopes"`
	Claims      []string  `json:"claims"`
	Enabled     bool      `json:"enabled"`
	UpdatedAt   time.Time `json:"updated_at"`
	Description string    `json:"description"`
}

type ScopeDefinition struct {
	Key                 string    `json:"key"`
	DisplayName         string    `json:"display_name"`
	Description         string    `json:"description"`
	Enabled             bool      `json:"enabled"`
	DeveloperSelectable bool      `json:"developer_selectable"`
	System              bool      `json:"system"`
	UpdatedAt           time.Time `json:"updated_at"`
}

type DeveloperGroup struct {
	ID          string    `json:"id"`
	OwnerUserID string    `json:"owner_user_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type AppGroupBinding struct {
	AppID     string    `json:"app_id"`
	GroupID   string    `json:"group_id"`
	CreatedAt time.Time `json:"created_at"`
	GroupName string    `json:"group_name,omitempty"`
}

type AppUserBan struct {
	ID        string     `json:"id"`
	AppID     string     `json:"app_id"`
	UserID    string     `json:"user_id"`
	Reason    string     `json:"reason"`
	ExpiresAt *time.Time `json:"expires_at,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

type AppUserAccessVersion struct {
	AppID     string    `json:"app_id"`
	UserID    string    `json:"user_id"`
	Version   int       `json:"version"`
	UpdatedAt time.Time `json:"updated_at"`
}

type DeveloperManagedUserAuthorizedApp struct {
	AppID            string    `json:"app_id"`
	ClientID         string    `json:"client_id"`
	AppName          string    `json:"app_name"`
	LastAuthorizedAt time.Time `json:"last_authorized_at"`
}

type DeveloperManagedUser struct {
	UserID           string                              `json:"user_id"`
	DisplayName      string                              `json:"display_name"`
	MaskedEmail      string                              `json:"masked_email"`
	MaskedPhone      string                              `json:"masked_phone"`
	LastAuthorizedAt time.Time                           `json:"last_authorized_at"`
	AuthorizedApps   []DeveloperManagedUserAuthorizedApp `json:"authorized_apps"`
	GroupIDs         []string                            `json:"group_ids"`
	GroupNames       []string                            `json:"group_names"`
	AppBans          []AppUserBan                        `json:"app_bans"`
}

type DeveloperAccessLog struct {
	ID          string         `json:"id"`
	OwnerUserID string         `json:"owner_user_id"`
	ActorID     string         `json:"actor_id"`
	Action      string         `json:"action"`
	TargetType  string         `json:"target_type"`
	TargetID    string         `json:"target_id"`
	AppID       string         `json:"app_id"`
	UserID      string         `json:"user_id"`
	GroupID     string         `json:"group_id"`
	Detail      map[string]any `json:"detail"`
	CreatedAt   time.Time      `json:"created_at"`
	DeletedAt   *time.Time     `json:"deleted_at,omitempty"`
}
