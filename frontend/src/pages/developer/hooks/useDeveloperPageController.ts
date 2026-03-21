import { Modal, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { readSessionToken } from "../../../authSession";
import { buildDeveloperPageMeta } from "../constants";
import { useDeveloperTranslation } from "../i18n";
import {
  createDeveloperApp,
  deleteDeveloperApp,
  deleteDeveloperAuditLogs,
  fetchDeveloperAnalytics,
  fetchDeveloperAnnouncement,
  fetchDeveloperApps,
  fetchDeveloperAuditLogs,
  fetchDeveloperScopes,
  resetDeveloperAppSecret,
  updateDeveloperApp,
} from "../services/developerApi";
import type {
  AppItem,
  DeveloperAnalyticsData,
  DeveloperAuditLog,
  DeveloperPageType,
  ScopeDefinition,
} from "../types";
import { buildUserInsights } from "../utils/analytics";
import { resolveDeveloperPageType } from "../utils/pageType";

type AppFormValues = {
  name: string;
  icon_url?: string;
  description?: string;
  redirect_uris: string;
  post_logout_redirect_uris?: string;
  frontchannel_logout_uri?: string;
  scopes: string[];
};

type RevealedSecretState = {
  title: string;
  clientId: string;
  clientSecret: string;
};

function mapAppPayload(values: AppFormValues) {
  return {
    name: values.name,
    icon_url: values.icon_url || "",
    description: values.description,
    redirect_uris: values.redirect_uris
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    post_logout_redirect_uris: (values.post_logout_redirect_uris || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    frontchannel_logout_uri: values.frontchannel_logout_uri?.trim() || "",
    scopes: values.scopes,
  };
}

export function useDeveloperPageController() {
  const location = useLocation();
  const sessionToken = readSessionToken();
  const { t, ready, i18n } = useDeveloperTranslation();
  const [messageApi, contextHolder] = message.useMessage();
  const [items, setItems] = useState<AppItem[]>([]);
  const [scopeOptions, setScopeOptions] = useState<ScopeDefinition[]>([]);
  const [auditLogs, setAuditLogs] = useState<DeveloperAuditLog[]>([]);
  const [analyticsData, setAnalyticsData] = useState<DeveloperAnalyticsData>({
    summary: {
      authorization_success_rate: 0,
      active_integration_rate: 0,
      needs_attention_rate: 0,
    },
    apps: [],
  });
  const [error, setError] = useState<string>();
  const [reloading, setReloading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingAppId, setEditingAppId] = useState<string>();
  const [resettingAppId, setResettingAppId] = useState<string>();
  const [deletingAppId, setDeletingAppId] = useState<string>();
  const [selectedAuditLogIds, setSelectedAuditLogIds] = useState<string[]>([]);
  const [deletingAuditLogs, setDeletingAuditLogs] = useState(false);
  const [developerAnnouncementEnabled, setDeveloperAnnouncementEnabled] =
    useState(false);
  const [developerAnnouncementContent, setDeveloperAnnouncementContent] =
    useState("");
  const [revealedSecret, setRevealedSecret] = useState<RevealedSecretState>();

  const pageType = useMemo<DeveloperPageType>(
    () => resolveDeveloperPageType(location.pathname),
    [location.pathname],
  );

  const pageMeta = useMemo(
    () => buildDeveloperPageMeta(t)[pageType],
    [pageType, ready, i18n.language, t],
  );

  const insights = useMemo(
    () => buildUserInsights(t, analyticsData.summary),
    [analyticsData.summary, ready, i18n.language, t],
  );

  async function load() {
    try {
      const [appResult, logResult, analyticsResult, scopeResult] =
        await Promise.all([
          fetchDeveloperApps(sessionToken),
          fetchDeveloperAuditLogs(sessionToken),
          fetchDeveloperAnalytics(sessionToken),
          fetchDeveloperScopes(sessionToken),
        ]);
      setItems(appResult.items);
      setAuditLogs(logResult.items);
      setAnalyticsData(analyticsResult.data);
      setScopeOptions(scopeResult.items);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.loadingFailed"));
    }
  }

  async function reloadApps() {
    setReloading(true);
    try {
      await load();
      messageApi.success(t("console.appRefreshed"));
    } finally {
      setReloading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    let active = true;
    void fetchDeveloperAnnouncement()
      .then((result) => {
        if (!active) {
          return;
        }
        setDeveloperAnnouncementEnabled(
          result.data?.developer_announcement_enabled === true,
        );
        setDeveloperAnnouncementContent(
          String(result.data?.developer_announcement_content || "").trim(),
        );
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setDeveloperAnnouncementEnabled(false);
        setDeveloperAnnouncementContent("");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!error) {
      return;
    }
    messageApi.error(error);
    setError(undefined);
  }, [error, messageApi]);

  async function createApp(values: AppFormValues) {
    setCreating(true);
    try {
      await createDeveloperApp(sessionToken, mapAppPayload(values));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.createFailed"));
    } finally {
      setCreating(false);
    }
  }

  async function editApp(app: AppItem, values: AppFormValues) {
    setEditingAppId(app.id);
    try {
      await updateDeveloperApp(sessionToken, app.id, mapAppPayload(values));
      await load();
      messageApi.success(t("console.appUpdatedResubmitted"));
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.updateFailed"));
    } finally {
      setEditingAppId(undefined);
    }
  }

  async function resetSecret(id: string) {
    setResettingAppId(id);
    const currentApp = items.find((item) => item.id === id);
    const creatingSecret = !currentApp?.has_client_secret;
    try {
      const app = await resetDeveloperAppSecret(sessionToken, id);
      await load();
      setRevealedSecret({
        title: creatingSecret
          ? t("console.secretCreatedTitle")
          : t("console.secretUpdatedTitle"),
        clientId: app.client_id,
        clientSecret: app.client_secret || t("console.noSecretReturned"),
      });
      messageApi.success(
        creatingSecret ? t("console.secretCreated") : t("console.secretReset"),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.resetFailed"));
    } finally {
      setResettingAppId(undefined);
    }
  }

  function deleteApp(app: AppItem) {
    Modal.confirm({
      title: t("console.confirmDeleteTitle"),
      content: t("console.confirmDeleteContent", { name: app.name }),
      okText: t("common.confirm"),
      cancelText: t("common.cancel"),
      okButtonProps: { danger: true },
      onOk: async () => {
        setDeletingAppId(app.id);
        try {
          await deleteDeveloperApp(sessionToken, app.id);
          await load();
          messageApi.success(t("console.appDeleted"));
        } catch (err) {
          setError(err instanceof Error ? err.message : t("common.deleteFailed"));
        } finally {
          setDeletingAppId(undefined);
        }
      },
    });
  }

  function deleteSelectedAuditLogsAction() {
    Modal.confirm({
      title: t("audit.confirmBatchDeleteTitle"),
      content: t("audit.confirmBatchDeleteContent", {
        count: selectedAuditLogIds.length,
      }),
      okText: t("common.confirm"),
      cancelText: t("common.cancel"),
      okButtonProps: { danger: true },
      onOk: async () => {
        setDeletingAuditLogs(true);
        try {
          await deleteDeveloperAuditLogs(sessionToken, selectedAuditLogIds);
          setSelectedAuditLogIds([]);
          await load();
          messageApi.success(t("audit.batchDeleted"));
        } catch (err) {
          setError(err instanceof Error ? err.message : t("common.deleteFailed"));
        } finally {
          setDeletingAuditLogs(false);
        }
      },
    });
  }

  return {
    contextHolder,
    pageType,
    items,
    scopeOptions,
    auditLogs,
    analyticsData,
    insights,
    reloading,
    creating,
    editingAppId,
    resettingAppId,
    deletingAppId,
    selectedAuditLogIds,
    setSelectedAuditLogIds,
    deletingAuditLogs,
    developerAnnouncementEnabled,
    developerAnnouncementContent,
    revealedSecret,
    pageMeta,
    reloadApps,
    createApp,
    editApp,
    resetSecret,
    closeRevealedSecret: () => setRevealedSecret(undefined),
    deleteApp,
    deleteSelectedAuditLogs: deleteSelectedAuditLogsAction,
  };
}
