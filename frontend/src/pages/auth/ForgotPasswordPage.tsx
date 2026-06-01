import { useEffect, useState } from "react";
import { Button, Card, Form, Input, Space, Typography, message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useEmailCodeCooldown } from "../../utils/emailCodeCooldown";
import {
  buildSearchString,
  getSafeRedirect,
  pickAllowedSearchParams,
  withUpdatedSearch,
} from "../../utils/urlState";
import { useTranslation } from "react-i18next";
import {
  ACCOUNT_LOCALE_STORAGE_KEY,
  accountLocaleLabel,
  normalizeAccountLocale,
  type AccountLocale,
} from "../../i18n/accountLocale";
import { buildFirstPartyForgotPasswordPath } from "./oidc";
import { AccountLanguageModal } from "../../components/AccountLanguageModal";
import { AuthPageFooter } from "../../components/AuthPageFooter";

export function ForgotPasswordPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = pickAllowedSearchParams(location.search);
  const authSearch = buildSearchString(location.search);
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [siteFooterText, setSiteFooterText] = useState(
    localStorage.getItem("site_footer_text") || "",
  );
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [form] = Form.useForm();
  const email = Form.useWatch("email", form) || "";
  const { remainingSeconds, startCooldown } = useEmailCodeCooldown(
    email,
    "reset_password",
  );
  const accountLocale = normalizeAccountLocale(i18n.language);
  const hasAuthorizationContext = Boolean(searchParams.get("client_id"));

  function translateSecurityError(rawMessage: string) {
    switch (rawMessage) {
      case "new password must be different from current password":
        return t("errors.newPasswordMustBeDifferentFromCurrentPassword");
      case "cooldown_active":
        return t("errors.cooldownActive");
      default:
        return rawMessage;
    }
  }

  useEffect(() => {
    const locale = new URLSearchParams(location.search).get("locale");
    if (locale) {
      const normalizedLocale = normalizeAccountLocale(locale);
      localStorage.setItem(ACCOUNT_LOCALE_STORAGE_KEY, normalizedLocale);
      if (normalizedLocale !== accountLocale) {
        void i18n.changeLanguage(normalizedLocale);
      }
    }
  }, [accountLocale, i18n, location.search]);

  useEffect(() => {
    let active = true;
    void api<{ data?: { site_footer_text?: string } }>("/public/settings")
      .then((result) => {
        if (!active) {
          return;
        }
        const nextSiteFooterText = result.data?.site_footer_text || "";
        setSiteFooterText(nextSiteFooterText);
        localStorage.setItem("site_footer_text", nextSiteFooterText);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (hasAuthorizationContext) {
      return () => {
        active = false;
      };
    }

    void buildFirstPartyForgotPasswordPath(
      location.search,
      getSafeRedirect(location.search),
    )
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
          err instanceof Error ? err.message : t("auth.resetPasswordFailed"),
        );
      });

    return () => {
      active = false;
    };
  }, [
    hasAuthorizationContext,
    location.pathname,
    location.search,
    messageApi,
    t,
  ]);

  function updateAccountLocale(nextLocale: AccountLocale) {
    localStorage.setItem(ACCOUNT_LOCALE_STORAGE_KEY, nextLocale);
    void i18n.changeLanguage(nextLocale);
    navigate(
      {
        pathname: location.pathname,
        search: withUpdatedSearch(location.search, { locale: nextLocale }),
      },
      { replace: true },
    );
  }

  async function sendCode() {
    try {
      setSendingCode(true);
      const values = await form.validateFields(["email"]);
      const result = await api<{ cooldown_seconds?: number }>(
        "/auth/email-code",
        {
          method: "POST",
          body: JSON.stringify({
            email: values.email,
            purpose: "reset_password",
          }),
        },
      );
      startCooldown(Number(result.cooldown_seconds || 0), values.email);
      messageApi.success(t("auth.sendResetCodeSuccess"));
    } catch (err) {
      messageApi.error(
        err instanceof Error
          ? translateSecurityError(err.message)
          : t("auth.sendResetCodeFailed"),
      );
    } finally {
      setSendingCode(false);
    }
  }

  async function submit(values: Record<string, string>) {
    setLoading(true);
    try {
      await api("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email: values.email,
          code: values.code,
          new_password: values.new_password,
        }),
      });
      messageApi.success(t("auth.resetPasswordSuccess"));
      window.setTimeout(() => navigate(`/login${authSearch}`), 800);
    } catch (err) {
      messageApi.error(
        err instanceof Error
          ? translateSecurityError(err.message)
          : t("auth.resetPasswordFailed"),
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="center-page auth-entry-page auth-entry-page--glass">
      {contextHolder}
      <div className="auth-entry-page__backdrop" aria-hidden="true" />
      <div className="auth-page-toolbar">
        <Button
          type="link"
          className="auth-language-button"
          onClick={() => setLanguageModalOpen(true)}
        >
          {accountLocaleLabel[accountLocale]}
        </Button>
      </div>
      <Card className="auth-card auth-card--glass">
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <div className="auth-entry-page__hero">
            <Typography.Title level={2}>
              {t("auth.forgotPasswordPageTitle")}
            </Typography.Title>
            <div className="auth-entry-page__subtitle-wrap">
              <Typography.Text type="secondary" className="auth-entry-page__subtitle">
                {t("auth.forgotPasswordPageSubtitle")}
              </Typography.Text>
            </div>
          </div>
          <Form form={form} layout="vertical" onFinish={submit}>
            <Form.Item
              label={t("auth.email")}
              name="email"
              rules={[
                { required: true, message: t("auth.emailRequired") },
                { type: "email", message: t("auth.emailInvalid") },
              ]}
            >
              <Input placeholder="you@example.com" />
            </Form.Item>
            <Form.Item label={t("auth.resetCode")} required>
              <Space.Compact style={{ width: "100%" }}>
                <Form.Item
                  name="code"
                  noStyle
                  rules={[
                    { required: true, message: t("auth.resetCodeRequired") },
                  ]}
                >
                  <Input placeholder={t("auth.resetCodePlaceholder")} />
                </Form.Item>
                <Button
                  onClick={() => void sendCode()}
                  loading={sendingCode}
                  disabled={remainingSeconds > 0}
                >
                  {remainingSeconds > 0
                    ? `${remainingSeconds}s`
                    : t("auth.sendResetCode")}
                </Button>
              </Space.Compact>
            </Form.Item>
            <Form.Item
              label={t("auth.newPassword")}
              name="new_password"
              rules={[
                { required: true, message: t("auth.newPasswordRequired") },
                { min: 8, message: t("auth.newPasswordMinLength") },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label={t("auth.confirmNewPassword")}
              name="confirm_new_password"
              dependencies={["new_password"]}
              rules={[
                {
                  required: true,
                  message: t("auth.confirmNewPasswordRequired"),
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("new_password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(t("auth.newPasswordMismatch")),
                    );
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Button onClick={() => navigate(`/login${authSearch}`)}>
                {t("auth.backToLogin")}
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {t("auth.resetPassword")}
              </Button>
            </Space>
          </Form>
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
