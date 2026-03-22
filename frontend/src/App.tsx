import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { LoginMFAPage } from "./pages/auth/LoginMFAPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { PhoneBindingRequiredPage } from "./pages/auth/PhoneBindingRequiredPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { LoginDeletionConfirmPage } from "./pages/auth/LoginDeletionConfirmPage";
import { LoginStepUpPage } from "./pages/auth/LoginStepUpPage";
import { ForcedMFAEnrollmentPage } from "./pages/auth/ForcedMFAEnrollmentPage";
import { AuthorizePage } from "./pages/auth/AuthorizePage";
import { CallbackPage } from "./pages/auth/CallbackPage";
import { LogoutCompletePage } from "./pages/auth/LogoutCompletePage";
import { SessionConflictPage } from "./pages/auth/SessionConflictPage";
import { DeveloperPage } from "./pages/developer/DeveloperPage";
import { AdminPage } from "./pages/admin";
import { UserPage } from "./pages/user/UserPage";
import { InstallPage } from "./pages/install/InstallPage";
import { LegalPage } from "./pages/legal/LegalPage";
import { withUpdatedSearch } from "./utils/urlState";
import {
  clearLegacyOIDCTokens,
  readBrowserSessionMeta,
  readSessionToken,
  readTabSessionMeta,
  readUserRole,
  syncTabSessionFromBrowser,
} from "./authSession";
import {
  getRoleHomePath,
  isPathAllowedForRole,
  type AccountRole,
} from "./roleRouting";
import {
  getStoredBrowserTitle,
  persistSiteBranding,
  resolveBrowserTitleForLocale,
} from "./siteBranding";
import { fetchPublicSettings, mergePublicSettingsCache } from "./publicSettings";

function RequireAuth() {
  const location = useLocation();
  const sessionToken = readSessionToken();

  if (!sessionToken) {
    return (
      <Navigate
        to={{
          pathname: "/login",
          search: withUpdatedSearch(location.search, {
            redirect: `${location.pathname}${location.search}`,
          }),
        }}
        replace
      />
    );
  }

  return <Outlet />;
}

function RedirectToLoginPreservingSearch() {
  const location = useLocation();
  return (
    <Navigate
      to={{
        pathname: "/login",
        search: location.search,
      }}
      replace
    />
  );
}

function RequireSingleBrowserAccount() {
  const location = useLocation();
  const browserSession = readBrowserSessionMeta();
  const tabSession = readTabSessionMeta();

  if (!browserSession) {
    return <Outlet />;
  }

  if (!tabSession) {
    syncTabSessionFromBrowser();
    return <Outlet />;
  }

  const browserIdentity =
    browserSession.userId || browserSession.authenticatedAt;
  const tabIdentity = tabSession.userId || tabSession.authenticatedAt;
  if (browserIdentity && tabIdentity && browserIdentity !== tabIdentity) {
    return (
      <Navigate
        to={{
          pathname: "/account-session-conflict",
          search: withUpdatedSearch(location.search, {
            redirect: `${location.pathname}${location.search}`,
          }),
        }}
        replace
      />
    );
  }

  return <Outlet />;
}

function RequireRoleRouteMatch() {
  const location = useLocation();
  const role = readUserRole() as AccountRole;

  if (!isPathAllowedForRole(location.pathname, role)) {
    return <Navigate to={getRoleHomePath(role)} replace />;
  }

  return <Outlet />;
}

