import type { TFunction } from "i18next";
import type {
  DeveloperAuditEventRecord,
  DeveloperAuditLog,
} from "../types";

function maskSensitiveAuditValue(
  key: string,
  value: unknown,
  t: TFunction<"developer">,
): unknown {
  const normalizedKey = key.toLowerCase();
  if (
    normalizedKey.includes("token") ||
    normalizedKey.includes("secret") ||
    normalizedKey.includes("password") ||
    normalizedKey.includes("code")
  ) {
    return t("audit.summaries.hidden");
  }
  if (Array.isArray(value)) {
    return value.map((item) =>
      typeof item === "object" && item !== null
        ? sanitizeAuditDetail(item as Record<string, unknown>, t)
        : item,
    );
  }
  if (value && typeof value === "object") {
    return sanitizeAuditDetail(value as Record<string, unknown>, t);
  }
  return value;
}

export function sanitizeAuditDetail(
  detail: Record<string, unknown> | undefined,
  t: TFunction<"developer">,
) {
  if (!detail) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(detail).map(([key, value]) => [
      key,
      maskSensitiveAuditValue(key, value, t),
    ]),
  );
}

export function formatAuditDetailText(
  detail: Record<string, unknown> | undefined,
  t: TFunction<"developer">,
) {
  const sanitized = sanitizeAuditDetail(detail, t);
  if (Object.keys(sanitized).length === 0) {
    return t("audit.summaries.noDetails");
  }
  return JSON.stringify(sanitized, null, 2);
}

export function normalizeAuditValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.join("、");
  }
  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }
  if (value === null || value === undefined || value === "") {
    return "";
  }
  return String(value);
}

function summarizeAppChanges(
  detail: Record<string, unknown> | undefined,
  t: TFunction<"developer">,
) {
  const changes = Array.isArray(detail?.changes) ? detail.changes : [];
  if (changes.length === 0) {
    return "";
  }
  return changes
    .slice(0, 3)
    .map((item) => {
      if (!item || typeof item !== "object") {
        return "";
      }
      const change = item as Record<string, unknown>;
      const field = normalizeAuditValue(change.field) || t("audit.summaries.fieldDefault");
      const nextValue =
        normalizeAuditValue(change.after) || t("audit.summaries.updatedDefault");
      return t("audit.summaries.fieldUpdated", { field, value: nextValue });
    })
    .filter(Boolean)
    .join("；");
}

