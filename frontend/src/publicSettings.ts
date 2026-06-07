import { api } from "./api/client";

export type PublicSettings = {
  site_name?: string;
  site_name_en?: string;
  site_browser_title?: string;
  site_browser_title_en?: string;
  site_logo_data_url?: string;
  site_footer_text?: string;
  site_icp_record_number?: string;
  site_public_security_record_number?: string;
  user_center_announcement_enabled?: boolean;
  user_center_announcement_content?: string;
  developer_announcement_enabled?: boolean;
  developer_announcement_content?: string;
  enable_phone_verification?: boolean;
  enable_qr_login?: boolean;
  app_current_version_code?: number;
  app_current_version_name?: string;
  app_download_url?: string;
  app_force_update?: boolean;
  captcha_enabled?: boolean;
  oidc_first_party_client_id?: string;
};

let cachedPublicSettings: PublicSettings | null = null;
let inflightPublicSettingsRequest: Promise<PublicSettings> | null = null;

export async function fetchPublicSettings(options?: { force?: boolean }) {
  if (!options?.force) {
    if (cachedPublicSettings) {
      return cachedPublicSettings;
    }
    if (inflightPublicSettingsRequest) {
      return inflightPublicSettingsRequest;
    }
  }

  inflightPublicSettingsRequest = api<{ data?: PublicSettings }>(
    "/public/settings",
  )
    .then((result) => {
      cachedPublicSettings = result.data || {};
      return cachedPublicSettings;
    })
    .finally(() => {
      inflightPublicSettingsRequest = null;
    });

  return inflightPublicSettingsRequest;
}

export function mergePublicSettingsCache(
  nextSettings?: Partial<PublicSettings> | null,
) {
  if (!nextSettings) {
    return;
  }
  cachedPublicSettings = {
    ...(cachedPublicSettings || {}),
    ...nextSettings,
  };
}

export function clearPublicSettingsCache() {
  cachedPublicSettings = null;
  inflightPublicSettingsRequest = null;
}
