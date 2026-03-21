import {
  Card,
  Col,
  Grid,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import { useDeveloperTranslation } from "../../i18n";
import type { DeveloperAnalyticsData, UserInsight } from "../../types";
import { statusColor, statusText } from "../../utils/status";

export function DeveloperAnalytics({
  analyticsApps,
  insights,
}: {
  analyticsApps: DeveloperAnalyticsData["apps"];
  insights: UserInsight[];
}) {
  const { t } = useDeveloperTranslation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <Row gutter={[16, 16]}>
        {insights.map((item) => (
          <Col xs={24} md={8} key={item.label}>
            <Card>
              <Statistic title={item.label} value={item.value} suffix="%" />
              <Progress
                percent={item.value}
                strokeColor={item.color}
                showInfo={false}
                style={{ marginTop: 12 }}
              />
              <Typography.Paragraph
                type="secondary"
                style={{ marginTop: 12, marginBottom: 0 }}
              >
                {item.description}
              </Typography.Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card title={t("analytics.appConversion")}>
            <Table
              rowKey="id"
              dataSource={analyticsApps}
              pagination={false}
              scroll={{ x: isMobile ? 860 : undefined }}
              columns={[
                {
                  title: t("analytics.columns.app"),
                  dataIndex: "name",
                  width: 180,
                  ellipsis: true,
                },
                {
                  title: t("analytics.columns.status"),
                  width: 100,
                  dataIndex: "status",
                  render: (value: string) => (
                    <Tag color={statusColor(value)}>{statusText(value, t)}</Tag>
                  ),
                },
                {
                  title: t("analytics.columns.authorizationCount"),
                  dataIndex: "authorization_count",
                  width: 110,
                },
                {
                  title: t("analytics.columns.tokenExchangeCount"),
                  dataIndex: "token_exchange_count",
                  width: 130,
                },
                {
                  title: t("analytics.columns.activeUserCount"),
                  dataIndex: "active_user_count",
                  width: 120,
                },
                {
                  title: t("analytics.columns.successRate"),
                  width: 100,
                  dataIndex: "success_rate",
                  render: (value: number) => `${value}%`,
                },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card title={t("analytics.explanation")}>
            <Space direction="vertical" size={12}>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {t("analytics.explanation1")}
              </Typography.Paragraph>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {t("analytics.explanation2")}
              </Typography.Paragraph>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {t("analytics.explanation3")}
              </Typography.Paragraph>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
