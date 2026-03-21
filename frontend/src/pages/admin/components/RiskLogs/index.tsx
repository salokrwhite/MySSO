import { Button, Card, Col, Input, Row, Select, Space, Statistic, Table, Tabs, Tag, Typography } from "antd";
import { useMemo, useState } from "react";
import type { TableRowSelection } from "antd/es/table/interface";
import type {
  AdminPasskeyLog,
  AdminPasskeyLoginChallenge,
  AdminPasskeyLogs,
  AdminPasskeyRegistrationChallenge,
  AdminPasskeyUsageLog,
  RiskLog
} from "../../types";
import { useAdminI18n } from "../../i18n";
import { formatAdminDateTime } from "../../utils/time";

type RiskLogsPanelProps = {
  logs: RiskLog[];
  passkeyLogs: AdminPasskeyLogs;
  refreshing: boolean;
  deletingLogs: boolean;
  selectedLogIds: string[];
  setSelectedLogIds: (value: string[]) => void;
  deletingPasskeyTable?: string;
  onRefresh: () => void;
  onBatchDelete: () => void;
  onBatchDeletePasskeyLogs: (table: string, recordIds: string[]) => void;
};

function resultColor(result: string) {
  switch (result) {
    case "sent":
      return "green";
    case "blocked":
      return "red";
    default:
      return "default";
  }
}

