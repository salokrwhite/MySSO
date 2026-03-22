import { api, getPreferredApiBase } from "../../../api/client";
import type { Consent, CurrentUser, PasskeyItem } from "../types";
import { fetchPublicSettings, type PublicSettings } from "../../../publicSettings";

export type PublicUserSettings = Pick<
  PublicSettings,
  | "user_center_announcement_enabled"
  | "user_center_announcement_content"
  | "enable_phone_verification"
>;

export type PublicSiteBranding = Pick<
  PublicSettings,
  | "site_name"
  | "site_name_en"
  | "site_footer_text"
  | "site_icp_record_number"
  | "site_public_security_record_number"
>;

export type UserAccountOverview = {
  user: CurrentUser;
};

type SessionScopedCache<T> = {
  value: T | null;
  inflight: Promise<T> | null;
  sessionToken?: string;
};

type PasskeyRegistrationOptionsResult = {
  challenge_token: string;
  options: any;
};

type PasskeyRegistrationVerifyResult = {
  item: PasskeyItem;
};

const overviewCache: SessionScopedCache<UserAccountOverview> = {
  value: null,
  inflight: null,
};
const consentsCache: SessionScopedCache<Consent[]> = {
  value: null,
  inflight: null,
};
const passkeysCache: SessionScopedCache<PasskeyItem[]> = {
  value: null,
  inflight: null,
};

function sameSessionToken(
  cacheSessionToken?: string,
  sessionToken?: string,
) {
  return (cacheSessionToken || "") === (sessionToken || "");
}

function resetSessionScopedCache<T>(cache: SessionScopedCache<T>) {
  cache.value = null;
  cache.inflight = null;
  cache.sessionToken = undefined;
}

function readSessionScopedCache<T>(
  cache: SessionScopedCache<T>,
  sessionToken?: string,
) {
  if (!sameSessionToken(cache.sessionToken, sessionToken)) {
    resetSessionScopedCache(cache);
    cache.sessionToken = sessionToken;
  }
  return cache;
}

async function fetchRaw(path: string, init?: RequestInit) {
  const response = await fetch(`${getPreferredApiBase()}${path}`, {
    ...init,
    credentials: init?.credentials ?? "include",
  });
  if (!response.ok) {
    const payload = (await response
      .json()
      .catch(() => ({ error: response.statusText }))) as {
      error?: string;
    };
    throw new Error(payload.error || "request failed");
  }
  return response;
}

export async function fetchPublicUserSettings() {
  const settings = await fetchPublicSettings();
  return {
    data: {
      user_center_announcement_enabled:
        settings.user_center_announcement_enabled,
      user_center_announcement_content:
        settings.user_center_announcement_content,
      enable_phone_verification: settings.enable_phone_verification,
    } satisfies PublicUserSettings,
  };
}

export async function fetchPublicSiteBranding() {
  const settings = await fetchPublicSettings();
  return {
    data: {
      site_name: settings.site_name,
      site_name_en: settings.site_name_en,
      site_footer_text: settings.site_footer_text,
      site_icp_record_number: settings.site_icp_record_number,
      site_public_security_record_number:
        settings.site_public_security_record_number,
    } satisfies PublicSiteBranding,
  };
}

export async function fetchUserAccountOverview(sessionToken?: string) {
  const cache = readSessionScopedCache(overviewCache, sessionToken);
  if (cache.value) {
    return cache.value;
  }
  if (cache.inflight) {
    return cache.inflight;
  }
  cache.inflight = api<UserAccountOverview>("/me", undefined, sessionToken)
    .then((result) => {
      cache.value = result;
      return result;
    })
    .finally(() => {
      cache.inflight = null;
    });
  return cache.inflight;
}

export async function fetchUserConsents(sessionToken?: string) {
  const cache = readSessionScopedCache(consentsCache, sessionToken);
  if (cache.value) {
    return cache.value;
  }
  if (cache.inflight) {
    return cache.inflight;
  }
  cache.inflight = api<{ items: Consent[] }>("/consents", undefined, sessionToken)
    .then((result) => {
      cache.value = result.items;
      return result.items;
    })
    .finally(() => {
      cache.inflight = null;
    });
  return cache.inflight;
}

export async function fetchUserPasskeys(sessionToken?: string) {
  const cache = readSessionScopedCache(passkeysCache, sessionToken);
  if (cache.value) {
    return cache.value;
  }
  if (cache.inflight) {
    return cache.inflight;
  }
  cache.inflight = api<{ items: PasskeyItem[] }>("/me/passkeys", undefined, sessionToken)
    .then((result) => {
      cache.value = result.items;
      return result.items;
    })
    .finally(() => {
      cache.inflight = null;
    });
  return cache.inflight;
}

