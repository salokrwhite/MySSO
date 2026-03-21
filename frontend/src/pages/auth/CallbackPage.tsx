import { Alert, Button, Card, Space, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import {
  ACCOUNT_LOCALE_STORAGE_KEY,
  accountLocaleLabel,
  normalizeAccountLocale,
  type AccountLocale
} from "../../i18n/accountLocale";
import { useTranslation } from "react-i18next";
import { clearPendingAuthorization, getPendingAuthorization, validateIDToken } from "./oidc";
import { AccountLanguageModal } from "../../components/AccountLanguageModal";
import { clearLegacyOIDCTokens, readUserRole } from "../../authSession";

const OIDC_EXCHANGE_LOCK_PREFIX = "oidc_exchange_lock_";
const OIDC_CALLBACK_TIMEOUT_MS = 15000;

function formatCallbackError(
  errorCode: string,
  errorDescription: string,
  messages: {
    appRejected: string;
    appRejectedWithReason: string;
    appNotFound: string;
    accessDenied: string;
    tokenExchangeFailed: string;
  }
) {
  const description = errorDescription.trim();
  const code = errorCode.trim();

  if (description.startsWith("application rejected:")) {
    const reason = description.replace(/^application rejected:\s*/i, "").trim();
    return reason ? messages.appRejectedWithReason.replace("{{reason}}", reason) : messages.appRejected;
  }
  if (description === "application rejected") {
    return messages.appRejected;
  }
  if (description === "application not found") {
    return messages.appNotFound;
  }
  if (description) {
    return description;
  }
  if (code === "access_denied") {
    return messages.accessDenied;
  }
  return code || messages.tokenExchangeFailed;
}

export function CallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const search = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [error, setError] = useState<string>("");
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const accountLocale = normalizeAccountLocale(i18n.language);

  function updateAccountLocale(nextLocale: AccountLocale) {
    localStorage.setItem(ACCOUNT_LOCALE_STORAGE_KEY, nextLocale);
    void i18n.changeLanguage(nextLocale);
    const nextSearch = new URLSearchParams(location.search);
    nextSearch.set("locale", nextLocale);
    navigate(
      {
        pathname: location.pathname,
        search: `?${nextSearch.toString()}`
      },
      { replace: true }
    );
  }

  function getRoleHome() {
    const currentRole = readUserRole();
    if (currentRole === "admin") {
      return "/admin";
    }
    if (currentRole === "developer") {
      return "/developer";
    }
    return "/me";
  }

  async function exchangeCode() {
    setError("");
    clearLegacyOIDCTokens();
    try {
      const authorizeError = search.get("error") || "";
      const authorizeErrorDescription = search.get("error_description") || "";
      if (authorizeError || authorizeErrorDescription) {
        throw new Error(
          formatCallbackError(authorizeError, authorizeErrorDescription, {
            appRejected: t("auth.appRejected"),
            appRejectedWithReason: t("auth.appRejectedWithReason"),
            appNotFound: t("auth.appNotFound"),
            accessDenied: t("auth.accessDenied"),
            tokenExchangeFailed: t("auth.tokenExchangeFailed")
          })
        );
      }

      const code = search.get("code") || "";
      const state = search.get("state") || "";
      if (!code || !state) {
        throw new Error("missing code or state");
      }
      const pending = getPendingAuthorization(state);
      if (!pending) {
        throw new Error("authorization context not found or expired");
      }
      const exchangeLockKey = `${OIDC_EXCHANGE_LOCK_PREFIX}${state}:${code}`;
      if (sessionStorage.getItem(exchangeLockKey) === "1") {
        return;
      }
      sessionStorage.setItem(exchangeLockKey, "1");
      const payload = await api<{
        id_token?: string;
      }>("/auth/oidc-exchange", {
        method: "POST",
        timeout_ms: OIDC_CALLBACK_TIMEOUT_MS,
        body: JSON.stringify({
          code,
          redirect_uri: pending.redirectUri,
          code_verifier: pending.codeVerifier
        })
      });
      await validateIDToken(String(payload.id_token || ""), pending);
      const postLoginRedirect = pending.postLoginRedirect?.trim() || "";
      clearPendingAuthorization(state);
      sessionStorage.removeItem(exchangeLockKey);
      navigate(postLoginRedirect || getRoleHome(), { replace: true });
    } catch (err) {
      const code = search.get("code") || "";
      const state = search.get("state") || "";
      if (code && state) {
        sessionStorage.removeItem(`${OIDC_EXCHANGE_LOCK_PREFIX}${state}:${code}`);
      }
      const nextError =
        err instanceof Error && err.name === "AbortError"
          ? t("auth.tokenExchangeFailed")
          : err instanceof Error
            ? err.message
            : t("auth.tokenExchangeFailed");
      setError(nextError);
    }
  }

  useEffect(() => {
    void exchangeCode();
  }, [accountLocale, location.search]);

  useEffect(() => {
    const locale = search.get("locale");
    if (!locale) {
      return;
    }
    const normalizedLocale = normalizeAccountLocale(locale);
    localStorage.setItem(ACCOUNT_LOCALE_STORAGE_KEY, normalizedLocale);
    void i18n.changeLanguage(normalizedLocale);
  }, [i18n, search]);

  if (!error) {
    return null;
  }

  return (
    <div className="center-page">
      <div className="auth-page-toolbar">
        <Button type="link" className="auth-language-button" onClick={() => setLanguageModalOpen(true)}>
          {accountLocaleLabel[accountLocale]}
        </Button>
      </div>
      <Card className="auth-card">
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Typography.Title level={3}>{t("auth.oidcCallbackFailed")}</Typography.Title>
          {error ? <Alert type="error" message={error} /> : null}
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
