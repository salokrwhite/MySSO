import { Alert, Button, Card, Space, Typography, message } from "antd";
import { Grid } from "antd";
import { DeveloperAnalytics } from "./components/Analytics";
import { DeveloperAuditLogs } from "./components/AuditLogs";
import { DeveloperSecretRevealModal } from "./components/common/DeveloperSecretRevealModal";
import { DeveloperConsole } from "./components/Console";
import {
  DeveloperDocsExamples,
  DeveloperDocsExamplesCsharp,
  DeveloperDocsExamplesGo,
  DeveloperDocsExamplesJava,
  DeveloperDocsExamplesNodejs,
  DeveloperDocsExamplesPHP,
  DeveloperDocsExamplesPython,
  DeveloperDocsExamplesRuby,
  DeveloperDocsExamplesRust,
} from "./components/DocsExamples";
import {
  buildDeveloperManualMarkdown,
  DeveloperDocsManual,
} from "./components/DocsManual";
import { DeveloperDashboard } from "./components/Dashboard";
import { DeveloperProfile } from "./components/Profile";
import { DeveloperUserAccess } from "./components/UserAccess";
import { useDeveloperPageController } from "./hooks/useDeveloperPageController";
import { useDeveloperTranslation } from "./i18n";

export function DeveloperPage() {
  const controller = useDeveloperPageController();
  const { t, ready } = useDeveloperTranslation();
  const screens = Grid.useBreakpoint();
  const isCompact = !screens.md;
  const showPageHeader = controller.pageType.startsWith("docs");

  if (!ready) {
    return null;
  }

  async function handleCopyMarkdown() {
    try {
      await navigator.clipboard.writeText(
        buildDeveloperManualMarkdown(controller.scopeOptions, t),
      );
      message.success(t("docsManual.copyMarkdownSuccess"));
    } catch {
      message.error(t("docsManual.copyMarkdownFailed"));
    }
  }

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      {controller.contextHolder}
      {controller.developerAnnouncementEnabled &&
      controller.developerAnnouncementContent ? (
        <Alert
          type="warning"
          showIcon
          message={
            <div style={{ whiteSpace: "pre-wrap" }}>
              {controller.developerAnnouncementContent}
            </div>
          }
        />
      ) : null}
      {controller.pageType === "console" && controller.scopeOptions.length > 0 ? (
        <Alert
          type="info"
          showIcon
          message={t("common.currentAvailableScopes", {
            scopes: controller.scopeOptions.map((item) => item.key).join("、"),
          })}
        />
      ) : null}

      {showPageHeader ? (
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: isCompact ? "stretch" : "flex-start",
              flexDirection: isCompact ? "column" : "row",
              gap: 16,
            }}
          >
            <Space
              direction="vertical"
              size={8}
              style={{ flex: 1, minWidth: 0 }}
            >
              <Typography.Title level={4} style={{ margin: 0 }}>
                {controller.pageMeta.title}
              </Typography.Title>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {controller.pageMeta.description}
              </Typography.Paragraph>
            </Space>
            {controller.pageType === "docsManual" ? (
              <Button
                onClick={() => void handleCopyMarkdown()}
                style={isCompact ? { width: "100%" } : undefined}
              >
                {t("docsManual.copyMarkdown")}
              </Button>
            ) : null}
          </div>
        </Card>
      ) : null}

      <DeveloperSecretRevealModal
        open={Boolean(controller.revealedSecret)}
        title={controller.revealedSecret?.title || ""}
        clientId={controller.revealedSecret?.clientId || ""}
        clientSecret={controller.revealedSecret?.clientSecret || ""}
        onClose={controller.closeRevealedSecret}
      />

      {controller.pageType === "dashboard" ? (
        <DeveloperDashboard
          apps={controller.items}
          auditLogs={controller.auditLogs}
        />
      ) : null}
      {controller.pageType === "profile" ? (
        <DeveloperProfile sessionToken={controller.sessionToken} />
      ) : null}
      {controller.pageType === "console" ? (
        <DeveloperConsole
          apps={controller.items}
          scopes={controller.scopeOptions}
          loading={controller.creating || Boolean(controller.editingAppId)}
          reloading={controller.reloading}
          resettingAppId={controller.resettingAppId}
          deletingAppId={controller.deletingAppId}
          onCreateApp={controller.createApp}
          onEditApp={controller.editApp}
          onReload={controller.reloadApps}
          onResetSecret={controller.resetSecret}
          onDeleteApp={controller.deleteApp}
        />
      ) : null}
      {controller.pageType === "userAccess" ? (
        <DeveloperUserAccess
          groups={controller.groups}
          managedUsers={controller.managedUsers}
          memberCandidateUsers={controller.memberCandidateUsers}
          selectedManagedUserIDs={controller.selectedManagedUserIDs}
          setSelectedManagedUserIDs={controller.setSelectedManagedUserIDs}
          managedUsersTotal={controller.managedUsersTotal}
          managedUsersPage={controller.managedUsersPage}
          managedUsersPageSize={controller.managedUsersPageSize}
          managedUsersAppID={controller.managedUsersAppID}
          managedUsersEmailKeyword={controller.managedUsersEmailKeyword}
          memberCandidateEmailKeyword={controller.memberCandidateEmailKeyword}
          accessApps={controller.accessApps}
          accessLogs={controller.accessLogs}
          accessLogsTotal={controller.accessLogsTotal}
          accessLogsPage={controller.accessLogsPage}
          accessLogsPageSize={controller.accessLogsPageSize}
          deletingAccessLogs={controller.deletingAccessLogs}
          selectedAccessLogIds={controller.selectedAccessLogIds}
          setSelectedAccessLogIds={controller.setSelectedAccessLogIds}
          onCreateGroup={controller.createGroup}
          onUpdateGroup={controller.updateGroup}
          onDeleteGroup={controller.deleteGroup}
          onManagedUsersPageChange={controller.changeManagedUsersPage}
          onManagedUsersAppFilterChange={controller.changeManagedUsersAppFilter}
          onManagedUsersGroupFilterChange={
            controller.changeManagedUsersGroupFilter
          }
          onManagedUsersEmailKeywordChange={
            controller.changeManagedUsersEmailKeyword
          }
          onMemberCandidateEmailKeywordChange={
            controller.changeMemberCandidateEmailKeyword
          }
          onBatchUpdateManagedUserGroups={
            controller.batchUpdateManagedUserGroups
          }
          onUpdateAppBindings={controller.updateAppBindings}
          onBanUser={controller.banAppUser}
          onUnbanUser={controller.unbanAppUser}
          onAccessLogsPageChange={controller.changeAccessLogsPage}
          onDeleteSelectedLogs={controller.deleteSelectedAccessLogs}
        />
      ) : null}
      {controller.pageType === "auditLogs" ? (
        <DeveloperAuditLogs
          auditLogs={controller.auditLogs}
          selectedLogIds={controller.selectedAuditLogIds}
          setSelectedLogIds={controller.setSelectedAuditLogIds}
          deleting={controller.deletingAuditLogs}
          onBatchDelete={controller.deleteSelectedAuditLogs}
          apps={controller.items}
        />
      ) : null}
      {controller.pageType === "analytics" ? (
        <DeveloperAnalytics
          analyticsApps={controller.analyticsData.apps}
          insights={controller.insights}
        />
      ) : null}
      {controller.pageType === "docsManual" ? (
        <DeveloperDocsManual scopes={controller.scopeOptions} />
      ) : null}
      {controller.pageType === "docsExamples" ? <DeveloperDocsExamples /> : null}
      {controller.pageType === "docsExamplesGo" ? (
        <DeveloperDocsExamplesGo />
      ) : null}
      {controller.pageType === "docsExamplesCsharp" ? (
        <DeveloperDocsExamplesCsharp />
      ) : null}
      {controller.pageType === "docsExamplesPHP" ? (
        <DeveloperDocsExamplesPHP />
      ) : null}
      {controller.pageType === "docsExamplesJava" ? (
        <DeveloperDocsExamplesJava />
      ) : null}
      {controller.pageType === "docsExamplesNodejs" ? (
        <DeveloperDocsExamplesNodejs />
      ) : null}
      {controller.pageType === "docsExamplesPython" ? (
        <DeveloperDocsExamplesPython />
      ) : null}
      {controller.pageType === "docsExamplesRuby" ? (
        <DeveloperDocsExamplesRuby />
      ) : null}
      {controller.pageType === "docsExamplesRust" ? (
        <DeveloperDocsExamplesRust />
      ) : null}
    </Space>
  );
}
