import { Card, Table, Tag, Typography } from "antd";
import type { TablePaginationConfig, TableRowSelection } from "antd/es/table/interface";
import type { AuditLog } from "../../types";
import { getRoleLabel } from "../../utils/roleLabel";
import { useAdminI18n } from "../../i18n";

type AuditLogTableProps = {
  logs: AuditLog[];
  title?: string;
  pagination?: false | TablePaginationConfig;
  rowSelection?: TableRowSelection<AuditLog>;
  cardless?: boolean;
};

function formatDetail(detail?: Record<string, unknown>) {
  if (!detail || Object.keys(detail).length === 0) {
    return "-";
  }
  return Object.entries(detail)
    .map(([key, value]) => `${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`)
    .join(" | ");
}

export function AuditLogTable({
  logs,
  title = "最近审计日志",
  pagination,
  rowSelection,
  cardless = false
}: AuditLogTableProps) {
  const { t } = useAdminI18n();
  const table = (
    <Table
      rowKey="id"
      dataSource={logs}
      rowSelection={rowSelection}
      scroll={{ x: 1080 }}
      pagination={pagination ?? { pageSize: 5 }}
      columns={[
        {
          title: t("动作"),
          dataIndex: "action",
          render: (value: string) => <Typography.Text code>{value}</Typography.Text>
        },
        {
          title: t("操作者"),
          dataIndex: "actor_id",
          render: (value: string) => value || "-"
        },
        {
          title: t("角色"),
          dataIndex: "actor_role",
          render: (value: string) => <Tag>{getRoleLabel(value, t)}</Tag>
        },
        {
          title: t("目标"),
          dataIndex: "target_id",
          render: (value: string) => value || "-"
        },
        {
          title: t("详情"),
          dataIndex: "detail",
          render: (value: Record<string, unknown> | undefined) => (
            <Typography.Text type="secondary">{formatDetail(value)}</Typography.Text>
          )
        },
        { title: t("时间"), dataIndex: "created_at" }
      ]}
    />
  );

  if (cardless) {
    return table;
  }

  return <Card title={t(title)}>{table}</Card>;
}
