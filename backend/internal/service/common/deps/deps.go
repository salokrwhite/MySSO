package deps

import (
	"strings"
	"time"

	"github.com/google/uuid"

	"mysso/backend/internal/config"
	"mysso/backend/internal/crypto"
	"mysso/backend/internal/domain"
	"mysso/backend/internal/geoip"
	"mysso/backend/internal/notify"
	"mysso/backend/internal/store"
)

type Deps struct {
	Cfg   *config.Config
	Store store.Store
	JWT   *crypto.JWTManager
	Mail  notify.Mailer
	SMS   notify.SMSSender
	GeoIP geoip.Locator
}

func (d *Deps) LookupUserEmailByID(userID string) string {
	userID = strings.TrimSpace(userID)
	if userID == "" {
		return ""
	}
	user, err := d.Store.GetUser(userID)
	if err != nil {
		return ""
	}
	return strings.TrimSpace(user.Email)
}

func (d *Deps) LookupUserEmailByEmail(email string) string {
	email = strings.ToLower(strings.TrimSpace(email))
	if email == "" {
		return ""
	}
	user, err := d.Store.FindUserByEmail(email)
	if err != nil {
		return email
	}
	return strings.TrimSpace(user.Email)
}

func (d *Deps) LookupUserEmailByPhone(phone string) string {
	phone = strings.TrimSpace(phone)
	if phone == "" {
		return ""
	}
	user, err := d.Store.FindUserByPhone(phone)
	if err != nil {
		return ""
	}
	return strings.TrimSpace(user.Email)
}

func (d *Deps) AppendEmailSendLog(targetEmail, content, accountEmail string) {
	d.Store.AppendEmailSendLog(domain.EmailSendLog{
		ID:           uuid.NewString(),
		TargetEmail:  strings.TrimSpace(targetEmail),
		Content:      strings.TrimSpace(content),
		AccountEmail: strings.TrimSpace(accountEmail),
		CreatedAt:    time.Now().UTC(),
	})
}

func (d *Deps) AppendPhoneSendLog(targetPhone, content, accountEmail string) {
	d.Store.AppendPhoneSendLog(domain.PhoneSendLog{
		ID:           uuid.NewString(),
		TargetPhone:  strings.TrimSpace(targetPhone),
		Content:      strings.TrimSpace(content),
		AccountEmail: strings.TrimSpace(accountEmail),
		CreatedAt:    time.Now().UTC(),
	})
}

func (d *Deps) AppendUserOperationLog(userID, action, targetID string, detail map[string]any) {
	userID = strings.TrimSpace(userID)
	action = strings.TrimSpace(action)
	if userID == "" || action == "" {
		return
	}
	d.Store.AppendUserOperationLog(domain.UserOperationLog{
		ID:        uuid.NewString(),
		UserID:    userID,
		Action:    action,
		TargetID:  strings.TrimSpace(targetID),
		Detail:    detail,
		CreatedAt: time.Now().UTC(),
	})
}
