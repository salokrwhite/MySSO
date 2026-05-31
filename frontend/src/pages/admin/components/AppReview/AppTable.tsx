import { Table, Tag } from "antd";
import type { AppItem } from "../../types";
import { ReviewActions } from "./ReviewActions";
import { useAdminI18n } from "../../i18n";

type AppTableProps = {
  apps: AppItem[];
  total: number;
  currentPage: number;
  pageSize: number;
  selectedAppIds: string[];
  setSelectedAppIds: (value: string[]) => void;
  loading: boolean;
  onPageChange: (page: number, pageSize: number) => void;
  onReview: (id: string, approved: boolean) => void;
  onDelete: (app: AppItem) => void;
  onDetail: (app: AppItem) => void;
  onEdit: (app: AppItem) => void;
  onHistory: (app: AppItem) => void;
  onResetSecret: (app: AppItem) => void;
  onSetDisabled: (app: AppItem, disabled: boolean) => void;
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
    case "disabled":
      return t("已禁用");
    default:
      return status;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "approved":
      return "green";
    case "rejected":
      return "red";
    case "disabled":
      return "default";
    default:
      return "gold";
  }
}

export function AppTable({
  apps,
  total,
  currentPage,
  pageSize,
  selectedAppIds,
  setSelectedAppIds,
  loading,
  onPageChange,
  onReview,
  onDelete,
  onDetail,
  onEdit,
  onHistory,
  onResetSecret,
  onSetDisabled,
}: AppTableProps) {
  const { t } = useAdminI18n();
  return (
    <Table
      rowKey="id"
      dataSource={apps}
      loading={loading}
      pagination={{
        current: currentPage,
        pageSize,
        total,
        showSizeChanger: true,
        pageSizeOptions: [10, 20, 50, 100],
        onChange: onPageChange,
        showTotal: (count) => t("共 {{count}} 条", { count: String(count) }),
      }}
      scroll={{ x: 1120 }}
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
            <Tag color={getStatusColor(value)}>{getStatusText(value, t)}</Tag>
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
          width: 360,
          render: (_, record: AppItem) => (
            <ReviewActions
              adminOwned={Boolean(record.admin_owned)}
              adminCreated={Boolean(record.admin_created)}
              hasSecret={Boolean(record.has_client_secret)}
              disabled={record.status === "disabled"}
              onDetail={() => onDetail(record)}
              onEdit={() => onEdit(record)}
              onHistory={() => onHistory(record)}
              onResetSecret={() => onResetSecret(record)}
              onSetDisabled={(disabled) => onSetDisabled(record, disabled)}
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
