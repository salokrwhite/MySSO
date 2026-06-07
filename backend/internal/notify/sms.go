package notify

import (
	"crypto/md5" // #nosec G501 -- SmsBao requires MD5(password) in its API protocol.
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	openapi "github.com/alibabacloud-go/darabonba-openapi/v2/client"
	dypnsapi "github.com/alibabacloud-go/dypnsapi-20170525/v3/client"
	"github.com/alibabacloud-go/tea/tea"

	"mysso/backend/internal/config"
)

type SMSSender interface {
	Send(phone, purpose, content string, options SendOptions) error
	Enabled() bool
}

type SendOptions struct {
	Code    string
	Minutes int
}

type DisabledSMSSender struct{}

type ReservedSMSSender struct {
	provider string
}

type AliyunSender struct {
	client *dypnsapi.Client
	cfg    config.SMSConfig
}

type SmsBaoSender struct {
	apiBase   string
	username  string
	password  string
	signature string
	client    *http.Client
}

var smsBaoStatusText = map[string]string{
	"0":  "短信发送成功",
	"-1": "参数不全",
	"-2": "服务器空间不支持,请确认支持curl或者fsocket，联系您的空间商解决或者更换空间！",
	"30": "密码错误",
	"40": "账号不存在",
	"41": "余额不足",
	"42": "帐户已过期",
	"43": "IP地址限制",
	"50": "内容含有敏感词",
}

func NewSMSSender(cfg config.SMSConfig) SMSSender {
	if strings.TrimSpace(cfg.Provider) == "" || strings.TrimSpace(cfg.Provider) == "disabled" {
		return DisabledSMSSender{}
	}
	if strings.EqualFold(strings.TrimSpace(cfg.Provider), "smsbao") {
		if strings.TrimSpace(cfg.APIBase) == "" || strings.TrimSpace(cfg.Username) == "" || strings.TrimSpace(cfg.Password) == "" {
			return DisabledSMSSender{}
		}
		return SmsBaoSender{
			apiBase:   strings.TrimRight(strings.TrimSpace(cfg.APIBase), "/") + "/",
			username:  strings.TrimSpace(cfg.Username),
			password:  strings.TrimSpace(cfg.Password),
			signature: strings.TrimSpace(cfg.Signature),
			client: &http.Client{
				Timeout: 10 * time.Second,
			},
		}
	}
	if strings.EqualFold(strings.TrimSpace(cfg.Provider), "aliyun") {
		endpoint := strings.TrimSpace(cfg.AliyunEndpoint)
		if endpoint == "" || strings.EqualFold(endpoint, "dysmsapi.aliyuncs.com") {
			endpoint = "dypnsapi.aliyuncs.com"
		}
		if strings.TrimSpace(cfg.AliyunAccessKeyID) == "" ||
			strings.TrimSpace(cfg.AliyunAccessKeySecret) == "" ||
			strings.TrimSpace(cfg.AliyunSignName) == "" {
			return DisabledSMSSender{}
		}
		openAPIConfig := &openapi.Config{
			AccessKeyId:     tea.String(strings.TrimSpace(cfg.AliyunAccessKeyID)),
			AccessKeySecret: tea.String(strings.TrimSpace(cfg.AliyunAccessKeySecret)),
			Endpoint:        tea.String(endpoint),
			RegionId:        tea.String(strings.TrimSpace(cfg.AliyunRegionID)),
		}
		client, err := dypnsapi.NewClient(openAPIConfig)
		if err != nil {
			return DisabledSMSSender{}
		}
		cfg.AliyunEndpoint = endpoint
		return AliyunSender{client: client, cfg: cfg}
	}
	return DisabledSMSSender{}
}

func (DisabledSMSSender) Send(_, _, _ string, _ SendOptions) error {
	return fmt.Errorf("sms not configured")
}

func (DisabledSMSSender) Enabled() bool { return false }

func (s ReservedSMSSender) Send(_, _, _ string, _ SendOptions) error {
	return fmt.Errorf("%s sms sender is reserved but not implemented yet", s.provider)
}

func (ReservedSMSSender) Enabled() bool { return true }

func (s AliyunSender) Enabled() bool { return s.client != nil }

