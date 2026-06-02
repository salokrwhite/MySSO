import type { ReactNode } from "react";

export type User = {
  id: string;
  country?: string;
  gender?: string;
  preferred_locale?: string;
  email: string;
  phone?: string;
  last_device_ip?: string;
  display_name?: string;
  freeze_reason?: string;
  role: string;
  status: string;
  mfa_enabled: boolean;
  passkey_count?: number;
  passkey_enabled?: boolean;
  authorized_app_count?: number;
  authorized_apps?: AuthorizedApp[];
  created_at?: string;
  deletion_requested_at?: string;
  deletion_scheduled_at?: string;
  personal_announcement_enabled?: boolean;
  personal_announcement_content?: string;
  security_policy?: UserSecurityPolicy;
};

export type UserListResponse = {
  items: User[];
  total: number;
  page: number;
  page_size: number;
};

export type AdminDashboardSummary = {
  total_users: number;
  active_users: number;
  pending_apps: number;
  approved_apps: number;
  audit_logs: number;
  policies: number;
};

export type UserSecurityPolicy = {
  force_phone_binding_next_login: boolean;
  force_mfa_enrollment_next_login: boolean;
  login_step_up_mode: "none" | "email" | "sms" | "email_and_sms";
  has_email: boolean;
  has_phone: boolean;
  available_mfa_methods: Array<"email" | "sms">;
};

export type UpdateUserSecurityPolicyInput = {
  force_phone_binding_next_login: boolean;
  force_mfa_enrollment_next_login: boolean;
  login_step_up_mode: "none" | "email" | "sms" | "email_and_sms";
};

export type AuthorizedApp = {
  id: string;
  client_id: string;
  app_name: string;
  icon_url?: string;
  scopes?: string[];
  created_at?: string;
  revoked_at?: string;
};

export type UserOperationLog = {
  id: string;
  user_id: string;
  action: string;
  target_id: string;
  detail?: Record<string, unknown>;
  created_at: string;
};

export type UserOperationLogListResponse = {
  items: UserOperationLog[];
  total: number;
  page: number;
  page_size: number;
};

export type CreateUserInput = {
  email: string;
  display_name: string;
  password: string;
  role: string;
  status: string;
  country: string;
  freeze_reason?: string;
};

export type UpdateUserInput = {
  email: string;
  display_name: string;
  phone: string;
  password?: string;
  role: string;
  status: string;
  country: string;
  gender?: string;
  freeze_reason?: string;
};

export type AppItem = {
  id: string;
  name: string;
  icon_url?: string;
  description?: string;
  client_id: string;
  client_secret?: string;
  owner_user_id?: string;
  admin_owned?: boolean;
  admin_created?: boolean;
  has_client_secret?: boolean;
  redirect_uris?: string[];
  post_logout_redirect_uris?: string[];
  frontchannel_logout_uri?: string;
  allow_get_session_logout?: boolean;
  scopes?: string[];
  status: string;
  review_comment?: string;
};

export type AppListResponse = {
  items: AppItem[];
  total: number;
  page: number;
  page_size: number;
};

export type AuditLog = {
  id: string;
  actor_id: string;
  action: string;
  actor_role: string;
  target_id: string;
  detail?: Record<string, unknown>;
  created_at: string;
};

export type AuditLogListResponse = {
  items: AuditLog[];
  total: number;
  page: number;
  page_size: number;
};

export type DeveloperAccessLog = {
  id: string;
  owner_user_id: string;
  actor_id: string;
  action: string;
  target_type: string;
  target_id: string;
  app_id: string;
  user_id: string;
  group_id: string;
  detail?: Record<string, unknown>;
  created_at: string;
  deleted_at?: string;
};

export type DeveloperAccessLogListResponse = {
  items: DeveloperAccessLog[];
  total: number;
  page: number;
  page_size: number;
};

export type EmailSendLog = {
  id: string;
  target_email: string;
  content: string;
  account_email: string;
  created_at: string;
};

export type PhoneSendLog = {
  id: string;
  target_phone: string;
  content: string;
  account_email: string;
  created_at: string;
};

export type AdminPasskeyLog = {
  id: string;
  user_id: string;
  user_email: string;
  name: string;
  credential_id: string;
  credential_json: string;
  sign_count: number;
  aaguid: string;
  transports: string[];
  last_used_at?: string;
  created_at: string;
  updated_at: string;
};

export type AdminPasskeyRegistrationChallenge = {
  token: string;
  user_id: string;
  user_email: string;
  session_data_json: string;
  expires_at: string;
  created_at: string;
};

export type AdminPasskeyLoginChallenge = {
  token: string;
  session_data_json: string;
  expires_at: string;
  created_at: string;
};

