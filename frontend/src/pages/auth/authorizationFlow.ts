import { api } from "../../api/client";

type PublicSettings = {
  data?: {
    frontend_base_url?: string;
    oidc_first_party_client_id?: string;
    oidc_auto_approve_client_ids?: string[];
    oidc_auto_approve_redirect_hosts?: string[];
  };
};

export type AuthorizationParams = {
  client_id: string;
  redirect_uri: string;
  response_type: string;
  scope: string;
  state: string;
  nonce: string;
  code_challenge: string;
  code_challenge_method: string;
  prompt: string;
  max_age: string;
  acr_values: string;
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

export function readAuthorizationParams(searchParams: URLSearchParams): AuthorizationParams {
  return {
    client_id: searchParams.get("client_id") || "",
    redirect_uri: searchParams.get("redirect_uri") || "",
    response_type: searchParams.get("response_type") || "code",
    scope: searchParams.get("scope") || "openid",
    state: searchParams.get("state") || "",
    nonce: searchParams.get("nonce") || "",
    code_challenge: searchParams.get("code_challenge") || "",
    code_challenge_method: searchParams.get("code_challenge_method") || "",
    prompt: searchParams.get("prompt") || "",
    max_age: searchParams.get("max_age") || "",
    acr_values: searchParams.get("acr_values") || ""
  };
}

export async function shouldAutoApproveAuthorization(params: AuthorizationParams) {
  const settings = await api<PublicSettings>("/public/settings");
  const approvedClientIDs = new Set(
    [
      settings.data?.oidc_first_party_client_id || "",
      ...(settings.data?.oidc_auto_approve_client_ids || [])
    ]
      .map((item) => item.trim())
      .filter(Boolean)
  );
  if (approvedClientIDs.has(params.client_id.trim())) {
    const approvedHosts = [
      getAuthority(settings.data?.frontend_base_url || ""),
      ...(settings.data?.oidc_auto_approve_redirect_hosts || []).map(normalizeHost)
    ].filter(Boolean);
    return matchesApprovedRedirect(params.redirect_uri, approvedHosts);
  }
  return false;
}

export async function authorizeAndRedirect(params: AuthorizationParams) {
  const result = await api<{ redirect_url?: string }>("/auth/authorize", {
    method: "POST",
    body: JSON.stringify(params)
  });
  if (!result.redirect_url) {
    throw new Error("authorize failed");
  }
  window.location.assign(result.redirect_url);
}
