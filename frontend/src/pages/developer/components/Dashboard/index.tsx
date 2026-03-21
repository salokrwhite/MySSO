import {
  AppstoreOutlined,
  BarChartOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import {
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Space,
  Statistic,
  Timeline,
  Typography,
} from "antd";
import { developerLocaleKey, useDeveloperTranslation } from "../../i18n";
import type { AppItem, DeveloperAuditLog } from "../../types";
import {
  buildDeveloperAuditEvent,
  normalizeAuditValue,
} from "../../utils/auditEvents";
import { formatTimeLabel } from "../../utils/time";

export function DeveloperDashboard({
  apps,
  auditLogs,
}: {
  apps: AppItem[];
  auditLogs: DeveloperAuditLog[];
}) {
  const { t, i18n } = useDeveloperTranslation();
  const locale = developerLocaleKey(i18n.language);
  const approvedApps = apps.filter((item) => item.status === "approved").length;
  const pendingApps = apps.filter((item) => item.status === "pending").length;
  const totalScopes = apps.reduce((sum, item) => sum + item.scopes.length, 0);
  const recentEvents = auditLogs.slice(0, 4).map((item) => {
    const fallbackName =
      normalizeAuditValue(item.detail?.name) ||
      normalizeAuditValue(item.detail?.client_id) ||
      t("common.unnamedTarget");
    const targetName =
      apps.find((app) => app.id === item.target_id)?.name ||
      item.target_id ||
      fallbackName;

    return buildDeveloperAuditEvent(item, targetName, t);
  });

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={6}>
          <Card>
            <Statistic
              title={t("dashboard.appCount")}
              value={apps.length}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card>
            <Statistic
              title={t("dashboard.approvedCount")}
              value={approvedApps}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card>
            <Statistic
              title={t("dashboard.pendingCount")}
              value={pendingApps}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card>
            <Statistic
              title={t("dashboard.scopeCount")}
              value={totalScopes}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card title={t("dashboard.overview")}>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <div>
                <Typography.Text strong>{t("dashboard.progress")}</Typography.Text>
                <Progress
                  percent={
                    apps.length === 0 ? 0 : Math.round((approvedApps / apps.length) * 100)
                  }
                  status="active"
                />
              </div>
              <div>
                <Typography.Text strong>{t("dashboard.currentFocus")}</Typography.Text>
                <Typography.Paragraph
                  type="secondary"
                  style={{ marginTop: 8, marginBottom: 0 }}
                >
                  {t("dashboard.currentFocusDesc")}
                </Typography.Paragraph>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card title={t("dashboard.recentActivity")}>
            {recentEvents.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("dashboard.noActivity")}
              />
            ) : (
              <Timeline
                items={recentEvents.map((item) => ({
                  color: item.categoryColor === "red"
                    ? "red"
                    : item.categoryColor === "green"
                      ? "green"
                      : item.categoryColor === "volcano"
                        ? "orange"
                        : "blue",
                  children: (
                    <Space direction="vertical" size={4}>
                      <Space size={8} wrap>
                        <Typography.Text strong>{item.title}</Typography.Text>
                        <Typography.Text type="secondary">
                          {item.targetName}
                        </Typography.Text>
                      </Space>
                      <Typography.Text type="secondary">
                        {item.summary}
                      </Typography.Text>
                      <Typography.Text type="secondary">
                        {formatTimeLabel(item.createdAt, locale)}
                      </Typography.Text>
                    </Space>
                  ),
                }))}
              />
            )}
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