export function buildDeveloperAuditEvent(
  log: DeveloperAuditLog,
  targetName: string,
  t: TFunction<"developer">,
): DeveloperAuditEventRecord {
  const sanitizedDetail = sanitizeAuditDetail(log.detail, t);
  const detailText = formatAuditDetailText(log.detail, t);
  const comment = normalizeAuditValue(sanitizedDetail.comment);
  const scopes = normalizeAuditValue(sanitizedDetail.scopes);
  const grantType = normalizeAuditValue(sanitizedDetail.grant_type);
  const changedSummary = summarizeAppChanges(sanitizedDetail, t);

  const baseEvent = {
    id: log.id,
    targetName,
    createdAt: log.created_at,
    detailText,
    rawAction: log.action,
    sanitizedDetail,
  };

  switch (log.action) {
    case "developer.app.create":
      return {
        ...baseEvent,
        title: t("audit.events.createApp"),
        statusText: t("audit.eventStatus.pending"),
        statusColor: "gold",
        summary: t("audit.summaries.createApp", { target: targetName }),
        category: t("audit.categories.appManagement"),
        categoryColor: "blue",
      };
    case "developer.app.update":
      return {
        ...baseEvent,
        title: t("audit.events.updateApp"),
        statusText: t("audit.eventStatus.submitted"),
        statusColor: "processing",
        summary: changedSummary
          ? t("audit.summaries.updateAppWithChanges", {
              target: targetName,
              changes: changedSummary,
            })
          : t("audit.summaries.updateApp", { target: targetName }),
        category: t("audit.categories.appManagement"),
        categoryColor: "blue",
      };
    case "developer.app.create_secret":
      return {
        ...baseEvent,
        title: t("audit.events.createSecret"),
        statusText: t("audit.eventStatus.done"),
        statusColor: "success",
        summary: t("audit.summaries.createSecret", { target: targetName }),
        category: t("audit.categories.securityAction"),
        categoryColor: "purple",
      };
    case "developer.app.reset_secret":
      return {
        ...baseEvent,
        title: t("audit.events.resetSecret"),
        statusText: t("audit.eventStatus.done"),
        statusColor: "warning",
        summary: t("audit.summaries.resetSecret", { target: targetName }),
        category: t("audit.categories.securityAction"),
        categoryColor: "purple",
      };
    case "developer.app.delete":
      return {
        ...baseEvent,
        title: t("audit.events.deleteApp"),
        statusText: t("audit.eventStatus.deleted"),
        statusColor: "error",
        summary: t("audit.summaries.deleteApp", {
          target: normalizeAuditValue(sanitizedDetail.name) || targetName,
        }),
        category: t("audit.categories.appManagement"),
        categoryColor: "blue",
      };
    case "admin.app.approve":
      return {
        ...baseEvent,
        title: t("audit.events.approveApp"),
        statusText: t("audit.eventStatus.approved"),
        statusColor: "success",
        summary: comment
          ? t("audit.summaries.approveAppWithComment", {
              target: targetName,
              comment,
            })
          : t("audit.summaries.approveApp", { target: targetName }),
        category: t("audit.categories.reviewResult"),
        categoryColor: "green",
      };
    case "admin.app.reject":
      return {
        ...baseEvent,
        title: t("audit.events.rejectApp"),
        statusText: t("audit.eventStatus.rejected"),
        statusColor: "error",
        summary: comment
          ? t("audit.summaries.rejectAppWithComment", {
              target: targetName,
              comment,
            })
          : t("audit.summaries.rejectApp", { target: targetName }),
        category: t("audit.categories.reviewResult"),
        categoryColor: "red",
      };
    case "oauth.authorize":
      return {
        ...baseEvent,
        title: t("audit.events.authorize"),
        statusText: t("audit.eventStatus.success"),
        statusColor: "success",
        summary: scopes
          ? t("audit.summaries.authorizeWithScopes", {
              target: targetName,
              scopes,
            })
          : t("audit.summaries.authorize", { target: targetName }),
        category: t("audit.categories.integrationEvent"),
        categoryColor: "cyan",
      };
    case "oauth.token":
      return {
        ...baseEvent,
        title:
          grantType === "refresh_token"
            ? t("audit.events.tokenRefresh")
            : t("audit.events.tokenExchange"),
        statusText: t("audit.eventStatus.success"),
        statusColor: "success",
        summary:
          grantType === "refresh_token"
            ? t("audit.summaries.tokenRefresh", { target: targetName })
            : t("audit.summaries.tokenExchange", { target: targetName }),
        category: t("audit.categories.integrationEvent"),
        categoryColor: "cyan",
      };
    case "oauth.logout":
      return {
        ...baseEvent,
        title: t("audit.events.logout"),
        statusText: t("audit.eventStatus.complete"),
        statusColor: "default",
        summary: t("audit.summaries.logout", { target: targetName }),
        category: t("audit.categories.integrationEvent"),
        categoryColor: "cyan",
      };
    case "oauth.refresh_token.reuse_detected":
      return {
        ...baseEvent,
        title: t("audit.events.refreshTokenRisk"),
        statusText: t("audit.eventStatus.attention"),
        statusColor: "warning",
        summary: t("audit.summaries.refreshTokenRisk", { target: targetName }),
        category: t("audit.categories.securityAlert"),
        categoryColor: "volcano",
      };
    default:
      return {
        ...baseEvent,
        title: t("audit.events.generic"),
        statusText: t("audit.eventStatus.recorded"),
        statusColor: "default",
        summary: t("audit.summaries.generic", { target: targetName }),
        category: t("audit.categories.systemRecord"),
        categoryColor: "default",
      };
  }
}
