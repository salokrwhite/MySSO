import { Card, Table, Tag, Typography } from "antd";
import type { DeveloperAccessLog } from "../../types";
import { BatchActions } from "../AuditLogs/BatchActions";
import { useAdminI18n } from "../../i18n";

type DeveloperAccessLogsPanelProps = {
  logs: DeveloperAccessLog[];
  logsTotal: number;
  currentPage: number;
  pageSize: number;
  selectedLogIds: string[];
  setSelectedLogIds: (value: string[]) => void;
  deletingLogs: boolean;
  refreshing: boolean;
  onPageChange: (page: number, pageSize: number) => void;
  onBatchDelete: () => void;
};

function formatDetail(detail?: Record<string, unknown>) {
  if (!detail || Object.keys(detail).length === 0) {
    return "-";
  }
  return Object.entries(detail)
    .map(([key, value]) =>
      `${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`,
    )
    .join(" | ");
}

export function DeveloperAccessLogsPanel({
  logs,
  logsTotal,
  currentPage,
  pageSize,
  selectedLogIds,
  setSelectedLogIds,
  deletingLogs,
  refreshing,
  onPageChange,
  onBatchDelete,
}: DeveloperAccessLogsPanelProps) {
  const { t } = useAdminI18n();

  return (
    <Card title={t("开发者访问日志列表")}>
      <BatchActions
        selectedCount={selectedLogIds.length}
        loading={deletingLogs}
        onDelete={onBatchDelete}
      />
      <Table
        rowKey="id"
        dataSource={logs}
        loading={refreshing}
        scroll={{ x: 1280 }}
        pagination={{
          current: currentPage,
          pageSize,
          total: logsTotal,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
          onChange: (page, nextPageSize) => onPageChange(page, nextPageSize || pageSize),
          onShowSizeChange: (_, nextPageSize) => onPageChange(1, nextPageSize),
        }}
        rowSelection={{
          selectedRowKeys: selectedLogIds,
          onChange: (selectedRowKeys) =>
            setSelectedLogIds(selectedRowKeys as string[]),
        }}
        columns={[
          {
            title: t("动作"),
            dataIndex: "action",
            render: (value: string) => <Typography.Text code>{value}</Typography.Text>,
          },
          { title: t("归属开发者"), dataIndex: "owner_user_id" },
          { title: t("操作者"), dataIndex: "actor_id" },
          {
            title: t("目标类型"),
            dataIndex: "target_type",
            render: (value: string) => <Tag>{value || "-"}</Tag>,
          },
          { title: t("目标"), dataIndex: "target_id" },
          { title: t("应用"), dataIndex: "app_id" },
          { title: t("用户"), dataIndex: "user_id" },
          { title: t("用户组"), dataIndex: "group_id" },
          {
            title: t("详情"),
            dataIndex: "detail",
            render: (value: Record<string, unknown> | undefined) => (
              <Typography.Text type="secondary">
                {formatDetail(value)}
              </Typography.Text>
            ),
          },
          { title: t("删除时间"), dataIndex: "deleted_at", render: (value?: string) => value || "-" },
          { title: t("时间"), dataIndex: "created_at" },
        ]}
      />
    </Card>
  );
}
