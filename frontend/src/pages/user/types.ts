export type CurrentUser = {
  id: string;
  country?: string;
  gender?: string;
  preferred_locale?: string;
  email: string;
  phone?: string;
  display_name?: string;
  role: string;
  status: string;
  mfa_enabled?: boolean;
  mfa_method?: string;
  last_login_at?: string;
  last_device_ip?: string;
  created_at: string;
  avatar_url?: string;
  deletion_requested_at?: string;
  deletion_scheduled_at?: string;
  personal_announcement_enabled?: boolean;
  personal_announcement_content?: string;
};

export type PasskeyItem = {
  id: string;
  name: string;
  credential_id: string;
  last_used_at?: string;
  last_used_ip?: string;
  created_at: string;
};

export type Consent = {
  id: string;
  client_id: string;
  app_name: string;
  icon_url?: string;
  scopes: string[];
  created_at: string;
};

export type UserSectionKey = "security" | "profile" | "privacy" | "bindings" | "help";
