import { Form, message } from "antd";
import type { FormInstance } from "antd";
import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { API_BASE } from "../../../api/client";
import { useAdminI18n } from "../i18n";
import { sendTestEmail as sendTestEmailRequest, sendTestSMS as sendTestSMSRequest, updateSystemSettings } from "../services/adminApi";
import { convertImageToWebp, uploadSiteLogo } from "../utils/imageConverter";
import type { SettingsTabKey, SystemSettings } from "../types";

export function useSystemSettings(
  sessionToken: string,
  settings: SystemSettings,
  setSettings: Dispatch<SetStateAction<SystemSettings>>,
  reload: () => Promise<void>,
  setError: (value?: string) => void,
  pageType: string,
  activeSettingsTab: SettingsTabKey
) {
  const { t } = useAdminI18n();
  const backendOrigin = useMemo(() => API_BASE.replace(/\/api$/, ""), []);
  const [messageApi, contextHolder] = message.useMessage();
  const [savingSettings, setSavingSettings] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingSMS, setTestingSMS] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testSMSProvider, setTestSMSProvider] = useState(settings.sms_provider || "disabled");
  const [testSMSPhone, setTestSMSPhone] = useState("");
  const [testSMSContent, setTestSMSContent] = useState("这是一条来自 MySSO 的测试短信。");
  const [siteForm] = Form.useForm<SystemSettings>();
  const [smtpForm] = Form.useForm<SystemSettings>();
  const [verificationForm] = Form.useForm<SystemSettings>();
  const [intlForm] = Form.useForm<SystemSettings>();
  const [sessionForm] = Form.useForm<SystemSettings>();
  const [smsForm] = Form.useForm<SystemSettings>();
  const [announcementForm] = Form.useForm<SystemSettings>();
  const [riskForm] = Form.useForm<SystemSettings>();
  const [rateLimitForm] = Form.useForm<SystemSettings>();

  const siteLogoFieldValue = Form.useWatch("site_logo_data_url", siteForm);
  const smsProviderFieldValue = Form.useWatch("sms_provider", smsForm);
  const smsTemplateProviderFieldValue = Form.useWatch("sms_template_provider", smsForm);

  const handleValidationError = useCallback(
    (form: FormInstance<SystemSettings>, err: unknown) => {
      const firstError = (err as { errorFields?: Array<{ name: (string | number)[]; errors?: string[] }> })?.errorFields?.[0];
      if (!firstError) {
        return;
      }
      form.scrollToField(firstError.name, { behavior: "smooth", block: "center" });
      const firstMessage = firstError.errors?.[0];
      if (firstMessage) {
        messageApi.error(firstMessage);
      }
    },
    [messageApi]
  );

  useEffect(() => {
    setTestSMSProvider(settings.sms_provider || "disabled");
  }, [settings.sms_provider]);

  useEffect(() => {
    if (pageType !== "settings") {
      return;
    }
    if (activeSettingsTab === "site") {
      siteForm.setFieldsValue(settings);
      return;
    }
    if (activeSettingsTab === "session") {
      sessionForm.setFieldsValue(settings);
      return;
    }
    if (activeSettingsTab === "email") {
      smtpForm.setFieldsValue(settings);
      return;
    }
    if (activeSettingsTab === "sms") {
      smsForm.setFieldsValue(settings);
      return;
    }
    if (activeSettingsTab === "media") {
      announcementForm.setFieldsValue(settings);
      return;
    }
    if (activeSettingsTab === "addons") {
      riskForm.setFieldsValue(settings);
      return;
    }
    if (activeSettingsTab === "verification") {
      verificationForm.setFieldsValue(settings);
      return;
    }
    if (activeSettingsTab === "intl") {
      intlForm.setFieldsValue(settings);
      return;
    }
    if (activeSettingsTab === "queue") {
      rateLimitForm.setFieldsValue(settings);
    }
  }, [activeSettingsTab, announcementForm, intlForm, pageType, rateLimitForm, riskForm, settings, siteForm, smtpForm, verificationForm, sessionForm, smsForm]);

  const saveSystemSettings = useCallback(
    async (values: Partial<SystemSettings>, successText: string) => {
      setSavingSettings(true);
      setError(undefined);
      try {
        const nextSettings = { ...settings, ...values };
        await updateSystemSettings(sessionToken, nextSettings);
        const sanitizedSettings = {
          ...nextSettings,
          oidc_first_party_client_secret: "",
          oidc_first_party_client_secret_configured:
            settings.oidc_first_party_client_secret_configured || Boolean(nextSettings.oidc_first_party_client_secret),
          smtp_password: "",
          smtp_password_configured: settings.smtp_password_configured || Boolean(nextSettings.smtp_password),
          sms_password: "",
          sms_password_configured: settings.sms_password_configured || Boolean(nextSettings.sms_password),
          aliyun_sms_access_key_secret: "",
          aliyun_sms_access_key_secret_configured:
            settings.aliyun_sms_access_key_secret_configured || Boolean(nextSettings.aliyun_sms_access_key_secret)
        };
        setSettings(sanitizedSettings);
        localStorage.setItem("site_name", nextSettings.site_name);
        localStorage.setItem("site_name_en", nextSettings.site_name_en || "");
        localStorage.setItem("site_browser_title", nextSettings.site_browser_title || "");
        localStorage.setItem("site_browser_title_en", nextSettings.site_browser_title_en || "");
        localStorage.setItem("site_logo_data_url", nextSettings.site_logo_data_url || "");
        localStorage.setItem("site_footer_text", nextSettings.site_footer_text || "");
        localStorage.setItem("site_icp_record_number", nextSettings.site_icp_record_number || "");
        localStorage.setItem("site_public_security_record_number", nextSettings.site_public_security_record_number || "");
        window.dispatchEvent(
          new CustomEvent("site-name-updated", {
            detail: {
              siteName: nextSettings.site_name,
              siteNameEn: nextSettings.site_name_en || "",
              siteBrowserTitle: nextSettings.site_browser_title || "",
              siteBrowserTitleEn: nextSettings.site_browser_title_en || "",
              siteLogoDataUrl: nextSettings.site_logo_data_url || "",
              siteFooterText: nextSettings.site_footer_text || "",
              siteICPRecordNumber: nextSettings.site_icp_record_number || "",
              sitePublicSecurityRecordNumber: nextSettings.site_public_security_record_number || ""
            }
          })
        );
        messageApi.success(successText);
        await reload();
      } catch (err) {
        messageApi.error(err instanceof Error ? err.message : t("保存失败"));
        setError(err instanceof Error ? err.message : t("保存失败"));
      } finally {
        setSavingSettings(false);
      }
    },
    [messageApi, reload, sessionToken, setError, setSettings, settings, t]
  );

  const saveEmailSettings = useCallback(async () => {
    const values = await smtpForm.validateFields([
      "smtp_host",
      "smtp_port",
      "smtp_username",
      "smtp_password",
      "smtp_from",
      "smtp_force_ssl",
      "smtp_verification_code_ttl_minutes"
    ]);
    await saveSystemSettings(values, "邮件设置已保存");
  }, [saveSystemSettings, smtpForm]);

  const saveSiteSettings = useCallback(async () => {
    try {
      const values = await siteForm.validateFields([
        "site_name",
        "site_name_en",
        "site_browser_title",
        "site_browser_title_en",
        "site_logo_data_url",
        "site_footer_text",
        "site_icp_record_number",
        "site_public_security_record_number",
        "frontend_base_url",
        "oidc_first_party_client_id",
        "oidc_first_party_client_secret",
        "oidc_first_party_scope",
        "oidc_auto_approve_client_ids",
        "oidc_auto_approve_redirect_hosts"
      ]);
      await saveSystemSettings(values, "站点信息已保存");
    } catch (err) {
      handleValidationError(siteForm, err);
    }
  }, [handleValidationError, saveSystemSettings, siteForm]);

  const saveVerificationSettings = useCallback(async () => {
    const values = await verificationForm.validateFields([
      "smtp_verification_code_ttl_minutes",
      "smtp_verification_code_cooldown_seconds"
    ]);
    await saveSystemSettings(values, "验证码策略已保存");
  }, [saveSystemSettings, verificationForm]);

  const saveIntlSettings = useCallback(async () => {
    const values = await intlForm.validateFields([
      "login_code_subject_template",
      "login_code_body_template",
      "login_code_subject_template_en",
      "login_code_body_template_en",
      "register_code_subject_template",
      "register_code_body_template",
      "register_code_subject_template_en",
      "register_code_body_template_en",
      "reset_password_code_subject_template",
      "reset_password_code_body_template",
      "reset_password_code_subject_template_en",
      "reset_password_code_body_template_en",
      "delete_account_code_subject_template",
      "delete_account_code_body_template",
      "delete_account_code_subject_template_en",
      "delete_account_code_body_template_en",
      "change_email_code_subject_template",
      "change_email_code_body_template",
      "change_email_code_subject_template_en",
      "change_email_code_body_template_en"
    ]);
    await saveSystemSettings(values, "国际化模板已保存");
  }, [intlForm, saveSystemSettings]);

  const saveSMSSettings = useCallback(async () => {
    const values = await smsForm.validateFields();
    await saveSystemSettings(values, "发信配置已保存");
  }, [saveSystemSettings, smsForm]);

  const saveSessionSettings = useCallback(async () => {
    const values = await sessionForm.validateFields(["allow_user_registration", "enable_phone_verification"]);
    await saveSystemSettings(values, "用户会话设置已保存");
  }, [saveSystemSettings, sessionForm]);

  const saveAnnouncementSettings = useCallback(async () => {
    const values = await announcementForm.validateFields([
      "user_center_announcement_enabled",
      "user_center_announcement_content",
      "developer_announcement_enabled",
      "developer_announcement_content"
    ]);
    await saveSystemSettings(values, "公告配置已保存");
  }, [announcementForm, saveSystemSettings]);

  const saveRiskSettings = useCallback(async () => {
    const values = await riskForm.validateFields([
      "risk_control_enabled",
      "risk_immediate_bind_probability",
      "risk_delayed_bind_probability",
      "risk_delayed_bind_login_count"
    ]);
    await saveSystemSettings(values, "风控管理已保存");
  }, [riskForm, saveSystemSettings]);

  const saveRateLimitSettings = useCallback(async () => {
    const values = await rateLimitForm.validateFields();
    await saveSystemSettings(values, "限流管理已保存");
  }, [rateLimitForm, saveSystemSettings]);

  const handleSiteLogoUpload = useCallback(
    async (file: File) => {
      setError(undefined);
      try {
        const dataUrl = await convertImageToWebp(file);
        const fileUrl = await uploadSiteLogo(dataUrl, sessionToken);
        siteForm.setFieldValue("site_logo_data_url", fileUrl);
        setSettings((current) => ({ ...current, site_logo_data_url: fileUrl }));
        messageApi.success(t("图标已转换为 WebP 并上传，可保存生效"));
      } catch (err) {
        setError(err instanceof Error ? err.message : t("图标处理失败"));
      }
    },
    [messageApi, sessionToken, setError, setSettings, siteForm, t]
  );

  const clearSiteLogo = useCallback(() => {
    siteForm.setFieldValue("site_logo_data_url", "");
    setSettings((current) => ({ ...current, site_logo_data_url: "" }));
  }, [setSettings, siteForm]);

  const sendTestEmail = useCallback(async () => {
    setTestingEmail(true);
    setError(undefined);
    try {
      await sendTestEmailRequest(sessionToken, testEmail);
      messageApi.success("测试邮件已发送");
    } catch (err) {
      setError(err instanceof Error ? err.message : "测试邮件发送失败");
    } finally {
      setTestingEmail(false);
    }
  }, [messageApi, sessionToken, setError, testEmail]);

  const sendTestSMS = useCallback(async () => {
    setTestingSMS(true);
    setError(undefined);
    try {
      await sendTestSMSRequest(sessionToken, testSMSProvider, testSMSPhone, testSMSContent);
      messageApi.success("测试短信已发送");
    } catch (err) {
      setError(err instanceof Error ? err.message : "测试短信发送失败");
    } finally {
      setTestingSMS(false);
    }
  }, [messageApi, sessionToken, setError, testSMSContent, testSMSPhone, testSMSProvider]);

  return {
    backendOrigin,
    contextHolder,
    messageApi,
    savingSettings,
    testingEmail,
    testingSMS,
    testEmail,
    setTestEmail,
    testSMSProvider,
    setTestSMSProvider,
    testSMSPhone,
    setTestSMSPhone,
    testSMSContent,
    setTestSMSContent,
    siteForm,
    smtpForm,
    verificationForm,
    intlForm,
    sessionForm,
    smsForm,
    announcementForm,
    riskForm,
    rateLimitForm,
    siteLogoFieldValue,
    smsProviderFieldValue,
    smsTemplateProviderFieldValue,
    saveEmailSettings,
    saveSiteSettings,
    saveVerificationSettings,
    saveIntlSettings,
    saveSMSSettings,
    saveSessionSettings,
    saveAnnouncementSettings,
    saveRiskSettings,
    saveRateLimitSettings,
    handleSiteLogoUpload,
    clearSiteLogo,
    sendTestEmail,
    sendTestSMS
  };
}
