import { GlobalOutlined, SwapOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Avatar, Button, Card, Checkbox, Space, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { api, getPreferredBackendOrigin } from "../../api/client";
import { AccountLanguageModal } from "../../components/AccountLanguageModal";
import { AuthPageFooter } from "../../components/AuthPageFooter";
import {
  ACCOUNT_LOCALE_STORAGE_KEY,
  accountLocaleLabel,
  normalizeAccountLocale,
  type AccountLocale
} from "../../i18n/accountLocale";
import { withUpdatedSearch } from "../../utils/urlState";
import { LoginPage } from "./LoginPage";
import { clearAuthorizationSession, getAuthorizationSession } from "./oidc";
import { clearBrowserSessionMeta, readFirstPartySessionContext, readSessionToken, readUserRole } from "../../authSession";
import { getStoredSiteName, persistSiteBranding, resolveSiteNameForLocale } from "../../siteBranding";

type PublicSettings = {
  data?: {
    site_name?: string;
    site_name_en?: string;
    site_logo_data_url?: string;
    site_footer_text?: string;
    frontend_base_url?: string;
    oidc_first_party_client_id?: string;
    oidc_auto_approve_client_ids?: string[];
    oidc_auto_approve_redirect_hosts?: string[];
  };
};

type PublicApp = {
  data?: {
    id?: string;
    client_id?: string;
    name?: string;
    icon_url?: string;
    description?: string;
  };
};

type CurrentUserResponse = {
  user?: {
    id?: string;
    email?: string;
    phone?: string;
    display_name?: string;
    role?: string;
    avatar_url?: string;
  };
};

type CurrentUser = {
  id: string;
  email: string;
  phone: string;
  displayName: string;
  role: string;
  avatarURL: string;
};

type PermissionItem = {
  key: string;
  title: string;
  description: string;
};

function normalizeHost(value: string) {
  return value.trim().toLowerCase();
}

function getAuthority(rawURL: string) {
  try {
    return normalizeHost(new URL(rawURL).host);
  } catch {
    return "";
  }
}

function matchesApprovedRedirect(redirectURI: string, approvedValues: string[]) {
  let redirectURL: URL;
  try {
    redirectURL = new URL(redirectURI);
  } catch {
    return false;
  }
  const redirectHost = normalizeHost(redirectURL.hostname);
  const redirectAuthority = normalizeHost(redirectURL.host);
  return approvedValues.some((value) => {
    const normalized = normalizeHost(value);
    if (!normalized) {
      return false;
    }
    if (normalized.includes("://")) {
      try {
        return redirectAuthority === normalizeHost(new URL(normalized).host);
      } catch {
        return false;
      }
    }
    if (normalized.includes(":")) {
      return redirectAuthority === normalized;
    }
    return redirectHost === normalized;
  });
}

function shouldAutoApproveAuthorization(
  clientID: string,
  redirectURI: string,
  settings?: PublicSettings["data"]
) {
  const approvedClientIDs = new Set(
    [
      settings?.oidc_first_party_client_id || "",
      ...(settings?.oidc_auto_approve_client_ids || [])
    ]
      .map((item) => item.trim())
      .filter(Boolean)
  );
  if (approvedClientIDs.has(clientID.trim())) {
    const approvedHosts = [
      getAuthority(settings?.frontend_base_url || ""),
      ...(settings?.oidc_auto_approve_redirect_hosts || []).map(normalizeHost)
    ].filter(Boolean);
    return matchesApprovedRedirect(redirectURI, approvedHosts);
  }
  return false;
}

function getFallbackAppDisplayName(clientID: string, redirectURI: string) {
  try {
    const hostname = new URL(redirectURI).hostname.replace(/^www\./, "");
    return hostname || clientID;
  } catch {
    return clientID;
  }
}

function resolveAssetURL(asset: string, backendOrigin: string) {
  const value = asset.trim();
  if (!value) {
    return "";
  }
  return value.startsWith("http") ? value : `${backendOrigin}${value}`;
}

function getFaviconURL(redirectURI: string) {
  try {
    const url = new URL(redirectURI);
    return `${url.origin}/favicon.ico`;
  } catch {
    return "";
  }
}

function buildPromptValueForReauth(rawPrompt: string) {
  const tokens = rawPrompt
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => item !== "none" && item !== "login");
  tokens.push("login");
  return Array.from(new Set(tokens)).join(" ");
}

