import type { TFunction } from "i18next";
import type { DeveloperAnalyticsData, UserInsight } from "../types";

export function buildUserInsights(
  t: TFunction<"developer">,
  summary?: DeveloperAnalyticsData["summary"],
): UserInsight[] {
  return [
    {
      label: t("analytics.successRate"),
      value: Number(summary?.authorization_success_rate || 0),
      color: "#1677ff",
      description: t("analytics.successRateDesc"),
    },
    {
      label: t("analytics.activeApps"),
      value: Number(summary?.active_integration_rate || 0),
      color: "#52c41a",
      description: t("analytics.activeAppsDesc"),
    },
    {
      label: t("analytics.needsAttention"),
      value: Number(summary?.needs_attention_rate || 0),
      color: "#faad14",
      description: t("analytics.needsAttentionDesc"),
    },
  ];
}
