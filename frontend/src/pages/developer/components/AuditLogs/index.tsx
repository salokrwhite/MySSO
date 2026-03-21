import {
  Button,
  Card,
  Col,
  Descriptions,
  Modal,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import { useMemo, useState } from "react";
import { developerLocaleKey, useDeveloperTranslation } from "../../i18n";
import type {
  AppItem,
  DeveloperAuditEventRecord,
  DeveloperAuditLog,
} from "../../types";
import {
  buildDeveloperAuditEvent,
  normalizeAuditValue,
} from "../../utils/auditEvents";
import { formatTimeLabel } from "../../utils/time";

export function DeveloperAuditLogs({
  auditLogs,
  selectedLogIds,
  setSelectedLogIds,
  deleting,
  onBatchDelete,
  apps,
}: {
  auditLogs: DeveloperAuditLog[];
  selectedLogIds: string[];
  setSelectedLogIds: (value: string[]) => void;
  deleting: boolean;
  onBatchDelete: () => void | Promise<void>;
  apps: AppItem[];
}) {
  const { t, i18n } = useDeveloperTranslation();
  const locale = developerLocaleKey(i18n.language);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeEvent, setActiveEvent] = useState<DeveloperAuditEventRecord>();

  function resolveTargetName(targetID: string) {
    return (
      apps.find((item) => item.id === targetID)?.name ||
      targetID ||
      t("common.unnamedTarget")
    );
  }

  const eventRecords = useMemo(
    () =>
      auditLogs.map((log) => {
        const fallbackName =
          normalizeAuditValue(log.detail?.name) ||
          normalizeAuditValue(log.detail?.client_id);
        const targetName =
          resolveTargetName(log.target_id) ||
          fallbackName ||
          t("common.unnamedTarget");
        return buildDeveloperAuditEvent(log, targetName, t);
      }),
    [apps, auditLogs, t],
  );

  const reviewCount = eventRecords.filter(
    (item) => item.category === t("audit.categories.reviewResult"),
  ).length;
  const securityCount = eventRecords.filter(
    (item) =>
      item.category === t("audit.categories.securityAction") ||
      item.category === t("audit.categories.securityAlert"),
  ).length;
  const integrationCount = eventRecords.filter(
    (item) => item.category === t("audit.categories.integrationEvent"),
  ).length;

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="developer-audit-summary-card">
            <Statistic title={t("audit.summaryReview")} value={reviewCount} />
            <Typography.Paragraph
              type="secondary"
              style={{ marginBottom: 0, marginTop: 8 }}
            >
              {t("audit.summaryReviewDesc")}
            </Typography.Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="developer-audit-summary-card">
            <Statistic title={t("audit.summarySecurity")} value={securityCount} />
            <Typography.Paragraph
              type="secondary"
              style={{ marginBottom: 0, marginTop: 8 }}
            >
              {t("audit.summarySecurityDesc")}
            </Typography.Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="developer-audit-summary-card">
            <Statistic
              title={t("audit.summaryIntegration")}
              value={integrationCount}
            />
            <Typography.Paragraph
              type="secondary"
              style={{ marginBottom: 0, marginTop: 8 }}
            >
              {t("audit.summaryIntegrationDesc")}
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>

      <Card
        title={t("audit.title")}
        extra={
          <Button
            danger
            disabled={selectedLogIds.length === 0}
            loading={deleting}
            onClick={() => void onBatchDelete()}
          >
            {t("common.batchDelete")}
          </Button>
        }
      >
        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          {t("audit.hint")}
        </Typography.Paragraph>
        <Table
          className="developer-audit-log-table"
          rowKey="id"
          dataSource={eventRecords}
          rowSelection={{
            selectedRowKeys: selectedLogIds,
            onChange: (selectedRowKeys) =>
              setSelectedLogIds(selectedRowKeys as string[]),
          }}
          pagination={{
            current: page,
            pageSize,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            },
            onShowSizeChange: (_, nextPageSize) => {
              setPage(1);
              setPageSize(nextPageSize);
            },
          }}
          scroll={{ x: 1240 }}
          columns={[
            {
              title: t("audit.columns.event"),
              dataIndex: "title",
              width: 220,
              render: (_, record: DeveloperAuditEventRecord) => (
                <Space direction="vertical" size={6}>
                  <Space size={8} wrap>
                    <Tag color={record.categoryColor}>{record.category}</Tag>
                    <Tag color={record.statusColor}>{record.statusText}</Tag>
                  </Space>
                  <Typography.Text strong>{record.title}</Typography.Text>
                </Space>
              ),
            },
            {
              title: t("audit.columns.target"),
              dataIndex: "targetName",
              width: 200,
              ellipsis: true,
              render: (value: string) => (
                <Typography.Text ellipsis={{ tooltip: value }}>
                  {value}
                </Typography.Text>
              ),
            },
            {
              title: t("audit.columns.summary"),
              dataIndex: "summary",
              width: 560,
              render: (value: string) => (
                <Typography.Paragraph
                  className="developer-audit-log-summary"
                  style={{ marginBottom: 0 }}
                  ellipsis={{
                    rows: 2,
                    expandable: "collapsible",
                    symbol: t("common.details"),
                  }}
                >
                  {value}
                </Typography.Paragraph>
              ),
            },
            {
              title: t("audit.columns.time"),
              dataIndex: "createdAt",
              width: 180,
              render: (value: string) => (
                <Typography.Text className="developer-audit-log-time">
                  {formatTimeLabel(value, locale)}
                </Typography.Text>
              ),
            },
            {
              title: t("audit.columns.details"),
              dataIndex: "id",
              width: 120,
              render: (_, record: DeveloperAuditEventRecord) => (
                <Button type="link" onClick={() => setActiveEvent(record)}>
                  {t("common.details")}
                </Button>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={
          activeEvent
            ? t("audit.detailModalTitle", { title: activeEvent.title })
            : t("common.details")
        }
        open={Boolean(activeEvent)}
        footer={null}
        width={760}
        onCancel={() => setActiveEvent(undefined)}
      >
        {activeEvent ? (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label={t("audit.eventLabel")}>
                {activeEvent.title}
              </Descriptions.Item>
              <Descriptions.Item label={t("audit.categoryLabel")}>
                <Space size={8} wrap>
                  <Tag color={activeEvent.categoryColor}>{activeEvent.category}</Tag>
                  <Tag color={activeEvent.statusColor}>{activeEvent.statusText}</Tag>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label={t("audit.targetLabel")}>
                {activeEvent.targetName}
              </Descriptions.Item>
              <Descriptions.Item label={t("audit.timeLabel")}>
                {formatTimeLabel(activeEvent.createdAt, locale)}
              </Descriptions.Item>
              <Descriptions.Item label={t("audit.summaryLabel")}>
                {activeEvent.summary}
              </Descriptions.Item>
              <Descriptions.Item label={t("audit.rawActionLabel")}>
                <Typography.Text code>{activeEvent.rawAction}</Typography.Text>
              </Descriptions.Item>
            </Descriptions>
            <div>
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                {t("audit.technicalDetails")}
              </Typography.Title>
              <pre className="developer-audit-log-detail-panel">
                {activeEvent.detailText}
              </pre>
            </div>
          </Space>
        ) : null}
      </Modal>
    </Space>
  );
}
