import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Form,
  Grid,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import type {
  DeveloperAccessApp,
  DeveloperAccessLog,
  DeveloperGroup,
  DeveloperManagedUser,
} from "../../types";
import { useDeveloperTranslation } from "../../i18n";

type Props = {
  groups: DeveloperGroup[];
  managedUsers: DeveloperManagedUser[];
  selectedManagedUserIDs: string[];
  setSelectedManagedUserIDs: (ids: string[]) => void;
  managedUsersTotal: number;
  managedUsersPage: number;
  managedUsersPageSize: number;
  managedUsersAppID: string;
  managedUsersEmailKeyword: string;
  accessApps: DeveloperAccessApp[];
  accessLogs: DeveloperAccessLog[];
  accessLogsTotal: number;
  accessLogsPage: number;
  accessLogsPageSize: number;
  deletingAccessLogs: boolean;
  selectedAccessLogIds: string[];
  setSelectedAccessLogIds: (ids: string[]) => void;
  onCreateGroup: (values: { name: string; description?: string }) => Promise<void>;
  onUpdateGroup: (id: string, values: { name: string; description?: string }) => Promise<void>;
  onDeleteGroup: (id: string) => Promise<void>;
  onManagedUsersPageChange: (page: number, pageSize: number) => void;
  onManagedUsersAppFilterChange: (appId: string) => void;
  onManagedUsersEmailKeywordChange: (keyword: string) => void;
  onBatchUpdateManagedUserGroups: (groupIds: string[]) => Promise<void>;
  onUpdateManagedUserGroups: (userId: string, groupIds: string[]) => Promise<void>;
  onUpdateAppBindings: (appId: string, groupIds: string[]) => Promise<void>;
  onBanUser: (appId: string, payload: { user_id: string; reason: string; expires_at?: string }) => Promise<void>;
  onUnbanUser: (appId: string, userId: string) => Promise<void>;
  onAccessLogsPageChange: (page: number, pageSize: number) => void;
  onDeleteSelectedLogs: () => void;
};

type GroupFormValues = {
  name: string;
  description?: string;
};

type BanFormValues = {
  user_id: string;
  reason: string;
  expires_at?: string;
};

type BatchGroupFormValues = {
  group_ids: string[];
};

