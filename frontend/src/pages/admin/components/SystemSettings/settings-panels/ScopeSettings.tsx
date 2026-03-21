import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Modal, Space, Switch, Table, Tag, Typography } from "antd";
import { useState } from "react";
import { useAdminI18n } from "../../../i18n";
import type { ScopeDefinition } from "../../../types";
import { SettingsCard } from "../../common/SettingsCard";

type ScopeSettingsProps = {
  scopes: ScopeDefinition[];
  savingScopeKey?: string;
  deletingScopeKey?: string;
  onSave: (scope: ScopeDefinition) => void | Promise<void>;
  onDelete: (key: string) => void | Promise<void>;
};

type ScopeFormValues = ScopeDefinition;

export function ScopeSettings({ scopes, savingScopeKey, deletingScopeKey, onSave, onDelete }: ScopeSettingsProps) {
  const { t } = useAdminI18n();
  const [form] = Form.useForm<ScopeFormValues>();
  const [editingScope, setEditingScope] = useState<ScopeDefinition>();
  const [modalOpen, setModalOpen] = useState(false);

  function openCreateModal() {
    setEditingScope(undefined);
    form.resetFields();
    form.setFieldsValue({
      key: "",
      display_name: "",
      description: "",
      enabled: true,
      developer_selectable: true,
      system: false
    });
    setModalOpen(true);
  }

  function openEditModal(scope: ScopeDefinition) {
    setEditingScope(scope);
    form.setFieldsValue(scope);
    setModalOpen(true);
  }

  async function handleSubmit() {
    const values = await form.validateFields();
    await onSave({
      ...values,
      key: values.key.trim()
    });
    setModalOpen(false);
    setEditingScope(undefined);
    form.resetFields();
  }

  return (
    <SettingsCard
      title={t("Scope 设置")}
      extra={(
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          {t("新增 Scope")}
        </Button>
      )}
    >
      <Card size="small" style={{ marginBottom: 16 }}>
        <Typography.Text type="secondary">
          {t("管理统一身份平台支持的 scope。开发者创建应用时只能选择这里已定义且“允许开发者选择”的 scope。")}
        </Typography.Text>
      </Card>

      <Table
        rowKey="key"
        pagination={false}
        dataSource={scopes}
        scroll={{ x: 960 }}
        columns={[
          {
            title: t("Scope Key"),
            dataIndex: "key",
            render: (value: string, record: ScopeDefinition) => (
              <Space>
                <Typography.Text code>{value}</Typography.Text>
                {record.system ? <Tag color="blue">{t("系统")}</Tag> : null}
              </Space>
            )
          },
          { title: t("显示名称"), dataIndex: "display_name", render: (value: string) => t(value) },
          {
            title: t("说明"),
            dataIndex: "description",
            render: (value: string) => <Typography.Text type="secondary">{t(value)}</Typography.Text>
          },
          {
            title: t("状态"),
            render: (_, record: ScopeDefinition) => (
              <Space wrap>
                <Tag color={record.enabled ? "green" : "default"}>{record.enabled ? t("已启用") : t("已关闭")}</Tag>
                <Tag color={record.developer_selectable ? "gold" : "default"}>
                  {record.developer_selectable ? t("开发者可选") : t("仅管理员可控")}
                </Tag>
              </Space>
            )
          },
          {
            title: t("操作"),
            render: (_, record: ScopeDefinition) => (
              <Space wrap>
                <Button onClick={() => openEditModal(record)} loading={savingScopeKey === record.key}>
                  {t("编辑")}
                </Button>
                <Button
                  danger
                  ghost
                  icon={<DeleteOutlined />}
                  disabled={record.system}
                  loading={deletingScopeKey === record.key}
                  onClick={() => {
                    Modal.confirm({
                      title: t("确认删除 Scope？"),
                      content: t("删除后开发者将无法再选择 {{key}}。如果已有应用正在使用，该删除会被阻止。", { key: record.key }),
                      okText: t("确认删除"),
                      cancelText: t("取消"),
                      okButtonProps: { danger: true },
                      onOk: () => onDelete(record.key)
                    });
                  }}
                >
                  {t("删除")}
                </Button>
              </Space>
            )
          }
        ]}
      />

      <Modal
        title={editingScope ? t("编辑 Scope · {{key}}", { key: editingScope.key }) : t("新增 Scope")}
        open={modalOpen}
        okText={t("保存")}
        cancelText={t("取消")}
        confirmLoading={savingScopeKey === (editingScope?.key || form.getFieldValue("key") || "__new__")}
        onOk={() => void handleSubmit()}
        onCancel={() => {
          if (savingScopeKey) {
            return;
          }
          setModalOpen(false);
          setEditingScope(undefined);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={t("Scope Key")}
            name="key"
            rules={[
              { required: true, whitespace: true, message: t("请输入 scope key") },
              { pattern: /^[a-z0-9._-]+$/, message: t("仅支持小写字母、数字、点、下划线和中划线") }
            ]}
          >
            <Input disabled={Boolean(editingScope)} placeholder={t("例如：gateway.read")} />
          </Form.Item>
          <Form.Item label={t("显示名称")} name="display_name" rules={[{ required: true, whitespace: true, message: t("请输入显示名称") }]}>
            <Input placeholder={t("例如：网关受保护资源读取")} />
          </Form.Item>
          <Form.Item label={t("说明")} name="description" rules={[{ required: true, whitespace: true, message: t("请输入说明") }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label={t("是否启用")} name="enabled" valuePropName="checked">
            <Switch checkedChildren={t("启用")} unCheckedChildren={t("关闭")} />
          </Form.Item>
          <Form.Item label={t("允许开发者选择")} name="developer_selectable" valuePropName="checked">
            <Switch checkedChildren={t("开放")} unCheckedChildren={t("限制")} />
          </Form.Item>
        </Form>
      </Modal>
    </SettingsCard>
  );
}
