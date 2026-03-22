import {
  AppstoreOutlined,
  BarChartOutlined,
  DownOutlined,
  FileTextOutlined,
  GlobalOutlined,
  HomeOutlined,
  LogoutOutlined,
  MailOutlined,
  MenuOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PhoneOutlined,
  ReadOutlined,
  SettingOutlined,
  UserOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Drawer,
  Dropdown,
  Grid,
  Layout,
  Menu,
  Space,
  Typography,
} from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../api/client";
import {
  ACCOUNT_LOCALE_STORAGE_KEY,
  normalizeAccountLocale,
  type AccountLocale,
} from "../i18n/accountLocale";
import { AccountLanguageModal } from "../components/AccountLanguageModal";
import { buildSearchString, withUpdatedSearch } from "../utils/urlState";
import {
  persistFirstPartySessionContext,
  readBrowserSessionMeta,
  readSessionToken,
  readUserRole,
} from "../authSession";
import { applyPreferredLocaleFromSession } from "../i18n/accountLocalePreference";
import { DeveloperLanguageModal } from "../pages/developer/components/common/DeveloperLanguageModal";
import { AdminLanguageModal } from "../pages/admin/components/common/AdminLanguageModal";
import {
  ensureDeveloperTranslationsLoaded,
  getDeveloperFallbackMessages,
  isDeveloperTranslationsLoaded,
} from "../pages/developer/i18n";
import { useAdminI18n } from "../pages/admin/i18n";
import {
  getStoredSiteName,
  persistSiteBranding,
  resolveSiteNameForLocale,
} from "../siteBranding";
import { updateUserProfile } from "../pages/user/services/userApi";
import { fetchPublicSettings, mergePublicSettingsCache } from "../publicSettings";

const { Header, Content, Sider } = Layout;

function goMenuIcon() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 18,
        height: 18,
      }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <title>Go</title>
        <path
          fill="#00ADD8"
          d="M1.811 10.231c-.047 0-.058-.023-.035-.059l.246-.315c.023-.035.081-.058.128-.058h4.172c.046 0 .058.035.035.07l-.199.303c-.023.036-.082.07-.117.07zM.047 11.306c-.047 0-.059-.023-.035-.058l.245-.316c.023-.035.082-.058.129-.058h5.328c.047 0 .07.035.058.07l-.093.28c-.012.047-.058.07-.105.07zm2.828 1.075c-.047 0-.059-.035-.035-.07l.163-.292c.023-.035.07-.07.117-.07h2.337c.047 0 .07.035.07.082l-.023.28c0 .047-.047.082-.082.082zm12.129-2.36c-.736.187-1.239.327-1.963.514-.176.046-.187.058-.34-.117-.174-.199-.303-.327-.548-.444-.737-.362-1.45-.257-2.115.175-.795.514-1.204 1.274-1.192 2.22.011.935.654 1.706 1.577 1.835.795.105 1.46-.175 1.987-.77.105-.13.198-.27.315-.434H10.47c-.245 0-.304-.152-.222-.35.152-.362.432-.97.596-1.274a.315.315 0 01.292-.187h4.253c-.023.316-.023.631-.07.947a4.983 4.983 0 01-.958 2.29c-.841 1.11-1.94 1.8-3.33 1.986-1.145.152-2.209-.07-3.143-.77-.865-.655-1.356-1.52-1.484-2.595-.152-1.274.222-2.419.993-3.424.83-1.086 1.928-1.776 3.272-2.02 1.098-.2 2.15-.07 3.096.571.62.41 1.063.97 1.356 1.648.07.105.023.164-.117.2m3.868 6.461c-1.064-.024-2.034-.328-2.852-1.029a3.665 3.665 0 01-1.262-2.255c-.21-1.32.152-2.489.947-3.529.853-1.122 1.881-1.706 3.272-1.95 1.192-.21 2.314-.095 3.33.595.923.63 1.496 1.484 1.648 2.605.198 1.578-.257 2.863-1.344 3.962-.771.783-1.718 1.273-2.805 1.495-.315.06-.63.07-.934.106zm2.78-4.72c-.011-.153-.011-.27-.034-.387-.21-1.157-1.274-1.81-2.384-1.554-1.087.245-1.788.935-2.045 2.033-.21.912.234 1.835 1.075 2.21.643.28 1.285.244 1.905-.07.923-.48 1.425-1.228 1.484-2.233z"
        />
      </svg>
    </span>
  );
}

