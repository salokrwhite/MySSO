import { UploadOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, DatePicker, Descriptions, Drawer, Empty, Form, Grid, Input, List, Modal, Select, Space, Spin, Switch, Tag, Timeline, Typography, Upload, message } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import type { AppItem, AuditLog, ScopeDefinition } from "../../types";
import { useAdminI18n } from "../../i18n";
import { BatchActions } from "./BatchActions";
import { AppTable } from "./AppTable";
import { API_BASE } from "../../../../api/client";
import { convertImageToSquareWebp } from "../../utils/imageConverter";
import { deleteAdminAppAuditLogs, uploadAdminAppIcon } from "../../services/adminApi";
import { DeveloperSecretRevealModal } from "../../../developer/components/common/DeveloperSecretRevealModal";

type AppReviewProps = {
  sessionToken: string;
  apps: AppItem[];
  appsTotal: number;
  currentPage: number;
  pageSize: number;
  statusFilter: string;
  nameKeyword: string;
  scopes: ScopeDefinition[];
  selectedAppIds: string[];
  setSelectedAppIds: (value: string[]) => void;
  deletingApps: boolean;
  refreshing: boolean;
  onPageChange: (page: number, pageSize: number) => void;
  onStatusFilterChange: (value: string) => void;
  onNameKeywordChange: (value: string) => void;
  onLoadHistory: (appID: string) => Promise<AuditLog[]>;
  onCreate: (
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
  onResetSecret: (id: string) => Promise<AppItem | undefined>;
  onSetDisabled: (id: string, disabled: boolean) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onRefresh: () => void;
  onBatchDelete: () => void;
};

export function AppReview({
  sessionToken,
  apps,
  appsTotal,
  currentPage,
  pageSize,
  statusFilter,
  nameKeyword,
  scopes,
  selectedAppIds,
  setSelectedAppIds,
  deletingApps,
  refreshing,
  onPageChange,
  onStatusFilterChange,
  onNameKeywordChange,
  onLoadHistory,
  onCreate,
  onReview,
  onUpdate,
  onResetSecret,
  onSetDisabled,
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
  const [creatingApp, setCreatingApp] = useState(false);
  const [detailApp, setDetailApp] = useState<AppItem>();
  const [editingApp, setEditingApp] = useState<AppItem>();
  const [revealedSecret, setRevealedSecret] = useState<{
    title: string;
    clientId: string;
    clientSecret: string;
  }>();
  const [historyApp, setHistoryApp] = useState<AppItem>();
  const [historyLogs, setHistoryLogs] = useState<AuditLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [deletingHistory, setDeletingHistory] = useState(false);
  const [historyRange, setHistoryRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const backendOrigin = API_BASE.replace(/\/api$/, "");
  const iconValue = Form.useWatch("icon_url", editForm) || "";
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const allowedHistoryActions = useMemo(
    () =>
      new Set([
        "developer.app.create",
        "developer.app.update",
        "admin.app.create",
        "admin.app.update",
        "admin.app.create_secret",
        "admin.app.reset_secret",
        "admin.app.disable",
        "admin.app.enable",
        "admin.app.approve",
        "admin.app.reject",
      ]),
    [],
  );

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
      case "admin.app.create":
        return t("管理员创建应用");
      case "admin.app.create_secret":
        return t("管理员创建密钥");
      case "admin.app.reset_secret":
        return t("管理员重置密钥");
      case "admin.app.disable":
        return t("管理员禁用应用");
      case "admin.app.enable":
        return t("管理员启用应用");
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
    if (!editingApp && !creatingApp) {
      return;
    }
    const values = await editForm.validateFields();
    const payload = {
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
    };
    setSubmitting(true);
    try {
      if (creatingApp) {
        await onCreate(payload);
      } else if (editingApp) {
        await onUpdate(editingApp.id, payload);
      }
      editForm.resetFields();
      setEditingApp(undefined);
      setCreatingApp(false);
    } finally {
      setSubmitting(false);
    }
  }

  function openCreateDrawer() {
    editForm.setFieldsValue({
      name: "",
      icon_url: "",
      description: "",
      redirect_uris: "",
      post_logout_redirect_uris: "",
      frontchannel_logout_uri: "",
      allow_get_session_logout: false,
      scopes: ["openid", "profile", "email"].filter((key) => scopes.some((scope) => scope.key === key && scope.enabled))
    });
    setCreatingApp(true);
  }

  async function handleResetSecret(app: AppItem) {
    const actionText = app.has_client_secret ? t("重置密钥") : t("创建密钥");
    Modal.confirm({
      title: t("确认{{action}}？", { action: actionText }),
      content: t("新密钥只会显示一次，请立即复制并保存到服务端配置中。"),
      okText: actionText,
      cancelText: t("取消"),
      onOk: async () => {
        const result = await onResetSecret(app.id);
        if (!result?.client_secret) {
          message.warning(t("后端没有返回新密钥"));
          return;
        }
        setRevealedSecret({
          title: app.has_client_secret ? t("密钥已更新") : t("密钥已创建"),
          clientId: result.client_id,
          clientSecret: result.client_secret,
        });
      },
    });
  }

  function getStatusText(status: string) {
    switch (status) {
      case "approved":
        return t("已通过");
      case "rejected":
        return t("已驳回");
      case "disabled":
        return t("已禁用");
      default:
        return t("待审核");
    }
  }

  function getStatusColor(status: string) {
    if (status === "approved") {
      return "green";
    }
    if (status === "rejected") {
      return "red";
    }
    if (status === "disabled") {
      return "default";
    }
    return "gold";
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

  async function openHistory(app: AppItem) {
    setHistoryApp(app);
    setHistoryLogs([]);
    setLoadingHistory(true);
    try {
      const nextLogs = await onLoadHistory(app.id);
      setHistoryLogs(nextLogs.filter((log) => allowedHistoryActions.has(log.action)));
    } catch (err) {
      message.error(err instanceof Error ? err.message : t("加载操作历史失败"));
    } finally {
      setLoadingHistory(false);
    }
  }

  async function refreshHistory(app: AppItem) {
    setLoadingHistory(true);
    try {
      const nextLogs = await onLoadHistory(app.id);
      setHistoryLogs(nextLogs.filter((log) => allowedHistoryActions.has(log.action)));
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleDeleteHistoryRange() {
    if (!historyApp) {
      return;
    }
    if (!historyRange || !historyRange[0] || !historyRange[1]) {
      message.warning(t("请选择删除时间范围"));
      return;
    }
    setDeletingHistory(true);
    try {
      const result = await deleteAdminAppAuditLogs(sessionToken, historyApp.id, {
        start_at: historyRange[0].startOf("day").toISOString(),
        end_at: historyRange[1].endOf("day").toISOString(),
      });
      message.success(t("已删除指定时间范围内的操作日志"));
      if (result.deleted === 0) {
        message.info(t("没有匹配的操作日志"));
      }
      await refreshHistory(historyApp);
    } catch (err) {
      message.error(err instanceof Error ? err.message : t("删除操作历史失败"));
    } finally {
      setDeletingHistory(false);
    }
  }

  function renderUriList(values?: string[]) {
    if (!values || values.length === 0) {
      return "-";
    }
    return (
      <Space direction="vertical" size={4} style={{ width: "100%" }}>
        {values.map((value) => (
          <Typography.Text key={value} copyable={{ text: value }}>
            {value}
          </Typography.Text>
        ))}
      </Space>
    );
  }

  return (
    <>
      <DeveloperSecretRevealModal
        open={Boolean(revealedSecret)}
        title={revealedSecret?.title || ""}
        clientId={revealedSecret?.clientId || ""}
        clientSecret={revealedSecret?.clientSecret || ""}
        onClose={() => setRevealedSecret(undefined)}
      />

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
              onChange={onStatusFilterChange}
              style={{ width: isMobile ? "100%" : 160 }}
              options={[
                { label: t("全部状态"), value: "all" },
                { label: t("待审核"), value: "pending_review" },
                { label: t("已通过"), value: "approved" },
                { label: t("已驳回"), value: "rejected" },
                { label: t("已禁用"), value: "disabled" }
              ]}
            />
            <Input
              allowClear
              placeholder={t("按应用名称搜索")}
              style={{ width: isMobile ? "100%" : 240 }}
              value={nameKeyword}
              onChange={(event) => onNameKeywordChange(event.target.value)}
            />
          </Space>
          <div style={{ width: isMobile ? "100%" : "auto" }}>
            <Space wrap style={{ width: isMobile ? "100%" : undefined, justifyContent: isMobile ? "stretch" : "flex-end" }}>
              <Button type="primary" onClick={openCreateDrawer} block={isMobile}>
                {t("创建应用")}
              </Button>
              <BatchActions
                selectedCount={selectedAppIds.length}
                loading={deletingApps}
                refreshing={refreshing}
                onRefresh={onRefresh}
                onDelete={onBatchDelete}
              />
            </Space>
          </div>
        </div>
        <AppTable
          apps={apps}
          total={appsTotal}
          currentPage={currentPage}
          pageSize={pageSize}
          selectedAppIds={selectedAppIds}
          setSelectedAppIds={setSelectedAppIds}
          loading={refreshing}
          onPageChange={onPageChange}
          onDetail={(app) => setDetailApp(app)}
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
          onHistory={(app) => void openHistory(app)}
          onResetSecret={(app) => void handleResetSecret(app)}
          onSetDisabled={(app, disabled) => {
            Modal.confirm({
              title: disabled ? t("确认禁用应用？") : t("确认启用应用？"),
              content: disabled
                ? t("禁用后，该应用无法继续完成授权和换取令牌。")
                : t("启用后，该应用会恢复为已通过状态。"),
              okText: disabled ? t("确认禁用") : t("确认启用"),
              cancelText: t("取消"),
              okButtonProps: { danger: disabled },
              onOk: () => onSetDisabled(app.id, disabled),
            });
          }}
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

      <Drawer
        title={creatingApp ? t("创建应用") : t("编辑应用")}
        open={creatingApp || Boolean(editingApp)}
        width={isMobile ? "100vw" : 560}
        placement="right"
        destroyOnHidden
        maskClosable={!submitting}
        onClose={() => {
          if (submitting) {
            return;
          }
          editForm.resetFields();
          setEditingApp(undefined);
          setCreatingApp(false);
        }}
        footer={
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button
              disabled={submitting}
              onClick={() => {
                editForm.resetFields();
                setEditingApp(undefined);
                setCreatingApp(false);
              }}
            >
              {t("取消")}
            </Button>
            <Button type="primary" loading={submitting} onClick={() => void handleEditSubmit()}>
              {creatingApp ? t("创建") : t("保存")}
            </Button>
          </Space>
        }
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
      </Drawer>

      <Drawer
        title={detailApp ? t("应用详情 · {{name}}", { name: detailApp.name }) : t("应用详情")}
        open={Boolean(detailApp)}
        width={isMobile ? "100vw" : 640}
        placement="right"
        destroyOnHidden
        onClose={() => setDetailApp(undefined)}
      >
        {detailApp ? (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label={t("应用名称")}>{detailApp.name}</Descriptions.Item>
              <Descriptions.Item label="Client ID">
                <Typography.Text copyable={{ text: detailApp.client_id }}>
                  {detailApp.client_id}
                </Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label={t("描述")}>{detailApp.description || "-"}</Descriptions.Item>
              <Descriptions.Item label={t("当前状态")}>
                <Tag color={getStatusColor(detailApp.status)}>{getStatusText(detailApp.status)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t("归属")}>
                {detailApp.admin_created ? t("管理员创建") : t("开发者提交")}
              </Descriptions.Item>
              <Descriptions.Item label={t("密钥状态")}>
                {detailApp.has_client_secret ? t("已创建") : t("未创建")}
              </Descriptions.Item>
              <Descriptions.Item label={t("意见")}>{detailApp.review_comment || "-"}</Descriptions.Item>
              <Descriptions.Item label={t("回调地址")}>
                {renderUriList(detailApp.redirect_uris)}
              </Descriptions.Item>
              <Descriptions.Item label={t("退出后回跳地址")}>
                {renderUriList(detailApp.post_logout_redirect_uris)}
              </Descriptions.Item>
              <Descriptions.Item label={t("Front-Channel Logout 地址")}>
                {detailApp.frontchannel_logout_uri || "-"}
              </Descriptions.Item>
              <Descriptions.Item label={t("允许 GET 会话退出")}>
                {detailApp.allow_get_session_logout ? t("开启") : t("关闭")}
              </Descriptions.Item>
              <Descriptions.Item label="Scopes">
                {detailApp.scopes && detailApp.scopes.length > 0 ? (
                  <Space wrap>
                    {detailApp.scopes.map((scope) => (
                      <Tag key={scope}>{scope}</Tag>
                    ))}
                  </Space>
                ) : "-"}
              </Descriptions.Item>
            </Descriptions>
          </Space>
        ) : null}
      </Drawer>

      <Drawer
        title={historyApp ? t("操作历史 · {{name}}", { name: historyApp.name }) : t("操作历史")}
        open={Boolean(historyApp)}
        width={isMobile ? "100vw" : 760}
        placement="right"
        destroyOnHidden
        onClose={() => {
          setHistoryApp(undefined);
          setHistoryLogs([]);
          setHistoryRange(null);
        }}
      >
        {historyApp ? (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label={t("应用名称")}>{historyApp.name}</Descriptions.Item>
              <Descriptions.Item label="Client ID">{historyApp.client_id}</Descriptions.Item>
              <Descriptions.Item label={t("当前状态")}>
                <Tag color={getStatusColor(historyApp.status)}>{getStatusText(historyApp.status)}</Tag>
              </Descriptions.Item>
            </Descriptions>

            <Space wrap style={{ justifyContent: "space-between", width: "100%" }}>
              <Space wrap>
                <DatePicker.RangePicker
                  showTime={false}
                  value={historyRange}
                  onChange={(value) =>
                    setHistoryRange((value as [Dayjs | null, Dayjs | null]) ?? null)
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
                  loading={deletingHistory}
                  disabled={!historyRange || !historyRange[0] || !historyRange[1]}
                  onClick={() => {
                    Modal.confirm({
                      title: t("确认删除指定时间范围内的操作日志？"),
                      content: t("删除后不可恢复。"),
                      okText: t("确认删除"),
                      cancelText: t("取消"),
                      okButtonProps: { danger: true },
                      onOk: () => handleDeleteHistoryRange(),
                    });
                  }}
                >
                  {t("删除时间范围日志")}
                </Button>
              </Space>
              <Button loading={loadingHistory} onClick={() => void refreshHistory(historyApp)}>
                {t("刷新")}
              </Button>
            </Space>

            <Spin spinning={loadingHistory}>
              {historyLogs.length > 0 ? (
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
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("暂无操作历史")} />
              )}
            </Spin>
          </Space>
        ) : null}
      </Drawer>
    </>
  );
}
