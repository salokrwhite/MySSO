import { Table, Typography } from "antd";
import type { TablePaginationConfig, TableRowSelection } from "antd/es/table/interface";
import type { PhoneSendLog } from "../../types";

type PhoneSendLogsTableProps = {
  logs: PhoneSendLog[];
  pagination?: false | TablePaginationConfig;
  rowSelection?: TableRowSelection<PhoneSendLog>;
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

export function PhoneSendLogsTable({ logs, pagination, rowSelection }: PhoneSendLogsTableProps) {
  return (
    <Table
      rowKey="id"
      dataSource={logs}
      rowSelection={rowSelection}
      scroll={{ x: 1100 }}
      pagination={pagination ?? { pageSize: 10, showSizeChanger: true, pageSizeOptions: ["10", "20", "50", "100"] }}
      columns={[
        { title: "时间", dataIndex: "created_at", width: 180, render: (value: string) => formatDateTime(value) },
        {
          title: "发信内容",
          dataIndex: "content",
          render: (value: string) => (
            <Typography.Paragraph style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>{value || "-"}</Typography.Paragraph>
          )
        },
        { title: "目标手机号", dataIndex: "target_phone", width: 220, render: (value: string) => value || "-" },
        { title: "用户账号", dataIndex: "account_email", width: 220, render: (value: string) => value || "-" }
      ]}
    />
  );
}