function buildSilentAuthorizationPrompt() {
  return "none";
}

function getUserInitial(currentUser?: CurrentUser) {
  const source = currentUser?.displayName || currentUser?.email || "";
  return source.trim().slice(0, 1).toUpperCase() || "U";
}

function getRequestedPermissions(scope: string, t: (key: string, options?: Record<string, unknown>) => string): PermissionItem[] {
  const scopes = Array.from(new Set(scope.split(/\s+/).map((item) => item.trim()).filter(Boolean)));
  return scopes.map((item) => {
    switch (item) {
      case "openid":
        return {
          key: item,
          title: t("auth.authorize.scopes.openidTitle"),
          description: t("auth.authorize.scopes.openidDesc")
        };
      case "profile":
        return {
          key: item,
          title: t("auth.authorize.scopes.profileTitle"),
          description: t("auth.authorize.scopes.profileDesc")
        };
      case "email":
        return {
          key: item,
          title: t("auth.authorize.scopes.emailTitle"),
          description: t("auth.authorize.scopes.emailDesc")
        };
      case "phone":
        return {
          key: item,
          title: t("auth.authorize.scopes.phoneTitle"),
          description: t("auth.authorize.scopes.phoneDesc")
        };
      case "gateway.read":
        return {
          key: item,
          title: t("auth.authorize.scopes.gatewayReadTitle"),
          description: t("auth.authorize.scopes.gatewayReadDesc")
        };
      default:
        return {
          key: item,
          title: t("auth.authorize.scopes.customTitle", { scope: item }),
          description: t("auth.authorize.scopes.customDesc")
        };
    }
  });
}

function translateAuthorizeError(rawMessage: string, t: (key: string, options?: Record<string, unknown>) => string) {
  const normalizedMessage = rawMessage.trim();
  const lowerCasedMessage = normalizedMessage.toLowerCase();
  const rejectedPrefix = "application rejected:";
  const bannedPrefix = "application access banned:";

  if (lowerCasedMessage.startsWith(rejectedPrefix)) {
    return t("auth.authorize.errors.applicationRejectedWithReason", {
      reason: normalizedMessage.slice(rejectedPrefix.length).trim()
    });
  }

  if (lowerCasedMessage.startsWith(bannedPrefix)) {
    return t("auth.authorize.errors.applicationAccessBannedWithReason", {
      reason: normalizedMessage.slice(bannedPrefix.length).trim()
    });
  }

  switch (lowerCasedMessage) {
    case "application rejected":
      return t("auth.authorize.errors.applicationRejected");
    case "application access restricted":
      return t("auth.authorize.errors.applicationAccessRestricted");
    case "application access banned":
      return t("auth.authorize.errors.applicationAccessBanned");
    case "application not approved":
      return t("auth.authorize.errors.applicationNotApproved");
    case "application not found":
      return t("auth.authorize.errors.applicationNotFound");
    case "forbidden":
      return t("auth.authorize.errors.forbidden");
    case "unsupported response_type":
      return t("auth.authorize.errors.unsupportedResponseType");
    case "redirect_uri mismatch":
      return t("auth.authorize.errors.redirectUriMismatch");
    case "scope not allowed":
      return t("auth.authorize.errors.scopeNotAllowed");
    case "openid scope is required":
      return t("auth.authorize.errors.openidScopeRequired");
    case "code_challenge_method requires code_challenge":
      return t("auth.authorize.errors.codeChallengeMethodRequiresCodeChallenge");
    case "unsupported code_challenge_method":
      return t("auth.authorize.errors.unsupportedCodeChallengeMethod");
    case "prompt none must not be combined with other values":
      return t("auth.authorize.errors.promptNoneMustNotBeCombinedWithOtherValues");
    case "invalid max_age":
      return t("auth.authorize.errors.invalidMaxAge");
    case "acr_values_not_satisfied":
      return t("auth.authorize.errors.acrValuesNotSatisfied");
    case "consent_required":
      return t("auth.authorize.errors.consentRequired");
    case "login_required":
      return t("auth.authorize.errors.loginRequired");
    case "authorize failed":
      return t("auth.authorize.errors.authorizeFailed");
    case "failed to load authorization settings":
      return t("auth.authorize.errors.loadAuthorizationSettingsFailed");
    case "network request failed":
      return t("auth.authorize.errors.networkRequestFailed");
    default:
      if (lowerCasedMessage.startsWith("api endpoint returned html instead of json")) {
        return t("auth.authorize.errors.apiReturnedHtml");
      }
      return rawMessage;
  }
}

