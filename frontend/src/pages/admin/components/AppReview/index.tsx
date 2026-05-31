import { UploadOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Descriptions, Form, Grid, Input, List, Modal, Select, Space, Switch, Tag, Timeline, Typography, Upload, message } from "antd";
import { useMemo, useState } from "react";
import type { AppItem, AuditLog, ScopeDefinition } from "../../types";
import { useAdminI18n } from "../../i18n";
import { BatchActions } from "./BatchActions";
import { AppTable } from "./AppTable";
import { API_BASE } from "../../../../api/client";
import { convertImageToSquareWebp } from "../../utils/imageConverter";
import { uploadAdminAppIcon } from "../../services/adminApi";

type AppReviewProps = {
  apps: AppItem[];
  logs: AuditLog[];
  scopes: ScopeDefinition[];
  selectedAppIds: string[];
  setSelectedAppIds: (value: string[]) => void;
  deletingApps: boolean;
  refreshing: boolean;
  onReview: (id: string, approved: boolean, comment?: string) => void | Promise<void>;
  onUpdate: (
    id: string,
    values: {
      name: string;
      icon_url?: string;
      description?: string;
      redirect_uris: string[];
      post_logout_redirect_uris?: string[];
      frontchannel_logout_uri?: string;
      allow_get_session_logout?: boolean;
      scopes: string[];
    }
  ) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onRefresh: () => void;
  onBatchDelete: () => void;
};