func (s AliyunSender) Send(phone, purpose, content string, options SendOptions) error {
	phone = strings.TrimSpace(phone)
	purpose = strings.ToLower(strings.TrimSpace(purpose))
	if phone == "" {
		return fmt.Errorf("phone is required")
	}

	templateCode := s.templateCodeForPurpose(purpose)
	if templateCode == "" {
		if purpose == "" {
			return fmt.Errorf("aliyun sms requires a template code for the selected provider")
		}
		return fmt.Errorf("aliyun sms template code is not configured for purpose %s", purpose)
	}

	code := strings.TrimSpace(options.Code)
	if code == "" {
		code = extractCode(content)
	}
	if code == "" {
		return fmt.Errorf("aliyun sms send failed: verification code is empty")
	}
	minutes := options.Minutes
	if minutes <= 0 {
		if parsed, err := strconv.Atoi(extractMinutes(content)); err == nil {
			minutes = parsed
		}
	}
	if minutes <= 0 {
		return fmt.Errorf("aliyun sms send failed: verification minutes is empty")
	}

	templateParamBytes, err := json.Marshal(map[string]string{
		"code":    code,
		"min":     strconv.Itoa(minutes),
		"minutes": strconv.Itoa(minutes),
		"phone":   phone,
	})
	if err != nil {
		return err
	}

	request := &dypnsapi.SendSmsVerifyCodeRequest{
		PhoneNumber:      tea.String(phone),
		CountryCode:      tea.String("86"),
		SignName:         tea.String(strings.TrimSpace(s.cfg.AliyunSignName)),
		TemplateCode:     tea.String(templateCode),
		TemplateParam:    tea.String(string(templateParamBytes)),
		ReturnVerifyCode: tea.Bool(false),
		ValidTime:        tea.Int64(int64(300)),
	}
	response, err := s.client.SendSmsVerifyCode(request)
	if err != nil {
		return err
	}
	if response == nil || response.Body == nil {
		return fmt.Errorf("aliyun sms returned an empty response")
	}
	if tea.StringValue(response.Body.Code) != "OK" || !tea.BoolValue(response.Body.Success) {
		return fmt.Errorf("aliyun sms send failed: %s", strings.TrimSpace(tea.StringValue(response.Body.Message)))
	}
	return nil
}

func (s AliyunSender) templateCodeForPurpose(purpose string) string {
	switch purpose {
	case "login", "mfa_login", "login_step_up", "login_mfa_enrollment":
		return strings.TrimSpace(s.cfg.AliyunLoginTemplateCode)
	case "reset_password":
		return strings.TrimSpace(s.cfg.AliyunResetTemplateCode)
	case "change_phone", "verify_current_phone", "risk_phone_binding":
		return strings.TrimSpace(s.cfg.AliyunBindPhoneTemplateCode)
	case "delete_account":
		return strings.TrimSpace(s.cfg.AliyunDeleteTemplateCode)
	case "register":
		return strings.TrimSpace(s.cfg.AliyunRegisterTemplateCode)
	default:
		return ""
	}
}

func (s SmsBaoSender) Enabled() bool { return true }

func (s SmsBaoSender) Send(phone, _, content string, _ SendOptions) error {
	phone = strings.TrimSpace(phone)
	content = strings.TrimSpace(content)
	if phone == "" || content == "" {
		return fmt.Errorf("phone and content are required")
	}
	if s.signature != "" && !strings.Contains(content, s.signature) {
		content = fmt.Sprintf("%s【%s】", content, s.signature)
	}
	requestURL := fmt.Sprintf(
		"%ssms?u=%s&p=%s&m=%s&c=%s",
		s.apiBase,
		url.QueryEscape(s.username),
		url.QueryEscape(md5Encode(s.password)),
		url.QueryEscape(phone),
		url.QueryEscape(content),
	)
	resp, err := s.client.Get(requestURL)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	result := strings.TrimSpace(string(body))
	if result == "0" {
		return nil
	}
	if message, ok := smsBaoStatusText[result]; ok {
		return fmt.Errorf("%s", message)
	}
	return fmt.Errorf("未知短信返回码: %s", result)
}

func md5Encode(text string) string {
	// #nosec G401,G501 -- SmsBao requires MD5(password) in its API protocol; not used as a security hash.
	hash := md5.Sum([]byte(text))
	return hex.EncodeToString(hash[:])
}

func extractCode(content string) string {
	content = strings.TrimSpace(content)
	for _, field := range strings.FieldsFunc(content, func(r rune) bool {
		return r < '0' || r > '9'
	}) {
		if len(field) >= 4 && len(field) <= 8 {
			return field
		}
	}
	return ""
}

func extractMinutes(content string) string {
	content = strings.TrimSpace(content)
	for _, marker := range []string{"分钟", "分"} {
		index := strings.Index(content, marker)
		if index <= 0 {
			continue
		}
		prefix := strings.TrimSpace(content[:index])
		for i := len(prefix) - 1; i >= 0; i-- {
			if prefix[i] < '0' || prefix[i] > '9' {
				if i == len(prefix)-1 {
					break
				}
				return prefix[i+1:]
			}
		}
		if len(prefix) > 0 {
			return prefix
		}
	}
	return ""
}
