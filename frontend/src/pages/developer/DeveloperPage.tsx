import { Alert, Card, Space, Typography } from "antd";
import { DeveloperAnalytics } from "./components/Analytics";
import { DeveloperAuditLogs } from "./components/AuditLogs";
import { DeveloperSecretRevealModal } from "./components/common/DeveloperSecretRevealModal";
import { DeveloperConsole } from "./components/Console";
import {
  DeveloperDocsExamples,
  DeveloperDocsExamplesGo,
  DeveloperDocsExamplesJava,
  DeveloperDocsExamplesNodejs,
  DeveloperDocsExamplesPHP,
  DeveloperDocsExamplesPython,
} from "./components/DocsExamples";
import { DeveloperDocsManual } from "./components/DocsManual";
import { DeveloperDashboard } from "./components/Dashboard";
import { useDeveloperPageController } from "./hooks/useDeveloperPageController";
import { useDeveloperTranslation } from "./i18n";

export function DeveloperPage() {
  const controller = useDeveloperPageController();
  const { t, ready } = useDeveloperTranslation();

  if (!ready) {
    return null;
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

      <Card>
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {controller.pageMeta.title}
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {controller.pageMeta.description}
          </Typography.Paragraph>
        </Space>
      </Card>

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
    </Space>
  );
}
