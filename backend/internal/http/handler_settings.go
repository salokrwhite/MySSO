package http

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"mysso/backend/internal/appdefaults"
	"mysso/backend/internal/domain"
	"mysso/backend/internal/service"
)

func (s *Server) handlePublicSettings(c *gin.Context) {
	siteName := appdefaults.DefaultSiteName
	siteNameEN := ""
	siteBrowserTitle := ""
	siteBrowserTitleEN := ""
	siteLogoDataURL := ""
	siteFooterText := ""
	siteICPRecordNumber := ""
	sitePublicSecurityRecordNumber := ""
	homePageAnnouncementEnabled := appdefaults.DefaultHomePageAnnouncementEnabled
	homePageAnnouncementContent := appdefaults.DefaultHomePageAnnouncementContent
	userCenterAnnouncementEnabled := appdefaults.DefaultUserCenterAnnouncementEnabled
	userCenterAnnouncementContent := appdefaults.DefaultUserCenterAnnouncementContent
	developerAnnouncementEnabled := appdefaults.DefaultDeveloperAnnouncementEnabled
	developerAnnouncementContent := appdefaults.DefaultDeveloperAnnouncementContent
	frontendBaseURL := strings.TrimSpace(s.cfg.HTTP.FrontendBase)
	firstPartyClientID := strings.TrimSpace(s.cfg.OIDC.FirstPartyClientID)
	firstPartyScope := strings.TrimSpace(s.cfg.OIDC.FirstPartyScope)
	autoApproveClientIDs := append([]string{}, s.cfg.OIDC.AutoApproveClientIDs...)
	autoApproveHosts := append([]string{}, s.cfg.OIDC.AutoApproveHosts...)
	verificationCodeCooldownSeconds := appdefaults.DefaultVerificationCodeCooldownSeconds
	sendChallengeEnabled := appdefaults.DefaultSendChallengeEnabled
	if s.services != nil {
		settings, err := s.services.Settings.GetSystemSettings()
		if err == nil && strings.TrimSpace(settings.SiteName) != "" {
			siteName = settings.SiteName
		}
		if err == nil {
			siteNameEN = strings.TrimSpace(settings.SiteNameEN)
			siteBrowserTitle = strings.TrimSpace(settings.SiteBrowserTitle)
			siteBrowserTitleEN = strings.TrimSpace(settings.SiteBrowserTitleEN)
			siteLogoDataURL = strings.TrimSpace(settings.SiteLogoDataURL)
			siteFooterText = settings.SiteFooterText
			siteICPRecordNumber = strings.TrimSpace(settings.SiteICPRecordNumber)
			sitePublicSecurityRecordNumber = strings.TrimSpace(settings.SitePublicSecurityRecordNumber)
			homePageAnnouncementEnabled = settings.HomePageAnnouncementEnabled
			homePageAnnouncementContent = strings.TrimSpace(settings.HomePageAnnouncementContent)
			userCenterAnnouncementEnabled = settings.UserCenterAnnouncementEnabled
			userCenterAnnouncementContent = strings.TrimSpace(settings.UserCenterAnnouncementContent)
			developerAnnouncementEnabled = settings.DeveloperAnnouncementEnabled
			developerAnnouncementContent = strings.TrimSpace(settings.DeveloperAnnouncementContent)
			frontendBaseURL = strings.TrimSpace(settings.FrontendBaseURL)
			firstPartyClientID = strings.TrimSpace(settings.OIDCFirstPartyClientID)
			firstPartyScope = strings.TrimSpace(settings.OIDCFirstPartyScope)
			verificationCodeCooldownSeconds = settings.SMTPVerificationCodeCooldownSecond
			sendChallengeEnabled = settings.SendChallengeEnabled
			for _, clientID := range service.SplitListSetting(settings.OIDCAutoApproveClientIDs) {
				if !containsString(autoApproveClientIDs, clientID) {
					autoApproveClientIDs = append(autoApproveClientIDs, clientID)
				}
			}
			for _, host := range service.SplitListSetting(settings.OIDCAutoApproveRedirectHosts) {
				if !containsString(autoApproveHosts, host) {
					autoApproveHosts = append(autoApproveHosts, host)
				}
			}
			if firstPartyClientID != "" && !containsString(autoApproveClientIDs, firstPartyClientID) {
				autoApproveClientIDs = append(autoApproveClientIDs, firstPartyClientID)
			}
		}
	}
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"site_name":                               siteName,
			"site_name_en":                            siteNameEN,
			"site_browser_title":                      siteBrowserTitle,
			"site_browser_title_en":                   siteBrowserTitleEN,
			"allow_user_registration":                 s.services == nil || s.services.Settings.IsUserRegistrationAllowed(),
			"enable_phone_verification":               s.services == nil || s.services.Settings.IsPhoneVerificationEnabled(),
			"site_logo_data_url":                      siteLogoDataURL,
			"site_footer_text":                        siteFooterText,
			"site_icp_record_number":                  siteICPRecordNumber,
			"site_public_security_record_number":      sitePublicSecurityRecordNumber,
			"frontend_base_url":                       frontendBaseURL,
			"oidc_first_party_client_id":              firstPartyClientID,
			"oidc_first_party_scope":                  firstPartyScope,
			"oidc_auto_approve_client_ids":            autoApproveClientIDs,
			"oidc_auto_approve_redirect_hosts":        autoApproveHosts,
			"smtp_verification_code_cooldown_seconds": verificationCodeCooldownSeconds,
			"send_challenge_enabled":                  sendChallengeEnabled,
			"home_page_announcement_enabled":          homePageAnnouncementEnabled,
			"home_page_announcement_content":          homePageAnnouncementContent,
			"user_center_announcement_enabled":        userCenterAnnouncementEnabled,
			"user_center_announcement_content":        userCenterAnnouncementContent,
			"developer_announcement_enabled":          developerAnnouncementEnabled,
			"developer_announcement_content":          developerAnnouncementContent,
		},
	})
}