export function AuthorizePage() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const backendOrigin = getPreferredBackendOrigin();
  const [error, setError] = useState("");
  const [authorizing, setAuthorizing] = useState(false);
  const [checkingPageState, setCheckingPageState] = useState(true);
  const [showConsent, setShowConsent] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [siteName, setSiteName] = useState(getStoredSiteName(i18n.language));
  const [siteLogoDataUrl, setSiteLogoDataUrl] = useState(localStorage.getItem("site_logo_data_url") || "");
  const [siteFooterText, setSiteFooterText] = useState(localStorage.getItem("site_footer_text") || "");
  const [appName, setAppName] = useState("");
  const [appIconUrl, setAppIconUrl] = useState("");
  const [thirdPartyIconFailed, setThirdPartyIconFailed] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [autoApproveEnabled, setAutoApproveEnabled] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);

  const search = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const params = useMemo(
    () => ({
      client_id: search.get("client_id") || "",
      redirect_uri: search.get("redirect_uri") || "",
      response_type: search.get("response_type") || "code",
      scope: search.get("scope") || "openid",
      state: search.get("state") || "",
      nonce: search.get("nonce") || "",
      code_challenge: search.get("code_challenge") || "",
      code_challenge_method: search.get("code_challenge_method") || "",
      prompt: search.get("prompt") || "",
      max_age: search.get("max_age") || "",
      acr_values: search.get("acr_values") || ""
    }),
    [search]
  );
  const hasRequiredParams = Boolean(params.client_id && params.redirect_uri);
  const currentRole = readUserRole();
  const usesAuthorizationFlowSession = search.get("auth_flow") === "authorization";
  const authorizationSession = usesAuthorizationFlowSession ? getAuthorizationSession() : null;
  const hasSession = Boolean(authorizationSession) || Boolean(readSessionToken());
  const promptValues = useMemo(() => new Set(params.prompt.split(/\s+/).filter(Boolean)), [params.prompt]);
  const promptLoginSatisfied = search.get("prompt_login_satisfied") === "1";
  const appDisplayName = useMemo(
    () => appName || getFallbackAppDisplayName(params.client_id, params.redirect_uri),
    [appName, params.client_id, params.redirect_uri]
  );
  const siteLogoUrl = useMemo(
    () => resolveAssetURL(siteLogoDataUrl, backendOrigin),
    [backendOrigin, siteLogoDataUrl]
  );
  const uploadedAppIconUrl = useMemo(
    () => resolveAssetURL(appIconUrl, backendOrigin),
    [appIconUrl, backendOrigin]
  );
  const thirdPartyIconUrl = useMemo(() => getFaviconURL(params.redirect_uri), [params.redirect_uri]);
  const requestedPermissions = useMemo(() => getRequestedPermissions(params.scope, t), [params.scope, t]);
  const accountLocale = normalizeAccountLocale(i18n.language);

  useEffect(() => {
    setSiteName(getStoredSiteName(i18n.language));
  }, [i18n.language]);

  function clearLocalSession() {
    clearBrowserSessionMeta();
  }

  function getRoleHome() {
    if (currentRole === "admin") {
      return "/admin";
    }
    if (currentRole === "developer") {
      return "/developer";
    }
    return "/me";
  }

  function getReauthSearch() {
    return withUpdatedSearch(location.search, {
      prompt: buildPromptValueForReauth(params.prompt),
      prompt_login_satisfied: null,
      auth_flow: "authorization",
      tab: "password"
    });
  }

  function navigateToLoginForNewAccount() {
    clearAuthorizationSession();
    navigate(
      {
        pathname: "/login",
        search: getReauthSearch()
      },
      { replace: true }
    );
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

  useEffect(() => {
    if (!params.client_id) {
      setAppName("");
      setAppIconUrl("");
      return;
    }
    let active = true;
    const fallbackName = getFallbackAppDisplayName(params.client_id, params.redirect_uri);
    setAppName(fallbackName);
    void api<PublicApp>(`/public/apps/${encodeURIComponent(params.client_id)}`)
      .then((result) => {
        if (!active) {
          return;
        }
        setAppName(result.data?.name?.trim() || fallbackName);
        setAppIconUrl(result.data?.icon_url?.trim() || "");
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setAppName(fallbackName);
        setAppIconUrl("");
      });
    return () => {
      active = false;
    };
  }, [params.client_id, params.redirect_uri]);

  useEffect(() => {
    setThirdPartyIconFailed(false);
  }, [thirdPartyIconUrl]);

  useEffect(() => {
    let active = true;

    if (hasSession) {
      if (promptValues.has("login") && !promptLoginSatisfied) {
        navigateToLoginForNewAccount();
        return () => {
          active = false;
        };
      }
      if (!hasRequiredParams) {
        navigate(getRoleHome(), { replace: true });
      }
      return () => {
        active = false;
      };
    }

    if (hasRequiredParams) {
      if (promptValues.has("none")) {
        setError("login_required");
        return () => {
          active = false;
        };
      }
      setError("");
      return () => {
        active = false;
      };
    }

    setError("");
    navigate(getRoleHome(), { replace: true });
    return () => {
      active = false;
    };
  }, [currentRole, hasRequiredParams, navigate, promptLoginSatisfied, promptValues, hasSession]);

  useEffect(() => {
    let active = true;

    if (!hasSession || !hasRequiredParams) {
      setCheckingPageState(false);
      setShowConsent(false);
      setShowAccountPicker(false);
      return () => {
        active = false;
      };
    }

    setCheckingPageState(true);
    setShowConsent(false);
    setShowAccountPicker(false);
    setError("");

    if (promptValues.has("none")) {
      void api<PublicSettings>("/public/settings")
        .then((settings) => {
        if (!active) {
          return;
        }
        persistSiteBranding(settings.data);
        setSiteName(resolveSiteNameForLocale(i18n.language, settings.data?.site_name, settings.data?.site_name_en));
        setSiteLogoDataUrl(settings.data?.site_logo_data_url?.trim() || "");
        setSiteFooterText(settings.data?.site_footer_text || "");
        const canAutoApprove = shouldAutoApproveAuthorization(params.client_id, params.redirect_uri, settings.data);
        setAutoApproveEnabled(canAutoApprove);
        if (!canAutoApprove) {
          setError("consent_required");
          setCheckingPageState(false);
          return;
          }
          void authorize();
        })
        .catch((err) => {
          if (!active) {
            return;
          }
          setError(err instanceof Error ? err.message : "failed to load authorization settings");
          setCheckingPageState(false);
        });

      return () => {
        active = false;
      };
    }

    Promise.all([
      api<PublicSettings>("/public/settings"),
      api<CurrentUserResponse>("/me")
    ])
      .then(([settings, me]) => {
        if (!active) {
          return;
        }
        persistSiteBranding(settings.data);
        setSiteName(resolveSiteNameForLocale(i18n.language, settings.data?.site_name, settings.data?.site_name_en));
        setSiteLogoDataUrl(settings.data?.site_logo_data_url?.trim() || "");
        setSiteFooterText(settings.data?.site_footer_text || "");
        const user = me.user;
        setCurrentUser({
          id: user?.id?.trim() || "",
          email: user?.email?.trim() || "",
          phone: user?.phone?.trim() || "",
          displayName: user?.display_name?.trim() || "",
          role: user?.role?.trim() || "",
          avatarURL: user?.avatar_url?.trim() || ""
        });
        const canAutoApprove = shouldAutoApproveAuthorization(params.client_id, params.redirect_uri, settings.data);
        setAutoApproveEnabled(canAutoApprove);
        if (canAutoApprove) {
          void authorize();
          return;
        }
        const hasFirstPartySessionContext = Boolean(readFirstPartySessionContext());
        const shouldShowAccountPicker = hasFirstPartySessionContext && !promptLoginSatisfied;
        if (shouldShowAccountPicker) {
          setShowConsent(false);
          setShowAccountPicker(true);
          setCheckingPageState(false);
          return;
        }
        void trySilentAuthorize();
      })
      .catch((err) => {
        if (!active) {
          return;
        }
        const isUnauthorized =
          err instanceof Error &&
          "status" in err &&
          typeof (err as { status?: unknown }).status === "number" &&
          (err as { status: number }).status === 401;
        if (isUnauthorized) {
          clearLocalSession();
          navigateToLoginForNewAccount();
          return;
        }
        setError(err instanceof Error ? err.message : "failed to load authorization settings");
        setShowConsent(true);
        setCheckingPageState(false);
      });

    return () => {
      active = false;
    };
  }, [
    hasRequiredParams,
    navigate,
    params.client_id,
    params.prompt,
    params.redirect_uri,
    promptLoginSatisfied,
    promptValues,
    hasSession,
    i18n.language
  ]);

  async function authorize() {
    await authorizeWithPrompt(params.prompt);
  }

  async function requestAuthorization(prompt: string) {
    const result = await api<{ redirect_url?: string }>(
      "/auth/authorize",
      {
        method: "POST",
        body: JSON.stringify({
          client_id: params.client_id,
          redirect_uri: params.redirect_uri,
          response_type: params.response_type,
          scope: params.scope,
          state: params.state,
          nonce: params.nonce,
          code_challenge: params.code_challenge,
          code_challenge_method: params.code_challenge_method,
          prompt,
          max_age: params.max_age,
          acr_values: params.acr_values
        })
      }
    );
    if (!result.redirect_url) {
      throw new Error("authorize failed");
    }
    return result.redirect_url;
  }

  async function authorizeWithPrompt(prompt: string) {
    if (!hasSession) {
      return;
    }
    setCheckingPageState(false);
    setAuthorizing(true);
    setError("");
    try {
      const redirectURL = await requestAuthorization(prompt);
      clearAuthorizationSession();
      window.location.assign(redirectURL);
    } catch (err) {
      const message = err instanceof Error ? err.message : "authorize failed";
      if (message === "login_required" && !promptValues.has("none")) {
        navigateToLoginForNewAccount();
        return;
      }
      if (message.includes("session")) {
        clearAuthorizationSession();
        clearLocalSession();
        navigate(`/authorize${location.search}`, { replace: true });
        return;
      }
      setShowConsent(true);
      setError(message);
    } finally {
      setAuthorizing(false);
    }
  }

  async function trySilentAuthorize() {
    if (!hasSession) {
      return;
    }
    setAuthorizing(true);
    setError("");
    try {
      const redirectURL = await requestAuthorization(buildSilentAuthorizationPrompt());
      clearAuthorizationSession();
      window.location.assign(redirectURL);
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : "authorize failed";
      if (message === "login_required") {
        navigateToLoginForNewAccount();
        return;
      }
      if (message.includes("session")) {
        clearAuthorizationSession();
        clearLocalSession();
        navigate(`/authorize${location.search}`, { replace: true });
        return;
      }
      setShowConsent(true);
      setShowAccountPicker(false);
      setError(message === "consent_required" ? "" : message);
      setCheckingPageState(false);
    } finally {
      setAuthorizing(false);
    }
  }

  if (!hasSession && !promptValues.has("none")) {
    return <LoginPage />;
  }

  if (checkingPageState) {
    return null;
  }

  const currentUserAvatarURL = currentUser?.avatarURL ? resolveAssetURL(currentUser.avatarURL, backendOrigin) : "";

  return (
    <div className="center-page auth-entry-page--glass">
      <div className="auth-entry-page__backdrop" aria-hidden="true" />
      <div className="auth-page-toolbar">
        <Button type="link" className="auth-language-button" onClick={() => setLanguageModalOpen(true)}>
          {accountLocaleLabel[accountLocale]}
        </Button>
      </div>
      <Card className="auth-card auth-card--glass" styles={{ body: { padding: 32 } }}>
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 18,
                  margin: "0 auto"
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 18,
                    display: "grid",
                    placeItems: "center",
                    background: "linear-gradient(135deg, #1677ff, #58a6ff)",
                    border: "1px solid rgba(22, 119, 255, 0.12)",
                    color: "#fff",
                    overflow: "hidden"
                  }}
                >
                  {siteLogoUrl ? (
                    <img
                      src={siteLogoUrl}
                      alt={siteName}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span style={{ fontSize: 24, fontWeight: 700 }}>{siteName.slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <SwapOutlined style={{ fontSize: 30, color: "rgba(18, 38, 58, 0.42)" }} />
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 18,
                    display: "grid",
                    placeItems: "center",
                    background: "#fff",
                    border: "1px solid rgba(18, 38, 58, 0.08)",
                    color: "#12263a",
                    overflow: "hidden"
                  }}
                >
                  {uploadedAppIconUrl ? (
                    <img
                      src={uploadedAppIconUrl}
                      alt={appDisplayName}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : thirdPartyIconUrl && !thirdPartyIconFailed ? (
                    <img
                      src={thirdPartyIconUrl}
                      alt={appDisplayName}
                      style={{ width: 38, height: 38, objectFit: "contain" }}
                      onError={() => {
                        setThirdPartyIconFailed(true);
                      }}
                    />
                  ) : (
                    <GlobalOutlined style={{ fontSize: 28, color: "rgba(18, 38, 58, 0.6)" }} />
                  )}
                </div>
              </div>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {showAccountPicker
                  ? t("auth.authorize.chooseAccountTitle", { siteName, appName: appDisplayName })
                  : t("auth.authorize.title", { siteName, appName: appDisplayName })}
              </Typography.Title>
              <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                {showAccountPicker
                  ? t("auth.authorize.chooseAccountDesc")
                  : t("auth.authorize.desc")}
              </Typography.Paragraph>
            </Space>
          </div>

          {error ? <Alert type="error" message={translateAuthorizeError(error, t)} /> : null}

          {showAccountPicker ? (
            <div
              style={{
                borderRadius: 18,
                padding: 20,
                background: "linear-gradient(180deg, rgba(248,250,252,0.96), rgba(255,255,255,0.98))",
                border: "1px solid rgba(18, 38, 58, 0.08)"
              }}
            >
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: 16,
                    background: "#fff",
                    borderRadius: 16,
                    border: "1px solid rgba(18, 38, 58, 0.08)"
                  }}
                >
                  <Avatar
                    size={56}
                    src={currentUserAvatarURL || undefined}
                    icon={!currentUserAvatarURL ? <UserOutlined /> : undefined}
                    style={!currentUserAvatarURL ? { backgroundColor: "#1677ff" } : undefined}
                  >
                    {getUserInitial(currentUser || undefined)}
                  </Avatar>
                  <Space direction="vertical" size={2} style={{ flex: 1 }}>
                    <Typography.Text strong style={{ fontSize: 16 }}>
                      {currentUser?.displayName || currentUser?.email || t("auth.authorize.currentAccountFallback")}
                    </Typography.Text>
                    <Typography.Text type="secondary">{currentUser?.email || currentUser?.phone || "-"}</Typography.Text>
                  </Space>
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: 12
                  }}
                >
                  <Button type="primary" size="large" onClick={() => {
                    setShowAccountPicker(false);
                    if (autoApproveEnabled) {
                      void authorize();
                      return;
                    }
                    setShowConsent(true);
                    setError("");
                  }}>
                    {t("auth.authorize.useCurrentAccount")}
                  </Button>
                  <Button size="large" onClick={navigateToLoginForNewAccount}>
                    {t("auth.authorize.useAnotherAccount")}
                  </Button>
                </div>
              </Space>
            </div>
          ) : null}

          {showConsent ? (
            <>
              <div
                style={{
                  borderRadius: 18,
                  padding: 18,
                  background: "linear-gradient(180deg, rgba(248,250,252,0.96), rgba(255,255,255,0.96))",
                  border: "1px solid rgba(18, 38, 58, 0.08)"
                }}
              >
                <Space direction="vertical" size={14} style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <Typography.Text strong>{t("auth.authorize.permissionTitle")}</Typography.Text>
                    <Tag color="blue">{t("auth.authorize.permissionCount", { count: requestedPermissions.length })}</Tag>
                  </div>
                  {requestedPermissions.map((item) => (
                    <div
                      key={item.key}
                      style={{
                        padding: "14px 16px",
                        borderRadius: 14,
                        background: "#fff",
                        border: "1px solid rgba(18, 38, 58, 0.06)"
                      }}
                    >
                      <Space direction="vertical" size={4} style={{ width: "100%" }}>
                        <Typography.Text strong>{item.title}</Typography.Text>
                        <Typography.Text type="secondary">{item.description}</Typography.Text>
                      </Space>
                    </div>
                  ))}
                </Space>
              </div>

              <Checkbox checked disabled>
                {t("auth.authorize.agreement")}
              </Checkbox>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <Space>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => void authorize()}
                    loading={authorizing}
                    disabled={!hasRequiredParams}
                  >
                    {t("auth.authorize.confirm")}
                  </Button>
                  <Button
                    size="large"
                    onClick={() => {
                      clearAuthorizationSession();
                      navigate(
                        {
                          pathname: "/login",
                          search: withUpdatedSearch(location.search, {
                            prompt_login_satisfied: null,
                            auth_flow: null,
                            tab: "password"
                          })
                        },
                        { replace: true }
                      );
                    }}
                  >
                    {t("auth.authorize.cancel")}
                  </Button>
                </Space>
              </div>
            </>
          ) : null}
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
