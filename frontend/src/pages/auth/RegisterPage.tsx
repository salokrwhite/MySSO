import { useEffect, useState } from "react";
import { Button, Card, Form, Input, Select, Space, Typography, message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useEmailCodeCooldown } from "../../utils/emailCodeCooldown";
import { buildSearchString, getSafeRedirect, pickAllowedSearchParams, withUpdatedSearch } from "../../utils/urlState";
import {
  ACCOUNT_LOCALE_STORAGE_KEY,
  accountLocaleLabel,
  normalizeAccountLocale,
  type AccountLocale
} from "../../i18n/accountLocale";
import { useTranslation } from "react-i18next";
import { buildFirstPartyRegisterPath } from "./oidc";
import { getCountries } from "../../utils/countries";
import { AccountLanguageModal } from "../../components/AccountLanguageModal";
import { AuthPageFooter } from "../../components/AuthPageFooter";

export function RegisterPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = pickAllowedSearchParams(location.search);
  const authSearch = buildSearchString(location.search);
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [registrationAllowed, setRegistrationAllowed] = useState(true);
  const [checkingSettings, setCheckingSettings] = useState(true);
  const [siteFooterText, setSiteFooterText] = useState(localStorage.getItem("site_footer_text") || "");
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [form] = Form.useForm();
  const email = Form.useWatch("email", form) || "";
  const { remainingSeconds, startCooldown } = useEmailCodeCooldown(email, "register");
  const accountLocale = normalizeAccountLocale(i18n.language);
  const hasAuthorizationContext = Boolean(searchParams.get("client_id"));
  const countryOptions = getCountries(i18n.language);

  function translateSecurityError(rawMessage: string) {
    switch (rawMessage) {
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
    if (hasAuthorizationContext) {
      return () => {
        active = false;
      };
    }

    void buildFirstPartyRegisterPath(location.search, getSafeRedirect(location.search))
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
        messageApi.error(err instanceof Error ? err.message : t("auth.registerFailed"));
      });

    return () => {
      active = false;
    };
  }, [hasAuthorizationContext, location.pathname, location.search, messageApi, t]);

  useEffect(() => {
    let active = true;
    void api<{ data?: { allow_user_registration?: boolean; site_footer_text?: string } }>("/public/settings")
      .then((result) => {
        if (!active) {
          return;
        }
        setRegistrationAllowed(result.data?.allow_user_registration !== false);
        const nextSiteFooterText = result.data?.site_footer_text || "";
        setSiteFooterText(nextSiteFooterText);
        localStorage.setItem("site_footer_text", nextSiteFooterText);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) {
          setCheckingSettings(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  async function sendCode() {
    if (!registrationAllowed) {
      messageApi.warning(t("auth.registerDisabled"));
      return;
    }
    try {
      setSendingCode(true);
      const values = await form.validateFields(["country", "email"]);
      const result = await api<{ cooldown_seconds?: number }>("/auth/email-code", {
        method: "POST",
        body: JSON.stringify({
          country: values.country,
          email: values.email,
          purpose: "register"
        })
      });
      startCooldown(Number(result.cooldown_seconds || 0), values.email);
      messageApi.success(t("auth.sendRegisterCodeSuccess"));
    } catch (err) {
      messageApi.error(err instanceof Error ? translateSecurityError(err.message) : t("auth.sendRegisterCodeFailed"));
    } finally {
      setSendingCode(false);
    }
  }

  async function submit(values: Record<string, string>) {
    if (!registrationAllowed) {
      messageApi.warning(t("auth.registerDisabled"));
      return;
    }
    setLoading(true);
    try {
      const result = await api<{
        requires_phone_binding?: boolean;
        phone_binding_challenge_token?: string;
        phone_binding_reason?: string;
      }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          country: values.country,
          email: values.email,
          code: values.code,
          password: values.password
        })
      });
      if (result.requires_phone_binding && result.phone_binding_challenge_token) {
        messageApi.success(t("auth.phoneBindingRequiredAfterRegister"));
        navigate(
          `/phone-binding-required?challenge_token=${encodeURIComponent(result.phone_binding_challenge_token)}&reason=${encodeURIComponent(result.phone_binding_reason || "post_register")}`
        );
        return;
      }
      messageApi.success(t("auth.registerSuccess"));
      setTimeout(
        () =>
          navigate({
            pathname: "/login",
            search: withUpdatedSearch(authSearch, { tab: "password" })
          }),
        800
      );
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : t("auth.registerFailed"));
    } finally {
      setLoading(false);
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
    <div className="center-page auth-entry-page auth-entry-page--glass">
      {contextHolder}
      <div className="auth-entry-page__backdrop" aria-hidden="true" />
      <div className="auth-page-toolbar">
        <Button type="link" className="auth-language-button" onClick={() => setLanguageModalOpen(true)}>
          {accountLocaleLabel[accountLocale]}
        </Button>
      </div>
      <Card className="auth-card auth-card--glass">
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <div className="auth-entry-page__hero">
            <Typography.Title level={2}>{t("auth.registerPageTitle")}</Typography.Title>
            <Typography.Text type="secondary" className="auth-entry-page__subtitle">
              {t("auth.registerPageSubtitle")}
            </Typography.Text>
          </div>

          {!checkingSettings && !registrationAllowed ? (
            <Typography.Text type="danger">{t("auth.registerDisabled")}</Typography.Text>
          ) : null}

          <Form form={form} layout="vertical" initialValues={{ country: "CN" }} onFinish={submit}>
            <Form.Item label={t("auth.country")} name="country" rules={[{ required: true, message: t("auth.countryRequired") }]}>
              <Select
                showSearch
                optionFilterProp="label"
                options={countryOptions}
                filterOption={(input, option) => {
                  const keyword = input.trim().toLowerCase();
                  return (
                    String(option?.label || "")
                      .toLowerCase()
                      .includes(keyword) ||
                    String(option?.value || "")
                      .toLowerCase()
                      .includes(keyword)
                  );
                }}
              />
            </Form.Item>
            <Form.Item
              label={t("auth.email")}
              name="email"
              rules={[{ required: true, message: t("auth.emailRequired") }, { type: "email", message: t("auth.emailInvalid") }]}
            >
              <Input placeholder="you@example.com" />
            </Form.Item>
            <Form.Item label={t("auth.registerCode")} required>
              <Space.Compact style={{ width: "100%" }}>
                <Form.Item
                  name="code"
                  noStyle
                  rules={[{ required: true, message: t("auth.registerCodeRequired") }]}
                >
                  <Input placeholder={t("auth.registerCodePlaceholder")} />
                </Form.Item>
                <Button onClick={() => void sendCode()} loading={sendingCode} disabled={remainingSeconds > 0 || !registrationAllowed}>
                  {remainingSeconds > 0 ? `${remainingSeconds}s` : t("auth.sendRegisterCode")}
                </Button>
              </Space.Compact>
            </Form.Item>
            <Form.Item
              label={t("auth.password")}
              name="password"
              rules={[
                { required: true, message: t("auth.newPasswordRequired") },
                { min: 8, message: t("auth.passwordMinLength") }
              ]}
            >
              <Input.Password placeholder={t("auth.newPasswordPlaceholder")} />
            </Form.Item>
            <Form.Item
              label={t("auth.confirmPassword")}
              name="confirm_password"
              dependencies={["password"]}
              rules={[
                { required: true, message: t("auth.confirmNewPasswordRequired") },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t("auth.passwordMismatch")));
                  }
                })
              ]}
            >
              <Input.Password placeholder={t("auth.confirmPasswordPlaceholder")} />
            </Form.Item>

            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Button onClick={() => navigate(`/login${authSearch}`)}>{t("auth.backToLoginWithAccount")}</Button>
              <Button type="primary" htmlType="submit" loading={loading} disabled={!registrationAllowed}>
                {t("auth.registerNow")}
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