func (s *Server) handlePublicScopes(c *gin.Context) {
	if s.services == nil {
		c.JSON(http.StatusOK, gin.H{"items": []gin.H{
			{"key": "openid", "display_name": "基础登录", "description": "确认用户身份并建立 OIDC 登录会话。", "enabled": true, "developer_selectable": true, "system": true},
			{"key": "profile", "display_name": "公开资料", "description": "允许读取昵称、头像等公开资料。", "enabled": true, "developer_selectable": true, "system": true},
			{"key": "email", "display_name": "邮箱资料", "description": "允许读取账号邮箱地址。", "enabled": true, "developer_selectable": true, "system": true},
			{"key": "phone", "display_name": "手机号资料", "description": "允许读取账号绑定手机号。", "enabled": true, "developer_selectable": true, "system": true},
			{"key": "role", "display_name": "账号角色信息", "description": "允许读取账号当前角色标识，例如 user、developer、admin。", "enabled": true, "developer_selectable": true, "system": true},
			{"key": "gateway.read", "display_name": "网关受保护资源读取", "description": "允许访问系统里受 scope 保护的网关或 API 资源。", "enabled": true, "developer_selectable": true, "system": true},
		}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": s.services.Apps.ListEnabledScopes()})
}

func (s *Server) handleGetSystemSettings(c *gin.Context) {
	settings, err := s.services.Settings.GetSystemSettings()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	settings.OIDCFirstPartyClientSecret = ""
	c.JSON(http.StatusOK, gin.H{"data": settings})
}

func (s *Server) handleUpdateSystemSettings(c *gin.Context) {
	var req updateSystemSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := s.services.Settings.UpdateSystemSettings(service.SystemSettings{
		AllowUserRegistration:               req.AllowUserRegistration,
		EnablePhoneVerification:             req.EnablePhoneVerification,
		SiteName:                            req.SiteName,
		SiteNameEN:                          req.SiteNameEN,
		SiteBrowserTitle:                    req.SiteBrowserTitle,
		SiteBrowserTitleEN:                  req.SiteBrowserTitleEN,
		SiteLogoDataURL:                     req.SiteLogoDataURL,
		SiteFooterText:                      req.SiteFooterText,
		SiteICPRecordNumber:                 req.SiteICPRecordNumber,
		SitePublicSecurityRecordNumber:      req.SitePublicSecurityRecordNumber,
		HomePageAnnouncementEnabled:         req.HomePageAnnouncementEnabled,
		HomePageAnnouncementContent:         req.HomePageAnnouncementContent,
		UserCenterAnnouncementEnabled:       req.UserCenterAnnouncementEnabled,
		UserCenterAnnouncementContent:       req.UserCenterAnnouncementContent,
		DeveloperAnnouncementEnabled:        req.DeveloperAnnouncementEnabled,
		DeveloperAnnouncementContent:        req.DeveloperAnnouncementContent,
		FrontendBaseURL:                     req.FrontendBaseURL,
		OIDCFirstPartyClientID:              req.OIDCFirstPartyClientID,
		OIDCFirstPartyClientSecret:          req.OIDCFirstPartyClientSecret,
		OIDCFirstPartyScope:                 req.OIDCFirstPartyScope,
		OIDCAutoApproveClientIDs:            req.OIDCAutoApproveClientIDs,
		OIDCAutoApproveRedirectHosts:        req.OIDCAutoApproveRedirectHosts,
		SMTPHost:                            req.SMTPHost,
		SMTPPort:                            req.SMTPPort,
		SMTPUsername:                        req.SMTPUsername,
		SMTPPassword:                        req.SMTPPassword,
		SMTPFrom:                            req.SMTPFrom,
		SMTPForceSSL:                        req.SMTPForceSSL,
		SMTPVerificationCodeTTLMinute:       req.SMTPVerificationCodeTTLMinute,
		SMTPVerificationCodeCooldownSecond:  req.SMTPVerificationCodeCooldownSecond,
		LoginCodeSubjectTemplate:            req.LoginCodeSubjectTemplate,
		LoginCodeBodyTemplate:               req.LoginCodeBodyTemplate,
		LoginCodeSubjectTemplateEN:          req.LoginCodeSubjectTemplateEN,
		LoginCodeBodyTemplateEN:             req.LoginCodeBodyTemplateEN,
		RegisterCodeSubjectTemplate:         req.RegisterCodeSubjectTemplate,
		RegisterCodeBodyTemplate:            req.RegisterCodeBodyTemplate,
		RegisterCodeSubjectTemplateEN:       req.RegisterCodeSubjectTemplateEN,
		RegisterCodeBodyTemplateEN:          req.RegisterCodeBodyTemplateEN,
		ResetPasswordCodeSubjectTemplate:    req.ResetPasswordCodeSubjectTemplate,
		ResetPasswordCodeBodyTemplate:       req.ResetPasswordCodeBodyTemplate,
		ResetPasswordCodeSubjectTemplateEN:  req.ResetPasswordCodeSubjectTemplateEN,
		ResetPasswordCodeBodyTemplateEN:     req.ResetPasswordCodeBodyTemplateEN,
		DeleteAccountCodeSubjectTemplate:    req.DeleteAccountCodeSubjectTemplate,
		DeleteAccountCodeBodyTemplate:       req.DeleteAccountCodeBodyTemplate,
		DeleteAccountCodeSubjectTemplateEN:  req.DeleteAccountCodeSubjectTemplateEN,
		DeleteAccountCodeBodyTemplateEN:     req.DeleteAccountCodeBodyTemplateEN,
		ChangeEmailCodeSubjectTemplate:      req.ChangeEmailCodeSubjectTemplate,
		ChangeEmailCodeBodyTemplate:         req.ChangeEmailCodeBodyTemplate,
		ChangeEmailCodeSubjectTemplateEN:    req.ChangeEmailCodeSubjectTemplateEN,
		ChangeEmailCodeBodyTemplateEN:       req.ChangeEmailCodeBodyTemplateEN,
		SMSProvider:                         req.SMSProvider,
		SMSTemplateProvider:                 req.SMSTemplateProvider,
		SMSAPIBase:                          req.SMSAPIBase,
		SMSUsername:                         req.SMSUsername,
		SMSPassword:                         req.SMSPassword,
		SMSSignature:                        req.SMSSignature,
		SMSLoginTemplate:                    req.SMSLoginTemplate,
		SMSRegisterTemplate:                 req.SMSRegisterTemplate,
		SMSResetPasswordTemplate:            req.SMSResetPasswordTemplate,
		SMSBindPhoneTemplate:                req.SMSBindPhoneTemplate,
		SMSDeleteAccountTemplate:            req.SMSDeleteAccountTemplate,
		AliyunSMSAccessKeyID:                req.AliyunSMSAccessKeyID,
		AliyunSMSAccessKeySecret:            req.AliyunSMSAccessKeySecret,
		AliyunSMSEndpoint:                   req.AliyunSMSEndpoint,
		AliyunSMSRegionID:                   req.AliyunSMSRegionID,
		AliyunSMSSignName:                   req.AliyunSMSSignName,
		AliyunSMSLoginTemplateCode:          req.AliyunSMSLoginTemplateCode,
		AliyunSMSRegisterTemplateCode:       req.AliyunSMSRegisterTemplateCode,
		AliyunSMSResetTemplateCode:          req.AliyunSMSResetTemplateCode,
		AliyunSMSBindPhoneTemplateCode:      req.AliyunSMSBindPhoneTemplateCode,
		AliyunSMSDeleteTemplateCode:         req.AliyunSMSDeleteTemplateCode,
		RiskControlEnabled:                  req.RiskControlEnabled,
		RiskImmediateBindProbability:        req.RiskImmediateBindProbability,
		RiskDelayedBindProbability:          req.RiskDelayedBindProbability,
		RiskDelayedBindLoginCount:           req.RiskDelayedBindLoginCount,
		RateLimitEnabled:                    req.RateLimitEnabled,
		SendChallengeEnabled:                req.SendChallengeEnabled,
		ChallengeTokenTTLSeconds:            req.ChallengeTokenTTLSeconds,
		ChallengeRequiredAfterIPMinuteCount: req.ChallengeRequiredAfterIPMinuteCount,
		CaptchaRequiredAfterIPHourCount:     req.CaptchaRequiredAfterIPHourCount,
		EmailTargetCooldownSeconds:          req.EmailTargetCooldownSeconds,
		EmailIPMinuteLimit:                  req.EmailIPMinuteLimit,
		EmailIPHourLimit:                    req.EmailIPHourLimit,
		EmailIPHourUniqueTargetLimit:        req.EmailIPHourUniqueTargetLimit,
		EmailGlobalMinuteLimit:              req.EmailGlobalMinuteLimit,
		EmailGlobalHourLimit:                req.EmailGlobalHourLimit,
		EmailFuseMinutes:                    req.EmailFuseMinutes,
		SMSTargetCooldownSeconds:            req.SMSTargetCooldownSeconds,
		SMSIPMinuteLimit:                    req.SMSIPMinuteLimit,
		SMSIPHourLimit:                      req.SMSIPHourLimit,
		SMSIPHourUniqueTargetLimit:          req.SMSIPHourUniqueTargetLimit,
		SMSGlobalMinuteLimit:                req.SMSGlobalMinuteLimit,
		SMSGlobalHourLimit:                  req.SMSGlobalHourLimit,
		SMSFuseMinutes:                      req.SMSFuseMinutes,
		AdminTestEmailMinuteLimit:           req.AdminTestEmailMinuteLimit,
		AdminTestEmailDailyLimit:            req.AdminTestEmailDailyLimit,
		AdminTestSMSMinuteLimit:             req.AdminTestSMSMinuteLimit,
		AdminTestSMSDailyLimit:              req.AdminTestSMSDailyLimit,
		AuthAttemptWindowMinutes:            req.AuthAttemptWindowMinutes,
		AuthAttemptLockMinutes:              req.AuthAttemptLockMinutes,
		PasswordLoginAccountAttemptLimit:    req.PasswordLoginAccountAttemptLimit,
		OTPLoginAccountAttemptLimit:         req.OTPLoginAccountAttemptLimit,
		MFALoginAccountAttemptLimit:         req.MFALoginAccountAttemptLimit,
		AuthAttemptIPLimit:                  req.AuthAttemptIPLimit,
		AuthAttemptDeviceLimit:              req.AuthAttemptDeviceLimit,
	}); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"updated": true})
}

func (s *Server) handleSendTestEmail(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	var req testEmailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := s.services.Settings.SendTestEmail(admin.ID, req.Email); err != nil {
		if writeSecurityFlowError(c, err) {
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"sent": true})
}

func (s *Server) handleSendTestSMS(c *gin.Context) {
	admin := c.MustGet("user").(domain.User)
	var req testSMSRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := s.services.Settings.SendTestSMS(admin.ID, req.Provider, req.Phone, req.Content); err != nil {
		if writeSecurityFlowError(c, err) {
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"sent": true})
}

func (s *Server) handleUploadSiteLogo(c *gin.Context) {
	url, err := s.storeUploadedImage(c, "file", "site-logo")
	if err != nil {
		if errors.Is(err, http.ErrMissingFile) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "missing logo file"})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": uploadSiteLogoResponse{URL: url}})
}
