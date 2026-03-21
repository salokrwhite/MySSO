import { Avatar, Button, Card, Space, Typography } from "antd";
import { SwapOutlined, UserOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { api, API_BASE } from "../../api/client";
import { AccountLanguageModal } from "../../components/AccountLanguageModal";
import {
  ACCOUNT_LOCALE_STORAGE_KEY,
  accountLocaleLabel,
  normalizeAccountLocale,
  type AccountLocale
} from "../../i18n/accountLocale";
import { applyPreferredLocaleFromSession } from "../../i18n/accountLocalePreference";
import { resolveRoleAwareRedirect } from "../../roleRouting";
import {
  clearBrowserSessionMeta,
  getSessionDisplayLabel,
  readBrowserSessionMeta,
  readTabSessionMeta,
  syncTabSessionFromBrowser,
  type StoredSessionMeta
} from "../../authSession";
import { getSafeRedirect } from "../../utils/urlState";
import { getStoredSiteName, persistSiteBranding, resolveSiteNameForLocale } from "../../siteBranding";

function resolveAssetURL(asset: string, backendOrigin: string) {
  const value = asset.trim();
  if (!value) {
    return "";
  }
  return value.startsWith("http") ? value : `${backendOrigin}${value}`;
}

export function SessionConflictPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const backendOrigin = API_BASE.replace(/\/api$/, "");
  const [siteName, setSiteName] = useState(getStoredSiteName(i18n.language));
  const [siteLogoDataUrl, setSiteLogoDataUrl] = useState(localStorage.getItem("site_logo_data_url") || "");
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const browserSession = readBrowserSessionMeta();
  const tabSession = readTabSessionMeta();
  const accountLocale = normalizeAccountLocale(i18n.language);

  useEffect(() => {
    if (!browserSession || !tabSession) {
      navigate("/login", { replace: true });
    }
  }, [browserSession, navigate, tabSession]);

  useEffect(() => {
    setSiteName(getStoredSiteName(i18n.language));
  }, [i18n.language]);

  useEffect(() => {
    let active = true;
    void api<{ data?: { site_name?: string; site_name_en?: string; site_logo_data_url?: string } }>("/public/settings")
      .then((result) => {
        if (!active) {
          return;
        }
        const nextSiteName = resolveSiteNameForLocale(i18n.language, result.data?.site_name, result.data?.site_name_en);
        const nextSiteLogo = result.data?.site_logo_data_url?.trim() || "";
        persistSiteBranding(result.data);
        setSiteName(nextSiteName);
        setSiteLogoDataUrl(nextSiteLogo);
        localStorage.setItem("site_logo_data_url", nextSiteLogo);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [i18n.language]);

  const redirect = getSafeRedirect(location.search);
  const siteLogoURL = useMemo(() => resolveAssetURL(siteLogoDataUrl, backendOrigin), [backendOrigin, siteLogoDataUrl]);

  function getAccountSubtitle(meta: StoredSessionMeta | null) {
    if (!meta) {
      return "-";
    }
    if (meta.displayName && meta.email) {
      return meta.email;
    }
    return meta.email || meta.userId || meta.role;
  }

  async function useBrowserAccount() {
    const synced = syncTabSessionFromBrowser();
    if (!synced) {
      navigate("/login", { replace: true });
      return;
    }
    await applyPreferredLocaleFromSession().catch(() => undefined);
    navigate(resolveRoleAwareRedirect(redirect, synced.role), { replace: true });
  }

  function switchBrowserToThisTabAccount() {
    clearBrowserSessionMeta();
    navigate("/login", { replace: true });
  }

  function signOutAndRelogin() {
    clearBrowserSessionMeta();
    navigate("/login", { replace: true });
  }

  function updateAccountLocale(nextLocale: AccountLocale) {
    localStorage.setItem(ACCOUNT_LOCALE_STORAGE_KEY, nextLocale);
    void i18n.changeLanguage(nextLocale);
    navigate(
      {
        pathname: location.pathname,
        search: location.search
      },
      { replace: true }
    );
  }

  return (
    <div className="center-page">
      <div className="auth-page-toolbar">
        <Button type="link" className="auth-language-button" onClick={() => setLanguageModalOpen(true)}>
          {accountLocaleLabel[accountLocale]}
        </Button>
      </div>
      <Card className="auth-card">
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <Space direction="vertical" size={10} style={{ width: "100%" }}>
              <Space align="center" size={14} style={{ justifyContent: "center", width: "100%" }}>
                <div
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: 20,
                    display: "grid",
                    placeItems: "center",
                    background: "linear-gradient(135deg, #1677ff, #58a6ff)",
                    color: "#fff",
                    overflow: "hidden",
                    flexShrink: 0
                  }}
                >
                  {siteLogoURL ? (
                    <img src={siteLogoURL} alt={siteName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    siteName.slice(0, 1).toUpperCase()
                  )}
                </div>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {siteName}
                </Typography.Title>
              </Space>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {t("auth.sessionConflict.title")}
              </Typography.Title>
              <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                {t("auth.sessionConflict.desc")}
              </Typography.Paragraph>
            </Space>
          </div>

          <div
            style={{
              display: "grid",
              gap: 16
            }}
          >
            <div
              style={{
                border: "1px solid rgba(18, 38, 58, 0.08)",
                borderRadius: 18,
                padding: 18,
                background: "#fff"
              }}
            >
              <Space align="center" size={14} style={{ width: "100%", justifyContent: "space-between" }}>
                <Space align="center" size={14}>
                  <Avatar size={52} icon={<UserOutlined />} style={{ backgroundColor: "#1677ff" }} />
                  <div>
                    <Typography.Text type="secondary">{t("auth.sessionConflict.browserAccount")}</Typography.Text>
                    <div>
                      <Typography.Text strong>{getSessionDisplayLabel(browserSession)}</Typography.Text>
                    </div>
                    <Typography.Text type="secondary">{getAccountSubtitle(browserSession)}</Typography.Text>
                  </div>
                </Space>
                <Button type="primary" onClick={() => void useBrowserAccount()}>
                  {t("auth.sessionConflict.useBrowserAccount")}
                </Button>
              </Space>
            </div>

            <div style={{ textAlign: "center", color: "rgba(18,38,58,0.45)" }}>
              <SwapOutlined />
            </div>

            <div
              style={{
                border: "1px solid rgba(18, 38, 58, 0.08)",
                borderRadius: 18,
                padding: 18,
                background: "#fff"
              }}
            >
              <Space align="center" size={14} style={{ width: "100%", justifyContent: "space-between" }}>
                <Space align="center" size={14}>
                  <Avatar size={52} icon={<UserOutlined />} style={{ backgroundColor: "#52c41a" }} />
                  <div>
                    <Typography.Text type="secondary">{t("auth.sessionConflict.thisWindowAccount")}</Typography.Text>
                    <div>
                      <Typography.Text strong>{getSessionDisplayLabel(tabSession)}</Typography.Text>
                    </div>
                    <Typography.Text type="secondary">{getAccountSubtitle(tabSession)}</Typography.Text>
                  </div>
                </Space>
                <Button onClick={() => void switchBrowserToThisTabAccount()}>
                  {t("auth.sessionConflict.useThisWindowAccount")}
                </Button>
              </Space>
            </div>
          </div>

          <Button type="link" onClick={signOutAndRelogin}>
            {t("auth.sessionConflict.relogin")}
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
