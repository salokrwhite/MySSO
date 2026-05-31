import { Button, Grid, Input, Select, Space, Typography } from "antd";
import { useAdminI18n } from "../../i18n";

type BatchActionsProps = {
  selectedCount: number;
  loading: boolean;
  refreshing: boolean;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  emailKeyword: string;
  onEmailKeywordChange: (value: string) => void;
  userIDKeyword: string;
  onUserIDKeywordChange: (value: string) => void;
  onRefresh: () => void;
  onFreeze: () => void;
  onUnfreeze: () => void;
  onDelete: () => void;
};

export function BatchActions({
  selectedCount,
  loading,
  refreshing,
  statusFilter,
  onStatusFilterChange,
  emailKeyword,
  onEmailKeywordChange,
  userIDKeyword,
  onUserIDKeywordChange,
  onRefresh,
  onFreeze,
  onUnfreeze,
  onDelete
}: BatchActionsProps) {
  const { t } = useAdminI18n();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  return (
    <div
      style={{
        marginBottom: 16,
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: isMobile ? "stretch" : "center",
        flexDirection: isMobile ? "column" : "row",
        gap: 12,
        flexWrap: "wrap"
      }}
    >
      <Space wrap direction={isMobile ? "vertical" : "horizontal"} style={{ width: isMobile ? "100%" : undefined }}>
        <Select
          value={statusFilter}
          style={{ width: isMobile ? "100%" : 180 }}
          onChange={onStatusFilterChange}
          options={[
            { label: t("全部状态"), value: "all" },
            { label: t("正常"), value: "active" },
            { label: t("冻结"), value: "frozen" },
            { label: t("待激活"), value: "pending" },
            { label: t("注销中"), value: "deleting" }
          ]}
        />
        <Input.Search
          allowClear
          value={emailKeyword}
          placeholder={t("搜索用户邮箱")}
          style={{ width: isMobile ? "100%" : 260 }}
          onChange={(event) => onEmailKeywordChange(event.target.value)}
        />
        <Input.Search
          allowClear
          value={userIDKeyword}
          placeholder={t("输入用户 ID 精确搜索")}
          style={{ width: isMobile ? "100%" : 260 }}
          onChange={(event) => onUserIDKeywordChange(event.target.value)}
        />
      </Space>

      <Space wrap style={{ width: isMobile ? "100%" : undefined, justifyContent: isMobile ? "flex-start" : "flex-end" }}>
        <Typography.Text type="secondary">{t("已选择 {{count}} 个用户", { count: selectedCount })}</Typography.Text>
        <Button loading={refreshing} onClick={onRefresh}>
          {t("刷新")}
        </Button>
        <Button disabled={selectedCount === 0} loading={loading} onClick={onFreeze}>
          {t("批量封禁")}
        </Button>
        <Button disabled={selectedCount === 0} loading={loading} onClick={onUnfreeze}>
          {t("批量解封")}
        </Button>
        <Button danger disabled={selectedCount === 0} loading={loading} onClick={onDelete}>
          {t("批量删除")}
        </Button>
      </Space>
    </div>
  );
}
