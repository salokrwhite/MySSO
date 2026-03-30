import { Card, Table, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import type { DeveloperAccessLog } from "../../types";
import { BatchActions } from "../AuditLogs/BatchActions";
import { useAdminI18n } from "../../i18n";

type DeveloperAccessLogsPanelProps = {
  logs: DeveloperAccessLog[];
  selectedLogIds: string[];
  setSelectedLogIds: (value: string[]) => void;
  deletingLogs: boolean;
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
  selectedLogIds,
  setSelectedLogIds,
  deletingLogs,
  onBatchDelete,
}: DeveloperAccessLogsPanelProps) {
  const { t } = useAdminI18n();
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(logs.length / pageSize));
    if (current > maxPage) {
      setCurrent(maxPage);
    }
  }, [current, logs.length, pageSize]);

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
        scroll={{ x: 1280 }}
        pagination={{
          current,
          pageSize,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          onChange: (page, nextPageSize) => {
            setCurrent(page);
            if (nextPageSize && nextPageSize !== pageSize) {
              setPageSize(nextPageSize);
            }
          },
          onShowSizeChange: (_, nextPageSize) => {
            setCurrent(1);
            setPageSize(nextPageSize);
          },
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
