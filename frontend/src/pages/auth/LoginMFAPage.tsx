import { useEffect, useMemo, useState } from "react";
import { Button, Card, Form, Input, Space, Typography, message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE, ApiError, api } from "../../api/client";
import { useEmailCodeCooldown } from "../../utils/emailCodeCooldown";
import { buildSearchString, pickAllowedSearchParams } from "../../utils/urlState";
import {
  ACCOUNT_LOCALE_STORAGE_KEY,
  accountLocaleLabel,
  normalizeAccountLocale,
  type AccountLocale
} from "../../i18n/accountLocale";
import { useTranslation } from "react-i18next";
import { withUpdatedSearch } from "../../utils/urlState";
import { AccountLanguageModal } from "../../components/AccountLanguageModal";
import { getStoredSiteName, persistSiteBranding, resolveSiteNameForLocale } from "../../siteBranding";
import { handleLoginFlowResult, type LoginFlowResponse } from "./authLoginFlow";
import { useCaptchaGate } from "../../hooks/useCaptchaGate";

type PublicSettings = {
  data?: {
    site_name?: string;
    site_name_en?: string;
    site_logo_data_url?: string;
    smtp_verification_code_cooldown_seconds?: number;
  };
};

export function LoginMFAPage() {
  const backendOrigin = API_BASE.replace(/\/api$/, "");
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const rawSearchParams = new URLSearchParams(location.search);
  const searchParams = pickAllowedSearchParams(location.search);
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm<{ otp: string }>();
  const [siteName, setSiteName] = useState(getStoredSiteName(i18n.language));
  const [siteLogoDataUrl, setSiteLogoDataUrl] = useState(localStorage.getItem("site_logo_data_url") || "");
  const [initialCooldownApplied, setInitialCooldownApplied] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const accountLocale = normalizeAccountLocale(i18n.language);
  const challengeToken = rawSearchParams.get("challenge_token") || "";
  const mfaMethod = (rawSearchParams.get("mfa_method") || "") as "email" | "sms" | "";
  const maskedTarget = rawSearchParams.get("masked_target") || "";
  const cooldownTarget = useMemo(() => `${mfaMethod}:${maskedTarget}:${challengeToken}`, [challengeToken, maskedTarget, mfaMethod]);
  const { remainingSeconds, startCooldown } = useEmailCodeCooldown(cooldownTarget, "login");
  const authSearch = buildSearchString(location.search);
  const hasAuthorizationContext = Boolean(searchParams.get("client_id"));
  const usesAuthorizationFlowSession = searchParams.get("auth_flow") === "authorization";
  const { requestCaptcha, captchaModal } = useCaptchaGate();

  function buildMFASearch(overrides?: Record<string, string | null>) {
    const nextSearch = new URLSearchParams(location.search);
    for (const [key, value] of Object.entries(overrides || {})) {
      if (value === null) {
        nextSearch.delete(key);
      } else {
        nextSearch.set(key, value);
      }
    }
    const query = nextSearch.toString();
    return query ? `?${query}` : "";
  }

  function translateLoginError(rawMessage: string) {
    switch (rawMessage) {
      case "invalid mfa code":
        return t("errors.invalidMfaCode");
      case "mfa challenge expired or invalid":
        return t("errors.mfaChallengeExpiredOrInvalid");
      case "unsupported mfa method":
        return t("errors.unsupportedMfaMethod");
      case "user not found":
        return t("errors.userNotFound");
      case "sms not configured":
        return t("errors.smsNotConfigured");
      case "smtp not configured":
        return t("errors.smtpNotConfigured");
      default:
        if (rawMessage.startsWith("user status is ")) {
          return t("errors.userStatusInvalid");
        }
        return rawMessage;
    }
  }

  useEffect(() => {
    if (!challengeToken) {
      navigate(
        {
          pathname: "/login",
          search: buildMFASearch({
            challenge_token: null,
            mfa_method: null,
            masked_target: null
          })
        },
        { replace: true }
      );
    }
  }, [challengeToken, location.search, navigate]);

  useEffect(() => {
    setSiteName(getStoredSiteName(i18n.language));
  }, [i18n.language]);

  useEffect(() => {
    let active = true;
    void api<PublicSettings>("/public/settings")
      .then((result) => {
        if (!active) {
          return;
        }
        const nextSiteName = resolveSiteNameForLocale(i18n.language, result.data?.site_name, result.data?.site_name_en);
        const nextSiteLogo = result.data?.site_logo_data_url?.trim() || "";
        const cooldownSeconds = Number(result.data?.smtp_verification_code_cooldown_seconds || 0);
        persistSiteBranding(result.data);
        setSiteName(nextSiteName);
        setSiteLogoDataUrl(nextSiteLogo);
        localStorage.setItem("site_logo_data_url", nextSiteLogo);
        if (!initialCooldownApplied && challengeToken && cooldownTarget && cooldownSeconds > 0) {
          startCooldown(cooldownSeconds, cooldownTarget);
          setInitialCooldownApplied(true);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [challengeToken, cooldownTarget, i18n.language, initialCooldownApplied]);

  async function submit(values: { otp: string }) {
    setLoading(true);
    try {
      const result = await api<LoginFlowResponse>("/auth/login-mfa", {
        method: "POST",
        body: JSON.stringify({
          challenge_token: challengeToken,
          otp: values.otp
        })
      });
      await handleLoginFlowResult(result, { locationSearch: location.search, navigate });
    } catch (err) {
      messageApi.error(translateLoginError(err instanceof Error ? err.message : t("auth.loginFailed")));
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setSending(true);
    try {
      const captchaPayload = await requestCaptcha({
        flow: "mfa_login",
        purpose: "mfa_login",
        target: challengeToken,
      });
      const result = await api<{ cooldown_seconds?: number; method?: "email" | "sms"; masked_target?: string }>("/auth/login-mfa/resend", {
        method: "POST",
        body: JSON.stringify({
          challenge_token: challengeToken,
          ...captchaPayload
        })
      });
      startCooldown(Number(result.cooldown_seconds || 0), cooldownTarget);
      messageApi.success(result.method === "sms" ? t("auth.sendPhoneOtpCodeSuccess") : t("auth.sendOtpCodeSuccess"));
    } catch (err) {
      if (err instanceof ApiError) {
        const retryAfterSeconds = Number(err.payload.retry_after_seconds || 0);
        if (retryAfterSeconds > 0) {
          startCooldown(retryAfterSeconds, cooldownTarget);
          return;
        }
      }
      messageApi.error(translateLoginError(err instanceof Error ? err.message : t("auth.loginFailed")));
    } finally {
      setSending(false);
    }
  }

  function updateAccountLocale(nextLocale: AccountLocale) {
    localStorage.setItem(ACCOUNT_LOCALE_STORAGE_KEY, nextLocale);
    void i18n.changeLanguage(nextLocale);
    navigate(
      {
        pathname: location.pathname,
        search: buildMFASearch({ locale: nextLocale })
      },
      { replace: true }
    );
  }

  const siteLogoUrl = siteLogoDataUrl ? (siteLogoDataUrl.startsWith("http") ? siteLogoDataUrl : `${backendOrigin}${siteLogoDataUrl}`) : "";

  return (
    <div className="center-page">
      {contextHolder}
      {captchaModal}
      <div className="auth-page-toolbar">
        <Button type="link" className="auth-language-button" onClick={() => setLanguageModalOpen(true)}>
          {accountLocaleLabel[accountLocale]}
        </Button>
      </div>
      <Card className="auth-card">
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <div className="auth-brand">
            {siteLogoUrl ? <img src={siteLogoUrl} alt={siteName} className="auth-brand-logo" /> : null}
            <Typography.Title level={2} style={{ margin: 0 }}>
              {siteName}
            </Typography.Title>
          </div>
          <div>
            <Typography.Title level={4} style={{ marginBottom: 8 }}>
              {t("auth.mfaVerifyTitle")}
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              {t(mfaMethod === "sms" ? "auth.mfaVerifyPhoneHint" : "auth.mfaVerifyEmailHint", { target: maskedTarget })}
            </Typography.Paragraph>
          </div>
          <Form form={form} layout="vertical" onFinish={(values) => void submit(values)}>
            <Form.Item label={t(mfaMethod === "sms" ? "auth.phoneOtpCode" : "auth.otpCode")} required>
              <Space.Compact style={{ width: "100%" }}>
                <Form.Item name="otp" noStyle rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Button onClick={() => void resendCode()} loading={sending} disabled={remainingSeconds > 0}>
                  {remainingSeconds > 0 ? `${remainingSeconds}s` : t(mfaMethod === "sms" ? "auth.sendPhoneOtpCode" : "auth.sendOtpCode")}
                </Button>
              </Space.Compact>
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              {t("auth.verifyAndLogin")}
            </Button>
          </Form>
          <Button
            type="link"
            onClick={() =>
              navigate({
                pathname: "/login",
                search: buildMFASearch({
                  challenge_token: null,
                  mfa_method: null,
                  masked_target: null
                })
              })
            }
          >
            {t("auth.backToLogin")}
          </Button>
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
    </div>
  );
}
