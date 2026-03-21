package service

import (
	"fmt"

	"mysso/backend/internal/domain"
)

type ConsentService struct {
	deps  *serviceDeps
	audit *AuditService
}

func (s *ConsentService) ListConsents(userID string) []domain.Consent {
	return s.deps.store.ListConsentsByUser(userID)
}

func (s *ConsentService) RevokeConsent(userID, consentID string) error {
	consents := s.deps.store.ListConsentsByUser(userID)
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
	if err := s.deps.store.RevokeConsent(consentID); err != nil {
		return err
	}
	if ownedConsent != nil && ownedConsent.ClientID != "" {
		if err := s.deps.store.RevokeRefreshTokensByUserClient(userID, ownedConsent.ClientID); err != nil {
			return err
		}
	}
	s.audit.Record(userID, domain.RoleUser, "oauth.consent.revoke", consentID, nil)
	if ownedConsent != nil {
		s.deps.appendUserOperationLog(userID, "oauth.consent.revoke", consentID, map[string]any{
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
	for _, consent := range s.deps.store.ListConsentsByUser(userID) {
		owned[consent.ID] = consent.ClientID
		consentByID[consent.ID] = consent
	}
	for _, consentID := range consentIDs {
		if _, ok := owned[consentID]; !ok {
			return fmt.Errorf("consent not found")
		}
	}
	for _, consentID := range consentIDs {
		if err := s.deps.store.RevokeConsent(consentID); err != nil {
			return err
		}
		if clientID := owned[consentID]; clientID != "" {
			if err := s.deps.store.RevokeRefreshTokensByUserClient(userID, clientID); err != nil {
				return err
			}
		}
		s.audit.Record(userID, domain.RoleUser, "oauth.consent.revoke", consentID, map[string]any{"batch": true})
		if consent, ok := consentByID[consentID]; ok {
			s.deps.appendUserOperationLog(userID, "oauth.consent.revoke", consentID, map[string]any{
				"batch":     true,
				"client_id": consent.ClientID,
				"app_name":  consent.AppName,
				"scopes":    consent.Scopes,
			})
		}
	}
	return nil
}
