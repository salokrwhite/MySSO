import { api, getPreferredApiBase } from "../../../api/client";
import type { Consent, CurrentUser, PasskeyItem } from "../types";

export type PublicUserSettings = {
  user_center_announcement_enabled?: boolean;
  user_center_announcement_content?: string;
  enable_phone_verification?: boolean;
};

export type PublicSiteBranding = {
  site_name?: string;
  site_name_en?: string;
  site_footer_text?: string;
  site_icp_record_number?: string;
  site_public_security_record_number?: string;
};

type PasskeyRegistrationOptionsResult = {
  challenge_token: string;
  options: any;
};

type PasskeyRegistrationVerifyResult = {
  item: PasskeyItem;
};

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
  return api<{ data?: PublicUserSettings }>("/public/settings");
}

export async function fetchPublicSiteBranding() {
  return api<{ data: PublicSiteBranding }>("/public/settings");
}

export async function fetchUserAccountData(sessionToken?: string) {
  const [userResult, consentResult, passkeyResult] = await Promise.all([
    api<{ user: CurrentUser }>("/me", undefined, sessionToken),
    api<{ items: Consent[] }>("/consents", undefined, sessionToken),
    api<{ items: PasskeyItem[] }>("/me/passkeys", undefined, sessionToken),
  ]);

  return {
    user: userResult.user,
    consents: consentResult.items,
    passkeys: passkeyResult.items,
  };
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
