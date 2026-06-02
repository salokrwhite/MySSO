import { Button, Space, Typography } from "antd";
import { useAdminI18n } from "../../i18n";

type BatchActionsProps = {
  selectedCount: number;
  loading: boolean;
  refreshing: boolean;
  isMobile?: boolean;
  onCreate: () => void;
  onRefresh: () => void;
  onDelete: () => void;
};

export function BatchActions({ selectedCount, loading, refreshing, isMobile = false, onCreate, onRefresh, onDelete }: BatchActionsProps) {
  const { t } = useAdminI18n();
  return (
    <Space wrap style={{ width: isMobile ? "100%" : undefined, justifyContent: isMobile ? "stretch" : undefined }}>
      <Typography.Text type="secondary">{t("已选择 {{count}} 个应用", { count: selectedCount })}</Typography.Text>
      <Button type="primary" onClick={onCreate} block={isMobile}>
        {t("创建应用")}
      </Button>
      <Button loading={refreshing} onClick={onRefresh}>
        {t("刷新")}
      </Button>
      <Button danger disabled={selectedCount === 0} loading={loading} onClick={onDelete}>
        {t("批量删除")}
      </Button>
    </Space>
  );
}