export type AdminPasskeyUsageLog = {
  id: string;
  user_id: string;
  user_email: string;
  passkey_id: string;
  credential_id: string;
  event_type: string;
  source_ip: string;
  user_agent: string;
  result: string;
  failure_reason: string;
  created_at: string;
};

export type AdminPasskeyLogs = {
  passkeys: AdminPasskeyLog[];
  registration_challenges: AdminPasskeyRegistrationChallenge[];
  login_challenges: AdminPasskeyLoginChallenge[];
  usage_logs: AdminPasskeyUsageLog[];
};

export type Policy = {
  id: string;
  name: string;
  method: string;
  path: string;
  scopes: string[];
};

export type ScopeDefinition = {
  key: string;
  display_name: string;
  description: string;
  enabled: boolean;
  developer_selectable: boolean;
  system: boolean;
  updated_at?: string;
};

export type SystemSettings = {
  allow_user_registration: boolean;
  enable_phone_verification: boolean;
  site_name: string;
  site_name_en: string;
  site_browser_title: string;
  site_browser_title_en: string;
  site_logo_data_url: string;
  site_footer_text: string;
  site_icp_record_number: string;
  site_public_security_record_number: string;
  home_page_announcement_enabled: boolean;
  home_page_announcement_content: string;
  user_center_announcement_enabled: boolean;
  user_center_announcement_content: string;
  developer_announcement_enabled: boolean;
  developer_announcement_content: string;
  public_base_url: string;
  frontend_base_url: string;
  oidc_first_party_client_id: string;
  oidc_first_party_client_secret: string;
  oidc_first_party_client_secret_configured: boolean;
  oidc_first_party_scope: string;
  oidc_auto_approve_client_ids: string;
  oidc_auto_approve_redirect_hosts: string;
  smtp_host: string;
  smtp_port: string;
  smtp_username: string;
  smtp_password: string;
  smtp_password_configured: boolean;
  smtp_from: string;
  smtp_force_ssl: boolean;
  smtp_verification_code_ttl_minutes: number;
  smtp_verification_code_cooldown_seconds: number;
  login_code_subject_template: string;
  login_code_body_template: string;
  login_code_subject_template_en: string;
  login_code_body_template_en: string;
  register_code_subject_template: string;
  register_code_body_template: string;
  register_code_subject_template_en: string;
  register_code_body_template_en: string;
  reset_password_code_subject_template: string;
  reset_password_code_body_template: string;
  reset_password_code_subject_template_en: string;
  reset_password_code_body_template_en: string;
  delete_account_code_subject_template: string;
  delete_account_code_body_template: string;
  delete_account_code_subject_template_en: string;
  delete_account_code_body_template_en: string;
  change_email_code_subject_template: string;
  change_email_code_body_template: string;
  change_email_code_subject_template_en: string;
  change_email_code_body_template_en: string;
  sms_provider: string;
  sms_template_provider: string;
  sms_api_base: string;
  sms_username: string;
  sms_password: string;
  sms_password_configured: boolean;
  sms_signature: string;
  sms_login_template: string;
  sms_register_template: string;
  sms_reset_password_template: string;
  sms_bind_phone_template: string;
  sms_delete_account_template: string;
  aliyun_sms_access_key_id: string;
  aliyun_sms_access_key_secret: string;
  aliyun_sms_access_key_secret_configured: boolean;
  aliyun_sms_endpoint: string;
  aliyun_sms_region_id: string;
  aliyun_sms_sign_name: string;
  aliyun_sms_login_template_code: string;
  aliyun_sms_register_template_code: string;
  aliyun_sms_reset_template_code: string;
  aliyun_sms_bind_phone_template_code: string;
  aliyun_sms_delete_template_code: string;
  risk_control_enabled: boolean;
  risk_immediate_bind_probability: number;
  risk_delayed_bind_probability: number;
  risk_delayed_bind_login_count: number;
  developer_managed_users_search_window_seconds: number;
  developer_managed_users_search_limit: number;
};

export type SettingsTabKey =
  | "site"
  | "session"
  | "verification"
  | "intl"
  | "sms"
  | "media"
  | "addons"
  | "rateLimit"
  | "email"
  | "scope";

export type AdminPageType =
  | "dashboard"
  | "users"
  | "apps"
  | "emailSendLogs"
  | "phoneSendLogs"
  | "auditLogs"
  | "developerAccessLogs"
  | "riskLogs"
  | "settings";

export type SettingsTab = {
  key: SettingsTabKey;
  label: string;
  icon?: ReactNode;
};

export type AdminPageMeta = {
  title: string;
  description: string;
};

export type AdminDataResponse = {
  users: User[];
  apps: AppItem[];
  logs: AuditLog[];
  passkeyLogs: AdminPasskeyLogs;
  emailSendLogs: EmailSendLog[];
  phoneSendLogs: PhoneSendLog[];
  policies: Policy[];
  scopes: ScopeDefinition[];
  settings: SystemSettings;
};
