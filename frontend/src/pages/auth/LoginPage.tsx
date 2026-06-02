import { useEffect, useState } from "react";
import { Button, Card, Form, Input, Space, Tabs, Typography, message } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_BASE, ApiError, api } from "../../api/client";
import { useEmailCodeCooldown } from "../../utils/emailCodeCooldown";
import { buildSearchString, getSafeRedirect, pickAllowedSearchParams, withUpdatedSearch } from "../../utils/urlState";
import {
  ACCOUNT_LOCALE_STORAGE_KEY,
  accountLocaleLabel,
  normalizeAccountLocale,
  type AccountLocale
} from "../../i18n/accountLocale";
import { useTranslation } from "react-i18next";
import { buildFirstPartyLoginPath } from "./oidc";
import { AccountLanguageModal } from "../../components/AccountLanguageModal";
import { AuthPageFooter } from "../../components/AuthPageFooter";
import { getStoredSiteName, persistSiteBranding, resolveSiteNameForLocale } from "../../siteBranding";
import { browserSupportsPasskey, getPasskeyAssertion } from "../../utils/webauthn";
import { handleLoginFlowResult, type LoginFlowResponse } from "./authLoginFlow";
import { useCaptchaGate } from "../../hooks/useCaptchaGate";

type PublicSettings = {
  data?: {
    allow_user_registration?: boolean;
    enable_phone_verification?: boolean;
    site_name?: string;
    site_name_en?: string;
    site_logo_data_url?: string;
    site_footer_text?: string;
  };
};

type LoginTabKey = "password" | "otp" | "sms" | "passkey";

