import { Card, Space, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { getAdminPageMeta, getSettingsTabs } from "./constants";
import { AppReview } from "./components/AppReview";
import { AuditLogsPanel } from "./components/AuditLogs";
import { Dashboard } from "./components/Dashboard";
import { RiskLogsPanel } from "./components/RiskLogs";
import { EmailSendLogsPanel, PhoneSendLogsPanel } from "./components/SendLogs";
import { SystemSettingsPanel } from "./components/SystemSettings";
import { UserManagement } from "./components/UserManagement";
import { useAdminData } from "./hooks/useAdminData";
import { useAuditLogActions } from "./hooks/useAuditLogActions";
import { useAppReview } from "./hooks/useAppReview";
import { useBatchAppActions } from "./hooks/useBatchAppActions";
import { useBatchUserActions } from "./hooks/useBatchUserActions";
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
  const [selectedRiskLogIds, setSelectedRiskLogIds] = useState<string[]>([]);
  const [selectedEmailSendLogIds, setSelectedEmailSendLogIds] = useState<
    string[]
  >([]);
  const [selectedPhoneSendLogIds, setSelectedPhoneSendLogIds] = useState<
    string[]
  >([]);
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

  const {
    users,
    apps,
    logs,
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
    activeUsers,
    pendingApps,
    approvedApps,
  } = useAdminData(sessionToken, pageType);

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

  const { reviewApp, deleteApp, updateApp } = useAppReview(
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
          userCount={users.length}
          activeUsers={activeUsers}
          pendingApps={pendingApps}
          approvedApps={approvedApps}
          logs={logs}
          policies={policies}
        />
      ) : null}

      {pageType === "users" ? (
        <UserManagement
          sessionToken={sessionToken}
          users={users}
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
          apps={apps}
          logs={logs}
          scopes={scopes}
          selectedAppIds={selectedAppIds}
          setSelectedAppIds={setSelectedAppIds}
          deletingApps={deletingApps}
          refreshing={loading}
          onReview={(id, approved, comment) =>
            void reviewApp(id, approved, comment)
          }
          onUpdate={(id, values) => void updateApp(id, values)}
          onDelete={(id) => void deleteApp(id)}
          onRefresh={() => void reloadCurrentPage()}
          onBatchDelete={confirmBatchDeleteApps}
        />
      ) : null}

      {pageType === "auditLogs" ? (
        <AuditLogsPanel
          logs={logs}
          selectedAuditLogIds={selectedAuditLogIds}
          setSelectedAuditLogIds={setSelectedAuditLogIds}
          deletingAuditLogs={deletingAuditLogs}
          onBatchDelete={confirmBatchDeleteAuditLogs}
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
