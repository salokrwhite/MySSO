import { Tag } from "antd";
import { useAdminI18n } from "../../i18n";

type UserStatusTagProps = {
  status: string;
  deletionScheduledAt?: string;
};

export function getUserStatusMeta(status: string, deletionScheduledAt?: string, t: (key: string) => string = (key) => key) {
  if (deletionScheduledAt) {
    return { label: t("注销中"), color: "gold", value: "deleting" };
  }
  if (status === "active") {
    return { label: t("正常"), color: "green", value: status };
  }
  if (status === "frozen") {
    return { label: t("冻结"), color: "red", value: status };
  }
  if (status === "pending") {
    return { label: t("待激活"), color: "blue", value: status };
  }
  return { label: status, color: "default", value: status };
}

export function UserStatusTag({ status, deletionScheduledAt }: UserStatusTagProps) {
  const { t } = useAdminI18n();
  const meta = getUserStatusMeta(status, deletionScheduledAt, t);
  return <Tag color={meta.color}>{meta.label}</Tag>;
}
