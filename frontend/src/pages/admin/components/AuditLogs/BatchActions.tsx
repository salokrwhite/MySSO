import { Button, Space, Typography } from "antd";
import { useAdminI18n } from "../../i18n";

type BatchActionsProps = {
  selectedCount: number;
  loading: boolean;
  onDelete: () => void;
};

export function BatchActions({ selectedCount, loading, onDelete }: BatchActionsProps) {
  const { t } = useAdminI18n();
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
      <Space wrap style={{ justifyContent: "flex-end" }}>
        <Typography.Text type="secondary">{t("已选择 {{count}} 条日志", { count: selectedCount })}</Typography.Text>
        <Button danger disabled={selectedCount === 0} loading={loading} onClick={onDelete}>
          {t("批量删除")}
        </Button>
      </Space>
    </div>
  );
}
