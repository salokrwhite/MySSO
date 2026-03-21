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
  | "auditLogs"
  | "analytics"
  | "docsManual"
  | "docsExamples"
  | "docsExamplesGo"
  | "docsExamplesPHP"
  | "docsExamplesJava"
  | "docsExamplesNodejs"
  | "docsExamplesPython";

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