function phpMenuIcon() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 18,
        height: 18,
      }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <title>PHP</title>
        <path
          fill="#777BB4"
          d="M7.01 10.207h-.944l-.515 2.648h.838c.556 0 .97-.105 1.242-.314.272-.21.455-.559.55-1.049.092-.47.05-.802-.124-.995-.175-.193-.523-.29-1.047-.29zM12 5.688C5.373 5.688 0 8.514 0 12s5.373 6.313 12 6.313S24 15.486 24 12c0-3.486-5.373-6.312-12-6.312zm-3.26 7.451c-.261.25-.575.438-.917.551-.336.108-.765.164-1.285.164H5.357l-.327 1.681H3.652l1.23-6.326h2.65c.797 0 1.378.209 1.744.628.366.418.476 1.002.33 1.752a2.836 2.836 0 0 1-.305.847c-.143.255-.33.49-.561.703zm4.024.715l.543-2.799c.063-.318.039-.536-.068-.651-.107-.116-.336-.174-.687-.174H11.46l-.704 3.625H9.388l1.23-6.327h1.367l-.327 1.682h1.218c.767 0 1.295.134 1.586.401s.378.7.263 1.299l-.572 2.944h-1.389zm7.597-2.265a2.782 2.782 0 0 1-.305.847c-.143.255-.33.49-.561.703a2.44 2.44 0 0 1-.917.551c-.336.108-.765.164-1.286.164h-1.18l-.327 1.682h-1.378l1.23-6.326h2.649c.797 0 1.378.209 1.744.628.366.417.477 1.001.331 1.751zM17.766 10.207h-.943l-.516 2.648h.838c.557 0 .971-.105 1.242-.314.272-.21.455-.559.551-1.049.092-.47.049-.802-.125-.995s-.524-.29-1.047-.29z"
        />
      </svg>
    </span>
  );
}

function javaMenuIcon() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 18,
        height: 18,
      }}
    >
      <svg
        viewBox="0 0 256 346"
        width="18"
        height="18"
        aria-hidden="true"
        preserveAspectRatio="xMinYMin meet"
      >
        <path
          fill="#5382A1"
          d="M82.554 267.473s-13.198 7.675 9.393 10.272c27.369 3.122 41.356 2.675 71.517-3.034 0 0 7.93 4.972 19.003 9.279-67.611 28.977-153.019-1.679-99.913-16.517M74.292 229.659s-14.803 10.958 7.805 13.296c29.236 3.016 52.324 3.263 92.276-4.43 0 0 5.526 5.602 14.215 8.666-81.747 23.904-172.798 1.885-114.296-17.532"
        />
        <path
          fill="#E76F00"
          d="M143.942 165.515c16.66 19.18-4.377 36.44-4.377 36.44s42.301-21.837 22.874-49.183c-18.144-25.5-32.059-38.172 43.268-81.858 0 0-118.238 29.53-61.765 94.6"
        />
        <path
          fill="#5382A1"
          d="M233.364 295.442s9.767 8.047-10.757 14.273c-39.026 11.823-162.432 15.393-196.714.471-12.323-5.36 10.787-12.8 18.056-14.362 7.581-1.644 11.914-1.337 11.914-1.337-13.705-9.655-88.583 18.957-38.034 27.15 137.853 22.356 251.292-10.066 215.535-26.195M88.9 190.48s-62.771 14.91-22.228 20.323c17.118 2.292 51.243 1.774 83.03-.89 25.978-2.19 52.063-6.85 52.063-6.85s-9.16 3.923-15.787 8.448c-63.744 16.765-186.886 8.966-151.435-8.183 29.981-14.492 54.358-12.848 54.358-12.848M201.506 253.422c64.8-33.672 34.839-66.03 13.927-61.67-5.126 1.066-7.411 1.99-7.411 1.99s1.903-2.98 5.537-4.27c41.37-14.545 73.187 42.897-13.355 65.647 0 .001 1.003-.895 1.302-1.697"
        />
        <path
          fill="#E76F00"
          d="M162.439.371s35.887 35.9-34.037 91.101c-56.071 44.282-12.786 69.53-.023 98.377-32.73-29.53-56.75-55.526-40.635-79.72C111.395 74.612 176.918 57.393 162.439.37"
        />
        <path
          fill="#5382A1"
          d="M95.268 344.665c62.199 3.982 157.712-2.209 159.974-31.64 0 0-4.348 11.158-51.404 20.018-53.088 9.99-118.564 8.824-157.399 2.421.001 0 7.95 6.58 48.83 9.201"
        />
      </svg>
    </span>
  );
}