export function App() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const currentRole = readUserRole();
  const brandingLocale = currentRole === "admin" ? "zh-CN" : i18n.language;

  useEffect(() => {
    clearLegacyOIDCTokens();
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = getStoredBrowserTitle(brandingLocale);
    }
  }, [brandingLocale]);

  useEffect(() => {
    const syncBrowserTitleWithBranding = (
      siteBrowserTitle?: string | null,
      siteBrowserTitleEn?: string | null,
    ) => {
      const resolvedTitle = resolveBrowserTitleForLocale(
        brandingLocale,
        siteBrowserTitle,
        siteBrowserTitleEn,
      );
      if (currentRole === "admin" && location.pathname.startsWith("/admin")) {
        document.title = resolvedTitle.includes("管理后台")
          ? resolvedTitle
          : `${resolvedTitle} 管理后台`;
        return;
      }
      document.title = resolvedTitle;
    };

    void fetchPublicSettings()
      .then((settings) => {
        persistSiteBranding(settings);
        syncBrowserTitleWithBranding(
          settings.site_browser_title,
          settings.site_browser_title_en,
        );
      })
      .catch(() => {
        const fallbackTitle = getStoredBrowserTitle(brandingLocale);
        document.title =
          currentRole === "admin" && location.pathname.startsWith("/admin")
            ? `${fallbackTitle} 管理后台`
            : fallbackTitle;
      });

    const handleSiteSettingsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{
        siteBrowserTitle?: string;
        siteBrowserTitleEn?: string;
        siteName?: string;
        siteNameEn?: string;
      }>;
      mergePublicSettingsCache({
        site_name: customEvent.detail?.siteName,
        site_name_en: customEvent.detail?.siteNameEn,
        site_browser_title: customEvent.detail?.siteBrowserTitle,
        site_browser_title_en: customEvent.detail?.siteBrowserTitleEn,
      });
      persistSiteBranding({
        site_name: customEvent.detail?.siteName,
        site_name_en: customEvent.detail?.siteNameEn,
        site_browser_title: customEvent.detail?.siteBrowserTitle,
        site_browser_title_en: customEvent.detail?.siteBrowserTitleEn,
      });
      syncBrowserTitleWithBranding(
        customEvent.detail?.siteBrowserTitle,
        customEvent.detail?.siteBrowserTitleEn,
      );
    };

    window.addEventListener("site-name-updated", handleSiteSettingsUpdated);
    return () =>
      window.removeEventListener(
        "site-name-updated",
        handleSiteSettingsUpdated,
      );
  }, [brandingLocale, currentRole, location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<RedirectToLoginPreservingSearch />} />
      <Route path="/install" element={<InstallPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login-mfa" element={<LoginMFAPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/phone-binding-required"
        element={<PhoneBindingRequiredPage />}
      />
      <Route path="/login-step-up" element={<LoginStepUpPage />} />
      <Route
        path="/forced-mfa-enrollment"
        element={<ForcedMFAEnrollmentPage />}
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        path="/login-deletion-confirm"
        element={<LoginDeletionConfirmPage />}
      />
      <Route path="/authorize" element={<AuthorizePage />} />
      <Route path="/callback" element={<CallbackPage />} />
      <Route path="/logout-complete" element={<LogoutCompletePage />} />
      <Route
        path="/account-session-conflict"
        element={<SessionConflictPage />}
      />
      <Route path="/legal/:kind" element={<LegalPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<RequireSingleBrowserAccount />}>
          <Route element={<RequireRoleRouteMatch />}>
            <Route element={<AppLayout />}>
              <Route path="/me/:section?" element={<UserPage />} />
              <Route path="/developer" element={<DeveloperPage />} />
              <Route path="/developer/console" element={<DeveloperPage />} />
              <Route path="/developer/audit-logs" element={<DeveloperPage />} />
              <Route
                path="/developer/user-analytics"
                element={<DeveloperPage />}
              />
              <Route path="/developer/docs" element={<DeveloperPage />} />
              <Route
                path="/developer/docs/manual"
                element={<DeveloperPage />}
              />
              <Route
                path="/developer/docs/examples"
                element={<DeveloperPage />}
              />
              <Route
                path="/developer/docs/examples/go"
                element={<DeveloperPage />}
              />
              <Route
                path="/developer/docs/examples/php"
                element={<DeveloperPage />}
              />
              <Route
                path="/developer/docs/examples/java"
                element={<DeveloperPage />}
              />
              <Route
                path="/developer/docs/examples/nodejs"
                element={<DeveloperPage />}
              />
              <Route
                path="/developer/docs/examples/python"
                element={<DeveloperPage />}
              />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/users" element={<AdminPage />} />
              <Route path="/admin/apps" element={<AdminPage />} />
              <Route path="/admin/send-logs/emails" element={<AdminPage />} />
              <Route path="/admin/send-logs/phones" element={<AdminPage />} />
              <Route path="/admin/audit-logs" element={<AdminPage />} />
              <Route path="/admin/risk-logs" element={<AdminPage />} />
              <Route path="/admin/settings" element={<AdminPage />} />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<RedirectToLoginPreservingSearch />} />
    </Routes>
  );
}
