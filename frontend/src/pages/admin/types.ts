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

export type RiskSignal = {
  category: string;
  name: string;
  weight: number;
  detail?: string;
};

export type RiskEvent = {
  id: string;
  user_id: string;
  email?: string;
  display_name?: string;
  event_type: string;
  identifier_hash?: string;
  failure_reason?: string;
  risk_score: number;
  risk_level: string;
  action_taken: string;
  ip_address: string;
  ip_country?: string;
  ip_region?: string;
  ip_city?: string;
  device_fingerprint?: string;
  device_key_id?: string;
  client_type: string;
  user_agent?: string;
  signals?: RiskSignal[];
  created_at: string;
};

export type RiskEventListResponse = {
  items: RiskEvent[];
  total: number;
  page: number;
  page_size: number;
};

export type RiskAccountSummary = {
  user_id: string;
  email?: string;
  display_name?: string;
  role?: string;
  status?: string;
  phone?: string;
  mfa_enabled: boolean;
  last_login_at?: string;
  last_device_ip?: string;
  created_at?: string;
  comprehensive_score: number;
  risk_level: string;
  event_count: number;
  login_success_count: number;
  login_failure_count: number;
  blocked_count: number;
  step_up_count: number;
  captcha_count: number;
  device_count: number;
  last_event_type?: string;
  last_action_taken?: string;
  last_ip_address?: string;
  last_ip_country?: string;
  last_ip_region?: string;
  last_ip_city?: string;
  last_client_type?: string;
  last_event_at?: string;
  trusted_until?: string;
  mitigated_until?: string;
  false_positive_until?: string;
  false_positive_note?: string;
};

export type RiskAccountSummaryListResponse = {
  items: RiskAccountSummary[];
  total: number;
  page: number;
  page_size: number;
};

export type AdminRiskStats = {
  levels_24h?: Record<string, number>;
  ip_blacklist_count?: number;
  config?: Record<string, unknown>;
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
  enable_qr_login: boolean;
  app_current_version_code: number;
  app_current_version_name: string;
  app_download_url: string;
  app_force_update: boolean;
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
  email_verification_code_daily_limit: number;
  sms_verification_code_daily_limit: number;
  captcha_enabled: boolean;
  captcha_mode: number;
  captcha_ComplexOfNoiseText: number;
  captcha_ComplexOfNoiseDot: number;
  captcha_IsShowHollowLine: boolean;
  captcha_IsShowNoiseDot: boolean;
  captcha_IsShowNoiseText: boolean;
  captcha_IsShowSlimeLine: boolean;
  captcha_IsShowSineLine: boolean;
  captcha_CaptchaLen: number;
  captcha_ttl_seconds: number;
  captcha_image_rate_limit_per_minute: number;
  captcha_precheck_rate_limit_per_minute: number;
  captcha_target_rate_limit_per_minute: number;
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
  risk_phone_binding_enabled: boolean;
  risk_immediate_bind_probability: number;
  risk_delayed_bind_probability: number;
  risk_delayed_bind_login_count: number;
  risk_medium_threshold: number;
  risk_high_threshold: number;
  risk_critical_threshold: number;
  risk_auto_block_threshold: number;
  risk_max_failed_logins: number;
  risk_lockout_minutes: number;
  risk_score_window_days: number;
  risk_failed_login_score_weight: number;
  risk_failed_login_score_cap: number;
  risk_enable_geo_check: boolean;
  risk_enable_device_check: boolean;
  risk_enable_behavior_check: boolean;
  risk_enable_ip_blacklist: boolean;
  risk_enable_mitigation: boolean;
  risk_allow_block_step_up: boolean;
  risk_trusted_device_days: number;
  risk_mitigation_hours: number;
  risk_trusted_device_score_discount: number;
  risk_mitigation_score_discount: number;
  risk_high_risk_geo_discount: number;
  risk_new_device_discount: number;
  risk_ip_change_discount: number;
  risk_trusted_ips: string;
  risk_high_risk_countries: string;
  developer_managed_users_search_window_seconds: number;
  developer_managed_users_search_limit: number;
};

export type SettingsTabKey =
  | "site"
  | "session"
  | "appVersion"
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
  | "profile"
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
