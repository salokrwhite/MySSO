import { Card, Space, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { getAdminPageMeta, getSettingsTabs } from "./constants";
import { AppReview } from "./components/AppReview";
import { AuditLogsPanel } from "./components/AuditLogs";
import { Dashboard } from "./components/Dashboard";
import { DeveloperAccessLogsPanel } from "./components/DeveloperAccessLogs";
import { RiskLogsPanel } from "./components/RiskLogs";
import { EmailSendLogsPanel, PhoneSendLogsPanel } from "./components/SendLogs";
import { SystemSettingsPanel } from "./components/SystemSettings";
import { UserManagement } from "./components/UserManagement";
import { useAdminData } from "./hooks/useAdminData";
import { useAuditLogActions } from "./hooks/useAuditLogActions";
import { useAppReview } from "./hooks/useAppReview";
import { useBatchAppActions } from "./hooks/useBatchAppActions";
import { useBatchUserActions } from "./hooks/useBatchUserActions";
import { useDeveloperAccessLogActions } from "./hooks/useDeveloperAccessLogActions";
import { useRiskLogActions } from "./hooks/useRiskLogActions";
import { usePasskeyLogActions } from "./hooks/usePasskeyLogActions";
import {
  useEmailSendLogActions,
  usePhoneSendLogActions,
} from "./hooks/useSendLogActions";
import { useSystemSettings } from "./hooks/useSystemSettings";
import { useUserCreateActions } from "./hooks/useUserCreateActions";
import {
  deleteScope as deleteScopeRequest,
  fetchAdminAppAuditLogs,
  upsertScope as upsertScopeRequest,
} from "./services/adminApi";
import type { AdminPageType, ScopeDefinition, SettingsTabKey } from "./types";
import { readSessionToken } from "../../authSession";
import { useAdminDocumentLocalization, useAdminI18n } from "./i18n";

export function AdminPage() {
  const { t } = useAdminI18n();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionToken = readSessionToken();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [selectedAuditLogIds, setSelectedAuditLogIds] = useState<string[]>([]);
  const [selectedDeveloperAccessLogIds, setSelectedDeveloperAccessLogIds] =
    useState<string[]>([]);
  const [selectedRiskLogIds, setSelectedRiskLogIds] = useState<string[]>([]);
  const [selectedEmailSendLogIds, setSelectedEmailSendLogIds] = useState<
    string[]
  >([]);
  const [selectedPhoneSendLogIds, setSelectedPhoneSendLogIds] = useState<
    string[]
  >([]);
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);
  const [appPage, setAppPage] = useState(1);
  const [appPageSize, setAppPageSize] = useState(10);
  const [auditLogPage, setAuditLogPage] = useState(1);
  const [auditLogPageSize, setAuditLogPageSize] = useState(10);
  const [developerAccessLogPage, setDeveloperAccessLogPage] = useState(1);
  const [developerAccessLogPageSize, setDeveloperAccessLogPageSize] = useState(10);
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [userEmailKeyword, setUserEmailKeyword] = useState("");
  const [userIDKeyword, setUserIDKeyword] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState("all");
  const [appNameKeyword, setAppNameKeyword] = useState("");
  useAdminDocumentLocalization(true);
  const settingsTabs = useMemo(() => getSettingsTabs(t), [t]);
  const adminPageMeta = useMemo(() => getAdminPageMeta(t), [t]);

  const pageType = useMemo<AdminPageType>(() => {
    if (location.pathname === "/admin/users") {
      return "users";
    }
    if (location.pathname === "/admin/apps") {
      return "apps";
    }
    if (location.pathname === "/admin/send-logs/emails") {
      return "emailSendLogs";
    }
    if (location.pathname === "/admin/send-logs/phones") {
      return "phoneSendLogs";
    }
    if (location.pathname === "/admin/audit-logs") {
      return "auditLogs";
    }
    if (location.pathname === "/admin/developer-access-logs") {
      return "developerAccessLogs";
    }
    if (location.pathname === "/admin/risk-logs") {
      return "riskLogs";
    }
    if (location.pathname === "/admin/settings") {
      return "settings";
    }
    return "dashboard";
  }, [location.pathname]);

  const activeSettingsTab = useMemo<SettingsTabKey>(() => {
    const tab = searchParams.get("tab");
    return settingsTabs.some((item) => item.key === tab)
      ? (tab as SettingsTabKey)
      : "site";
  }, [searchParams, settingsTabs]);
  const usersQuery = useMemo(
    () => ({
      page: userPage,
      pageSize: userPageSize,
      emailKeyword: userEmailKeyword,
      status: userStatusFilter,
      userID: userIDKeyword,
    }),
    [userEmailKeyword, userIDKeyword, userPage, userPageSize, userStatusFilter],
  );
  const appsQuery = useMemo(
    () => ({
      page: appPage,
      pageSize: appPageSize,
      status: appStatusFilter,
      nameKeyword: appNameKeyword,
    }),
    [appNameKeyword, appPage, appPageSize, appStatusFilter],
  );
  const auditLogsQuery = useMemo(
    () => ({
      page: auditLogPage,
      pageSize: auditLogPageSize,
    }),
    [auditLogPage, auditLogPageSize],
  );
  const developerAccessLogsQuery = useMemo(
    () => ({
      page: developerAccessLogPage,
      pageSize: developerAccessLogPageSize,
    }),
    [developerAccessLogPage, developerAccessLogPageSize],
  );

  const {
    users,
    usersTotal,
    dashboardSummary,
    apps,
    appsTotal,
    logs,
    logsTotal,
    developerAccessLogs,
    developerAccessLogsTotal,
    riskLogs,
    passkeyLogs,
    emailSendLogs,
    phoneSendLogs,
    policies,
    scopes,
    settings,
    setSettings,
    loading,
    error,
    setError,
    load,
  } = useAdminData(
    sessionToken,
    pageType,
    usersQuery,
    appsQuery,
    auditLogsQuery,
    developerAccessLogsQuery,
  );

  const ensureCurrentPageLoaded = useCallback(() => load(), [load]);
  const reloadCurrentPage = useCallback(
    () => load({ force: true }),
    [load],
  );

  const systemSettings = useSystemSettings(
    sessionToken,
    settings,
    setSettings,
    reloadCurrentPage,
    setError,
    pageType,
    activeSettingsTab,
  );

  const { createApp, reviewApp, deleteApp, updateApp, resetSecret, setDisabled } = useAppReview(
    sessionToken,
    reloadCurrentPage,
    setError,
  );
  const { deletingApps, confirmBatchDeleteApps } = useBatchAppActions(
    sessionToken,
    selectedAppIds,
    setSelectedAppIds,
    reloadCurrentPage,
    setError,
    systemSettings.messageApi,
  );
  const { creatingUser, createUser } = useUserCreateActions(
    sessionToken,
    reloadCurrentPage,
    setError,
    systemSettings.messageApi,
  );
  const {
    batchActingUsers,
    announcingUser,
    editingUser,
    securityPolicyUser,
    securityPolicy,
    loadingSecurityPolicy,
    updatingSecurityPolicy,
    freezeUser,
    batchFreezeUsers,
    confirmBatchDeleteUsers,
    updateUser,
    updateUserAnnouncement,
    openSecurityPolicy,
    closeSecurityPolicy,
    updateUserSecurityPolicy,
  } = useBatchUserActions(
    sessionToken,
    selectedUserIds,
    setSelectedUserIds,
    reloadCurrentPage,
    setError,
    systemSettings.messageApi,
  );
  const { deletingAuditLogs, confirmBatchDeleteAuditLogs } = useAuditLogActions(
    sessionToken,
    selectedAuditLogIds,
    setSelectedAuditLogIds,
    reloadCurrentPage,
    setError,
    systemSettings.messageApi,
  );
  const {
    deletingDeveloperAccessLogs,
    confirmBatchDeleteDeveloperAccessLogs,
  } = useDeveloperAccessLogActions(
    sessionToken,
    selectedDeveloperAccessLogIds,
    setSelectedDeveloperAccessLogIds,
    reloadCurrentPage,
    setError,
    systemSettings.messageApi,
  );
  const { deletingRiskLogs, confirmBatchDeleteRiskLogs } = useRiskLogActions(
    sessionToken,
    selectedRiskLogIds,
    setSelectedRiskLogIds,
    reloadCurrentPage,
    setError,
    systemSettings.messageApi,
  );
  const { deletingPasskeyTable, confirmBatchDeletePasskeyLogs } =
    usePasskeyLogActions(
      sessionToken,
      reloadCurrentPage,
      setError,
      systemSettings.messageApi,
    );
  const { deletingEmailSendLogs, confirmBatchDeleteEmailSendLogs } =
    useEmailSendLogActions(
      sessionToken,
      selectedEmailSendLogIds,
      setSelectedEmailSendLogIds,
      reloadCurrentPage,
      setError,
      systemSettings.messageApi,
    );
  const { deletingPhoneSendLogs, confirmBatchDeletePhoneSendLogs } =
    usePhoneSendLogActions(
      sessionToken,
      selectedPhoneSendLogIds,
      setSelectedPhoneSendLogIds,
      reloadCurrentPage,
      setError,
      systemSettings.messageApi,
    );
  const [savingScopeKey, setSavingScopeKey] = useState<string>();
  const [deletingScopeKey, setDeletingScopeKey] = useState<string>();

  const saveScope = useCallback(
    async (input: ScopeDefinition) => {
      setSavingScopeKey(input.key || "__new__");
      try {
        await upsertScopeRequest(sessionToken, input);
        await reloadCurrentPage();
        systemSettings.messageApi.success(t("Scope 设置已保存"));
      } catch (err) {
        setError(err instanceof Error ? err.message : t("保存 scope 失败"));
      } finally {
        setSavingScopeKey(undefined);
      }
    },
    [reloadCurrentPage, sessionToken, setError, systemSettings.messageApi, t],
  );

  const deleteScope = useCallback(
    async (key: string) => {
      setDeletingScopeKey(key);
      try {
        await deleteScopeRequest(sessionToken, key);
        await reloadCurrentPage();
        systemSettings.messageApi.success(t("Scope 已删除"));
      } catch (err) {
        setError(err instanceof Error ? err.message : t("删除 scope 失败"));
      } finally {
        setDeletingScopeKey(undefined);
      }
    },
    [reloadCurrentPage, sessionToken, setError, systemSettings.messageApi, t],
  );

  useEffect(() => {
    if (!error) {
      return;
    }
    systemSettings.messageApi.error(error);
    setError(undefined);
  }, [error, setError, systemSettings.messageApi]);

  useEffect(() => {
    void ensureCurrentPageLoaded();
  }, [activeSettingsTab, ensureCurrentPageLoaded, location.pathname]);

  useEffect(() => {
    if (pageType !== "users") {
      return;
    }
    setSelectedUserIds([]);
  }, [pageType, userEmailKeyword, userIDKeyword, userStatusFilter, userPage, userPageSize]);

  useEffect(() => {
    if (pageType !== "apps") {
      return;
    }
    setSelectedAppIds([]);
  }, [pageType, appNameKeyword, appPage, appPageSize, appStatusFilter]);

  useEffect(() => {
    if (pageType !== "apps" || loading || appPage <= 1 || apps.length > 0) {
      return;
    }
    const lastPage = Math.max(1, Math.ceil(appsTotal / appPageSize));
    if (appPage > lastPage) {
      setAppPage(lastPage);
    }
  }, [appPage, appPageSize, apps.length, appsTotal, loading, pageType]);

  useEffect(() => {
    if (pageType !== "auditLogs") {
      return;
    }
    setSelectedAuditLogIds([]);
  }, [auditLogPage, auditLogPageSize, pageType]);

  useEffect(() => {
    if (pageType !== "auditLogs" || loading || auditLogPage <= 1 || logs.length > 0) {
      return;
    }
    const lastPage = Math.max(1, Math.ceil(logsTotal / auditLogPageSize));
    if (auditLogPage > lastPage) {
      setAuditLogPage(lastPage);
    }
  }, [auditLogPage, auditLogPageSize, loading, logs.length, logsTotal, pageType]);

  useEffect(() => {
    if (pageType !== "developerAccessLogs") {
      return;
    }
    setSelectedDeveloperAccessLogIds([]);
  }, [developerAccessLogPage, developerAccessLogPageSize, pageType]);

  useEffect(() => {
    if (
      pageType !== "developerAccessLogs" ||
      loading ||
      developerAccessLogPage <= 1 ||
      developerAccessLogs.length > 0
    ) {
      return;
    }
    const lastPage = Math.max(
      1,
      Math.ceil(developerAccessLogsTotal / developerAccessLogPageSize),
    );
    if (developerAccessLogPage > lastPage) {
      setDeveloperAccessLogPage(lastPage);
    }
  }, [
    developerAccessLogPage,
    developerAccessLogPageSize,
    developerAccessLogs.length,
    developerAccessLogsTotal,
    loading,
    pageType,
  ]);

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      {systemSettings.contextHolder}

      <Card>
        <Typography.Title level={4}>
          {adminPageMeta[pageType].title}
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          {adminPageMeta[pageType].description}
        </Typography.Paragraph>
      </Card>

      {pageType === "dashboard" ? (
        <Dashboard
          userCount={dashboardSummary.total_users}
          activeUsers={dashboardSummary.active_users}
          pendingApps={dashboardSummary.pending_apps}
          approvedApps={dashboardSummary.approved_apps}
          logCount={dashboardSummary.audit_logs}
          policies={policies}
          policyCount={dashboardSummary.policies}
        />
      ) : null}

      {pageType === "users" ? (
        <UserManagement
          sessionToken={sessionToken}
          users={users}
          usersTotal={usersTotal}
          currentPage={userPage}
          pageSize={userPageSize}
          statusFilter={userStatusFilter}
          emailKeyword={userEmailKeyword}
          userIDKeyword={userIDKeyword}
          onPageChange={(page, pageSize) => {
            setUserPage(page);
            setUserPageSize(pageSize);
          }}
          onStatusFilterChange={(value) => {
            setUserStatusFilter(value);
            setUserPage(1);
          }}
          onEmailKeywordChange={(value) => {
            setUserEmailKeyword(value);
            setUserPage(1);
          }}
          onUserIDKeywordChange={(value) => {
            setUserIDKeyword(value);
            setUserPage(1);
          }}
          selectedUserIds={selectedUserIds}
          setSelectedUserIds={setSelectedUserIds}
          loading={batchActingUsers}
          refreshing={loading}
          creatingUser={creatingUser}
          announcingUser={announcingUser}
          editingUser={editingUser}
          onRefresh={() => void reloadCurrentPage()}
          onBatchFreeze={() => void batchFreezeUsers(true)}
          onBatchUnfreeze={() => void batchFreezeUsers(false)}
          onBatchDelete={confirmBatchDeleteUsers}
          onToggleFreeze={(id, frozen) => void freezeUser(id, frozen)}
          onCreateUser={(values) => createUser(values)}
          onUpdateUser={(userId, values) => updateUser(userId, values)}
          onUpdateAnnouncement={(userId, enabled, content) =>
            updateUserAnnouncement(userId, enabled, content)
          }
          securityPolicyUser={securityPolicyUser}
          securityPolicy={securityPolicy}
          loadingSecurityPolicy={loadingSecurityPolicy}
          updatingSecurityPolicy={updatingSecurityPolicy}
          onOpenSecurityPolicy={(user) => void openSecurityPolicy(user)}
          onCloseSecurityPolicy={closeSecurityPolicy}
          onUpdateSecurityPolicy={(userId, values) =>
            updateUserSecurityPolicy(userId, values)
          }
        />
      ) : null}

      {pageType === "apps" ? (
        <AppReview
          sessionToken={sessionToken}
          apps={apps}
          appsTotal={appsTotal}
          currentPage={appPage}
          pageSize={appPageSize}
          statusFilter={appStatusFilter}
          nameKeyword={appNameKeyword}
          scopes={scopes}
          selectedAppIds={selectedAppIds}
          setSelectedAppIds={setSelectedAppIds}
          deletingApps={deletingApps}
          refreshing={loading}
          onPageChange={(page, pageSize) => {
            setAppPage(page);
            setAppPageSize(pageSize);
          }}
          onStatusFilterChange={(value) => {
            setAppStatusFilter(value);
            setAppPage(1);
          }}
          onNameKeywordChange={(value) => {
            setAppNameKeyword(value);
            setAppPage(1);
          }}
          onLoadHistory={(appID) => fetchAdminAppAuditLogs(sessionToken, appID)}
          onCreate={(values) => void createApp(values)}
          onReview={(id, approved, comment) =>
            void reviewApp(id, approved, comment)
          }
          onUpdate={(id, values) => void updateApp(id, values)}
          onResetSecret={(id) => resetSecret(id)}
          onSetDisabled={(id, disabled) => void setDisabled(id, disabled)}
          onDelete={(id) => void deleteApp(id)}
          onRefresh={() => void reloadCurrentPage()}
          onBatchDelete={confirmBatchDeleteApps}
        />
      ) : null}

      {pageType === "auditLogs" ? (
        <AuditLogsPanel
          logs={logs}
          logsTotal={logsTotal}
          currentPage={auditLogPage}
          pageSize={auditLogPageSize}
          selectedAuditLogIds={selectedAuditLogIds}
          setSelectedAuditLogIds={setSelectedAuditLogIds}
          deletingAuditLogs={deletingAuditLogs}
          refreshing={loading}
          onPageChange={(page, pageSize) => {
            setAuditLogPage(page);
            setAuditLogPageSize(pageSize);
          }}
          onBatchDelete={confirmBatchDeleteAuditLogs}
        />
      ) : null}

      {pageType === "developerAccessLogs" ? (
        <DeveloperAccessLogsPanel
          logs={developerAccessLogs}
          logsTotal={developerAccessLogsTotal}
          currentPage={developerAccessLogPage}
          pageSize={developerAccessLogPageSize}
          selectedLogIds={selectedDeveloperAccessLogIds}
          setSelectedLogIds={setSelectedDeveloperAccessLogIds}
          deletingLogs={deletingDeveloperAccessLogs}
          refreshing={loading}
          onPageChange={(page, pageSize) => {
            setDeveloperAccessLogPage(page);
            setDeveloperAccessLogPageSize(pageSize);
          }}
          onBatchDelete={confirmBatchDeleteDeveloperAccessLogs}
        />
      ) : null}

      {pageType === "riskLogs" ? (
        <RiskLogsPanel
          logs={riskLogs}
          passkeyLogs={passkeyLogs}
          refreshing={loading}
          deletingLogs={deletingRiskLogs}
          selectedLogIds={selectedRiskLogIds}
          setSelectedLogIds={setSelectedRiskLogIds}
          deletingPasskeyTable={deletingPasskeyTable}
          onRefresh={() => void reloadCurrentPage()}
          onBatchDelete={confirmBatchDeleteRiskLogs}
          onBatchDeletePasskeyLogs={(table, recordIds) =>
            confirmBatchDeletePasskeyLogs(table, recordIds)
          }
        />
      ) : null}

      {pageType === "emailSendLogs" ? (
        <EmailSendLogsPanel
          logs={emailSendLogs}
          selectedLogIds={selectedEmailSendLogIds}
          setSelectedLogIds={setSelectedEmailSendLogIds}
          deletingLogs={deletingEmailSendLogs}
          refreshing={loading}
          onRefresh={() => void reloadCurrentPage()}
          onBatchDelete={confirmBatchDeleteEmailSendLogs}
        />
      ) : null}

      {pageType === "phoneSendLogs" ? (
        <PhoneSendLogsPanel
          logs={phoneSendLogs}
          selectedLogIds={selectedPhoneSendLogIds}
          setSelectedLogIds={setSelectedPhoneSendLogIds}
          deletingLogs={deletingPhoneSendLogs}
          refreshing={loading}
          onRefresh={() => void reloadCurrentPage()}
          onBatchDelete={confirmBatchDeletePhoneSendLogs}
        />
      ) : null}

      {pageType === "settings" ? (
        <SystemSettingsPanel
          activeSettingsTab={activeSettingsTab}
          onTabChange={(key) => setSearchParams({ tab: key })}
          tabs={settingsTabs}
          settings={settings}
          siteForm={systemSettings.siteForm}
          smtpForm={systemSettings.smtpForm}
          verificationForm={systemSettings.verificationForm}
          intlForm={systemSettings.intlForm}
          sessionForm={systemSettings.sessionForm}
          smsForm={systemSettings.smsForm}
          announcementForm={systemSettings.announcementForm}
          riskForm={systemSettings.riskForm}
          rateLimitForm={systemSettings.rateLimitForm}
          scopes={scopes}
          savingSettings={systemSettings.savingSettings}
          savingScopeKey={savingScopeKey}
          deletingScopeKey={deletingScopeKey}
          testingEmail={systemSettings.testingEmail}
          testingSMS={systemSettings.testingSMS}
          testEmail={systemSettings.testEmail}
          setTestEmail={systemSettings.setTestEmail}
          testSMSProvider={systemSettings.testSMSProvider}
          setTestSMSProvider={systemSettings.setTestSMSProvider}
          testSMSPhone={systemSettings.testSMSPhone}
          setTestSMSPhone={systemSettings.setTestSMSPhone}
          testSMSContent={systemSettings.testSMSContent}
          setTestSMSContent={systemSettings.setTestSMSContent}
          siteLogoFieldValue={systemSettings.siteLogoFieldValue}
          backendOrigin={systemSettings.backendOrigin}
          smsProvider={
            systemSettings.smsProviderFieldValue ?? settings.sms_provider
          }
          smsTemplateProvider={
            systemSettings.smsTemplateProviderFieldValue ??
            settings.sms_template_provider
          }
          onSaveSite={() => void systemSettings.saveSiteSettings()}
          onSaveEmail={() => void systemSettings.saveEmailSettings()}
          onSaveVerification={() =>
            void systemSettings.saveVerificationSettings()
          }
          onSaveIntl={() => void systemSettings.saveIntlSettings()}
          onSaveSession={() => void systemSettings.saveSessionSettings()}
          onSaveSMS={() => void systemSettings.saveSMSSettings()}
          onSaveAnnouncement={() =>
            void systemSettings.saveAnnouncementSettings()
          }
          onSaveRisk={() => void systemSettings.saveRiskSettings()}
          onSaveRateLimit={() => void systemSettings.saveRateLimitSettings()}
          onSaveScope={(scope) => void saveScope(scope)}
          onDeleteScope={(key) => void deleteScope(key)}
          onUploadSiteLogo={(file) =>
            void systemSettings.handleSiteLogoUpload(file)
          }
          onClearSiteLogo={systemSettings.clearSiteLogo}
          onSendTestEmail={() => void systemSettings.sendTestEmail()}
          onSendTestSMS={() => void systemSettings.sendTestSMS()}
        />
      ) : null}
    </Space>
  );
}