export function updateUserOverviewCache(user: CurrentUser, sessionToken?: string) {
  const cache = readSessionScopedCache(overviewCache, sessionToken);
  cache.value = { user };
}

export function updateUserConsentsCache(items: Consent[], sessionToken?: string) {
  const cache = readSessionScopedCache(consentsCache, sessionToken);
  cache.value = items;
}

export function updateUserPasskeysCache(
  items: PasskeyItem[],
  sessionToken?: string,
) {
  const cache = readSessionScopedCache(passkeysCache, sessionToken);
  cache.value = items;
}

export function clearUserAccountCaches(sessionToken?: string) {
  readSessionScopedCache(overviewCache, sessionToken).value = null;
  readSessionScopedCache(consentsCache, sessionToken).value = null;
  readSessionScopedCache(passkeysCache, sessionToken).value = null;
}

export async function updateUserProfile(
  sessionToken: string | undefined,
  payload: Record<string, unknown>,
) {
  return api<{ user: CurrentUser }>(
    "/me/profile",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    sessionToken,
  );
}

export async function sendEmailCode(payload: Record<string, unknown>) {
  return api<{ cooldown_seconds?: number }>(
    "/auth/email-code",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function sendPhoneCode(
  sessionToken: string | undefined,
  payload: Record<string, unknown>,
) {
  return api<{ cooldown_seconds?: number }>(
    "/me/phone-code",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    sessionToken,
  );
}

export async function updateUserEmail(
  sessionToken: string | undefined,
  payload: Record<string, unknown>,
) {
  return api<{ user: CurrentUser }>(
    "/me/profile",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    sessionToken,
  );
}

export async function updateUserPhone(
  sessionToken: string | undefined,
  payload: Record<string, unknown>,
) {
  return api<{ user: CurrentUser }>(
    "/me/profile",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    sessionToken,
  );
}

export async function updateUserPassword(
  sessionToken: string | undefined,
  payload: Record<string, unknown>,
) {
  return api<{ updated: boolean }>(
    "/me/password",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    sessionToken,
  );
}

export async function updateUserMFA(
  sessionToken: string | undefined,
  payload: Record<string, unknown>,
) {
  return api<{ user: CurrentUser }>(
    "/me/mfa",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    sessionToken,
  );
}

export async function sendCurrentMFACodeRequest(
  sessionToken: string | undefined,
  payload: Record<string, unknown>,
) {
  return api<{ cooldown_seconds?: number; method?: string }>(
    "/me/mfa/code",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    sessionToken,
  );
}

export async function preparePasskeyRegistration(
  sessionToken: string | undefined,
  payload: Record<string, unknown>,
) {
  return api<PasskeyRegistrationOptionsResult>(
    "/me/passkeys/register/options",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    sessionToken,
  );
}

export async function verifyPasskeyRegistration(
  sessionToken: string | undefined,
  payload: Record<string, unknown>,
) {
  return api<PasskeyRegistrationVerifyResult>(
    "/me/passkeys/register/verify",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    sessionToken,
  );
}

export async function deletePasskeyRequest(
  sessionToken: string | undefined,
  id: string,
  payload: Record<string, unknown>,
) {
  return api<{ deleted: boolean }>(
    `/me/passkeys/${id}`,
    {
      method: "DELETE",
      body: JSON.stringify(payload),
    },
    sessionToken,
  );
}

export async function uploadUserAvatarRequest(file: Blob) {
  const formData = new FormData();
  formData.append("file", file, "avatar.webp");
  const response = await fetchRaw("/me/avatar", {
    method: "POST",
    body: formData,
  });
  const payload = (await response.json()) as { data?: { url?: string } };
  return String(payload.data?.url || "");
}

export async function revokeConsentRequest(
  sessionToken: string | undefined,
  id: string,
) {
  return api<void>(`/consents/${id}/revoke`, { method: "POST" }, sessionToken);
}

export async function revokeBatchConsentsRequest(
  sessionToken: string | undefined,
  consentIds: string[],
) {
  return api<{ revoked: boolean }>(
    "/consents/batch-revoke",
    {
      method: "POST",
      body: JSON.stringify({ consent_ids: consentIds }),
    },
    sessionToken,
  );
}

export async function deleteAccountRequest(
  sessionToken: string | undefined,
  payload: Record<string, unknown>,
) {
  return api<{
    scheduled: boolean;
    deletion_requested_at?: string;
    deletion_scheduled_at?: string;
    grace_period_days?: number;
  }>(
    "/me/delete-account",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    sessionToken,
  );
}

export async function exportUserDataRequest(payload: Record<string, unknown>) {
  return fetchRaw("/me/export-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
