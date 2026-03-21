import { Descriptions, Modal, Typography } from "antd";
import { getCountries } from "../../../../utils/countries";
import { useAdminI18n } from "../../i18n";
import type { User } from "../../types";
import { getRoleLabel } from "../../utils/roleLabel";
import { UserStatusTag } from "./UserStatusTag";

function formatCountry(value?: string, locale?: string) {
  if (!value) {
    return "-";
  }
  const countryLabelByCode = new Map(
    getCountries(locale).map((item) => [item.value, item.label]),
  );
  return countryLabelByCode.get(value) || value;
}

type UserDetailModalProps = {
  open: boolean;
  user?: User;
  onCancel: () => void;
};

function formatDateTime(value: string | undefined, locale: "zh-CN" | "en-US") {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export function UserDetailModal({
  open,
  user,
  onCancel,
}: UserDetailModalProps) {
  const { t, locale } = useAdminI18n();

  return (
    <Modal
      title={t("用户详情")}
      open={open}
      footer={null}
      onCancel={onCancel}
      destroyOnHidden
      width={720}
    >
      {user ? (
        <>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
            {t("可查看用户当前状态、通行密钥与注销时间信息。")}
          </Typography.Paragraph>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label={t("用户 ID")}>{user.id}</Descriptions.Item>
            <Descriptions.Item label={t("邮箱")}>{user.email}</Descriptions.Item>
            <Descriptions.Item label={t("显示名称")}>
              {user.display_name || "-"}
            </Descriptions.Item>
            <Descriptions.Item label={t("手机号")}>
              {user.phone || "-"}
            </Descriptions.Item>
            <Descriptions.Item label={t("国家/地区")}>
              {formatCountry(user.country, locale)}
            </Descriptions.Item>
            <Descriptions.Item label={t("语言偏好")}>
              {user.preferred_locale || "-"}
            </Descriptions.Item>
            <Descriptions.Item label={t("性别")}>
              {user.gender === "male"
                ? t("男")
                : user.gender === "female"
                  ? t("女")
                  : user.gender === "other"
                    ? t("其他")
                    : user.gender || "-"}
            </Descriptions.Item>
            <Descriptions.Item label={t("角色")}>
              {getRoleLabel(user.role, t)}
            </Descriptions.Item>
            <Descriptions.Item label={t("状态")}>
              <UserStatusTag
                status={user.status}
                deletionScheduledAt={user.deletion_scheduled_at}
              />
            </Descriptions.Item>
            <Descriptions.Item label={t("冻结理由")}>
              {user.status === "frozen" ? user.freeze_reason || "-" : "-"}
            </Descriptions.Item>
            <Descriptions.Item label={t("MFA")}>
              {user.mfa_enabled ? t("已开启") : t("未开启")}
            </Descriptions.Item>
            <Descriptions.Item label={t("通行密钥")}>
              {user.passkey_enabled
                ? t("已设置 ({{count}})", { count: user.passkey_count || 0 })
                : t("未设置")}
            </Descriptions.Item>
            <Descriptions.Item label={t("授权应用数量")}>
              {user.authorized_app_count || 0}
            </Descriptions.Item>
            <Descriptions.Item label={t("注册时间")}>
              {formatDateTime(user.created_at, locale)}
            </Descriptions.Item>
            <Descriptions.Item label={t("申请注销时间")}>
              {formatDateTime(user.deletion_requested_at, locale)}
            </Descriptions.Item>
            <Descriptions.Item label={t("预计注销完成时间")}>
              {formatDateTime(user.deletion_scheduled_at, locale)}
            </Descriptions.Item>
          </Descriptions>
        </>
      ) : null}
    </Modal>
  );
}
