import { Table, Tag } from "antd";
import type { AppItem } from "../../types";
import { ReviewActions } from "./ReviewActions";
import { useAdminI18n } from "../../i18n";

type AppTableProps = {
  apps: AppItem[];
  selectedAppIds: string[];
  setSelectedAppIds: (value: string[]) => void;
  onReview: (id: string, approved: boolean) => void;
  onDelete: (app: AppItem) => void;
  onEdit: (app: AppItem) => void;
  onHistory: (app: AppItem) => void;
};

function formatReviewComment(
  value: string | undefined,
  t: (key: string) => string,
) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return "-";
  }
  if (normalized === "审核通过") {
    return t("审核通过");
  }
  return normalized;
}

function getStatusText(status: string, t: (key: string) => string) {
  switch (status) {
    case "approved":
      return t("已通过");
    case "rejected":
      return t("已驳回");
    case "pending_review":
      return t("待审核");
    default:
      return status;
  }
}

export function AppTable({ apps, selectedAppIds, setSelectedAppIds, onReview, onDelete, onEdit, onHistory }: AppTableProps) {
  const { t } = useAdminI18n();
  return (
    <Table
      rowKey="id"
      dataSource={apps}
      pagination={false}
      scroll={{ x: 980 }}
      rowSelection={{
        selectedRowKeys: selectedAppIds,
        onChange: (selectedRowKeys) => setSelectedAppIds(selectedRowKeys as string[])
      }}
      columns={[
        { title: t("应用"), dataIndex: "name", width: 180, ellipsis: true },
        { title: t("描述"), dataIndex: "description", width: 220, ellipsis: true, render: (value?: string) => value || "-" },
        { title: "Client ID", dataIndex: "client_id", width: 220, ellipsis: true },
        {
          title: t("状态"),
          width: 100,
          dataIndex: "status",
          render: (value: string) => (
            <Tag color={value === "approved" ? "green" : value === "rejected" ? "red" : "gold"}>{getStatusText(value, t)}</Tag>
          )
        },
        {
          title: t("意见"),
          dataIndex: "review_comment",
          width: 180,
          ellipsis: true,
          render: (value?: string) => formatReviewComment(value, t),
        },
        {
          title: t("操作"),
          width: 250,
          render: (_, record: AppItem) => (
            <ReviewActions
              onEdit={() => onEdit(record)}
              onHistory={() => onHistory(record)}
              onApprove={() => onReview(record.id, true)}
              onReject={() => onReview(record.id, false)}
              onDelete={() => onDelete(record)}
            />
          )
        }
      ]}
    />
  );
}
