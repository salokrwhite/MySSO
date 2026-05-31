import { ReloadOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import { useState } from "react";
import { API_BASE } from "../../../../api/client";
import {
  convertImageToSquareWebp,
  uploadDeveloperAppIcon,
} from "../../../admin/utils/imageConverter";
import { useDeveloperTranslation } from "../../i18n";
import type { AppItem, ScopeDefinition } from "../../types";
import { statusColor, statusText } from "../../utils/status";

type AppFormValues = {
  name: string;
  icon_url?: string;
  description?: string;
  redirect_uris: string;
  post_logout_redirect_uris?: string;
  frontchannel_logout_uri?: string;
  allow_get_session_logout?: boolean;
  scopes: string[];
};

export function DeveloperConsole({
  apps,
  scopes,
  loading,
  reloading,
  resettingAppId,
  deletingAppId,
  onCreateApp,
  onEditApp,
  onReload,
  onResetSecret,
  onDeleteApp,
}: {
  apps: AppItem[];
  scopes: ScopeDefinition[];
  loading: boolean;
  reloading: boolean;
  resettingAppId?: string;
  deletingAppId?: string;
  onCreateApp: (values: AppFormValues) => void | Promise<void>;
  onEditApp: (app: AppItem, values: AppFormValues) => void | Promise<void>;
  onReload: () => void | Promise<void>;
  onResetSecret: (id: string) => void | Promise<void>;
  onDeleteApp: (app: AppItem) => void | Promise<void>;
}) {
  const { t } = useDeveloperTranslation();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AppItem>();
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [form] = Form.useForm<AppFormValues>();
  const iconValue = Form.useWatch("icon_url", form) || "";

  async function handleCreateApp(values: AppFormValues) {
    await onCreateApp(values);
    form.resetFields();
    setCreateModalOpen(false);
  }

  async function handleEditApp(values: AppFormValues) {
    if (!editingApp) {
      return;
    }
    await onEditApp(editingApp, values);
    form.resetFields();
    setEditingApp(undefined);
  }

  function openCreateModal() {
    form.resetFields();
    form.setFieldsValue({
      scopes: scopes
        .filter(
          (item) =>
            item.key === "openid" ||
            item.key === "profile" ||
            item.key === "email",
        )
        .map((item) => item.key),
      icon_url: "",
      post_logout_redirect_uris: "",
      frontchannel_logout_uri: "",
      allow_get_session_logout: false,
    });
    setEditingApp(undefined);
    setCreateModalOpen(true);
  }

  function openEditModal(app: AppItem) {
    form.setFieldsValue({
      name: app.name,
      icon_url: app.icon_url || "",
      description: app.description || "",
      redirect_uris: (app.redirect_uris || []).join("\n"),
      post_logout_redirect_uris: (app.post_logout_redirect_uris || []).join(
        "\n",
      ),
      frontchannel_logout_uri: app.frontchannel_logout_uri || "",
      allow_get_session_logout: Boolean(app.allow_get_session_logout),
      scopes: app.scopes || [],
    });
    setCreateModalOpen(false);
    setEditingApp(app);
  }

  async function handleIconUpload(file: File) {
    setUploadingIcon(true);
    try {
      const dataUrl = await convertImageToSquareWebp(file, 64);
      const iconUrl = await uploadDeveloperAppIcon(dataUrl);
      form.setFieldValue("icon_url", iconUrl);
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : t("console.iconUploadFailed"),
      );
    } finally {
      setUploadingIcon(false);
    }
    return false;
  }

  const backendOrigin = API_BASE.replace(/\/api$/, "");
  const iconPreviewUrl = iconValue
    ? iconValue.startsWith("http")
      ? iconValue
      : `${backendOrigin}${iconValue}`
    : "";

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <Card
        title={t("console.title")}
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              loading={reloading}
              onClick={() => void onReload()}
            >
              {t("common.refresh")}
            </Button>
            <Button type="primary" onClick={openCreateModal}>
              {t("console.createApp")}
            </Button>
          </Space>
        }
      >
        <Table
          rowKey="id"
          dataSource={apps}
          pagination={false}
          scroll={{ x: 960 }}
          columns={[
            { title: t("console.columns.name"), dataIndex: "name" },
            { title: t("console.columns.clientId"), dataIndex: "client_id" },
            {
              title: t("console.columns.status"),
              dataIndex: "status",
              render: (value: string) => (
                <Tag color={statusColor(value)}>{statusText(value, t)}</Tag>
              ),
            },
            {
              title: t("console.columns.scopes"),
              dataIndex: "scopes",
              render: (value: string[]) => value.join(", ") || "-",
            },
            {
              title: t("console.columns.reviewComment"),
              dataIndex: "review_comment",
              render: (value?: string) => value || "-",
            },
            {
              title: t("console.columns.actions"),
              render: (_, record: AppItem) => {
                const hasSecret = Boolean(record.has_client_secret);
                const canManageSecret = record.status === "approved";

                return (
                  <Space wrap>
                    <Button onClick={() => openEditModal(record)}>
                      {t("common.edit")}
                    </Button>
                    {canManageSecret && !hasSecret ? (
                      <Button
                        type="primary"
                        loading={resettingAppId === record.id}
                        onClick={() => void onResetSecret(record.id)}
                      >
                        {t("console.createSecret")}
                      </Button>
                    ) : null}
                    {canManageSecret && hasSecret ? (
                      <Button
                        loading={resettingAppId === record.id}
                        onClick={() => void onResetSecret(record.id)}
                      >
                        {t("console.resetSecret")}
                      </Button>
                    ) : null}
                    <Button
                      danger
                      ghost
                      loading={deletingAppId === record.id}
                      onClick={() => void onDeleteApp(record)}
                    >
                      {t("common.delete")}
                    </Button>
                  </Space>
                );
              },
            },
          ]}
        />
      </Card>

      <Drawer
        title={editingApp ? t("console.editApp") : t("console.createApp")}
        open={createModalOpen || Boolean(editingApp)}
        width={560}
        placement="right"
        destroyOnClose
        maskClosable={!loading}
        onClose={() => {
          if (loading) {
            return;
          }
          form.resetFields();
          setCreateModalOpen(false);
          setEditingApp(undefined);
        }}
        footer={
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button
              disabled={loading}
              onClick={() => {
                form.resetFields();
                setCreateModalOpen(false);
                setEditingApp(undefined);
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="primary"
              loading={loading}
              onClick={() => void form.submit()}
            >
              {editingApp
                ? t("common.saveAndResubmit")
                : t("common.submitForReview")}
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            scopes: scopes
              .filter(
                (item) =>
                  item.key === "openid" ||
                  item.key === "profile" ||
                  item.key === "email",
              )
              .map((item) => item.key),
            post_logout_redirect_uris: "",
            frontchannel_logout_uri: "",
            allow_get_session_logout: false,
          }}
          onFinish={(values) =>
            void (editingApp ? handleEditApp(values) : handleCreateApp(values))
          }
        >
          <Form.Item
            label={t("console.appName")}
            name="name"
            rules={[{ required: true, message: t("console.nameRequired") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label={t("console.icon")} name="icon_url">
            <Space direction="vertical" size={12}>
              <Space size={12} align="center">
                <Avatar
                  shape="square"
                  size={64}
                  src={iconPreviewUrl || undefined}
                  style={{
                    borderRadius: 16,
                    border: "1px solid rgba(18, 38, 58, 0.08)",
                    background: "#f8fafc",
                    color: "#94a3b8",
                  }}
                >
                  {!iconPreviewUrl ? "ICON" : null}
                </Avatar>
                <Space direction="vertical" size={4}>
                  <Upload
                    showUploadList={false}
                    beforeUpload={(file) => {
                      void handleIconUpload(file);
                      return false;
                    }}
                  >
                    <Button icon={<UploadOutlined />} loading={uploadingIcon}>
                      {t("console.uploadIcon")}
                    </Button>
                  </Upload>
                  <Typography.Text type="secondary">
                    {t("console.iconHint")}
                  </Typography.Text>
                </Space>
              </Space>
              {iconValue ? (
                <Button
                  type="link"
                  style={{ paddingInline: 0 }}
                  onClick={() => form.setFieldValue("icon_url", "")}
                >
                  {t("common.clearIcon")}
                </Button>
              ) : null}
            </Space>
          </Form.Item>
          <Form.Item label={t("console.description")} name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            label={t("console.redirectUris")}
            name="redirect_uris"
            rules={[{ required: true, message: t("console.redirectRequired") }]}
          >
            <Input.TextArea rows={4} placeholder="http://localhost:3000/callback" />
          </Form.Item>
          <Form.Item
            label={t("console.postLogoutUris")}
            name="post_logout_redirect_uris"
          >
            <Input.TextArea
              rows={3}
              placeholder="http://localhost:3000/logged-out.php"
            />
          </Form.Item>
          <Form.Item
            label={t("console.frontchannelLogoutUri")}
            name="frontchannel_logout_uri"
          >
            <Input placeholder="http://localhost:3000/frontchannel-logout" />
          </Form.Item>
          <Form.Item
            label={t("console.allowGetSessionLogout")}
            name="allow_get_session_logout"
            valuePropName="checked"
            extra={t("console.allowGetSessionLogoutHint")}
          >
            <Switch />
          </Form.Item>
          <Form.Item
            label={t("console.scopes")}
            name="scopes"
            rules={[
              {
                required: true,
                type: "array",
                min: 1,
                message: t("console.scopesRequired"),
              },
            ]}
          >
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              optionFilterProp="label"
              placeholder={t("console.selectScopes")}
              options={scopes.map((scope) => ({
                value: scope.key,
                label: `${scope.display_name} (${scope.key})`,
              }))}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </Space>
  );
}
