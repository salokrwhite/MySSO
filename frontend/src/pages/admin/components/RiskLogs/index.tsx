import { Button, Card, Col, DatePicker, Form, Input, InputNumber, Modal, Progress, Row, Select, Space, Statistic, Table, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { AdminRiskStats, RiskAccountSummary, RiskEvent } from "../../types";
import { useAdminI18n } from "../../i18n";
import { formatAdminDateTime } from "../../utils/time";

type RiskLogsPanelProps = {
  accountSummaries: RiskAccountSummary[];
  accountSummariesTotal: number;
  accountPage: number;
  accountPageSize: number;
  events: RiskEvent[];
  eventsTotal: number;
  eventPage: number;
  eventPageSize: number;
  stats: AdminRiskStats;
  userIDFilter: string;
  eventTypeFilter: string;
  levelFilter: string;
  refreshing: boolean;
  deletingEvents: boolean;
  onRefresh: () => void;
  onAccountPageChange: (page: number, pageSize: number) => void;
  onEventPageChange: (page: number, pageSize: number) => void;
  onUserIDFilterChange: (value: string) => void;
  onEventTypeFilterChange: (value: string) => void;
  onLevelFilterChange: (value: string) => void;
  onClearRiskProfile: (userID: string) => Promise<void>;
  onMarkFalsePositive: (userID: string, input: { note: string; hours: number }) => Promise<void>;
  onDeleteEvents: (input: { deleteAll: boolean; startAt?: string; endAt?: string }) => Promise<void>;
};

const levelColors: Record<string, string> = {
  critical: "red",
  high: "volcano",
  medium: "gold",
  low: "green",
  none: "default"
};

const actionColors: Record<string, string> = {
  block: "red",
  step_up: "orange",
  captcha: "gold",
  allow: "green",
  logged: "blue"
};

function locationText(record: Partial<RiskAccountSummary & RiskEvent>) {
  const country = record.last_ip_country || record.ip_country;
  const region = record.last_ip_region || record.ip_region;
  const city = record.last_ip_city || record.ip_city;
  return [country, region, city].filter(Boolean).join(" / ") || "-";
}

function scoreStatus(score: number) {
  if (score >= 80) {
    return "exception" as const;
  }
  if (score >= 60) {
    return "active" as const;
  }
  return "normal" as const;
}

function eventText(t: (key: string) => string, value?: string) {
  return value ? t(`risk.event.${value}`) : "-";
}

function actionText(t: (key: string) => string, value?: string) {
  return value ? t(`risk.action.${value}`) : "-";
}

function signalText(t: (key: string) => string, value?: string) {
  return value ? t(`risk.signal.${value}`) : "-";
}

function statusText(t: (key: string) => string, value?: string) {
  return value ? t(`account.status.${value}`) : "-";
}

function roleText(t: (key: string) => string, value?: string) {
  return value ? t(`account.role.${value}`) : "-";
}

export function RiskLogsPanel({
  accountSummaries,
  accountSummariesTotal,
  accountPage,
  accountPageSize,
  events,
  eventsTotal,
  eventPage,
  eventPageSize,
  stats,
  userIDFilter,
  eventTypeFilter,
  levelFilter,
  refreshing,
  deletingEvents,
  onRefresh,
  onAccountPageChange,
  onEventPageChange,
  onUserIDFilterChange,
  onEventTypeFilterChange,
  onLevelFilterChange,
  onClearRiskProfile,
  onMarkFalsePositive,
  onDeleteEvents
}: RiskLogsPanelProps) {
  const { t } = useAdminI18n();
  const levels24h = stats.levels_24h || {};
  const [userSearch, setUserSearch] = useState(userIDFilter);
  const [deleteRange, setDeleteRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [falsePositiveTarget, setFalsePositiveTarget] = useState<RiskAccountSummary | null>(null);
  const [falsePositiveForm] = Form.useForm<{ note: string; hours: number }>();

  useEffect(() => {
    setUserSearch(userIDFilter);
  }, [userIDFilter]);

  const accountColumns = useMemo<ColumnsType<RiskAccountSummary>>(
    () => [
      {
        title: t("账号"),
        dataIndex: "email",
        width: 260,
        render: (_: string, record) => (
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{record.email || record.display_name || "-"}</Typography.Text>
            <Typography.Text type="secondary" code copyable={{ text: record.user_id }}>
              {record.user_id}
            </Typography.Text>
          </Space>
        )
      },
      {
        title: t("综合评分"),
        dataIndex: "comprehensive_score",
        width: 180,
        render: (score: number, record) => (
          <Space direction="vertical" size={2} style={{ minWidth: 140 }}>
            <Progress percent={score} size="small" status={scoreStatus(score)} />
            <Space size={6}>
              <Typography.Text strong>{score}</Typography.Text>
              <Tag color={levelColors[record.risk_level] || "default"}>{t(record.risk_level || "none")}</Tag>
            </Space>
          </Space>
        )
      },
      {
        title: t("账号使用信息"),
        width: 240,
        render: (_, record) => (
          <Space direction="vertical" size={2}>
            <Typography.Text>{t("登录成功")} {record.login_success_count} / {t("登录失败")} {record.login_failure_count}</Typography.Text>
            <Typography.Text type="secondary">
              MFA {record.mfa_enabled ? t("已启用") : t("未启用")} / {t("设备数")} {record.device_count}
            </Typography.Text>
            <Typography.Text type="secondary">
              {t("最后登录")} {record.last_login_at ? formatAdminDateTime(record.last_login_at) : "-"}
            </Typography.Text>
          </Space>
        )
      },
      {
        title: t("最近风险"),
        width: 260,
        render: (_, record) => (
          <Space direction="vertical" size={2}>
            <Space wrap size={6}>
              <Tag>{record.last_event_type ? eventText(t, record.last_event_type) : t("无事件")}</Tag>
              <Tag color={actionColors[record.last_action_taken || ""] || "default"}>{actionText(t, record.last_action_taken)}</Tag>
            </Space>
            <Typography.Text type="secondary">{record.last_ip_address || "-"}</Typography.Text>
            <Typography.Text type="secondary">{locationText(record)}</Typography.Text>
          </Space>
        )
      },
      {
        title: t("处置统计"),
        width: 180,
        render: (_, record) => (
          <Space direction="vertical" size={2}>
            <Typography.Text>{t("阻断")} {record.blocked_count}</Typography.Text>
            <Typography.Text>{t("二次验证")} {record.step_up_count}</Typography.Text>
            <Typography.Text>{t("图形验证")} {record.captcha_count}</Typography.Text>
          </Space>
        )
      },
      {
        title: t("账号状态"),
        width: 150,
        render: (_, record) => (
          <Space direction="vertical" size={2}>
            <Tag color={record.status === "active" ? "green" : record.status === "frozen" ? "red" : "gold"}>{statusText(t, record.status)}</Tag>
            <Typography.Text type="secondary">{roleText(t, record.role)}</Typography.Text>
          </Space>
        )
      },
      {
        title: t("最近事件时间"),
        dataIndex: "last_event_at",
        width: 180,
        render: (value?: string) => value ? formatAdminDateTime(value) : "-"
      },
      {
        title: t("可信/缓释状态"),
        width: 220,
        render: (_, record) => (
          <Space direction="vertical" size={2}>
            <Typography.Text type="secondary">{t("可信至")} {record.trusted_until ? formatAdminDateTime(record.trusted_until) : "-"}</Typography.Text>
            <Typography.Text type="secondary">{t("缓释至")} {record.mitigated_until ? formatAdminDateTime(record.mitigated_until) : "-"}</Typography.Text>
            <Typography.Text type="secondary">{t("误报至")} {record.false_positive_until ? formatAdminDateTime(record.false_positive_until) : "-"}</Typography.Text>
          </Space>
        )
      },
      {
        title: t("操作"),
        fixed: "right",
        width: 170,
        render: (_, record) => (
          <Space direction="vertical" size={6}>
            <Button size="small" danger onClick={() => void onClearRiskProfile(record.user_id)}>
              {t("清除画像")}
            </Button>
            <Button
              size="small"
              onClick={() => {
                falsePositiveForm.setFieldsValue({ note: record.false_positive_note || "", hours: 72 });
                setFalsePositiveTarget(record);
              }}
            >
              {t("标记误报")}
            </Button>
          </Space>
        )
      }
    ],
    [falsePositiveForm, onClearRiskProfile, t],
  );

  const eventColumns = useMemo<ColumnsType<RiskEvent>>(
    () => [
      {
        title: t("时间"),
        dataIndex: "created_at",
        width: 180,
        render: (value: string) => formatAdminDateTime(value)
      },
      {
        title: t("账号"),
        dataIndex: "user_id",
        width: 260,
        render: (value: string, record) => (
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{record.email || record.display_name || "-"}</Typography.Text>
            {value ? (
              <Typography.Text type="secondary" code copyable={{ text: value }}>
                {value}
              </Typography.Text>
            ) : (
              <Typography.Text type="secondary">-</Typography.Text>
            )}
          </Space>
        )
      },
      {
        title: t("事件"),
        dataIndex: "event_type",
        width: 150,
        render: (value: string) => <Tag>{eventText(t, value)}</Tag>
      },
      {
        title: t("评分 / 等级"),
        width: 150,
        render: (_, record) => (
          <Space>
            <Typography.Text strong>{record.risk_score}</Typography.Text>
            <Tag color={levelColors[record.risk_level] || "default"}>{t(record.risk_level || "none")}</Tag>
          </Space>
        )
      },
      {
        title: t("处置动作"),
        dataIndex: "action_taken",
        width: 120,
        render: (value: string) => <Tag color={actionColors[value] || "default"}>{actionText(t, value)}</Tag>
      },
      {
        title: "IP / Location",
        width: 240,
        render: (_, record) => (
          <Space direction="vertical" size={0}>
            <Typography.Text>{record.ip_address || "-"}</Typography.Text>
            <Typography.Text type="secondary">{locationText(record)}</Typography.Text>
          </Space>
        )
      },
      {
        title: t("设备 / 客户端"),
        width: 220,
        render: (_, record) => (
          <Space direction="vertical" size={0}>
            <Typography.Text>{record.client_type || "-"}</Typography.Text>
            <Typography.Text type="secondary" code ellipsis style={{ maxWidth: 180 }}>
              {record.device_fingerprint || record.device_key_id || "-"}
            </Typography.Text>
          </Space>
        )
      },
      {
        title: t("命中信号"),
        dataIndex: "signals",
        width: 280,
        render: (signals?: RiskEvent["signals"]) => signals?.length ? (
          <Space wrap>
            {signals.slice(0, 6).map((signal) => (
              <Tag key={`${signal.category}:${signal.name}:${signal.weight}`}>
                {signalText(t, signal.name)} +{signal.weight}
              </Tag>
            ))}
          </Space>
        ) : "-"
      },
      {
        title: t("失败原因"),
        dataIndex: "failure_reason",
        width: 180,
        render: (value: string) => value || "-"
      }
    ],
    [t],
  );

  const confirmDeleteRange = () => {
    const [start, end] = deleteRange || [];
    if (!start || !end) {
      Modal.warning({
        title: t("请选择要删除的时间范围"),
        okText: t("确认")
      });
      return;
    }
    Modal.confirm({
      title: t("确认硬删除该时间范围内的风控事件日志？"),
      content: t("删除后不可恢复。"),
      okText: t("确认删除"),
      cancelText: t("取消"),
      okButtonProps: { danger: true },
      onOk: () => onDeleteEvents({
        deleteAll: false,
        startAt: start.toISOString(),
        endAt: end.toISOString()
      })
    });
  };

  const confirmDeleteAll = () => {
    Modal.confirm({
      title: t("确认硬删除全部风控事件日志？"),
      content: t("删除后不可恢复。"),
      okText: t("确认删除"),
      cancelText: t("取消"),
      okButtonProps: { danger: true },
      onOk: () => onDeleteEvents({ deleteAll: true })
    });
  };

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title={t("风控事件总数")} value={eventsTotal} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title={t("本页高风险账号")} value={accountSummaries.filter((item) => item.risk_level === "high" || item.risk_level === "critical").length} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title={t("24 小时高风险事件")} value={(levels24h.high || 0) + (levels24h.critical || 0)} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title={t("IP 黑名单")} value={stats.ip_blacklist_count || 0} />
          </Card>
        </Col>
      </Row>

      <Card
        title={t("账号风险画像")}
        extra={<Button size="small" onClick={onRefresh} loading={refreshing}>{t("刷新")}</Button>}
      >
        <Space wrap style={{ width: "100%", marginBottom: 16 }}>
          <Input.Search
            allowClear
            style={{ width: 280 }}
            placeholder={t("按用户 ID 筛选")}
            value={userSearch}
            onChange={(event) => {
              setUserSearch(event.target.value);
              if (!event.target.value) {
                onUserIDFilterChange("");
              }
            }}
            onSearch={(value) => onUserIDFilterChange(value.trim())}
          />
          <Select
            style={{ width: 160 }}
            value={levelFilter}
            onChange={onLevelFilterChange}
            options={[
              { value: "all", label: t("全部等级") },
              { value: "critical", label: t("critical") },
              { value: "high", label: t("high") },
              { value: "medium", label: t("medium") },
              { value: "low", label: t("low") },
              { value: "none", label: t("none") }
            ]}
          />
        </Space>
        <Table
          rowKey="user_id"
          loading={refreshing}
          dataSource={accountSummaries}
          columns={accountColumns}
          scroll={{ x: 1450 }}
          pagination={{
            current: accountPage,
            pageSize: accountPageSize,
            total: accountSummariesTotal,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            onChange: onAccountPageChange
          }}
        />
      </Card>

      <Card title={t("风控事件明细")} extra={<Button size="small" onClick={onRefresh} loading={refreshing}>{t("刷新")}</Button>}>
        <Space wrap style={{ width: "100%", marginBottom: 16, justifyContent: "space-between" }}>
          <Space wrap>
            <Input.Search
              allowClear
              style={{ width: 280 }}
              placeholder={t("按用户 ID 筛选")}
              value={userSearch}
              onChange={(event) => {
                setUserSearch(event.target.value);
                if (!event.target.value) {
                  onUserIDFilterChange("");
                }
              }}
              onSearch={(value) => onUserIDFilterChange(value.trim())}
            />
            <Select
              style={{ width: 180 }}
              value={eventTypeFilter}
              onChange={onEventTypeFilterChange}
              options={[
                { value: "all", label: t("全部事件") },
                { value: "login", label: eventText(t, "login") },
                { value: "login_failed", label: eventText(t, "login_failed") },
                { value: "login_blocked", label: eventText(t, "login_blocked") },
                { value: "security_operation", label: eventText(t, "security_operation") }
              ]}
            />
          </Space>
          <Space wrap style={{ justifyContent: "flex-end" }}>
            <DatePicker.RangePicker
              showTime
              value={deleteRange}
              onChange={(value) => setDeleteRange((value as [Dayjs | null, Dayjs | null]) ?? null)}
              presets={[
                { label: t("最近 7 天"), value: [dayjs().subtract(7, "day"), dayjs()] },
                { label: t("最近 30 天"), value: [dayjs().subtract(30, "day"), dayjs()] }
              ]}
            />
            <Button danger loading={deletingEvents} onClick={confirmDeleteRange}>
              {t("删除时间范围日志")}
            </Button>
            <Button danger loading={deletingEvents} onClick={confirmDeleteAll}>
              {t("删除全部日志")}
            </Button>
          </Space>
        </Space>
        <Table
          rowKey="id"
          loading={refreshing}
          dataSource={events}
          columns={eventColumns}
          scroll={{ x: 1600 }}
          pagination={{
            current: eventPage,
            pageSize: eventPageSize,
            total: eventsTotal,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            onChange: onEventPageChange
          }}
        />
      </Card>

      <Modal
        title={t("标记误报")}
        open={Boolean(falsePositiveTarget)}
        okText={t("确认")}
        cancelText={t("取消")}
        onCancel={() => setFalsePositiveTarget(null)}
        onOk={() => {
          void falsePositiveForm.validateFields().then(async (values) => {
            if (!falsePositiveTarget) {
              return;
            }
            await onMarkFalsePositive(falsePositiveTarget.user_id, values);
            setFalsePositiveTarget(null);
          });
        }}
      >
        <Form form={falsePositiveForm} layout="vertical" initialValues={{ note: "", hours: 72 }}>
          <Form.Item label={t("缓释小时数")} name="hours" rules={[{ required: true, message: t("请输入小时数") }]}>
            <InputNumber min={1} max={8760} precision={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("备注")} name="note">
            <Input.TextArea rows={3} maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
