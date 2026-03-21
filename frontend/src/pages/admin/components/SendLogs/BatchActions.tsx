import { Button, Space, Typography } from "antd";
import { useAdminI18n } from "../../i18n";

type BatchActionsProps = {
  selectedCount: number;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onDelete: () => void;
  align?: "start" | "end";
};

export function BatchActions({ selectedCount, loading, refreshing, onRefresh, onDelete, align = "end" }: BatchActionsProps) {
  const { t } = useAdminI18n();

  return (
    <Space wrap style={{ marginBottom: 16, width: "100%", justifyContent: align === "start" ? "flex-start" : "flex-end" }}>
      <Typography.Text type="secondary">
        {t("已选择 {{count}} 条记录", { count: selectedCount })}
      </Typography.Text>
      <Button loading={refreshing} onClick={onRefresh}>
        {t("刷新")}
      </Button>
      <Button danger disabled={selectedCount === 0} loading={loading} onClick={onDelete}>
        {t("批量删除")}
      </Button>
    </Space>
  );
}
