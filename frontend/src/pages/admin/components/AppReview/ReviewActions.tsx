import { Button } from "antd";
import { useAdminI18n } from "../../i18n";

type ReviewActionsProps = {
  onEdit: () => void;
  onHistory: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
};

export function ReviewActions({ onEdit, onHistory, onApprove, onReject, onDelete }: ReviewActionsProps) {
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
      <Button onClick={onEdit}>
        {t("编辑")}
      </Button>
      <Button onClick={onHistory}>
        {t("历史")}
      </Button>
      <Button onClick={onApprove}>
        {t("通过")}
      </Button>
      <Button onClick={onReject}>
        {t("驳回")}
      </Button>
      <Button onClick={onDelete}>
        {t("删除")}
      </Button>
    </div>
  );
}
