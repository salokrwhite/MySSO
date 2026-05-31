import { Button } from "antd";
import { useAdminI18n } from "../../i18n";

type ReviewActionsProps = {
  adminOwned?: boolean;
  adminCreated?: boolean;
  hasSecret?: boolean;
  disabled?: boolean;
  onDetail: () => void;
  onEdit: () => void;
  onHistory: () => void;
  onResetSecret: () => void;
  onSetDisabled: (disabled: boolean) => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
};

export function ReviewActions({
  adminOwned,
  adminCreated,
  hasSecret,
  disabled,
  onDetail,
  onEdit,
  onHistory,
  onResetSecret,
  onSetDisabled,
  onApprove,
  onReject,
  onDelete
}: ReviewActionsProps) {
  const { t } = useAdminI18n();
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, max-content)",
        gap: 8,
        justifyContent: "start",
        alignItems: "start",
      }}
    >
      <Button onClick={onDetail}>
        {t("详情")}
      </Button>
      <Button onClick={onEdit}>
        {t("编辑")}
      </Button>
      <Button onClick={onHistory}>
        {t("历史")}
      </Button>
      {adminCreated ? (
        <>
          <Button disabled={!adminOwned || disabled} onClick={onResetSecret}>
            {hasSecret ? t("重置密钥") : t("创建密钥")}
          </Button>
          <Button disabled={!adminOwned} danger={!disabled} onClick={() => onSetDisabled(!disabled)}>
            {disabled ? t("启用") : t("禁用")}
          </Button>
        </>
      ) : (
        <>
          <Button onClick={onApprove}>
            {t("通过")}
          </Button>
          <Button onClick={onReject}>
            {t("驳回")}
          </Button>
        </>
      )}
      <Button onClick={onDelete}>
        {t("删除")}
      </Button>
    </div>
  );
}
