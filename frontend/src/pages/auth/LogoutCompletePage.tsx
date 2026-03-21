import { useEffect, useMemo } from "react";
import { Spin, Typography } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { clearAllSessionMeta } from "../../authSession";
import { useTranslation } from "react-i18next";
import { ACCOUNT_LOCALE_STORAGE_KEY, getBrowserAccountLocale } from "../../i18n/accountLocale";

function clearBrowserSession() {
  clearAllSessionMeta();
}

function appendState(target: string, state: string) {
  if (!target || !state) {
    return target;
  }
  try {
    const url = new URL(target);
    url.searchParams.set("state", state);
    return url.toString();
  } catch {
    return target;
  }
}

function appendLocaleForAuthRoute(target: string, locale: string) {
  const fallbackTarget = target || "/login";
  try {
    const url = new URL(fallbackTarget, window.location.origin);
    const isSameOrigin = url.origin === window.location.origin;
    const authRoutes = new Set([
      "/login",
      "/register",
      "/forgot-password",
      "/authorize",
      "/login-mfa",
      "/phone-binding-required",
      "/login-deletion-confirm",
      "/account-session-conflict"
    ]);
    if (isSameOrigin && authRoutes.has(url.pathname) && !url.searchParams.get("locale")) {
      url.searchParams.set("locale", locale);
    }
    if (isSameOrigin) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
    return url.toString();
  } catch {
    return fallbackTarget;
  }
}

function isSafeFrontChannelLogoutURL(target: string) {
  try {
    const url = new URL(target);
    if (url.username || url.password || url.hash) {
      return false;
    }
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function LogoutCompletePage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const search = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const postLogoutRedirectURI = search.get("post_logout_redirect_uri") || "";
  const state = search.get("state") || "";
  const frontChannelLogoutURIs = search
    .getAll("frontchannel_logout_uri")
    .map((item) => item.trim())
    .filter((item) => item && isSafeFrontChannelLogoutURL(item));

  useEffect(() => {
    clearBrowserSession();
    localStorage.removeItem(ACCOUNT_LOCALE_STORAGE_KEY);

    const browserLocale = getBrowserAccountLocale();
    const redirectTarget = appendLocaleForAuthRoute(appendState(postLogoutRedirectURI, state) || "/login", browserLocale);
    const timer = window.setTimeout(() => {
      if (redirectTarget.startsWith("http://") || redirectTarget.startsWith("https://")) {
        window.location.assign(redirectTarget);
        return;
      }
      navigate(redirectTarget, { replace: true });
    }, frontChannelLogoutURIs.length > 0 ? 1200 : 250);

    return () => window.clearTimeout(timer);
  }, [frontChannelLogoutURIs.length, navigate, postLogoutRedirectURI, state]);

  return (
    <div className="center-page">
      <div
        style={{
          width: "min(420px, calc(100vw - 32px))",
          padding: 32,
          borderRadius: 20,
          background: "#fff",
          border: "1px solid rgba(18, 38, 58, 0.08)",
          boxShadow: "0 18px 48px rgba(15, 23, 42, 0.08)",
          textAlign: "center"
        }}
      >
        <Spin />
        <Typography.Title level={4} style={{ marginTop: 18, marginBottom: 8 }}>
          {t("auth.logoutProgressTitle")}
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {t("auth.logoutProgressDesc")}
        </Typography.Paragraph>
        {frontChannelLogoutURIs.map((item) => (
          <iframe
            key={item}
            src={item}
            title={item}
            referrerPolicy="no-referrer"
            style={{ display: "none", width: 0, height: 0, border: 0 }}
          />
        ))}
      </div>
    </div>
  );
}
