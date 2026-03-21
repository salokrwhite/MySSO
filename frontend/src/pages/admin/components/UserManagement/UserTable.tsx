import { Button, Grid, Space, Table, Typography } from "antd";
import { countries } from "../../../../utils/countries";
import type { User } from "../../types";
import { getRoleLabel } from "../../utils/roleLabel";
import { UserStatusTag } from "./UserStatusTag";
import { useAdminI18n } from "../../i18n";

const countryLabelByCode = new Map(
  countries.map((item) => [item.value, item.label]),
);

function formatCountry(value?: string) {
  if (!value) {
    return "-";
  }
  return countryLabelByCode.get(value) || value;
}

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

function formatGender(value: string | undefined, t: (key: string) => string) {
  switch ((value || "").trim().toLowerCase()) {
    case "male":
      return t("男");
    case "female":
      return t("女");
    case "other":
      return t("其他");
    default:
      return value || "-";
  }
}

type UserTableProps = {
  users: User[];
  selectedUserIds: string[];
  setSelectedUserIds: (value: string[]) => void;
  onToggleFreeze: (id: string, frozen: boolean) => void;
  onOpenDetail: (user: User) => void;
  onOpenAuthorizedApps: (user: User) => void;
  onOpenEdit: (user: User) => void;
  onOpenSecurityPolicy: (user: User) => void;
  onOpenAnnouncement: (user: User) => void;
  onOpenOperationLogs: (user: User) => void;
};

export function UserTable({
  users,
  selectedUserIds,
  setSelectedUserIds,
  onToggleFreeze,
  onOpenDetail,
  onOpenAuthorizedApps,
  onOpenEdit,
  onOpenSecurityPolicy,
  onOpenAnnouncement,
  onOpenOperationLogs,
}: UserTableProps) {
  const { t, locale } = useAdminI18n();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Table
      rowKey="id"
      dataSource={users}
      pagination={false}
      scroll={{ x: "max-content" }}
      rowSelection={{
        selectedRowKeys: selectedUserIds,
        onChange: (selectedRowKeys) =>
          setSelectedUserIds(selectedRowKeys as string[]),
        fixed: !isMobile,
        getCheckboxProps: (record: User) => ({
          disabled: record.role === "admin",
        }),
      }}
      columns={[
        {
          title: t("用户 ID"),
          dataIndex: "id",
          width: 260,
          render: (value: string) => (
            <Space size={6}>
              <Typography.Text ellipsis style={{ maxWidth: 170 }}>
                {value}
              </Typography.Text>
              <Typography.Text
                copyable={{ text: value }}
                style={{ marginInlineStart: 0 }}
              />
            </Space>
          ),
        },
        { title: t("邮箱"), dataIndex: "email", width: 220, ellipsis: true },
        {
          title: t("显示名称"),
          dataIndex: "display_name",
          width: 150,
          render: (value?: string) => value || "-",
        },
        {
          title: t("性别"),
          dataIndex: "gender",
          width: 100,
          render: (value?: string) => formatGender(value, t),
        },
        {
          title: t("国家/地区"),
          dataIndex: "country",
          width: 120,
          render: (value?: string) => formatCountry(value),
        },
        {
          title: t("语言偏好"),
          dataIndex: "preferred_locale",
          width: 120,
          render: (value?: string) => value || "-",
        },
        {
          title: t("最后登录 IP"),
          dataIndex: "last_device_ip",
          width: 160,
          render: (value?: string) => value || "-",
        },
        {
          title: t("注册时间"),
          dataIndex: "created_at",
          width: 190,
          render: (value?: string) => formatDateTime(value, locale),
        },
        {
          title: t("角色"),
          dataIndex: "role",
          width: 110,
          render: (value: string) => getRoleLabel(value, t),
        },
        {
          title: t("状态"),
          dataIndex: "status",
          width: 140,
          render: (value: string, record: User) => (
            <UserStatusTag
              status={value}
              deletionScheduledAt={record.deletion_scheduled_at}
            />
          ),
        },
        {
          title: t("MFA"),
          dataIndex: "mfa_enabled",
          width: 100,
          render: (value: boolean) => (value ? t("已开启") : t("未开启")),
        },
        {
          title: t("通行密钥"),
          dataIndex: "passkey_count",
          width: 130,
          render: (value: number | undefined, record: User) => {
            const count = value || 0;
            return record.passkey_enabled ? t("已设置 ({{count}})", { count }) : t("未设置");
          },
        },
        {
          title: t("授权应用"),
          dataIndex: "authorized_app_count",
          width: 140,
          render: (value: number | undefined, record: User) => (
            <Space size={8}>
              <span>{value || 0}</span>
              <Button
                size="small"
                type="link"
                onClick={() => onOpenAuthorizedApps(record)}
              >
                {t("详情")}
              </Button>
            </Space>
          ),
        },
        {
          title: t("操作"),
          key: "actions",
          fixed: isMobile ? undefined : "right",
          render: (_, record: User) => (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, max-content)",
                gap: 8,
                justifyContent: "start",
                alignItems: "start",
              }}
            >
              <Button onClick={() => onOpenDetail(record)}>
                {t("详情")}
              </Button>
              <Button onClick={() => onOpenEdit(record)}>
                {t("编辑")}
              </Button>
              <Button onClick={() => onOpenSecurityPolicy(record)}>
                {t("安全策略")}
              </Button>
              <Button
                disabled={
                  record.role === "admin" ||
                  Boolean(record.deletion_scheduled_at)
                }
                onClick={() =>
                  onToggleFreeze(record.id, record.status === "active")
                }
              >
                {record.status === "active"
                  ? t("冻结")
                  : record.status === "frozen"
                    ? t("解冻")
                    : t("激活")}
              </Button>
              <Button onClick={() => onOpenAnnouncement(record)}>
                {t("发公告")}
              </Button>
              <Button onClick={() => onOpenOperationLogs(record)}>
                {t("操作日志")}
              </Button>
            </div>
          ),
        },
      ]}
    />
  );
}