function nodejsMenuIcon() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 18,
        height: 18,
      }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <title>Node.js</title>
        <path
          fill="#5FA04E"
          d="M11.998 24c-.321 0-.641-.084-.922-.247L8.14 22.016c-.438-.245-.224-.332-.08-.383.585-.203.703-.25 1.328-.604.065-.037.151-.023.218.017l2.256 1.339c.082.045.197.045.272 0l8.795-5.076c.082-.047.134-.141.134-.238V6.921c0-.099-.053-.192-.137-.242l-8.791-5.072c-.081-.047-.189-.047-.271 0L3.075 6.68c-.085.049-.139.145-.139.241v10.15c0 .097.054.189.139.235l2.409 1.392c1.307.654 2.108-.116 2.108-.89V7.787c0-.142.114-.253.256-.253h1.115c.139 0 .255.112.255.253v10.021c0 1.745-.95 2.745-2.604 2.745-.508 0-.909 0-2.026-.551L2.28 18.675c-.57-.329-.922-.945-.922-1.604V6.921c0-.659.353-1.275.922-1.603L11.075.236c.557-.315 1.296-.315 1.848 0l8.794 5.082c.57.329.924.944.924 1.603v10.15c0 .659-.354 1.273-.924 1.604l-8.794 5.078c-.28.163-.599.247-.925.247zm7.101-10.007c0-1.9-1.284-2.406-3.987-2.763-2.731-.361-3.009-.548-3.009-1.187 0-.528.235-1.233 2.258-1.233 1.807 0 2.473.389 2.747 1.607.024.115.129.199.247.199h1.141c.071 0 .138-.031.186-.081.048-.054.074-.123.067-.196-.177-2.098-1.571-3.076-4.388-3.076-2.508 0-4.004 1.058-4.004 2.833 0 1.925 1.488 2.457 3.895 2.695 2.88.282 3.103.703 3.103 1.269 0 .983-.789 1.402-2.642 1.402-2.327 0-2.839-.584-3.011-1.742-.02-.124-.126-.215-.253-.215h-1.137c-.141 0-.254.112-.254.253 0 1.482.806 3.248 4.655 3.248 2.934 0 4.532-1.097 4.532-3.014z"
        />
      </svg>
    </span>
  );
}

function pythonMenuIcon() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 18,
        height: 18,
      }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <title>Python</title>
        <path
          fill="#3776AB"
          d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"
        />
      </svg>
    </span>
  );
}