export function DeveloperUserAccess({
  groups,
  managedUsers,
  selectedManagedUserIDs,
  setSelectedManagedUserIDs,
  managedUsersTotal,
  managedUsersPage,
  managedUsersPageSize,
  managedUsersAppID,
  managedUsersEmailKeyword,
  accessApps,
  accessLogs,
  accessLogsTotal,
  accessLogsPage,
  accessLogsPageSize,
  deletingAccessLogs,
  selectedAccessLogIds,
  setSelectedAccessLogIds,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onManagedUsersPageChange,
  onManagedUsersAppFilterChange,
  onManagedUsersEmailKeywordChange,
  onBatchUpdateManagedUserGroups,
  onUpdateManagedUserGroups,
  onUpdateAppBindings,
  onBanUser,
  onUnbanUser,
  onAccessLogsPageChange,
  onDeleteSelectedLogs,
}: Props) {
  const { modal } = App.useApp();
  const { t } = useDeveloperTranslation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [groupForm] = Form.useForm<GroupFormValues>();
  const [banForm] = Form.useForm<BanFormValues>();
  const [batchGroupForm] = Form.useForm<BatchGroupFormValues>();
  const [editingGroup, setEditingGroup] = useState<DeveloperGroup | null>(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [batchGroupModalOpen, setBatchGroupModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("groups");
  const [selectedAppId, setSelectedAppId] = useState<string>(
    managedUsersAppID || accessApps[0]?.app_id || "",
  );

  useEffect(() => {
    if (accessApps.length === 0) {
      if (selectedAppId !== "") {
        setSelectedAppId("");
      }
      return;
    }
    if (!accessApps.some((item) => item.app_id === selectedAppId)) {
      setSelectedAppId(accessApps[0]?.app_id || "");
    }
  }, [accessApps, selectedAppId]);

  useEffect(() => {
    if (activeTab !== "apps") {
      return;
    }
    onManagedUsersAppFilterChange(selectedAppId);
  }, [activeTab, onManagedUsersAppFilterChange, selectedAppId]);

  useEffect(() => {
    if (managedUsersAppID && managedUsersAppID !== selectedAppId) {
      setSelectedAppId(managedUsersAppID);
    }
  }, [managedUsersAppID, selectedAppId]);

  const selectedApp = useMemo(
    () => accessApps.find((item) => item.app_id === selectedAppId) || accessApps[0],
    [accessApps, selectedAppId],
  );

  function openCreateGroup() {
    setEditingGroup(null);
    groupForm.resetFields();
    setGroupModalOpen(true);
  }

  function openEditGroup(group: DeveloperGroup) {
    setEditingGroup(group);
    groupForm.setFieldsValue({
      name: group.name,
      description: group.description,
    });
    setGroupModalOpen(true);
  }

  async function submitGroup() {
    const values = await groupForm.validateFields();
    if (editingGroup) {
      await onUpdateGroup(editingGroup.id, values);
    } else {
      await onCreateGroup(values);
    }
    setGroupModalOpen(false);
  }

  async function submitBan() {
    const values = await banForm.validateFields();
    if (!selectedApp) {
      return;
    }
    await onBanUser(selectedApp.app_id, values);
    setBanModalOpen(false);
    banForm.resetFields();
  }

  async function submitBatchGroupUpdate() {
    const values = await batchGroupForm.validateFields();
    await onBatchUpdateManagedUserGroups(values.group_ids ?? []);
    setBatchGroupModalOpen(false);
    batchGroupForm.resetFields();
  }

  function openAuthorizedAppsDetail(record: DeveloperManagedUser) {
    const authorizedApps = record.authorized_apps ?? [];
    Modal.info({
      title: t("userAccess.authorizedAppsDetailTitle", {
        name: record.display_name || record.user_id,
      }),
      okText: t("common.confirm"),
      width: isMobile ? "calc(100vw - 24px)" : 560,
      content: (
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Text type="secondary">
            {t("userAccess.authorizedAppsCount", { count: authorizedApps.length })}
          </Typography.Text>
          {authorizedApps.length > 0 ? (
            <Space wrap>
              {authorizedApps.map((app) => (
                <Tag key={app.app_id}>{app.app_name}</Tag>
              ))}
            </Space>
          ) : (
            <Typography.Text type="secondary">{t("common.noData")}</Typography.Text>
          )}
        </Space>
      ),
    });
  }

  return (
    <>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          if (key === "users") {
            onManagedUsersAppFilterChange("");
          }
          if (key === "apps") {
            onManagedUsersAppFilterChange(selectedAppId);
          }
        }}
        items={[
          {
            key: "groups",
            label: t("userAccess.groupsTab"),
            children: (
              <Card>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: isMobile ? "stretch" : "center",
                    flexDirection: isMobile ? "column" : "row",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    {t("userAccess.groupsTab")}
                  </Typography.Title>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={openCreateGroup}
                    style={isMobile ? { width: "100%" } : undefined}
                  >
                    {t("userAccess.createGroup")}
                  </Button>
                </div>
                <Table
                  rowKey="id"
                  pagination={false}
                  scroll={{ x: "max-content" }}
                  dataSource={groups}
                  columns={[
                    { title: t("userAccess.groupName"), dataIndex: "name", width: 180, ellipsis: true },
                    { title: t("userAccess.groupDescription"), dataIndex: "description", width: 260, ellipsis: true },
                    { title: t("userAccess.members"), dataIndex: "member_count", width: 100 },
                    { title: t("userAccess.boundApps"), dataIndex: "bound_app_count", width: 110 },
                    {
                      title: t("console.columns.actions"),
                      width: 180,
                      render: (_, record: DeveloperGroup) => (
                        <Space wrap>
                          <Button size={isMobile ? "small" : "middle"} onClick={() => openEditGroup(record)}>
                            {t("common.edit")}
                          </Button>
                          <Button
                            danger
                            ghost
                            size={isMobile ? "small" : "middle"}
                            onClick={() =>
                              Modal.confirm({
                                title: t("userAccess.deleteGroupConfirmTitle", { name: record.name }),
                                okText: t("common.confirm"),
                                cancelText: t("common.cancel"),
                                okButtonProps: { danger: true },
                                onOk: () => onDeleteGroup(record.id),
                              })
                            }
                          >
                            {t("common.delete")}
                          </Button>
                        </Space>
                      ),
                    },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: "users",
            label: t("userAccess.usersTab"),
            children: (
              <Card>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: isMobile ? "stretch" : "center",
                    flexDirection: isMobile ? "column" : "row",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <Space wrap>
                    <Select
                      allowClear
                      showSearch
                      placeholder={t("userAccess.filterAuthorizedApp")}
                      style={{ width: isMobile ? "100%" : 240, maxWidth: "100%" }}
                      value={managedUsersAppID || undefined}
                      options={accessApps.map((item) => ({
                        value: item.app_id,
                        label: item.name,
                      }))}
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        String(option?.label || "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      onChange={(value) => onManagedUsersAppFilterChange(value || "")}
                    />
                    <Input.Search
                      allowClear
                      placeholder={t("userAccess.searchUserByEmail")}
                      style={{ width: isMobile ? "100%" : 260, maxWidth: "100%" }}
                      value={managedUsersEmailKeyword}
                      onChange={(event) =>
                        onManagedUsersEmailKeywordChange(event.target.value)
                      }
                    />
                  </Space>
                  <Space wrap>
                    <Button
                      type="primary"
                      disabled={selectedManagedUserIDs.length === 0}
                      style={isMobile ? { width: "100%" } : undefined}
                      onClick={() => {
                        batchGroupForm.setFieldsValue({ group_ids: [] });
                        setBatchGroupModalOpen(true);
                      }}
                    >
                      {t("userAccess.batchSetGroups")}
                    </Button>
                  </Space>
                </div>
                <Table
                  rowKey="user_id"
                  scroll={{ x: "max-content" }}
                  rowSelection={{
                    selectedRowKeys: selectedManagedUserIDs,
                    onChange: (selectedRowKeys) =>
                      setSelectedManagedUserIDs(selectedRowKeys as string[]),
                  }}
                  pagination={{
                    current: managedUsersPage,
                    pageSize: managedUsersPageSize,
                    total: managedUsersTotal,
                    showSizeChanger: true,
                    pageSizeOptions: [10, 20, 50, 100],
                    onChange: (page, pageSize) =>
                      onManagedUsersPageChange(page, pageSize),
                    onShowSizeChange: (_, pageSize) =>
                      onManagedUsersPageChange(1, pageSize),
                  }}
                  dataSource={managedUsers}
                  columns={[
                    { title: t("common.displayName"), dataIndex: "display_name", width: 160, ellipsis: true },
                    { title: t("userAccess.maskedEmail"), dataIndex: "masked_email", width: 220, ellipsis: true },
                    { title: t("userAccess.maskedPhone"), dataIndex: "masked_phone", width: 160, ellipsis: true },
                    {
                      title: t("userAccess.groups"),
                      width: 300,
                      render: (_, record: DeveloperManagedUser) => (
                        <Select
                          mode="multiple"
                          style={{ minWidth: isMobile ? 220 : 260 }}
                          value={record.group_ids ?? []}
                          options={groups.map((group) => ({ label: group.name, value: group.id }))}
                          onChange={(values) => void onUpdateManagedUserGroups(record.user_id, values)}
                        />
                      ),
                    },
                    {
                      title: t("userAccess.authorizedApps"),
                      width: 160,
                      render: (_, record: DeveloperManagedUser) => {
                        const authorizedApps = record.authorized_apps ?? [];
                        return (
                          <Space>
                            <Typography.Text type="secondary">
                              {t("userAccess.authorizedAppsShortCount", { count: authorizedApps.length })}
                            </Typography.Text>
                            <Button size={isMobile ? "small" : "middle"} onClick={() => openAuthorizedAppsDetail(record)}>
                              {t("common.details")}
                            </Button>
                          </Space>
                        );
                      },
                    },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: "apps",
            label: t("userAccess.appsTab"),
            children: (
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Card>
                  <Space direction="vertical" size={12} style={{ width: "100%" }}>
                    <Typography.Text strong>{t("userAccess.selectApp")}</Typography.Text>
                    <Select
                      style={{ width: "100%" }}
                      value={selectedApp?.app_id}
                      showSearch
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        String(option?.label || "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      onChange={(value) => {
                        setSelectedAppId(value);
                        onManagedUsersAppFilterChange(value);
                      }}
                      options={accessApps.map((item) => ({
                        value: item.app_id,
                        label: `${item.name} (${item.client_id})`,
                      }))}
                    />
                    {selectedApp ? (
                      <>
                        <Typography.Text type="secondary">
                          {t("userAccess.noGroupsBound")}
                        </Typography.Text>
                        <Select
                          mode="multiple"
                          style={{ width: "100%" }}
                          value={selectedApp.bound_group_ids}
                          options={groups.map((group) => ({ label: group.name, value: group.id }))}
                          onChange={(values) => void onUpdateAppBindings(selectedApp.app_id, values)}
                        />
                        <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                          <Button type="dashed" onClick={() => setBanModalOpen(true)}>
                            {t("userAccess.banUser")}
                          </Button>
                        </div>
                      </>
                    ) : null}
                  </Space>
                </Card>
                <Card title={t("userAccess.currentAppUsers")}>
                  <Table
                    rowKey="user_id"
                    scroll={{ x: "max-content" }}
                    pagination={{
                      current: managedUsersPage,
                      pageSize: managedUsersPageSize,
                      total: managedUsersTotal,
                      showSizeChanger: true,
                      pageSizeOptions: [10, 20, 50, 100],
                      onChange: (page, pageSize) =>
                        onManagedUsersPageChange(page, pageSize),
                      onShowSizeChange: (_, pageSize) =>
                        onManagedUsersPageChange(1, pageSize),
                    }}
                    dataSource={managedUsers}
                    columns={[
                      { title: t("common.displayName"), dataIndex: "display_name", width: 160, ellipsis: true },
                      { title: t("userAccess.maskedEmail"), dataIndex: "masked_email", width: 220, ellipsis: true },
                      {
                        title: t("userAccess.groups"),
                        width: 240,
                        render: (_, record: DeveloperManagedUser) => (
                          <Space wrap>
                            {(record.group_names ?? []).map((groupName) => (
                              <Tag key={groupName}>{groupName}</Tag>
                            ))}
                          </Space>
                        ),
                      },
                      {
                        title: t("userAccess.banStatus"),
                        width: 220,
                        render: (_, record: DeveloperManagedUser) => {
                          const ban = (record.app_bans ?? []).find(
                            (item) => item.app_id === selectedApp?.app_id,
                          );
                          if (!ban) {
                            return <Tag color="green">{t("userAccess.normalStatus")}</Tag>;
                          }
                          return (
                            <Space wrap>
                              <Tag color="red">{ban.reason || t("userAccess.bannedStatus")}</Tag>
                              <Button
                                type="link"
                                danger
                                size={isMobile ? "small" : "middle"}
                                onClick={() => void onUnbanUser(ban.app_id, record.user_id)}
                              >
                                {t("userAccess.unbanUser")}
                              </Button>
                            </Space>
                          );
                        },
                      },
                    ]}
                  />
                </Card>
              </Space>
            ),
          },
          {
            key: "logs",
            label: t("userAccess.logsTab"),
            children: (
              <Card>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: isMobile ? "stretch" : "center",
                    flexDirection: isMobile ? "column" : "row",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    {t("userAccess.logsTab")}
                  </Typography.Title>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    disabled={selectedAccessLogIds.length === 0}
                    loading={deletingAccessLogs}
                    style={isMobile ? { width: "100%" } : undefined}
                    onClick={onDeleteSelectedLogs}
                  >
                    {t("userAccess.accessLogDelete")}
                  </Button>
                </div>
                <Table
                  rowKey="id"
                  scroll={{ x: "max-content" }}
                  pagination={{
                    current: accessLogsPage,
                    pageSize: accessLogsPageSize,
                    total: accessLogsTotal,
                    showSizeChanger: true,
                    pageSizeOptions: [10, 20, 50, 100],
                    onChange: (page, pageSize) =>
                      onAccessLogsPageChange(page, pageSize),
                    onShowSizeChange: (_, pageSize) =>
                      onAccessLogsPageChange(1, pageSize),
                  }}
                  rowSelection={{
                    selectedRowKeys: selectedAccessLogIds,
                    onChange: (keys) => setSelectedAccessLogIds(keys.map(String)),
                  }}
                  dataSource={accessLogs}
                  columns={[
                    { title: t("userAccess.logAction"), dataIndex: "action", width: 180, ellipsis: true },
                    { title: t("userAccess.logTarget"), dataIndex: "target_id", width: 180, ellipsis: true },
                    { title: t("userAccess.logApp"), dataIndex: "app_id", width: 180, ellipsis: true },
                    { title: t("userAccess.logUser"), dataIndex: "user_id", width: 180, ellipsis: true },
                    { title: t("userAccess.logTime"), dataIndex: "created_at", width: 180, ellipsis: true },
                  ]}
                />
              </Card>
            ),
          },
        ]}
      />
      <Modal
        title={editingGroup ? t("userAccess.editGroup") : t("userAccess.createGroup")}
        open={groupModalOpen}
        width={isMobile ? "calc(100vw - 24px)" : 520}
        okText={t("common.confirm")}
        cancelText={t("common.cancel")}
        onOk={() => void submitGroup()}
        onCancel={() => setGroupModalOpen(false)}
      >
        <Form layout="vertical" form={groupForm}>
          <Form.Item name="name" label={t("userAccess.groupName")} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label={t("userAccess.groupDescription")}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={t("userAccess.banUser")}
        open={banModalOpen}
        width={isMobile ? "calc(100vw - 24px)" : 520}
        okText={t("common.confirm")}
        cancelText={t("common.cancel")}
        onOk={() => void submitBan()}
        onCancel={() => setBanModalOpen(false)}
      >
        <Form layout="vertical" form={banForm}>
          <Form.Item name="user_id" label={t("userAccess.logUser")} rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                String(option?.label || "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={managedUsers.map((item) => ({
                value: item.user_id,
                label: `${item.display_name} (${item.masked_email || item.masked_phone || item.user_id})`,
              }))}
            />
          </Form.Item>
          <Form.Item name="reason" label={t("userAccess.banReason")} rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="expires_at" label={t("userAccess.banExpiresAt")}>
            <Input placeholder={t("userAccess.banExpiresAtPlaceholder")} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={t("userAccess.batchSetGroups")}
        open={batchGroupModalOpen}
        width={isMobile ? "calc(100vw - 24px)" : 520}
        okText={t("common.confirm")}
        cancelText={t("common.cancel")}
        onOk={() => void submitBatchGroupUpdate()}
        onCancel={() => setBatchGroupModalOpen(false)}
      >
        <Form layout="vertical" form={batchGroupForm}>
          <Form.Item>
            <Typography.Text type="secondary">
              {t("userAccess.batchSetGroupsDescription", { count: selectedManagedUserIDs.length })}
            </Typography.Text>
          </Form.Item>
          <Form.Item
            name="group_ids"
            label={t("userAccess.groups")}
            rules={[{ required: true, message: t("userAccess.selectAtLeastOneGroup") }]}
          >
            <Select
              mode="multiple"
              options={groups.map((group) => ({
                value: group.id,
                label: group.name,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
