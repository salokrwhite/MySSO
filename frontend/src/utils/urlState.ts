export const AUTHORIZED_QUERY_KEYS = [
  "locale",
  "redirect",
  "from",
  "tab",
  "client_id",
  "redirect_uri",
  "scope",
  "state",
  "nonce",
  "code_challenge",
  "code_challenge_method",
  "response_type",
  "prompt",
  "prompt_login_satisfied",
  "auth_flow",
  "max_age",
  "acr_values"
] as const;

type AuthorizedQueryKey = (typeof AUTHORIZED_QUERY_KEYS)[number];

export function pickAllowedSearchParams(search: string) {
  const current = new URLSearchParams(search);
  const next = new URLSearchParams();
  for (const key of AUTHORIZED_QUERY_KEYS) {
    const value = current.get(key);
    if (value) {
      next.set(key, value);
    }
  }
  return next;
}

export function buildSearchString(search: string) {
  const params = pickAllowedSearchParams(search);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function getSafeRedirect(search: string) {
  const redirect = pickAllowedSearchParams(search).get("redirect")?.trim() || "";
  if (!redirect.startsWith("/") || redirect.startsWith("//")) {
    return "";
  }
  return redirect;
}

export function withUpdatedSearch(search: string, updates: Partial<Record<AuthorizedQueryKey, string | null>>) {
  const params = pickAllowedSearchParams(search);
  for (const [key, value] of Object.entries(updates) as [AuthorizedQueryKey, string | null][]) {
    if (!value) {
      params.delete(key);
      continue;
    }
    params.set(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}
