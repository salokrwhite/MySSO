import { Modal, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { readSessionToken } from "../../../authSession";
import { buildDeveloperPageMeta } from "../constants";
import { useDeveloperTranslation } from "../i18n";
import {
  banDeveloperAppUser,
  batchUpdateDeveloperManagedUserGroups,
  createDeveloperApp,
  createDeveloperGroup,
  deleteDeveloperAccessLogs,
  deleteDeveloperApp,
  deleteDeveloperAuditLogs,
  deleteDeveloperGroup,
  fetchDeveloperAccessApps,
  fetchDeveloperAccessLogs,
  fetchDeveloperAnalytics,
  fetchDeveloperAnnouncement,
  fetchDeveloperApps,
  fetchDeveloperAuditLogs,
  fetchDeveloperGroups,
  fetchDeveloperManagedUsers,
  fetchDeveloperScopes,
  resetDeveloperAppSecret,
  unbanDeveloperAppUser,
  updateDeveloperApp,
  updateDeveloperAppBindings,
  updateDeveloperGroup,
  updateDeveloperManagedUserGroups,
} from "../services/developerApi";
import type {
  AppItem,
  DeveloperAccessApp,
  DeveloperAccessLog,
  DeveloperAnalyticsData,
  DeveloperAuditLog,
  DeveloperGroup,
  DeveloperManagedUser,
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
  allow_get_session_logout?: boolean;
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
    allow_get_session_logout: Boolean(values.allow_get_session_logout),
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
  const [groups, setGroups] = useState<DeveloperGroup[]>([]);
  const [managedUsers, setManagedUsers] = useState<DeveloperManagedUser[]>([]);
  const [selectedManagedUserIDs, setSelectedManagedUserIDs] = useState<string[]>([]);
  const [managedUsersTotal, setManagedUsersTotal] = useState(0);
  const [managedUsersPage, setManagedUsersPage] = useState(1);
  const [managedUsersPageSize, setManagedUsersPageSize] = useState(10);
  const [managedUsersAppID, setManagedUsersAppID] = useState("");
  const [managedUsersEmailKeyword, setManagedUsersEmailKeyword] = useState("");
  const [accessApps, setAccessApps] = useState<DeveloperAccessApp[]>([]);
  const [accessLogs, setAccessLogs] = useState<DeveloperAccessLog[]>([]);
  const [accessLogsTotal, setAccessLogsTotal] = useState(0);
  const [accessLogsPage, setAccessLogsPage] = useState(1);
  const [accessLogsPageSize, setAccessLogsPageSize] = useState(10);
  const [selectedAccessLogIds, setSelectedAccessLogIds] = useState<string[]>([]);
  const [deletingAccessLogs, setDeletingAccessLogs] = useState(false);
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

  const load = useCallback(async (options?: { force?: boolean }) => {
    try {
      if (pageType === "dashboard") {
        const [appResult, logResult] = await Promise.all([
          fetchDeveloperApps(sessionToken, options),
          fetchDeveloperAuditLogs(sessionToken, options),
        ]);
        setItems(appResult.items);
        setAuditLogs(logResult.items);
      } else if (pageType === "console") {
        const [appResult, scopeResult] = await Promise.all([
          fetchDeveloperApps(sessionToken, options),
          fetchDeveloperScopes(sessionToken, options),
        ]);
        setItems(appResult.items);
        setScopeOptions(scopeResult.items);
      } else if (pageType === "auditLogs") {
        const [appResult, logResult] = await Promise.all([
          fetchDeveloperApps(sessionToken, options),
          fetchDeveloperAuditLogs(sessionToken, options),
        ]);
        setItems(appResult.items);
        setAuditLogs(logResult.items);
      } else if (pageType === "analytics") {
        const analyticsResult = await fetchDeveloperAnalytics(
          sessionToken,
          options,
        );
        setAnalyticsData(analyticsResult.data);
      } else if (pageType === "docsManual") {
        const scopeResult = await fetchDeveloperScopes(sessionToken, options);
        setScopeOptions(scopeResult.items);
      } else if (pageType === "userAccess") {
        const [groupResult, userResult, appResult, logResult] = await Promise.all([
          fetchDeveloperGroups(sessionToken, options),
          fetchDeveloperManagedUsers(
            sessionToken,
            {
              page: managedUsersPage,
              pageSize: managedUsersPageSize,
              appId: managedUsersAppID,
              emailKeyword: managedUsersEmailKeyword,
            },
            options,
          ),
          fetchDeveloperAccessApps(sessionToken, options),
          fetchDeveloperAccessLogs(sessionToken, {
            page: accessLogsPage,
            pageSize: accessLogsPageSize,
          }),
        ]);
        setGroups(groupResult.items);
        setManagedUsers(userResult.items);
        setManagedUsersTotal(userResult.total);
        setManagedUsersPage(userResult.page);
        setManagedUsersPageSize(userResult.page_size);
        setAccessApps(appResult.items);
        setAccessLogs(logResult.items);
        setAccessLogsTotal(logResult.total);
        setAccessLogsPage(logResult.page);
        setAccessLogsPageSize(logResult.page_size);
      }
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.loadingFailed"));
    }
  }, [accessLogsPage, accessLogsPageSize, managedUsersAppID, managedUsersEmailKeyword, managedUsersPage, managedUsersPageSize, pageType, sessionToken, t]);

  async function reloadApps() {
    setReloading(true);
    try {
      await load({ force: true });
      messageApi.success(t("console.appRefreshed"));
    } finally {
      setReloading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [load]);

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
      await load({ force: true });
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
      await load({ force: true });
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
      await load({ force: true });
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
          await load({ force: true });
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
          await load({ force: true });
          messageApi.success(t("audit.batchDeleted"));
        } catch (err) {
          setError(err instanceof Error ? err.message : t("common.deleteFailed"));
        } finally {
          setDeletingAuditLogs(false);
        }
      },
    });
  }

  async function refreshUserAccess() {
    await load({ force: true });
  }

  const changeManagedUsersPage = useCallback((page: number, pageSize: number) => {
    setManagedUsersPage(page);
    setManagedUsersPageSize(pageSize);
  }, []);

  const changeManagedUsersAppFilter = useCallback((appId: string) => {
    setManagedUsersAppID(appId);
    setManagedUsersPage(1);
  }, []);

  const changeManagedUsersEmailKeyword = useCallback((keyword: string) => {
    setManagedUsersEmailKeyword(keyword);
    setManagedUsersPage(1);
  }, []);

  const changeAccessLogsPage = useCallback((page: number, pageSize: number) => {
    setAccessLogsPage(page);
    setAccessLogsPageSize(pageSize);
  }, []);

  async function createGroup(values: { name: string; description?: string }) {
    try {
      await createDeveloperGroup(sessionToken, values);
      await refreshUserAccess();
      messageApi.success("用户组已创建");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.createFailed"));
    }
  }

  async function updateGroup(id: string, values: { name: string; description?: string }) {
    try {
      await updateDeveloperGroup(sessionToken, id, values);
      await refreshUserAccess();
      messageApi.success("用户组已更新");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.updateFailed"));
    }
  }

  async function deleteGroup(id: string) {
    try {
      await deleteDeveloperGroup(sessionToken, id);
      await refreshUserAccess();
      messageApi.success("用户组已删除");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.deleteFailed"));
      throw err;
    }
  }

  async function updateManagedUserGroupsAction(userId: string, groupIds: string[]) {
    try {
      await updateDeveloperManagedUserGroups(sessionToken, userId, groupIds);
      await refreshUserAccess();
      messageApi.success("用户分组已更新");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.updateFailed"));
    }
  }

  async function batchUpdateManagedUserGroupsAction(groupIds: string[]) {
    try {
      await batchUpdateDeveloperManagedUserGroups(
        sessionToken,
        selectedManagedUserIDs,
        groupIds,
      );
      setSelectedManagedUserIDs([]);
      await refreshUserAccess();
      messageApi.success("批量用户分组已更新");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.updateFailed"));
    }
  }

  async function updateAppBindingsAction(appId: string, groupIds: string[]) {
    try {
      await updateDeveloperAppBindings(sessionToken, appId, groupIds);
      await refreshUserAccess();
      messageApi.success("应用访问范围已更新");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.updateFailed"));
    }
  }

  async function banAppUserAction(
    appId: string,
    payload: { user_id: string; reason: string; expires_at?: string },
  ) {
    try {
      await banDeveloperAppUser(sessionToken, appId, payload);
      await refreshUserAccess();
      messageApi.success("用户已封禁");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.updateFailed"));
    }
  }

  async function unbanAppUserAction(appId: string, userId: string) {
    try {
      await unbanDeveloperAppUser(sessionToken, appId, userId);
      await refreshUserAccess();
      messageApi.success("封禁已解除");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.updateFailed"));
    }
  }

  function deleteSelectedAccessLogsAction() {
    Modal.confirm({
      title: "确认删除选中的访问日志？",
      content: `已选择 ${selectedAccessLogIds.length} 条日志。`,
      okText: t("common.confirm"),
      cancelText: t("common.cancel"),
      okButtonProps: { danger: true },
      onOk: async () => {
        setDeletingAccessLogs(true);
        try {
          await deleteDeveloperAccessLogs(sessionToken, selectedAccessLogIds);
          setSelectedAccessLogIds([]);
          await refreshUserAccess();
          messageApi.success("访问日志已删除");
        } catch (err) {
          setError(err instanceof Error ? err.message : t("common.deleteFailed"));
        } finally {
          setDeletingAccessLogs(false);
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
    groups,
    managedUsers,
    selectedManagedUserIDs,
    setSelectedManagedUserIDs,
    managedUsersTotal,
    managedUsersPage,
    managedUsersPageSize,
    managedUsersAppID,
    managedUsersEmailKeyword,
    accessApps,
    accessLogs,
    accessLogsTotal,
    accessLogsPage,
    accessLogsPageSize,
    selectedAccessLogIds,
    setSelectedAccessLogIds,
    deletingAccessLogs,
    revealedSecret,
    pageMeta,
    reloadApps,
    createApp,
    editApp,
    resetSecret,
    closeRevealedSecret: () => setRevealedSecret(undefined),
    deleteApp,
    deleteSelectedAuditLogs: deleteSelectedAuditLogsAction,
    createGroup,
    updateGroup,
    deleteGroup,
    changeManagedUsersPage,
    changeManagedUsersAppFilter,
    changeManagedUsersEmailKeyword,
    changeAccessLogsPage,
    batchUpdateManagedUserGroups: batchUpdateManagedUserGroupsAction,
    updateManagedUserGroups: updateManagedUserGroupsAction,
    updateAppBindings: updateAppBindingsAction,
    banAppUser: banAppUserAction,
    unbanAppUser: unbanAppUserAction,
    deleteSelectedAccessLogs: deleteSelectedAccessLogsAction,
  };
}
