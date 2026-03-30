export type AppItem = {
  id: string;
  name: string;
  client_id: string;
  has_client_secret?: boolean;
  icon_url?: string;
  description?: string;
  redirect_uris?: string[];
  post_logout_redirect_uris?: string[];
  frontchannel_logout_uri?: string;
  scopes: string[];
  status: string;
  review_comment?: string;
};

export type ResetSecretResult = AppItem & {
  client_secret?: string;
};

export type ScopeDefinition = {
  key: string;
  display_name: string;
  description: string;
  enabled: boolean;
  developer_selectable: boolean;
};

export type DeveloperPageType =
  | "dashboard"
  | "console"
  | "userAccess"
  | "auditLogs"
  | "analytics"
  | "docsManual"
  | "docsExamples"
  | "docsExamplesGo"
  | "docsExamplesCsharp"
  | "docsExamplesPHP"
  | "docsExamplesJava"
  | "docsExamplesNodejs"
  | "docsExamplesPython"
  | "docsExamplesRuby"
  | "docsExamplesRust";

export type DeveloperAuditLog = {
  id: string;
  action: string;
  actor_role: string;
  target_id: string;
  detail?: Record<string, unknown>;
  created_at: string;
};

export type UserInsight = {
  label: string;
  value: number;
  color: string;
  description: string;
};

export type DeveloperAnalyticsData = {
  summary: {
    authorization_success_rate: number;
    active_integration_rate: number;
    needs_attention_rate: number;
  };
  apps: Array<{
    id: string;
    name: string;
    status: string;
    authorization_count: number;
    token_exchange_count: number;
    active_user_count: number;
    success_rate: number;
  }>;
};

export type DeveloperAuditEventRecord = {
  id: string;
  title: string;
  statusText: string;
  statusColor: string;
  summary: string;
  targetName: string;
  createdAt: string;
  category: string;
  categoryColor: string;
  detailText: string;
  rawAction: string;
  sanitizedDetail: Record<string, unknown>;
};

export type DeveloperGroup = {
  id: string;
  owner_user_id: string;
  name: string;
  description: string;
  member_count: number;
  bound_app_ids: string[];
  bound_app_count: number;
  created_at: string;
  updated_at: string;
};

export type ManagedAuthorizedApp = {
  app_id: string;
  client_id: string;
  app_name: string;
  last_authorized_at: string;
};

export type AppUserBan = {
  id: string;
  app_id: string;
  user_id: string;
  reason: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
};

export type DeveloperManagedUser = {
  user_id: string;
  display_name: string;
  masked_email: string;
  masked_phone: string;
  last_authorized_at: string;
  authorized_apps: ManagedAuthorizedApp[];
  group_ids: string[];
  group_names: string[];
  app_bans: AppUserBan[];
};

export type DeveloperManagedUserListResponse = {
  items: DeveloperManagedUser[];
  total: number;
  page: number;
  page_size: number;
};

export type DeveloperAccessApp = {
  app_id: string;
  client_id: string;
  name: string;
  status: string;
  bound_group_ids: string[];
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
