import { Card, Table } from "antd";
import type { Policy } from "../../types";
import { useAdminI18n } from "../../i18n";

type PolicyTableProps = {
  policies: Policy[];
};

export function PolicyTable({ policies }: PolicyTableProps) {
  const { t } = useAdminI18n();
  return (
    <Card title={t("网关策略")}>
      <Table
        rowKey="id"
        dataSource={policies}
        pagination={false}
        scroll={{ x: 760 }}
        columns={[
          { title: t("名称"), dataIndex: "name", width: 180, ellipsis: true },
          { title: "Method", dataIndex: "method", width: 120 },
          { title: "Path", dataIndex: "path", width: 220, ellipsis: true },
          {
            title: "Scopes",
            dataIndex: "scopes",
            width: 240,
            render: (value: string[]) => value.join(", ")
          }
        ]}
      />
    </Card>
  );
}
