import {
  Button,
  DatePicker,
  Descriptions,
  Empty,
  List,
  Modal,
  Pagination,
  Space,
  Timeline,
  Typography,
  message,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import {
  deleteUserOperationLogs,
  listUserOperationLogs,
} from "../../services/adminApi";
import { useAdminI18n } from "../../i18n";
import type { User, UserOperationLog } from "../../types";

const pageSizeOptions = ["10", "20", "50", "100"];

type UserOperationLogsModalProps = {
  open: boolean;
  sessionToken: string;
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
    hour12: false,
  }).format(date);
}

function formatAction(action: string, t: (key: string) => string) {
  switch (action) {
    case "user.login":
      return t("用户登录");
    case "oauth.consent.grant":
      return t("用户授权应用");
    case "oauth.consent.revoke":
      return t("撤销应用授权");
    case "user.profile.update_display_name":
      return t("修改显示名称");
    case "user.profile.update_gender":
      return t("修改性别");
    case "user.profile.update_preferred_locale":
      return t("修改语言偏好");
    case "user.profile.update_email":
      return t("修改邮箱");
    case "user.profile.update_phone":
      return t("修改手机号");
    case "user.profile.update_password":
      return t("修改密码");
    case "user.profile.update_mfa":
      return t("修改 MFA");
    case "user.profile.update_avatar":
      return t("修改头像");
    case "user.passkey.create":
      return t("绑定 Passkey");
    case "user.passkey.delete":
      return t("删除 Passkey");
    case "user.password.reset_by_email":
      return t("邮箱重置密码");
    case "user.account.deletion_requested":
      return t("申请注销账号");
    case "user.privacy.export_data":
      return t("导出个人数据");
    default:
      return action;
  }
}

function renderDetailValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0 ? JSON.stringify(value) : "-";
  }
  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return String(value);
}