export function LoginPage() {
  const backendOrigin = API_BASE.replace(/\/api$/, "");
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [smsSending, setSMSSending] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = pickAllowedSearchParams(location.search);
  const { t, i18n } = useTranslation();
  const [otpForm] = Form.useForm();
  const [smsForm] = Form.useForm();
  const otpEmail = Form.useWatch("email", otpForm) || "";
  const smsPhone = Form.useWatch("phone", smsForm) || "";
  const { remainingSeconds, startCooldown } = useEmailCodeCooldown(otpEmail, "login");
  const { remainingSeconds: smsRemainingSeconds, startCooldown: startSMSCooldown } = useEmailCodeCooldown(smsPhone, "login");
  const authSearch = buildSearchString(location.search);
  const hasAuthorizationContext = Boolean(searchParams.get("client_id"));
  const usesAuthorizationFlowSession = searchParams.get("auth_flow") === "authorization";
  const requestedTab = searchParams.get("tab");
  const loginTab: LoginTabKey = requestedTab === "otp" || requestedTab === "sms" || requestedTab === "passkey" ? requestedTab : "password";
  const [registrationAllowed, setRegistrationAllowed] = useState(true);
  const [phoneVerificationEnabled, setPhoneVerificationEnabled] = useState(true);
  const [siteName, setSiteName] = useState(getStoredSiteName(i18n.language));
  const [siteLogoDataUrl, setSiteLogoDataUrl] = useState(localStorage.getItem("site_logo_data_url") || "");
  const [siteFooterText, setSiteFooterText] = useState(localStorage.getItem("site_footer_text") || "");
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const accountLocale = normalizeAccountLocale(i18n.language);
  const supportsSMSLogin = accountLocale === "zh-CN" && phoneVerificationEnabled;
  const supportsPasskey = browserSupportsPasskey();
  const activeLoginTab: LoginTabKey = !supportsSMSLogin && loginTab === "sms" ? "password" : loginTab;
  const { requestCaptcha, captchaModal } = useCaptchaGate();

  function translateLoginError(rawMessage: string) {
    const normalizedMessage = rawMessage.trim();
    const lowerCasedMessage = normalizedMessage.toLowerCase();
    const frozenReasonPrefix = "该账户已冻结，理由 ";
    const frozenReasonEnglishPrefix = "this account has been frozen. reason:";

    if (normalizedMessage === "该账户已冻结") {
      return t("errors.accountFrozen");
    }

    if (normalizedMessage.startsWith(frozenReasonPrefix)) {
      return t("errors.accountFrozenWithReason", {
        reason: normalizedMessage.slice(frozenReasonPrefix.length).trim(),
      });
    }

    if (lowerCasedMessage === "this account has been frozen") {
      return t("errors.accountFrozen");
    }

    if (lowerCasedMessage.startsWith(frozenReasonEnglishPrefix)) {
      return t("errors.accountFrozenWithReason", {
        reason: normalizedMessage.slice(frozenReasonEnglishPrefix.length).trim(),
      });
    }

    if (
      normalizedMessage.includes("'email' is required") ||
      lowerCasedMessage.includes("\"email\" is required") ||
      lowerCasedMessage.includes("email is required")
    ) {
      return t("errors.emailRequiredByServer");
    }

    if (
      normalizedMessage.includes("'password' is required") ||
      lowerCasedMessage.includes("\"password\" is required") ||
      lowerCasedMessage.includes("password is required")
    ) {
      return t("errors.passwordRequiredByServer");
    }

    switch (lowerCasedMessage) {
      case "'email' is required":
        return t("errors.emailRequiredByServer");
      case "'password' is required":
        return t("errors.passwordRequiredByServer");
      case "invalid credentials":
        return t("errors.invalidCredentials");
      case "invalid otp code":
        return t("errors.invalidOtpCode");
      case "user not found":
        return t("errors.userNotFound");
      case "sms not configured":
        return t("errors.smsNotConfigured");
      case "smtp not configured":
        return t("errors.smtpNotConfigured");
      case "invalid mfa code":
        return t("errors.invalidMfaCode");
      case "cooldown_active":
        return t("errors.cooldownActive");
      case "passkey challenge expired":
        return t("errors.passkeyChallengeExpired");
      case "passkey verification failed":
        return t("errors.passkeyVerificationFailed");
      case "passkey browser unsupported":
        return t("errors.passkeyBrowserUnsupported");
      case "invalid login step-up verification code":
        return t("errors.invalidLoginStepUpVerificationCode");
      case "login step-up challenge expired or invalid":
        return t("errors.loginStepUpChallengeExpiredOrInvalid");
      case "mfa enrollment challenge expired or invalid":
        return t("errors.mfaEnrollmentChallengeExpiredOrInvalid");
      case "no available mfa method for current account":
        return t("errors.noAvailableMfaMethodForCurrentAccount");
      case "no available login verification target for current account":
        return t("errors.noAvailableLoginVerificationTargetForCurrentAccount");
      default:
        if (rawMessage.startsWith("user status is ")) {
          return t("errors.userStatusInvalid");
        }
        return rawMessage;
    }
  }

  function isAccountNotRegisteredError(rawMessage: string) {
    return rawMessage === "user not found";
  }

  useEffect(() => {
    const locale = searchParams.get("locale");
    if (locale) {
      const normalizedLocale = normalizeAccountLocale(locale);
      localStorage.setItem(ACCOUNT_LOCALE_STORAGE_KEY, normalizedLocale);
      if (normalizedLocale !== accountLocale) {
        void i18n.changeLanguage(normalizedLocale);
      }
    }
  }, [accountLocale, i18n, searchParams]);

  useEffect(() => {
    let active = true;
    void api<{ installed: boolean }>("/install/status")
      .then((result) => {
        if (active && !result.installed) {
          navigate("/install", { replace: true });
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    setSiteName(getStoredSiteName(i18n.language));
  }, [i18n.language]);

  useEffect(() => {
    let active = true;
    void api<PublicSettings>("/public/settings")
      .then((result) => {
        if (active) {
          setRegistrationAllowed(result.data?.allow_user_registration !== false);
          setPhoneVerificationEnabled(result.data?.enable_phone_verification !== false);
          const nextSiteName = resolveSiteNameForLocale(i18n.language, result.data?.site_name, result.data?.site_name_en);
          const nextSiteLogo = result.data?.site_logo_data_url?.trim() || "";
          const nextSiteFooterText = result.data?.site_footer_text || "";
          persistSiteBranding(result.data);
          setSiteName(nextSiteName);
          setSiteLogoDataUrl(nextSiteLogo);
          setSiteFooterText(nextSiteFooterText);
          localStorage.setItem("site_logo_data_url", nextSiteLogo);
          localStorage.setItem("site_footer_text", nextSiteFooterText);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [i18n.language]);

  useEffect(() => {
    let active = true;
    if (hasAuthorizationContext) {
      return () => {
        active = false;
      };
    }

    void buildFirstPartyLoginPath(location.search, getSafeRedirect(location.search))
      .then((path) => {
        if (!active) {
          return;
        }
        const currentPath = `${location.pathname}${location.search}`;
        if (path !== currentPath) {
          window.location.replace(path);
        }
      })
      .catch((err) => {
        if (!active) {
          return;
        }
        messageApi.error(
          translateLoginError(
            err instanceof Error ? err.message : t("auth.loginFailed")
          )
        );
      });

    return () => {
      active = false;
    };
  }, [hasAuthorizationContext, location.pathname, location.search, messageApi, t]);

  const siteLogoUrl = siteLogoDataUrl ? (siteLogoDataUrl.startsWith("http") ? siteLogoDataUrl : `${backendOrigin}${siteLogoDataUrl}`) : "";

  async function submit(values: Record<string, string>, useOtp = false, captchaPayload: Record<string, unknown> = {}) {
    setLoading(true);
    try {
      const result = await api<LoginFlowResponse>(
        useOtp ? "/auth/login-otp" : "/auth/login",
        {
          method: "POST",
          body: JSON.stringify(
            useOtp
              ? { email: values.email, otp: values.otp }
              : { email: values.email, password: values.password, ...captchaPayload }
          )
        }
      );
      await handleLoginFlowResult(result, { locationSearch: location.search, navigate });
    } catch (err) {
      if (!useOtp && err instanceof ApiError && err.payload.captcha_required) {
        try {
          const nextCaptchaPayload = await requestCaptcha({
            flow: "password_login_mfa",
            purpose: "mfa_login",
            target: String(values.email || ""),
          });
          await submit(values, useOtp, nextCaptchaPayload);
        } catch (captchaErr) {
          if (captchaErr instanceof Error && captchaErr.message === "captcha cancelled") {
            return;
          }
          messageApi.error(translateLoginError(captchaErr instanceof Error ? captchaErr.message : t("auth.loginFailed")));
        }
        return;
      }
      const nextMessage = err instanceof Error ? err.message : t("auth.loginFailed");
      if (nextMessage.includes("system not installed")) {
        navigate("/install", { replace: true });
        return;
      }
      if (useOtp && isAccountNotRegisteredError(nextMessage)) {
        navigate(`/register${authSearch}`, { replace: true });
        return;
      }
      messageApi.error(translateLoginError(nextMessage));
    } finally {
      setLoading(false);
    }
  }

  async function submitSMSLogin(values: Record<string, string>) {
    setLoading(true);
    try {
      const result = await api<LoginFlowResponse>("/auth/login-sms", {
        method: "POST",
        body: JSON.stringify({
          phone: values.phone,
          otp: values.otp
        })
      });
      await handleLoginFlowResult(result, { locationSearch: location.search, navigate });
    } catch (err) {
      const nextMessage = err instanceof Error ? err.message : t("auth.loginFailed");
      if (nextMessage.includes("system not installed")) {
        navigate("/install", { replace: true });
        return;
      }
      if (isAccountNotRegisteredError(nextMessage)) {
        navigate(`/register${authSearch}`, { replace: true });
        return;
      }
      messageApi.error(translateLoginError(nextMessage));
    } finally {
      setLoading(false);
    }
  }

  async function sendLoginCode(email?: string) {
    if (!email) {
      messageApi.error(t("auth.sendOtpCodeEmailRequired"));
      return;
    }
    setOtpSending(true);
    try {
      const captchaPayload = await requestCaptcha({
        flow: "email_code",
        purpose: "login",
        target: email,
      });
      const result = await api<{ cooldown_seconds?: number }>("/auth/email-code", {
        method: "POST",
        body: JSON.stringify({
          email,
          purpose: "login",
          ...captchaPayload
        })
      });
      startCooldown(Number(result.cooldown_seconds || 0), email);
      messageApi.success(t("auth.sendOtpCodeSuccess"));
    } catch (err) {
      messageApi.error(translateLoginError(err instanceof Error ? err.message : t("auth.sendOtpCodeFailed")));
    } finally {
      setOtpSending(false);
    }
  }

  async function sendSMSLoginCode(phone?: string) {
    if (!phone) {
      messageApi.error(t("auth.sendOtpCodePhoneRequired"));
      return;
    }
    setSMSSending(true);
    try {
      const captchaPayload = await requestCaptcha({
        flow: "sms_code",
        purpose: "login",
        target: phone,
      });
      const result = await api<{ cooldown_seconds?: number }>("/auth/sms-code", {
        method: "POST",
        body: JSON.stringify({
          phone,
          purpose: "login",
          ...captchaPayload
        })
      });
      startSMSCooldown(Number(result.cooldown_seconds || 0), phone);
      messageApi.success(t("auth.sendPhoneOtpCodeSuccess"));
    } catch (err) {
      messageApi.error(translateLoginError(err instanceof Error ? err.message : t("auth.sendPhoneOtpCodeFailed")));
    } finally {
      setSMSSending(false);
    }
  }

  async function submitPasskeyLogin() {
    if (!supportsPasskey) {
      messageApi.error(t("errors.passkeyBrowserUnsupported"));
      return;
    }
    setPasskeyLoading(true);
    try {
      const prepare = await api<{ challenge_token: string; options: any }>("/auth/passkey/login/options", {
        method: "POST",
        body: JSON.stringify({})
      });
      const credential = await getPasskeyAssertion(prepare.options);
      const result = await api<LoginFlowResponse>("/auth/passkey/login/verify", {
        method: "POST",
        body: JSON.stringify({
          challenge_token: prepare.challenge_token,
          credential
        })
      });
      await handleLoginFlowResult(result, { locationSearch: location.search, navigate });
    } catch (err) {
      const nextMessage = err instanceof Error ? err.message : t("auth.loginFailed");
      if (nextMessage === "NotAllowedError") {
        messageApi.error(t("auth.passkeyNotAvailable"));
        return;
      }
      messageApi.error(translateLoginError(nextMessage));
    } finally {
      setPasskeyLoading(false);
    }
  }

  function updateAccountLocale(nextLocale: AccountLocale) {
    localStorage.setItem(ACCOUNT_LOCALE_STORAGE_KEY, nextLocale);
    void i18n.changeLanguage(nextLocale);
    navigate(
      {
        pathname: location.pathname,
        search: withUpdatedSearch(location.search, { locale: nextLocale })
      },
      { replace: true }
    );
  }

  return (
    <div className="center-page login-page login-page--glass">
      {contextHolder}
      {captchaModal}
      <div className="login-page__backdrop" aria-hidden="true" />
      <div className="auth-page-toolbar">
        <Button type="link" className="auth-language-button" onClick={() => setLanguageModalOpen(true)}>
          {accountLocaleLabel[accountLocale]}
        </Button>
      </div>
      <Card className="auth-card auth-card--glass">
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <div className="login-page__hero">
            <div className="auth-brand">
              {siteLogoUrl ? (
                <img src={siteLogoUrl} alt={siteName} className="auth-brand-logo" />
              ) : null}
              <Typography.Title level={2} style={{ margin: 0 }}>
                {siteName}
              </Typography.Title>
            </div>
            <div className="login-page__hero-copy">
              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                <Typography.Text type="secondary">
                  {registrationAllowed ? <>{t("auth.noAccount")} <Link to={`/register${authSearch}`}>{t("auth.registerNow")}</Link></> : t("auth.registrationClosed")}
                </Typography.Text>
                <Typography.Text type="secondary">
                  {t("auth.forgotPasswordPrompt")}{" "}
                  <Link to={`/forgot-password${authSearch}`}>{t("auth.forgotPasswordAction")}</Link>
                </Typography.Text>
              </Space>
            </div>
          </div>
          <Tabs
            activeKey={activeLoginTab}
            onChange={(key) => {
              navigate(
                {
                  pathname: location.pathname,
                  search: withUpdatedSearch(location.search, { tab: key })
                },
                { replace: true }
              );
            }}
            items={[
              {
                key: "password",
                label: t("auth.passwordLogin"),
                children: (
                  <Form layout="vertical" onFinish={(values) => submit(values, false)}>
                    <Form.Item
                      label={t("auth.email")}
                      name="email"
                      rules={[{ required: true, message: t("auth.emailRequired") }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label={t("auth.password")}
                      name="password"
                      rules={[{ required: true, message: t("auth.passwordRequired") }]}
                    >
                      <Input.Password />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                      {t("auth.login")}
                    </Button>
                  </Form>
                )
              },
              {
                key: "otp",
                label: t("auth.otpLogin"),
                children: (
                  <Form form={otpForm} layout="vertical" onFinish={(values) => submit(values, true)}>
                    <Form.Item
                      label={t("auth.email")}
                      name="email"
                      rules={[{ required: true, message: t("auth.emailRequired") }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item label={t("auth.otpCode")} required>
                      <Space.Compact style={{ width: "100%" }}>
                        <Form.Item
                          name="otp"
                          noStyle
                          rules={[{ required: true, message: t("auth.otpCodeRequired") }]}
                        >
                          <Input />
                        </Form.Item>
                        <Button
                          onClick={() => void sendLoginCode(otpForm.getFieldValue("email"))}
                          loading={otpSending}
                          disabled={remainingSeconds > 0}
                        >
                          {remainingSeconds > 0 ? `${remainingSeconds}s` : t("auth.sendOtpCode")}
                        </Button>
                      </Space.Compact>
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                      {t("auth.login")}
                    </Button>
                  </Form>
                )
              },
              ...(supportsSMSLogin
                ? [
                    {
                      key: "sms",
                      label: t("auth.phoneOtpLogin"),
                      children: (
                        <Form form={smsForm} layout="vertical" onFinish={(values) => void submitSMSLogin(values)}>
                          <Form.Item
                            label={t("auth.phone")}
                            name="phone"
                            rules={[{ required: true, message: t("auth.phoneRequired") }]}
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item label={t("auth.phoneOtpCode")} required>
                            <Space.Compact style={{ width: "100%" }}>
                              <Form.Item
                                name="otp"
                                noStyle
                                rules={[{ required: true, message: t("auth.phoneOtpCodeRequired") }]}
                              >
                                <Input />
                              </Form.Item>
                              <Button
                                onClick={() => void sendSMSLoginCode(smsForm.getFieldValue("phone"))}
                                loading={smsSending}
                                disabled={smsRemainingSeconds > 0}
                              >
                                {smsRemainingSeconds > 0 ? `${smsRemainingSeconds}s` : t("auth.sendPhoneOtpCode")}
                              </Button>
                            </Space.Compact>
                          </Form.Item>
                          <Button type="primary" htmlType="submit" block loading={loading}>
                            {t("auth.login")}
                          </Button>
                        </Form>
                      )
                    }
                  ]
                : []),
              {
                key: "passkey",
                label: t("auth.passkeyLogin"),
                children: (
                  <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    <Typography.Text type="secondary">{t("auth.passkeyLoginDesc")}</Typography.Text>
                    <Typography.Text type="secondary">{t("auth.passkeyLoginHint")}</Typography.Text>
                    <Button type="primary" block loading={passkeyLoading} disabled={!supportsPasskey} onClick={() => void submitPasskeyLogin()}>
                      {t("auth.passkeyLoginButton")}
                    </Button>
                  </Space>
                )
              }
            ]}
          />
        </Space>
      </Card>
      <AccountLanguageModal
        open={languageModalOpen}
        currentLocale={accountLocale}
        title={t("header.languageModalTitle")}
        description={t("header.languageModalDesc")}
        onClose={() => setLanguageModalOpen(false)}
        onSelect={(locale) => updateAccountLocale(locale)}
      />
      <AuthPageFooter text={siteFooterText} />
    </div>
  );
}