export function RiskLogsPanel({
  logs,
  passkeyLogs,
  refreshing,
  deletingLogs,
  selectedLogIds,
  setSelectedLogIds,
  deletingPasskeyTable,
  onRefresh,
  onBatchDelete,
  onBatchDeletePasskeyLogs
}: RiskLogsPanelProps) {
  const { t } = useAdminI18n();
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [resultFilter, setResultFilter] = useState<string>("all");
  const [keyword, setKeyword] = useState("");
  const [activePasskeyTable, setActivePasskeyTable] = useState("passkeys");
  const [selectedPasskeyIds, setSelectedPasskeyIds] = useState<string[]>([]);

  const filteredLogs = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return logs.filter((item) => {
      if (channelFilter !== "all" && item.channel !== channelFilter) {
        return false;
      }
      if (resultFilter !== "all" && item.result !== resultFilter) {
        return false;
      }
      if (!normalizedKeyword) {
        return true;
      }
      return [
        item.purpose,
        item.matched_rule,
        item.source_ip,
        item.target_hash,
        item.user_agent_hash
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedKeyword);
    });
  }, [channelFilter, keyword, logs, resultFilter]);

  const blockedCount = useMemo(() => logs.filter((item) => item.result === "blocked").length, [logs]);
  const sentCount = useMemo(() => logs.filter((item) => item.result === "sent").length, [logs]);
  const emailCount = useMemo(() => logs.filter((item) => item.channel === "email").length, [logs]);
  const smsCount = useMemo(() => logs.filter((item) => item.channel === "sms").length, [logs]);
  const passkeyUserCount = useMemo(() => new Set(passkeyLogs.passkeys.map((item) => item.user_id)).size, [passkeyLogs.passkeys]);
  const rowSelection = useMemo<TableRowSelection<RiskLog>>(
    () => ({
      selectedRowKeys: selectedLogIds,
      onChange: (keys) => setSelectedLogIds(keys as string[])
    }),
    [selectedLogIds, setSelectedLogIds]
  );
  const activePasskeyRows = useMemo<any[]>(() => {
    if (activePasskeyTable === "passkey_registration_challenges") {
      return passkeyLogs.registration_challenges;
    }
    if (activePasskeyTable === "passkey_login_challenges") {
      return passkeyLogs.login_challenges;
    }
    if (activePasskeyTable === "passkey_usage_logs") {
      return passkeyLogs.usage_logs;
    }
    return passkeyLogs.passkeys;
  }, [activePasskeyTable, passkeyLogs]);

  const passkeyRowSelection = useMemo<TableRowSelection<any>>(
    () => ({
      selectedRowKeys: selectedPasskeyIds,
      onChange: (keys) => setSelectedPasskeyIds(keys as string[])
    }),
    [selectedPasskeyIds]
  );

  function channelLabel(channel: string) {
    return channel === "sms"
      ? t("短信")
      : channel === "email"
        ? t("邮件")
        : channel === "auth"
          ? t("认证")
          : channel || "-";
  }

  function resultLabel(result: string) {
    return result === "sent" ? t("放行") : result === "blocked" ? t("拦截") : result || "-";
  }

  const passkeyColumns = useMemo<any[]>(() => {
    if (activePasskeyTable === "passkey_registration_challenges") {
      return [
        {
          title: t("挑战 Token"),
          dataIndex: "token",
          width: 240,
          render: (value: string) => <Typography.Text copyable={{ text: value }}>{value}</Typography.Text>
        },
        {
          title: t("用户"),
          dataIndex: "user_email",
          width: 220,
          render: (_: string, record: AdminPasskeyRegistrationChallenge) => (
            <Space direction="vertical" size={0}>
              <Typography.Text>{record.user_email || "-"}</Typography.Text>
              <Typography.Text type="secondary" code>{record.user_id}</Typography.Text>
            </Space>
          )
        },
        {
          title: "Session Data",
          dataIndex: "session_data_json",
          width: 420,
          render: (value: string) => (
            <Typography.Paragraph copyable={{ text: value }} ellipsis={{ rows: 2, expandable: true, symbol: t("展开") }} style={{ marginBottom: 0 }}>
              {value || "-"}
            </Typography.Paragraph>
          )
        },
        {
          title: t("过期时间"),
          dataIndex: "expires_at",
          width: 180,
          render: (value: string) => formatAdminDateTime(value)
        },
        {
          title: t("创建时间"),
          dataIndex: "created_at",
          width: 180,
          render: (value: string) => formatAdminDateTime(value)
        }
      ];
    }
    if (activePasskeyTable === "passkey_login_challenges") {
      return [
        {
          title: t("挑战 Token"),
          dataIndex: "token",
          width: 240,
          render: (value: string) => <Typography.Text copyable={{ text: value }}>{value}</Typography.Text>
        },
        {
          title: "Session Data",
          dataIndex: "session_data_json",
          width: 520,
          render: (value: string) => (
            <Typography.Paragraph copyable={{ text: value }} ellipsis={{ rows: 2, expandable: true, symbol: t("展开") }} style={{ marginBottom: 0 }}>
              {value || "-"}
            </Typography.Paragraph>
          )
        },
        {
          title: t("过期时间"),
          dataIndex: "expires_at",
          width: 180,
          render: (value: string) => formatAdminDateTime(value)
        },
        {
          title: t("创建时间"),
          dataIndex: "created_at",
          width: 180,
          render: (value: string) => formatAdminDateTime(value)
        }
      ];
    }
    if (activePasskeyTable === "passkey_usage_logs") {
      return [
        {
          title: t("用户"),
          dataIndex: "user_email",
          width: 220,
          render: (_: string, record: AdminPasskeyUsageLog) => (
            <Space direction="vertical" size={0}>
              <Typography.Text>{record.user_email || "-"}</Typography.Text>
              <Typography.Text type="secondary" code>{record.user_id}</Typography.Text>
            </Space>
          )
        },
        {
          title: "Passkey ID",
          dataIndex: "passkey_id",
          width: 220,
          render: (value: string) => <Typography.Text copyable={{ text: value }}>{value || "-"}</Typography.Text>
        },
        {
          title: "Credential ID",
          dataIndex: "credential_id",
          width: 260,
          render: (value: string) => <Typography.Text copyable={{ text: value }}>{value || "-"}</Typography.Text>
        },
        {
          title: t("事件"),
          dataIndex: "event_type",
          width: 120,
          render: (value: string) => <Typography.Text code>{value || "-"}</Typography.Text>
        },
        {
          title: t("来源 IP"),
          dataIndex: "source_ip",
          width: 150,
          render: (value: string) => value || "-"
        },
        {
          title: t("结果"),
          dataIndex: "result",
          width: 100,
          render: (value: string) => <Tag color={value === "success" ? "green" : "red"}>{value === "success" ? t("成功") : value === "failed" ? t("失败") : value || "-"}</Tag>
        },
        {
          title: t("失败原因"),
          dataIndex: "failure_reason",
          width: 180,
          render: (value: string) => value || "-"
        },
        {
          title: "User Agent",
          dataIndex: "user_agent",
          width: 320,
          render: (value: string) => (
            <Typography.Paragraph copyable={{ text: value }} ellipsis={{ rows: 2, expandable: true, symbol: t("展开") }} style={{ marginBottom: 0 }}>
              {value || "-"}
            </Typography.Paragraph>
          )
        },
        {
          title: t("时间"),
          dataIndex: "created_at",
          width: 180,
          render: (value: string) => formatAdminDateTime(value)
        }
      ];
    }
    return [
      {
        title: t("用户"),
        dataIndex: "user_email",
        width: 220,
        render: (_: string, record: AdminPasskeyLog) => (
          <Space direction="vertical" size={0}>
            <Typography.Text>{record.user_email || "-"}</Typography.Text>
            <Typography.Text type="secondary" code>{record.user_id}</Typography.Text>
          </Space>
        )
      },
      {
        title: t("名称"),
        dataIndex: "name",
        width: 180
      },
      {
        title: "Credential ID",
        dataIndex: "credential_id",
        width: 260,
        render: (value: string) => <Typography.Text copyable={{ text: value }}>{value || "-"}</Typography.Text>
      },
      {
        title: "Sign Count",
        dataIndex: "sign_count",
        width: 120
      },
      {
        title: "AAGUID",
        dataIndex: "aaguid",
        width: 220,
        render: (value: string) => <Typography.Text code>{value || "-"}</Typography.Text>
      },
      {
        title: "Transports",
        dataIndex: "transports",
        width: 160,
        render: (value: string[]) => value?.length ? value.join(", ") : "-"
      },
      {
        title: "Credential JSON",
        dataIndex: "credential_json",
        width: 420,
        render: (value: string) => (
          <Typography.Paragraph copyable={{ text: value }} ellipsis={{ rows: 2, expandable: true, symbol: t("展开") }} style={{ marginBottom: 0 }}>
            {value || "-"}
          </Typography.Paragraph>
        )
      },
      {
        title: t("最近使用"),
        dataIndex: "last_used_at",
        width: 180,
        render: (value?: string) => value ? formatAdminDateTime(value) : "-"
      },
      {
        title: t("创建时间"),
        dataIndex: "created_at",
        width: 180,
        render: (value: string) => formatAdminDateTime(value)
      },
      {
        title: t("更新时间"),
        dataIndex: "updated_at",
        width: 180,
        render: (value: string) => formatAdminDateTime(value)
      }
    ];
  }, [activePasskeyTable, t]);

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title={t("日志总数")} value={logs.length} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title={t("已拦截")} value={blockedCount} valueStyle={{ color: "#cf1322" }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title={t("已放行")} value={sentCount} valueStyle={{ color: "#389e0d" }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title={t("邮件 / 短信")} value={`${emailCount} / ${smsCount}`} />
          </Card>
        </Col>
      </Row>

      <Card
        title={t("风控日志列表")}
        extra={
          <Space>
            <Tag color="blue">{t("目标与设备摘要为脱敏摘要")}</Tag>
            <Button size="small" onClick={onRefresh} loading={refreshing}>
              {t("刷新")}
            </Button>
          </Space>
        }
      >
        <Row gutter={[12, 12]} align="middle" justify="space-between" style={{ marginBottom: 16 }}>
          <Col flex="auto">
            <Space wrap>
              <Select
                value={channelFilter}
                style={{ width: 140 }}
                options={[
                  { label: t("全部渠道"), value: "all" },
                  { label: t("邮件"), value: "email" },
                  { label: t("短信"), value: "sms" }
                ]}
                onChange={setChannelFilter}
              />
              <Select
                value={resultFilter}
                style={{ width: 140 }}
                options={[
                  { label: t("全部结果"), value: "all" },
                  { label: t("放行"), value: "sent" },
                  { label: t("拦截"), value: "blocked" }
                ]}
                onChange={setResultFilter}
              />
              <Input.Search
                allowClear
                style={{ width: 320, maxWidth: "100%" }}
                placeholder={t("搜索用途、命中规则、来源 IP 或设备摘要")}
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
            </Space>
          </Col>
          <Col>
            <Space wrap style={{ justifyContent: "flex-end" }}>
              <Typography.Text type="secondary">{t("已选择 {{count}} 条日志", { count: selectedLogIds.length })}</Typography.Text>
              <Button danger disabled={selectedLogIds.length === 0} loading={deletingLogs} onClick={onBatchDelete}>
                {t("批量删除")}
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          rowKey="id"
          loading={refreshing}
          dataSource={filteredLogs}
          rowSelection={rowSelection}
          scroll={{ x: 1260 }}
          pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ["10", "20", "50", "100"] }}
          columns={[
            {
              title: t("结果"),
              dataIndex: "result",
              width: 100,
              render: (value: string) => <Tag color={resultColor(value)}>{resultLabel(value)}</Tag>
            },
            {
              title: t("渠道"),
              dataIndex: "channel",
              width: 100,
              render: (value: string) => <Tag>{channelLabel(value)}</Tag>
            },
            {
              title: t("用途"),
              dataIndex: "purpose",
              width: 140,
              render: (value: string) => <Typography.Text code>{value || "-"}</Typography.Text>
            },
            {
              title: t("命中规则"),
              dataIndex: "matched_rule",
              width: 180,
              render: (value: string) => <Typography.Text code>{value || "-"}</Typography.Text>
            },
            {
              title: t("来源 IP"),
              dataIndex: "source_ip",
              width: 150,
              render: (value: string) => value || "-"
            },
            {
              title: t("目标摘要"),
              dataIndex: "target_hash",
              width: 260,
              render: (value: string) => <Typography.Text copyable={{ text: value }}>{value || "-"}</Typography.Text>
            },
            {
              title: t("设备 / UA 摘要"),
              dataIndex: "user_agent_hash",
              width: 260,
              render: (value: string) => <Typography.Text type="secondary" copyable={{ text: value }}>{value || "-"}</Typography.Text>
            },
            {
              title: t("时间"),
              dataIndex: "created_at",
              width: 200,
              render: (value: string) => formatAdminDateTime(value)
            }
          ]}
        />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title={t("Passkey 总数")} value={passkeyLogs.passkeys.length} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title={t("绑定用户数")} value={passkeyUserCount} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title={t("注册挑战")} value={passkeyLogs.registration_challenges.length} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title={t("登录挑战")} value={passkeyLogs.login_challenges.length} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title={t("使用日志")} value={passkeyLogs.usage_logs.length} />
          </Card>
        </Col>
      </Row>

      <Card
        title={t("Passkey 数据表信息")}
        extra={
          <Space>
            <Tag color="gold">{t("展示 passkeys / registration / login challenge 原始表数据")}</Tag>
            <Button size="small" onClick={onRefresh} loading={refreshing}>
              {t("刷新")}
            </Button>
          </Space>
        }
      >
        <Row gutter={[12, 12]} align="middle" justify="space-between" style={{ marginBottom: 16 }}>
          <Col flex="auto">
            <Typography.Text type="secondary">
              {t("当前表：")}<Typography.Text code>{activePasskeyTable}</Typography.Text>
            </Typography.Text>
          </Col>
          <Col>
            <Space wrap style={{ justifyContent: "flex-end" }}>
              <Typography.Text type="secondary">{t("已选择 {{count}} 条记录", { count: selectedPasskeyIds.length })}</Typography.Text>
              <Button
                danger
                disabled={selectedPasskeyIds.length === 0}
                loading={deletingPasskeyTable === activePasskeyTable}
                onClick={() => onBatchDeletePasskeyLogs(activePasskeyTable, selectedPasskeyIds)}
              >
                {t("批量删除")}
              </Button>
            </Space>
          </Col>
        </Row>

        <Tabs
          activeKey={activePasskeyTable}
          onChange={(key) => {
            setActivePasskeyTable(key);
            setSelectedPasskeyIds([]);
          }}
          items={[
            {
              key: "passkeys",
              label: `${t("已绑定通行密钥")} (${passkeyLogs.passkeys.length})`,
              children: null
            },
            {
              key: "passkey_registration_challenges",
              label: `${t("通行密钥注册挑战")} (${passkeyLogs.registration_challenges.length})`,
              children: null
            },
            {
              key: "passkey_login_challenges",
              label: `${t("通行密钥登录挑战")} (${passkeyLogs.login_challenges.length})`,
              children: null
            },
            {
              key: "passkey_usage_logs",
              label: `${t("通行密钥使用日志")} (${passkeyLogs.usage_logs.length})`,
              children: null
            }
          ]}
        />

        <Table
          rowKey={(record: any) => ("id" in record ? record.id : record.token)}
          loading={refreshing}
          dataSource={activePasskeyRows}
          rowSelection={passkeyRowSelection}
          scroll={{ x: 1400 }}
          pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ["10", "20", "50", "100"] }}
          columns={passkeyColumns}
        />
      </Card>
    </Space>
  );
}
