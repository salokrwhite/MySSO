package consent

import (
	"fmt"

	"mysso/backend/internal/domain"
	"mysso/backend/internal/service/accesscontrol"
	"mysso/backend/internal/service/audit"
	"mysso/backend/internal/service/common/deps"
)

type ConsentService struct {
	deps          *deps.Deps
	audit         *audit.Service
	accessControl *accesscontrol.Service
}

type Service = ConsentService

func New(dependencies *deps.Deps, auditService *audit.Service, accessControlService *accesscontrol.Service) *Service {
	return &ConsentService{deps: dependencies, audit: auditService, accessControl: accessControlService}
}

func (s *ConsentService) ListConsents(userID string) []domain.Consent {
	return s.accessControl.DecorateConsents(userID, s.deps.Store.ListConsentsByUser(userID))
}

func (s *ConsentService) RevokeConsent(userID, consentID string) error {
	consents := s.deps.Store.ListConsentsByUser(userID)
	var ownedConsent *domain.Consent
	owned := false
	for _, consent := range consents {
		if consent.ID == consentID {
			owned = true
			consentCopy := consent
			ownedConsent = &consentCopy
			break
		}
	}
	if !owned {
		return fmt.Errorf("consent not found")
	}
	if err := s.deps.Store.RevokeConsent(consentID); err != nil {
		return err
	}
	if ownedConsent != nil && ownedConsent.ClientID != "" {
		if err := s.deps.Store.RevokeRefreshTokensByUserClient(userID, ownedConsent.ClientID); err != nil {
			return err
		}
	}
	s.audit.Record(userID, domain.RoleUser, "oauth.consent.revoke", consentID, nil)
	if ownedConsent != nil {
		s.deps.AppendUserOperationLog(userID, "oauth.consent.revoke", consentID, map[string]any{
			"client_id": ownedConsent.ClientID,
			"app_name":  ownedConsent.AppName,
			"scopes":    ownedConsent.Scopes,
		})
	}
	return nil
}

func (s *ConsentService) BatchRevokeConsents(userID string, consentIDs []string) error {
	if len(consentIDs) == 0 {
		return fmt.Errorf("no consents selected")
	}
	owned := map[string]string{}
	consentByID := map[string]domain.Consent{}
	for _, consent := range s.deps.Store.ListConsentsByUser(userID) {
		owned[consent.ID] = consent.ClientID
		consentByID[consent.ID] = consent
	}
	for _, consentID := range consentIDs {
		if _, ok := owned[consentID]; !ok {
			return fmt.Errorf("consent not found")
		}
	}
	for _, consentID := range consentIDs {
		if err := s.deps.Store.RevokeConsent(consentID); err != nil {
			return err
		}
		if clientID := owned[consentID]; clientID != "" {
			if err := s.deps.Store.RevokeRefreshTokensByUserClient(userID, clientID); err != nil {
				return err
			}
		}
		s.audit.Record(userID, domain.RoleUser, "oauth.consent.revoke", consentID, map[string]any{"batch": true})
		if consent, ok := consentByID[consentID]; ok {
			s.deps.AppendUserOperationLog(userID, "oauth.consent.revoke", consentID, map[string]any{
				"batch":     true,
				"client_id": consent.ClientID,
				"app_name":  consent.AppName,
				"scopes":    consent.Scopes,
			})
		}
	}
	return nil
}
