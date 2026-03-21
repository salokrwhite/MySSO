import { Table, Typography } from "antd";
import type { TablePaginationConfig, TableRowSelection } from "antd/es/table/interface";
import { useAdminI18n } from "../../i18n";
import type { EmailSendLog } from "../../types";

type EmailSendLogsTableProps = {
  logs: EmailSendLog[];
  pagination?: false | TablePaginationConfig;
  rowSelection?: TableRowSelection<EmailSendLog>;
};

function formatDateTime(value: string) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.replace("T", " ").replace(/Z$/, "");
  }
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  const seconds = `${date.getSeconds()}`.padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function EmailSendLogsTable({ logs, pagination, rowSelection }: EmailSendLogsTableProps) {
  const { t } = useAdminI18n();

  return (
    <Table
      rowKey="id"
      dataSource={logs}
      rowSelection={rowSelection}
      scroll={{ x: 1100 }}
      pagination={pagination ?? { pageSize: 10, showSizeChanger: true, pageSizeOptions: ["10", "20", "50", "100"] }}
      columns={[
        { title: t("时间"), dataIndex: "created_at", width: 180, render: (value: string) => formatDateTime(value) },
        {
          title: t("发信内容"),
          dataIndex: "content",
          render: (value: string) => (
            <Typography.Paragraph style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>{value || "-"}</Typography.Paragraph>
          )
        },
        { title: t("目标邮箱"), dataIndex: "target_email", width: 220, render: (value: string) => value || "-" },
        { title: t("用户账号"), dataIndex: "account_email", width: 220, render: (value: string) => value || "-" }
      ]}
    />
  );
}