export function UserOperationLogsModal({
  open,
  sessionToken,
  user,
  onCancel,
}: UserOperationLogsModalProps) {
  const { t, locale } = useAdminI18n();
  const [messageApi, contextHolder] = message.useMessage();
  const [logs, setLogs] = useState<UserOperationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  useEffect(() => {
    if (!open) {
      setLogs([]);
      setPage(1);
      setPageSize(10);
      setTotal(0);
      setRange(null);
      return;
    }
    if (!user) {
      return;
    }
    setPage(1);
  }, [open, user]);

  useEffect(() => {
    if (!open || !user) {
      return;
    }
    let cancelled = false;
    setLoading(true);
    void listUserOperationLogs(sessionToken, user.id, page, pageSize)
      .then((result) => {
        if (cancelled) {
          return;
        }
        setLogs(result.items);
        setTotal(result.total);
      })
      .catch((err) => {
        if (!cancelled) {
          messageApi.error(
            err instanceof Error ? err.message : t("加载用户操作日志失败"),
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [messageApi, open, page, pageSize, sessionToken, t, user]);

  const timelineItems = useMemo(
    () =>
      logs.map((log) => {
        const detailEntries = Object.entries(log.detail || {});
        return {
          children: (
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Space size={8} wrap>
                  <Typography.Text strong>
                    {formatAction(log.action, t)}
                  </Typography.Text>
                <Typography.Text type="secondary">
                  {formatDateTime(log.created_at, locale)}
                </Typography.Text>
              </Space>
              {detailEntries.length > 0 ? (
                <List
                  size="small"
                  bordered
                  dataSource={detailEntries}
                  renderItem={([key, value]) => (
                    <List.Item>
                      <Space
                        direction="vertical"
                        size={2}
                        style={{ width: "100%" }}
                      >
                        <Typography.Text strong>{key}</Typography.Text>
                        <Typography.Text type="secondary">
                          {renderDetailValue(value)}
                        </Typography.Text>
                      </Space>
                    </List.Item>
                  )}
                />
              ) : (
                <Typography.Text type="secondary">{t("无额外明细")}</Typography.Text>
              )}
            </Space>
          ),
        };
      }),
    [logs],
  );

  async function refreshCurrentPage(
    targetPage = page,
    targetPageSize = pageSize,
  ) {
    if (!user) {
      return;
    }
    setLoading(true);
    try {
      const result = await listUserOperationLogs(
        sessionToken,
        user.id,
        targetPage,
        targetPageSize,
      );
      setLogs(result.items);
      setTotal(result.total);
      setPage(result.page);
      setPageSize(result.page_size);
    } catch (err) {
      messageApi.error(
        err instanceof Error ? err.message : t("刷新用户操作日志失败"),
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(deleteAll: boolean) {
    if (!user) {
      return;
    }
    if (!deleteAll && (!range || !range[0] || !range[1])) {
      messageApi.warning(t("请选择删除时间范围"));
      return;
    }
    setDeleting(true);
    try {
      await deleteUserOperationLogs(sessionToken, user.id, {
        delete_all: deleteAll,
        start_at: deleteAll
          ? undefined
          : range?.[0]?.startOf("day").toISOString(),
        end_at: deleteAll ? undefined : range?.[1]?.endOf("day").toISOString(),
      });
      messageApi.success(
        deleteAll
          ? t("已删除该账号全部操作日志")
          : t("已删除指定时间范围内的操作日志"),
      );
      await refreshCurrentPage(1, pageSize);
    } catch (err) {
      messageApi.error(
        err instanceof Error ? err.message : t("删除用户操作日志失败"),
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal
      title={user ? t("账号操作日志 · {{email}}", { email: user.email }) : t("账号操作日志")}
      open={open}
      footer={null}
      width={820}
      destroyOnHidden
      onCancel={onCancel}
    >
      {contextHolder}
      {user ? (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label={t("用户 ID")}>{user.id}</Descriptions.Item>
            <Descriptions.Item label={t("邮箱")}>{user.email}</Descriptions.Item>
            <Descriptions.Item label={t("显示名称")}>
              {user.display_name || "-"}
            </Descriptions.Item>
            <Descriptions.Item label={t("手机号")}>
              {user.phone || "-"}
            </Descriptions.Item>
          </Descriptions>

          <Space
            wrap
            style={{ justifyContent: "space-between", width: "100%" }}
          >
            <Space wrap>
              <Button
                icon={<ReloadOutlined />}
                loading={loading}
                onClick={() => void refreshCurrentPage()}
              >
                {t("刷新")}
              </Button>
              <DatePicker.RangePicker
                showTime={false}
                value={range}
                onChange={(value) =>
                  setRange((value as [Dayjs | null, Dayjs | null]) ?? null)
                }
                presets={[
                  {
                    label: t("最近 7 天"),
                    value: [dayjs().subtract(6, "day"), dayjs()],
                  },
                  {
                    label: t("最近 30 天"),
                    value: [dayjs().subtract(29, "day"), dayjs()],
                  },
                ]}
              />
              <Button
                danger
                loading={deleting}
                onClick={() => void handleDelete(false)}
              >
                {t("删除时间范围日志")}
              </Button>
            </Space>
            <Button
              danger
              loading={deleting}
              onClick={() => {
                Modal.confirm({
                  title: t("确认删除该账号全部操作日志？"),
                  content: t("删除后不可恢复。"),
                  okText: t("确认删除"),
                  cancelText: t("取消"),
                  okButtonProps: { danger: true },
                  onOk: () => handleDelete(true),
                });
              }}
            >
              {t("删除全部日志")}
            </Button>
          </Space>

          {timelineItems.length > 0 ? (
            <Timeline items={timelineItems} />
          ) : (
            <Empty description={loading ? t("加载中...") : t("暂无操作日志")} />
          )}

          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            showSizeChanger
            showQuickJumper
            pageSizeOptions={pageSizeOptions}
            showTotal={(value) => t("共 {{count}} 条", { count: value })}
            onChange={(nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            }}
          />
        </Space>
      ) : null}
    </Modal>
  );
}
