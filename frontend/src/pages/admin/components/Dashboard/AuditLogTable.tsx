import { Card, Table } from "antd";
import type { AuditLog } from "../../types";
import { useAdminI18n } from "../../i18n";

type AuditLogTableProps = {
  logs: AuditLog[];
};

export function AuditLogTable({ logs }: AuditLogTableProps) {
  const { t } = useAdminI18n();
  return (
    <Card title={t("最近审计日志")}>
      <Table
        rowKey="id"
        dataSource={logs}
        scroll={{ x: 720 }}
        pagination={{ pageSize: 5 }}
        columns={[
          { title: t("动作"), dataIndex: "action", width: 180, ellipsis: true },
          { title: t("角色"), dataIndex: "actor_role", width: 120 },
          { title: t("目标"), dataIndex: "target_id", width: 220, ellipsis: true },
          { title: t("时间"), dataIndex: "created_at", width: 180, ellipsis: true }
        ]}
      />
    </Card>
  );
}
