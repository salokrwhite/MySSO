import { Button, Card, Col, Row, Space, Statistic, Table, Tabs, Tag, Typography } from "antd";
import { useMemo, useState } from "react";
import type { TableRowSelection } from "antd/es/table/interface";
import type {
  AdminPasskeyLog,
  AdminPasskeyLogs,
  AdminPasskeyUsageLog
} from "../../types";
import { useAdminI18n } from "../../i18n";
import { formatAdminDateTime } from "../../utils/time";

type RiskLogsPanelProps = {
  passkeyLogs: AdminPasskeyLogs;
  refreshing: boolean;
  deletingPasskeyTable?: string;
  onRefresh: () => void;
  onBatchDeletePasskeyLogs: (table: string, recordIds: string[]) => void;
};

export function RiskLogsPanel({
  passkeyLogs,
  refreshing,
  deletingPasskeyTable,
  onRefresh,
  onBatchDeletePasskeyLogs
}: RiskLogsPanelProps) {
  const { t } = useAdminI18n();
  const [activePasskeyTable, setActivePasskeyTable] = useState("passkeys");
  const [selectedPasskeyIds, setSelectedPasskeyIds] = useState<string[]>([]);

  const passkeyUserCount = useMemo(() => new Set(passkeyLogs.passkeys.map((item) => item.user_id)).size, [passkeyLogs.passkeys]);
  const activePasskeyRows = useMemo<any[]>(() => {
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

  const passkeyColumns = useMemo<any[]>(() => {
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
        <Col xs={24} md={8}>
          <Card>
            <Statistic title={t("Passkey 总数")} value={passkeyLogs.passkeys.length} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title={t("绑定用户数")} value={passkeyUserCount} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title={t("使用日志")} value={passkeyLogs.usage_logs.length} />
          </Card>
        </Col>
      </Row>

      <Card
        title={t("Passkey 数据表信息")}
        extra={
          <Space>
            <Button size="small" onClick={onRefresh} loading={refreshing}>
              {t("刷新")}
            </Button>
          </Space>
        }
      >
        <Tabs
          activeKey={activePasskeyTable}
          onChange={(key) => {
            setActivePasskeyTable(key);
            setSelectedPasskeyIds([]);
          }}
          tabBarExtraContent={
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
          }
          items={[
            {
              key: "passkeys",
              label: `${t("已绑定通行密钥")} (${passkeyLogs.passkeys.length})`,
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