export function AppLayout() {
  const backendOrigin = API_BASE.replace(/\/api$/, "");
  const screens = Grid.useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { t: adminT } = useAdminI18n();
  const currentRole = readUserRole();
  const sessionToken = readSessionToken();
  const browserSession = readBrowserSessionMeta();
  const [collapsed, setCollapsed] = useState(false);
  const [siteName, setSiteName] = useState(getStoredSiteName(i18n.language));
  const [siteLogoDataUrl, setSiteLogoDataUrl] = useState(
    localStorage.getItem("site_logo_data_url") || "",
  );
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false);
  const [developerTranslationsReady, setDeveloperTranslationsReady] = useState(
    () => isDeveloperTranslationsLoaded(i18n.language),
  );
  const accountLocale = normalizeAccountLocale(i18n.language);
  const brandingLocale = i18n.language;
  const developerFallback = getDeveloperFallbackMessages(i18n.language);
  const sharedSearch = buildSearchString(location.search);
  const isMobile = !screens.lg;
  const selectedMenuKey = useMemo(() => {
    if (location.pathname === "/admin/send-logs/emails") {
      return "/admin/send-logs/emails";
    }
    if (location.pathname === "/admin/send-logs/phones") {
      return "/admin/send-logs/phones";
    }
    if (location.pathname === "/admin/risk-logs") {
      return "/admin/risk-logs";
    }
    return location.pathname;
  }, [location.pathname]);
  const openMenuKeys = useMemo(() => {
    if (location.pathname.startsWith("/admin/send-logs/")) {
      return ["/admin/send-logs"];
    }
    if (location.pathname.startsWith("/developer/docs")) {
      return location.pathname.startsWith("/developer/docs/examples")
        ? ["/developer/integration", "/developer/docs/examples"]
        : ["/developer/integration"];
    }
    return [];
  }, [location.pathname]);
  const menuItems =
    currentRole === "admin"
      ? [
          {
            key: "/admin",
            icon: <HomeOutlined />,
            label: adminT("首页仪表盘"),
          },
          {
            key: "/admin/users",
            icon: <UsergroupAddOutlined />,
            label: adminT("用户管理"),
          },
          {
            key: "/admin/apps",
            icon: <AppstoreOutlined />,
            label: adminT("应用管理"),
          },
          {
            key: "/admin/send-logs",
            icon: <FileTextOutlined />,
            label: adminT("发信记录"),
            children: [
              {
                key: "/admin/send-logs/emails",
                icon: <MailOutlined />,
                label: adminT("邮件发信记录"),
              },
              {
                key: "/admin/send-logs/phones",
                icon: <PhoneOutlined />,
                label: adminT("手机号发信记录"),
              },
            ],
          },
          {
            key: "/admin/audit-logs",
            icon: <MenuOutlined />,
            label: adminT("审计日志"),
          },
          {
            key: "/admin/risk-logs",
            icon: <BarChartOutlined />,
            label: adminT("风控日志"),
          },
          {
            key: "/admin/settings",
            icon: <SettingOutlined />,
            label: adminT("参数设置"),
          },
        ]
      : currentRole === "developer"
        ? [
            {
              key: "/developer",
              icon: <HomeOutlined />,
              label: developerTranslationsReady
                ? t("menu.dashboard", { ns: "developer" })
                : developerFallback.menu.dashboard,
            },
            {
              key: "/developer/console",
              icon: <AppstoreOutlined />,
              label: developerTranslationsReady
                ? t("menu.console", { ns: "developer" })
                : developerFallback.menu.console,
            },
            {
              key: "/developer/audit-logs",
              icon: <FileTextOutlined />,
              label: developerTranslationsReady
                ? t("menu.auditLogs", { ns: "developer" })
                : developerFallback.menu.auditLogs,
            },
            {
              key: "/developer/user-analytics",
              icon: <BarChartOutlined />,
              label: developerTranslationsReady
                ? t("menu.analytics", { ns: "developer" })
                : developerFallback.menu.analytics,
            },
            {
              key: "/developer/integration",
              icon: <ReadOutlined />,
              label: developerTranslationsReady
                ? t("menu.integration", { ns: "developer" })
                : developerFallback.menu.integration,
              children: [
                {
                  key: "/developer/docs/manual",
                  icon: <ReadOutlined />,
                  label: developerTranslationsReady
                    ? t("menu.docsManual", { ns: "developer" })
                    : developerFallback.menu.docsManual,
                },
                {
                  key: "/developer/docs/examples",
                  icon: <FileTextOutlined />,
                  label: developerTranslationsReady
                    ? t("menu.docsExamples", { ns: "developer" })
                    : developerFallback.menu.docsExamples,
                  children: [
                    {
                      key: "/developer/docs/examples/go",
                      icon: goMenuIcon(),
                      label: "Go",
                    },
                    {
                      key: "/developer/docs/examples/php",
                      icon: phpMenuIcon(),
                      label: "PHP",
                    },
                    {
                      key: "/developer/docs/examples/java",
                      icon: javaMenuIcon(),
                      label: "Java",
                    },
                    {
                      key: "/developer/docs/examples/nodejs",
                      icon: nodejsMenuIcon(),
                      label: "Node.js",
                    },
                    {
                      key: "/developer/docs/examples/python",
                      icon: pythonMenuIcon(),
                      label: "Python",
                    },
                  ],
                },
              ],
            },
          ]
        : [{ key: "/me", icon: <UserOutlined />, label: "用户中心" }];

  const siteLogoUrl = useMemo(() => {
    if (!siteLogoDataUrl) {
      return "";
    }
    return siteLogoDataUrl.startsWith("http")
      ? siteLogoDataUrl
      : `${backendOrigin}${siteLogoDataUrl}`;
  }, [backendOrigin, siteLogoDataUrl]);

  useEffect(() => {
    if (browserSession?.authenticatedAt) {
      persistFirstPartySessionContext(
        currentRole,
        browserSession.authenticatedAt,
        browserSession.userId,
      );
    }
  }, [browserSession?.authenticatedAt, browserSession?.userId, currentRole]);

  useEffect(() => {
    void applyPreferredLocaleFromSession().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (currentRole !== "developer") {
      setDeveloperTranslationsReady(false);
      return;
    }

    let active = true;
    if (isDeveloperTranslationsLoaded(i18n.language)) {
      setDeveloperTranslationsReady(true);
      return;
    }

    setDeveloperTranslationsReady(false);
    void ensureDeveloperTranslationsLoaded(i18n.language).then(() => {
      if (!active) {
        return;
      }
      setDeveloperTranslationsReady(true);
    });

    return () => {
      active = false;
    };
  }, [currentRole, i18n.language]);

  useEffect(() => {
    setSiteName(getStoredSiteName(brandingLocale));
  }, [brandingLocale]);

  useEffect(() => {
    void fetchPublicSettings()
      .then((result) => {
        const nextName = resolveSiteNameForLocale(
          brandingLocale,
          result.site_name,
          result.site_name_en,
        );
        const nextLogo = result.site_logo_data_url?.trim() || "";
        const nextICPRecordNumber = result.site_icp_record_number?.trim() || "";
        const nextPublicSecurityRecordNumber =
          result.site_public_security_record_number?.trim() || "";
        persistSiteBranding(result);
        setSiteName(nextName);
        setSiteLogoDataUrl(nextLogo);
        localStorage.setItem("site_logo_data_url", nextLogo);
        localStorage.setItem("site_icp_record_number", nextICPRecordNumber);
        localStorage.setItem(
          "site_public_security_record_number",
          nextPublicSecurityRecordNumber,
        );
      })
      .catch(() => undefined);

    function handleSiteNameUpdated(event: Event) {
      const detail = (
        event as CustomEvent<{
          siteName?: string;
          siteNameEn?: string;
          siteLogoDataUrl?: string;
          siteICPRecordNumber?: string;
          sitePublicSecurityRecordNumber?: string;
        }>
      ).detail;
      const nextName = resolveSiteNameForLocale(
        brandingLocale,
        detail?.siteName,
        detail?.siteNameEn,
      );
      const nextLogo = detail?.siteLogoDataUrl?.trim();
      const nextICPRecordNumber = detail?.siteICPRecordNumber?.trim();
      const nextPublicSecurityRecordNumber =
        detail?.sitePublicSecurityRecordNumber?.trim();
      mergePublicSettingsCache({
        site_name: detail?.siteName,
        site_name_en: detail?.siteNameEn,
        site_logo_data_url: detail?.siteLogoDataUrl,
        site_icp_record_number: detail?.siteICPRecordNumber,
        site_public_security_record_number:
          detail?.sitePublicSecurityRecordNumber,
      });
      persistSiteBranding({
        site_name: detail?.siteName,
        site_name_en: detail?.siteNameEn,
      });
      setSiteName(nextName);
      if (typeof nextLogo === "string") {
        setSiteLogoDataUrl(nextLogo);
        localStorage.setItem("site_logo_data_url", nextLogo);
      }
      if (typeof nextICPRecordNumber === "string") {
        localStorage.setItem("site_icp_record_number", nextICPRecordNumber);
      }
      if (typeof nextPublicSecurityRecordNumber === "string") {
        localStorage.setItem(
          "site_public_security_record_number",
          nextPublicSecurityRecordNumber,
        );
      }
    }

    window.addEventListener("site-name-updated", handleSiteNameUpdated);
    return () =>
      window.removeEventListener("site-name-updated", handleSiteNameUpdated);
  }, [brandingLocale]);

  async function handleLogout() {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = `${backendOrigin}/oauth2/logout`;
    form.style.display = "none";
    document.body.appendChild(form);
    form.submit();
    form.remove();
  }

  async function updateAccountLocale(nextLocale: AccountLocale) {
    const previousLocale = accountLocale;
    const applyLocale = async (locale: AccountLocale) => {
      localStorage.setItem(ACCOUNT_LOCALE_STORAGE_KEY, locale);
      if (locale !== i18n.language) {
        await i18n.changeLanguage(locale);
      }
      navigate(
        {
          pathname: location.pathname,
          search: withUpdatedSearch(location.search, { locale }),
        },
        { replace: true },
      );
    };

    if (!sessionToken) {
      await applyLocale(nextLocale);
      return;
    }

    try {
      const result = await updateUserProfile(sessionToken, {
        preferred_locale: nextLocale,
      });
      const persistedLocale = normalizeAccountLocale(
        result.user?.preferred_locale || nextLocale,
      );
      await applyLocale(persistedLocale);
    } catch {
      await applyLocale(previousLocale);
    }
  }

  function buildLegalURL(kind: "agreement" | "privacy") {
    const search = new URLSearchParams(location.search);
    search.set("back_to", `${location.pathname}${location.search}`);
    const query = search.toString();
    return `/legal/${kind}${query ? `?${query}` : ""}`;
  }

  useEffect(() => {
    const search = new URLSearchParams(location.search);
    const rawLocale = search.get("locale");
    if (!rawLocale) {
      return;
    }
    const locale = normalizeAccountLocale(rawLocale);
    if (locale !== accountLocale) {
      localStorage.setItem(ACCOUNT_LOCALE_STORAGE_KEY, locale);
      void i18n.changeLanguage(locale);
    }
  }, [accountLocale, i18n, location.search]);

  if (currentRole === "user") {
    return (
      <Layout className="user-shell">
        <Header className="user-shell-header">
          <div
            className="user-shell-brand"
            onClick={() => navigate(`/me${sharedSearch}`)}
          >
            <span className="user-shell-brand-mark">
              {siteLogoUrl ? (
                <img
                  src={siteLogoUrl}
                  alt={siteName}
                  className="site-brand-image"
                />
              ) : (
                "M"
              )}
            </span>
            <span>{siteName}</span>
          </div>
          {isMobile ? (
            <Button
              type="text"
              className="user-shell-mobile-menu"
              icon={<MenuOutlined />}
              onClick={() => setMobileUserMenuOpen(true)}
            />
          ) : (
            <Space size={28} className="user-shell-links">
              <Button type="link" onClick={() => setLanguageModalOpen(true)}>
                {t("header.language")}
              </Button>
              <Button
                type="link"
                onClick={() =>
                  window.open(
                    buildLegalURL("agreement"),
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                {t("header.agreement")}
              </Button>
              <Button
                type="link"
                onClick={() =>
                  window.open(
                    buildLegalURL("privacy"),
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                {t("header.privacy")}
              </Button>
              <Button type="link">{t("header.help")}</Button>
              <Button type="link" danger onClick={() => void handleLogout()}>
                {t("header.logout")}
              </Button>
            </Space>
          )}
        </Header>
        <Content className="user-shell-content">
          <Outlet />
        </Content>
        <Drawer
          placement="right"
          open={mobileUserMenuOpen}
          onClose={() => setMobileUserMenuOpen(false)}
          className="user-shell-mobile-drawer"
          width={260}
        >
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <Button
              type="text"
              className="user-shell-mobile-drawer-link"
              onClick={() => {
                setMobileUserMenuOpen(false);
                setLanguageModalOpen(true);
              }}
            >
              {t("header.language")}
            </Button>
            <Button type="text" className="user-shell-mobile-drawer-link">
              <span
                onClick={() => {
                  setMobileUserMenuOpen(false);
                  window.open(
                    buildLegalURL("agreement"),
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
              >
                {t("header.agreement")}
              </span>
            </Button>
            <Button
              type="text"
              className="user-shell-mobile-drawer-link"
              onClick={() => {
                setMobileUserMenuOpen(false);
                window.open(
                  buildLegalURL("privacy"),
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
            >
              {t("header.privacy")}
            </Button>
            <Button type="text" className="user-shell-mobile-drawer-link">
              {t("header.help")}
            </Button>
            <Button
              type="text"
              danger
              className="user-shell-mobile-drawer-link"
              onClick={() => {
                setMobileUserMenuOpen(false);
                void handleLogout();
              }}
            >
              {t("header.logout")}
            </Button>
          </Space>
        </Drawer>
        <AccountLanguageModal
          open={languageModalOpen}
          currentLocale={accountLocale}
          title={t("header.languageModalTitle")}
          description={t("header.languageModalDesc")}
          onClose={() => setLanguageModalOpen(false)}
          onSelect={(locale) => updateAccountLocale(locale)}
        />
      </Layout>
    );
  }

  return (
    <Layout className="app-shell">
      <Sider
        width={240}
        collapsible
        collapsed={collapsed}
        trigger={null}
        theme="light"
        className="app-sider"
      >
        <div className={`brand ${collapsed ? "brand-collapsed" : ""}`}>
          {siteLogoUrl ? (
            <img
              src={siteLogoUrl}
              alt={siteName}
              className="brand-logo-image"
            />
          ) : null}
          {!collapsed ? <span>{siteName}</span> : null}
        </div>
        <Menu
          className="app-side-menu"
          mode="inline"
          selectedKeys={[selectedMenuKey]}
          defaultOpenKeys={openMenuKeys}
          items={menuItems}
          onClick={({ key }) => navigate(`${key}${sharedSearch}`)}
        />
      </Sider>
      <Layout className="app-main-shell">
        <Header className="app-header">
          <div className="app-header-title">
            <Space size={12}>
              <Button
                type="text"
                className="app-header-trigger"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed((value) => !value)}
              />
              <Typography.Title level={4} style={{ margin: 0 }}>
                {siteName}{" "}
                {currentRole === "admin"
                    ? adminT("管理后台")
                    : currentRole === "developer"
                    ? developerTranslationsReady
                      ? t("appLayout.title", { ns: "developer" })
                      : developerFallback.appLayout.title
                    : "用户中心"}
              </Typography.Title>
            </Space>
          </div>
          <Space size={12}>
            <Button
              type="text"
              className="app-header-user"
              icon={<GlobalOutlined />}
              onClick={() => setLanguageModalOpen(true)}
            >
              {currentRole === "admin"
                ? adminT("语言切换")
                : t("header.language")}
            </Button>
            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  {
                    key: "logout",
                    icon: <LogoutOutlined />,
                    label: t("header.logout"),
                  },
                ],
                onClick: ({ key }) => {
                  if (key === "logout") {
                    void handleLogout();
                  }
                },
              }}
            >
              <Button type="text" className="app-header-user">
                <Space size={8}>
                  <UserOutlined />
                  <span>
                    {currentRole === "admin"
                      ? adminT("管理员")
                      : currentRole === "developer"
                        ? developerTranslationsReady
                          ? t("appLayout.role", { ns: "developer" })
                          : developerFallback.appLayout.role
                        : "当前账号"}
                  </span>
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </Space>
        </Header>
        <Content className="app-content">
          <Outlet />
        </Content>
        {currentRole === "admin" ? (
          <AdminLanguageModal
            open={languageModalOpen}
            currentLocale={accountLocale}
            onClose={() => setLanguageModalOpen(false)}
            onSelect={(locale) => void updateAccountLocale(locale)}
          />
        ) : currentRole === "developer" ? (
          <DeveloperLanguageModal
            open={languageModalOpen}
            currentLocale={accountLocale}
            onClose={() => setLanguageModalOpen(false)}
            onSelect={(locale) => void updateAccountLocale(locale)}
          />
        ) : (
          <AccountLanguageModal
            open={languageModalOpen}
            currentLocale={accountLocale}
            title={t("header.languageModalTitle")}
            description={t("header.languageModalDesc")}
            onClose={() => setLanguageModalOpen(false)}
            onSelect={(locale) => void updateAccountLocale(locale)}
          />
        )}
      </Layout>
    </Layout>
  );
}