export function AppReview({
  apps,
  logs,
  scopes,
  selectedAppIds,
  setSelectedAppIds,
  deletingApps,
  refreshing,
  onReview,
  onUpdate,
  onDelete,
  onRefresh,
  onBatchDelete
}: AppReviewProps) {
  const { t, locale } = useAdminI18n();
  const [form] = Form.useForm<{ comment: string }>();
  const [editForm] = Form.useForm<{
    name: string;
    icon_url?: string;
    description?: string;
    redirect_uris: string;
    post_logout_redirect_uris: string;
    frontchannel_logout_uri: string;
    allow_get_session_logout: boolean;
    scopes: string[];
  }>();
  const [rejectingAppId, setRejectingAppId] = useState<string>();
  const [editingApp, setEditingApp] = useState<AppItem>();
  const [historyApp, setHistoryApp] = useState<AppItem>();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [nameKeyword, setNameKeyword] = useState("");
  const backendOrigin = API_BASE.replace(/\/api$/, "");
  const iconValue = Form.useWatch("icon_url", editForm) || "";
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const filteredApps = useMemo(() => {
    const keyword = nameKeyword.trim().toLowerCase();
    return apps.filter((app) => {
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      const matchesName = keyword === "" || app.name.toLowerCase().includes(keyword);
      return matchesStatus && matchesName;
    });
  }, [apps, nameKeyword, statusFilter]);

  const historyLogs = useMemo(() => {
    if (!historyApp) {
      return [];
    }
    const allowedActions = new Set([
      "developer.app.create",
      "developer.app.update",
      "admin.app.update",
      "admin.app.approve",
      "admin.app.reject"
    ]);
    return logs.filter((log) => log.target_id === historyApp.id && allowedActions.has(log.action));
  }, [historyApp, logs]);

  function translateDetailValue(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => translateDetailValue(item));
    }
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([key, item]) => [
          key,
          translateDetailValue(item),
        ]),
      );
    }
    if (typeof value !== "string") {
      return value;
    }
    switch (value.trim()) {
      case "审核通过":
        return t("审核通过");
      case "已通过":
        return t("已通过");
      case "已驳回":
        return t("已驳回");
      case "待审核":
        return t("待审核");
      case "管理员审核通过":
        return t("管理员审核通过");
      case "管理员驳回应用":
        return t("管理员驳回应用");
      default:
        return value;
    }
  }

  function formatValue(value: unknown) {
    const translatedValue = translateDetailValue(value);
    if (Array.isArray(value)) {
      return Array.isArray(translatedValue)
        ? translatedValue.join(", ") || "-"
        : "-";
    }
    if (
      translatedValue === null ||
      translatedValue === undefined ||
      translatedValue === ""
    ) {
      return "-";
    }
    return String(translatedValue);
  }

  function formatAction(action: string) {
    switch (action) {
      case "developer.app.create":
        return t("开发者创建应用");
      case "developer.app.update":
        return t("开发者修改应用");
      case "admin.app.update":
        return t("管理员编辑应用");
      case "admin.app.approve":
        return t("管理员审核通过");
      case "admin.app.reject":
        return t("管理员驳回应用");
      default:
        return action;
    }
  }

  async function handleRejectSubmit() {
    const values = await form.validateFields();
    if (!rejectingAppId) {
      return;
    }

    setSubmitting(true);
    try {
      await onReview(rejectingAppId, false, values.comment);
      form.resetFields();
      setRejectingAppId(undefined);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditSubmit() {
    if (!editingApp) {
      return;
    }
    const values = await editForm.validateFields();
    setSubmitting(true);
    try {
      await onUpdate(editingApp.id, {
        name: values.name.trim(),
        icon_url: values.icon_url?.trim() || "",
        description: values.description?.trim() || "",
        redirect_uris: values.redirect_uris
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        post_logout_redirect_uris: values.post_logout_redirect_uris
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        frontchannel_logout_uri: values.frontchannel_logout_uri?.trim() || "",
        allow_get_session_logout: Boolean(values.allow_get_session_logout),
        scopes: values.scopes || []
      });
      editForm.resetFields();
      setEditingApp(undefined);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleIconUpload(file: File) {
    setUploadingIcon(true);
    try {
      const dataUrl = await convertImageToSquareWebp(file, 64);
      const iconUrl = await uploadAdminAppIcon(dataUrl);
      editForm.setFieldValue("icon_url", iconUrl);
    } catch (err) {
      message.error(err instanceof Error ? err.message : t("应用图标上传失败"));
    } finally {
      setUploadingIcon(false);
    }
    return false;
  }

  return (
    <>
      <Card title={t("应用审核")}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: isMobile ? "stretch" : "center",
            flexDirection: isMobile ? "column" : "row",
            gap: 16,
            marginBottom: 16,
            flexWrap: "wrap"
          }}
        >
          <Space wrap direction={isMobile ? "vertical" : "horizontal"} style={{ width: isMobile ? "100%" : undefined }}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: isMobile ? "100%" : 160 }}
              options={[
                { label: t("全部状态"), value: "all" },
                { label: t("待审核"), value: "pending_review" },
                { label: t("已通过"), value: "approved" },
                { label: t("已驳回"), value: "rejected" }
              ]}
            />
            <Input
              allowClear
              placeholder={t("按应用名称搜索")}
              style={{ width: isMobile ? "100%" : 240 }}
              value={nameKeyword}
              onChange={(event) => setNameKeyword(event.target.value)}
            />
          </Space>
          <div style={{ width: isMobile ? "100%" : "auto" }}>
            <BatchActions
              selectedCount={selectedAppIds.length}
              loading={deletingApps}
              refreshing={refreshing}
              onRefresh={onRefresh}
              onDelete={onBatchDelete}
            />
          </div>
        </div>
        <AppTable
          apps={filteredApps}
          selectedAppIds={selectedAppIds}
          setSelectedAppIds={setSelectedAppIds}
          onEdit={(app) => {
            editForm.setFieldsValue({
              name: app.name,
              icon_url: app.icon_url || "",
              description: app.description || "",
              redirect_uris: (app.redirect_uris || []).join("\n"),
              post_logout_redirect_uris: (app.post_logout_redirect_uris || []).join("\n"),
              frontchannel_logout_uri: app.frontchannel_logout_uri || "",
              allow_get_session_logout: Boolean(app.allow_get_session_logout),
              scopes: app.scopes || []
            });
            setEditingApp(app);
          }}
          onHistory={(app) => setHistoryApp(app)}
          onDelete={(app) => {
            Modal.confirm({
              title: t("确认删除应用？"),
              content: t("应用“{{name}}”会被硬删除，相关授权数据也会一并清理，删除后不可恢复。", {
                name: app.name,
              }),
              okText: t("确认删除"),
              cancelText: t("取消"),
              okButtonProps: { danger: true },
              onOk: () => onDelete(app.id)
            });
          }}
          onReview={(id, approved) => {
            if (approved) {
              void onReview(id, true, t("审核通过"));
              return;
            }
            form.setFieldsValue({ comment: "" });
            setRejectingAppId(id);
          }}
        />
      </Card>

      <Modal
        title={t("填写驳回意见")}
        open={Boolean(rejectingAppId)}
        width={isMobile ? "calc(100vw - 24px)" : 520}
        okText={t("确认驳回")}
        cancelText={t("取消")}
        okButtonProps={{ danger: true }}
        confirmLoading={submitting}
        onOk={() => void handleRejectSubmit()}
        onCancel={() => {
          if (submitting) {
            return;
          }
          form.resetFields();
          setRejectingAppId(undefined);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={t("驳回意见")}
            name="comment"
            rules={[{ required: true, whitespace: true, message: t("请输入驳回意见") }]}
          >
            <Input.TextArea rows={4} placeholder={t("请输入本次驳回原因，开发者会看到这条审核意见")} maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t("编辑应用")}
        open={Boolean(editingApp)}
        width={isMobile ? "calc(100vw - 24px)" : 520}
        okText={t("保存")}
        cancelText={t("取消")}
        confirmLoading={submitting}
        onOk={() => void handleEditSubmit()}
        onCancel={() => {
          if (submitting) {
            return;
          }
          editForm.resetFields();
          setEditingApp(undefined);
        }}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item label={t("应用名称")} name="name" rules={[{ required: true, whitespace: true, message: t("请输入应用名称") }]}>
            <Input />
          </Form.Item>
          <Form.Item label={t("站点图标")} name="icon_url">
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Space size={12} align="center">
              <Avatar
                shape="square"
                size={64}
                src={
                  iconValue
                    ? iconValue.startsWith("http")
                      ? iconValue
                      : `${backendOrigin}${iconValue}`
                    : undefined
                }
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(18, 38, 58, 0.08)",
                  background: "#f8fafc",
                  color: "#94a3b8"
                }}
              >
                {!iconValue ? "ICON" : null}
              </Avatar>
                <Space direction="vertical" size={4}>
                  <Upload showUploadList={false} beforeUpload={(file) => {
                    void handleIconUpload(file);
                    return false;
                  }}>
                    <Button icon={<UploadOutlined />} loading={uploadingIcon}>
                      {t("上传图标")}
                    </Button>
                  </Upload>
                  <Typography.Text type="secondary">
                    {t("将自动居中裁剪为 64x64 并转换为 webp")}
                  </Typography.Text>
                </Space>
              </Space>
              {iconValue ? (
                <Button type="link" style={{ paddingInline: 0 }} onClick={() => editForm.setFieldValue("icon_url", "")}>
                  {t("清除图标")}
                </Button>
              ) : null}
            </Space>
          </Form.Item>
          <Form.Item label={t("描述")} name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            label={t("回调地址（每行一个）")}
            name="redirect_uris"
            rules={[{ required: true, whitespace: true, message: t("请至少填写一个回调地址") }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label={t("退出后回跳地址（每行一个）")} name="post_logout_redirect_uris">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label={t("Front-Channel Logout 地址")} name="frontchannel_logout_uri">
            <Input />
          </Form.Item>
          <Form.Item
            label={t("允许 GET 会话退出")}
            name="allow_get_session_logout"
            valuePropName="checked"
            extra={t("开启后，已登记的应用可通过 GET /oauth2/logout 发起浏览器会话退出。")}
          >
            <Switch />
          </Form.Item>
          <Form.Item label="Scopes" name="scopes" rules={[{ required: true, type: "array", min: 1, message: t("请至少选择一个 scope") }]}>
            <Select
              mode="multiple"
              optionFilterProp="label"
              options={scopes.map((scope) => ({
                value: scope.key,
                label: `${scope.display_name} (${scope.key})`,
                disabled: !scope.enabled
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={historyApp ? t("操作历史 · {{name}}", { name: historyApp.name }) : t("操作历史")}
        open={Boolean(historyApp)}
        footer={null}
        width={isMobile ? "calc(100vw - 24px)" : 760}
        onCancel={() => setHistoryApp(undefined)}
      >
        {historyApp ? (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label={t("应用名称")}>{historyApp.name}</Descriptions.Item>
              <Descriptions.Item label="Client ID">{historyApp.client_id}</Descriptions.Item>
              <Descriptions.Item label={t("当前状态")}>
                <Tag color={historyApp.status === "approved" ? "green" : historyApp.status === "rejected" ? "red" : "gold"}>
                  {historyApp.status === "approved" ? t("已通过") : historyApp.status === "rejected" ? t("已驳回") : t("待审核")}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Timeline
              items={historyLogs.map((log) => {
                const changes = Array.isArray(log.detail?.changes) ? (log.detail?.changes as Array<Record<string, unknown>>) : [];
                return {
                  children: (
                    <Space direction="vertical" size={8} style={{ width: "100%" }}>
                      <Space size={8} wrap>
                        <Typography.Text strong>{formatAction(log.action)}</Typography.Text>
                        <Typography.Text type="secondary">
                          {new Date(log.created_at).toLocaleString(locale, { hour12: false })}
                        </Typography.Text>
                      </Space>
                      {changes.length > 0 ? (
                        <List
                          size="small"
                          bordered
                          dataSource={changes}
                          renderItem={(item) => (
                            <List.Item>
                              <Space direction="vertical" size={2} style={{ width: "100%" }}>
                                <Typography.Text strong>{formatValue(item.field)}</Typography.Text>
                                <Typography.Text type="secondary">{t("修改前：")} {formatValue(item.before)}</Typography.Text>
                                <Typography.Text>{t("修改后：")} {formatValue(item.after)}</Typography.Text>
                              </Space>
                            </List.Item>
                          )}
                        />
                      ) : log.detail ? (
                        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                          {JSON.stringify(translateDetailValue(log.detail), null, 2)}
                        </Typography.Paragraph>
                      ) : (
                        <Typography.Text type="secondary">{t("无额外明细")}</Typography.Text>
                      )}
                    </Space>
                  )
                };
              })}
            />
          </Space>
        ) : null}
      </Modal>
    </>
  );
}
