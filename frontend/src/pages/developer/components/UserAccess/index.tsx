import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Drawer,
  Form,
  Grid,
  Input,
  Modal,
  Radio,
  Segmented,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  memberCandidateUsers: DeveloperManagedUser[];
  selectedManagedUserIDs: string[];
  setSelectedManagedUserIDs: (ids: string[]) => void;
  managedUsersTotal: number;
  managedUsersPage: number;
  managedUsersPageSize: number;
  managedUsersAppID: string;
  managedUsersEmailKeyword: string;
  memberCandidateEmailKeyword: string;
  accessApps: DeveloperAccessApp[];
  accessLogs: DeveloperAccessLog[];
  accessLogsTotal: number;
  accessLogsPage: number;
  accessLogsPageSize: number;
  deletingAccessLogs: boolean;
  selectedAccessLogIds: string[];
  setSelectedAccessLogIds: (ids: string[]) => void;
  onCreateGroup: (values: { name: string; description?: string }) => Promise<DeveloperGroup | void>;
  onUpdateGroup: (id: string, values: { name: string; description?: string }) => Promise<void>;
  onDeleteGroup: (id: string) => Promise<void>;
  onManagedUsersPageChange: (page: number, pageSize: number) => void;
  onManagedUsersAppFilterChange: (appId: string) => void;
  onManagedUsersGroupFilterChange: (groupIds: string[]) => void;
  onManagedUsersEmailKeywordChange: (keyword: string) => void;
  onMemberCandidateEmailKeywordChange: (keyword: string) => void;
  onBatchUpdateManagedUserGroups: (
    groupIds: string[],
    mode?: BatchGroupMode,
    userIds?: string[],
  ) => Promise<void>;
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
  app_ids: string[];
  user_id?: string;
  reason: string;
};

type BatchGroupFormValues = {
  group_ids: string[];
  mode?: BatchGroupMode;
};

type BatchGroupMode = "append" | "replace" | "remove";

type UserQuickFilter = "all" | "ungrouped" | "recent";

type UserAccessTabKey = "groups" | "users" | "apps" | "groupMembers" | "logs";

const userAccessTabKeys = new Set<UserAccessTabKey>([
  "groups",
  "users",
  "apps",
  "groupMembers",
  "logs",
]);

function resolveUserAccessTab(value: string | null): UserAccessTabKey {
  return value && userAccessTabKeys.has(value as UserAccessTabKey)
    ? (value as UserAccessTabKey)
    : "groups";
}

function formatAccessLogTime(value: string) {
  return String(value || "").replace("T", " ").replace(/Z$/, "");
}

function accessLogDetailCount(
  detail: Record<string, unknown> | undefined,
  key: string,
) {
  const value = detail?.[key];
  if (Array.isArray(value)) {
    return value.length;
  }
  if (typeof value === "number") {
    return value;
  }
  return 0;
}

function buildAccessLogDisplay(
  log: DeveloperAccessLog,
  t: ReturnType<typeof useDeveloperTranslation>["t"],
) {
  const groupCount = accessLogDetailCount(log.detail, "group_ids");
  const userCount = accessLogDetailCount(log.detail, "user_ids");
  const fallbackTarget = log.user_id || log.app_id || log.group_id || log.target_id || "";

  switch (log.action) {
    case "developer.group.create":
      return {
        action: t("userAccess.accessLogActions.groupCreate"),
        summary: t("userAccess.accessLogSummaries.groupCreate", {
          name: String(log.detail?.name || fallbackTarget || t("common.unnamedTarget")),
        }),
      };
    case "developer.group.update":
      return {
        action: t("userAccess.accessLogActions.groupUpdate"),
        summary: t("userAccess.accessLogSummaries.groupUpdate", {
          name: String(log.detail?.name || fallbackTarget || t("common.unnamedTarget")),
        }),
      };
    case "developer.group.delete":
      return {
        action: t("userAccess.accessLogActions.groupDelete"),
        summary: t("userAccess.accessLogSummaries.groupDelete", {
          name: String(log.detail?.name || fallbackTarget || t("common.unnamedTarget")),
        }),
      };
    case "developer.user.groups.update":
      return {
        action: t("userAccess.accessLogActions.userGroupsUpdate"),
        summary: t("userAccess.accessLogSummaries.userGroupsUpdate", {
          groupCount,
        }),
      };
    case "developer.user.groups.batch_update":
      return {
        action: t("userAccess.accessLogActions.userGroupsBatchUpdate"),
        summary: t("userAccess.accessLogSummaries.userGroupsBatchUpdate", {
          userCount,
          groupCount,
          mode: t(`userAccess.batchGroupMode${String(log.detail?.mode || "append")
            .slice(0, 1)
            .toUpperCase()}${String(log.detail?.mode || "append").slice(1)}`),
        }),
      };
    case "developer.app.group_bindings.update":
      return {
        action: t("userAccess.accessLogActions.appBindingsUpdate"),
        summary: t("userAccess.accessLogSummaries.appBindingsUpdate", {
          groupCount,
        }),
      };
    case "developer.app.user_ban.create":
      return {
        action: t("userAccess.accessLogActions.userBanCreate"),
        summary: t("userAccess.accessLogSummaries.userBanCreate", {
          reason: String(log.detail?.reason || t("userAccess.bannedStatus")),
        }),
      };
    case "developer.app.user_ban.delete":
      return {
        action: t("userAccess.accessLogActions.userBanDelete"),
        summary: t("userAccess.accessLogSummaries.userBanDelete"),
      };
    default:
      return {
        action: t("userAccess.accessLogActions.generic"),
        summary: t("userAccess.accessLogSummaries.generic"),
      };
  }
}

export function DeveloperUserAccess({
  groups,
  managedUsers,
  memberCandidateUsers,
  selectedManagedUserIDs,
  setSelectedManagedUserIDs,
  managedUsersTotal,
  managedUsersPage,
  managedUsersPageSize,
  managedUsersAppID,
  managedUsersEmailKeyword,
  memberCandidateEmailKeyword,
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
  onManagedUsersGroupFilterChange,
  onManagedUsersEmailKeywordChange,
  onMemberCandidateEmailKeywordChange,
  onBatchUpdateManagedUserGroups,
  onUpdateAppBindings,
  onBanUser,
  onUnbanUser,
  onAccessLogsPageChange,
  onDeleteSelectedLogs,
}: Props) {
  const { t } = useDeveloperTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [groupForm] = Form.useForm<GroupFormValues>();
  const [banForm] = Form.useForm<BanFormValues>();
  const [batchGroupForm] = Form.useForm<BatchGroupFormValues>();
  const [editingGroup, setEditingGroup] = useState<DeveloperGroup | null>(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [authorizedAppsDrawerUser, setAuthorizedAppsDrawerUser] =
    useState<DeveloperManagedUser | null>(null);
  const [banSubmitting, setBanSubmitting] = useState(false);
  const [banTargetUserIDs, setBanTargetUserIDs] = useState<string[]>([]);
  const [batchGroupModalOpen, setBatchGroupModalOpen] = useState(false);
  const [batchGroupSubmitting, setBatchGroupSubmitting] = useState(false);
  const [batchTargetUserIDs, setBatchTargetUserIDs] = useState<string[]>([]);
  const [selectedGroupMemberIDs, setSelectedGroupMemberIDs] = useState<string[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [addGroupMemberModalOpen, setAddGroupMemberModalOpen] = useState(false);
  const [groupMemberForm] = Form.useForm<{ user_ids: string[] }>();
  const [activeTab, setActiveTab] = useState<UserAccessTabKey>(() =>
    resolveUserAccessTab(searchParams.get("tab")),
  );
  const [userQuickFilter, setUserQuickFilter] = useState<UserQuickFilter>("all");
  const [selectedUserGroupFilter, setSelectedUserGroupFilter] = useState<string[]>([]);
  const [emailSearchInput, setEmailSearchInput] = useState(
    managedUsersEmailKeyword,
  );
  const [memberCandidateSearchInput, setMemberCandidateSearchInput] = useState(
    memberCandidateEmailKeyword,
  );
  const [selectedAppId, setSelectedAppId] = useState<string>(
    managedUsersAppID || accessApps[0]?.app_id || "",
  );

  const selectedApp = useMemo(
    () => accessApps.find((item) => item.app_id === selectedAppId) || accessApps[0],
    [accessApps, selectedAppId],
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
    const urlTab = resolveUserAccessTab(searchParams.get("tab"));
    if (urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [activeTab, searchParams]);

  useEffect(() => {
    if (activeTab !== "groupMembers") {
      return;
    }
    setSelectedManagedUserIDs([]);
    onManagedUsersAppFilterChange("");
    onManagedUsersGroupFilterChange(selectedGroupId ? [selectedGroupId] : []);
  }, [
    activeTab,
    onManagedUsersAppFilterChange,
    onManagedUsersGroupFilterChange,
    selectedGroupId,
    setSelectedManagedUserIDs,
  ]);

  useEffect(() => {
    if (activeTab !== "users") {
      return;
    }
    onManagedUsersAppFilterChange("");
    onManagedUsersGroupFilterChange(selectedUserGroupFilter);
  }, [
    activeTab,
    onManagedUsersAppFilterChange,
    onManagedUsersGroupFilterChange,
    selectedUserGroupFilter,
  ]);

  useEffect(() => {
    if (managedUsersAppID && managedUsersAppID !== selectedAppId) {
      setSelectedAppId(managedUsersAppID);
    }
  }, [managedUsersAppID, selectedAppId]);

  useEffect(() => {
    setEmailSearchInput(managedUsersEmailKeyword);
  }, [managedUsersEmailKeyword]);

  useEffect(() => {
    setMemberCandidateSearchInput(memberCandidateEmailKeyword);
  }, [memberCandidateEmailKeyword]);

  useEffect(() => {
    const currentUserIds = new Set(managedUsers.map((item) => item.user_id));
    setSelectedGroupMemberIDs((ids) => ids.filter((id) => currentUserIds.has(id)));
  }, [managedUsers]);

  const visibleManagedUsers = useMemo(() => {
    if (userQuickFilter === "ungrouped") {
      return managedUsers.filter((item) => (item.group_ids ?? []).length === 0);
    }
    if (userQuickFilter === "recent") {
      return [...managedUsers].sort((a, b) => {
        const left = Date.parse(a.last_authorized_at || "");
        const right = Date.parse(b.last_authorized_at || "");
        return (Number.isNaN(right) ? 0 : right) - (Number.isNaN(left) ? 0 : left);
      });
    }
    return managedUsers;
  }, [managedUsers, userQuickFilter]);

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
    const appIDs = (values.app_ids ?? []).filter(Boolean);
    const targetUserIDs = banTargetUserIDs.length > 0
      ? banTargetUserIDs
      : values.user_id
        ? [values.user_id]
        : [];
    if (targetUserIDs.length === 0 || appIDs.length === 0) {
      return;
    }
    setBanSubmitting(true);
    try {
      for (const appId of appIDs) {
        for (const userId of targetUserIDs) {
          await onBanUser(appId, {
            user_id: userId,
            reason: values.reason,
          });
        }
      }
      setBanModalOpen(false);
      setBanTargetUserIDs([]);
      banForm.resetFields();
    } finally {
      setBanSubmitting(false);
    }
  }

  async function submitBatchGroupUpdate() {
    if (batchTargetUserIDs.length === 0) {
      return;
    }
    setBatchGroupSubmitting(true);
    try {
      const values = await batchGroupForm.validateFields();
      await onBatchUpdateManagedUserGroups(
        values.group_ids ?? [],
        values.mode ?? "append",
        batchTargetUserIDs,
      );
      setBatchGroupModalOpen(false);
      batchGroupForm.resetFields();
      setBatchTargetUserIDs([]);
    } finally {
      setBatchGroupSubmitting(false);
    }
  }

  function openBatchGroupModal(userIds: string[]) {
    setBatchTargetUserIDs(userIds);
    batchGroupForm.setFieldsValue({ group_ids: [], mode: "append" });
    setBatchGroupModalOpen(true);
  }

  function openBanModal(userIds: string[] = []) {
    setBanTargetUserIDs(userIds);
    banForm.resetFields();
    setBanModalOpen(true);
  }

  function openAddGroupMemberModal() {
    setMemberCandidateSearchInput(memberCandidateEmailKeyword);
    groupMemberForm.resetFields();
    setAddGroupMemberModalOpen(true);
  }

  async function submitAddGroupMembers() {
    if (!selectedGroupId) {
      return;
    }
    const values = await groupMemberForm.validateFields();
    await onBatchUpdateManagedUserGroups(
      [selectedGroupId],
      "append",
      values.user_ids ?? [],
    );
    setAddGroupMemberModalOpen(false);
    groupMemberForm.resetFields();
  }

  async function removeSelectedGroupMembers() {
    if (!selectedGroupId || selectedGroupMemberIDs.length === 0) {
      return;
    }
    const selectedUserSet = new Set(selectedGroupMemberIDs);
    const targets = managedUsers.filter((item) => selectedUserSet.has(item.user_id));
    await onBatchUpdateManagedUserGroups(
      [selectedGroupId],
      "remove",
      targets.map((item) => item.user_id),
    );
    setSelectedGroupMemberIDs([]);
  }

  function changeActiveTab(key: string) {
    const nextTab = resolveUserAccessTab(key);
    setActiveTab(nextTab);
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set("tab", nextTab);
        return next;
      },
      { replace: true },
    );
  }

  const drawerAuthorizedApps = authorizedAppsDrawerUser?.authorized_apps ?? [];
  const drawerBannedApps = authorizedAppsDrawerUser?.app_bans ?? [];

  return (
    <>
      <Tabs
        className="developer-user-access-tabs"
        activeKey={activeTab}
        onChange={changeActiveTab}
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
                    <Segmented<UserQuickFilter>
                      value={userQuickFilter}
                      options={[
                        { label: t("userAccess.quickFilterAll"), value: "all" },
                        { label: t("userAccess.quickFilterUngrouped"), value: "ungrouped" },
                        { label: t("userAccess.quickFilterRecent"), value: "recent" },
                      ]}
                      onChange={setUserQuickFilter}
                    />
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
                    <Select
                      allowClear
                      mode="multiple"
                      showSearch
                      placeholder={t("userAccess.filterUserGroup")}
                      style={{ width: isMobile ? "100%" : 260, maxWidth: "100%" }}
                      value={selectedUserGroupFilter}
                      options={groups.map((group) => ({
                        value: group.id,
                        label: group.name,
                      }))}
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        String(option?.label || "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      onChange={setSelectedUserGroupFilter}
                    />
                    <Input.Search
                      allowClear
                      placeholder={t("userAccess.searchUserByEmail")}
                      style={{ width: isMobile ? "100%" : 260, maxWidth: "100%" }}
                      value={emailSearchInput}
                      onChange={(event) => {
                        const value = event.target.value;
                        setEmailSearchInput(value);
                        if (value === "" && managedUsersEmailKeyword !== "") {
                          onManagedUsersEmailKeywordChange("");
                        }
                      }}
                      onSearch={(value) =>
                        onManagedUsersEmailKeywordChange(value.trim())
                      }
                    />
                  </Space>
                  <Space wrap>
                    <Button
                      type="primary"
                      disabled={selectedManagedUserIDs.length === 0}
                      style={isMobile ? { width: "100%" } : undefined}
                      onClick={() => {
                        openBatchGroupModal(selectedManagedUserIDs);
                      }}
                    >
                      {t("userAccess.batchSetGroups")}
                    </Button>
                    <Button
                      danger
                      disabled={selectedManagedUserIDs.length === 0}
                      style={isMobile ? { width: "100%" } : undefined}
                      onClick={() => openBanModal(selectedManagedUserIDs)}
                    >
                      {t("userAccess.banSelectedUsers")}
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
                  dataSource={visibleManagedUsers}
                  columns={[
                    { title: t("common.displayName"), dataIndex: "display_name", width: 160, ellipsis: true },
                    { title: t("userAccess.maskedEmail"), dataIndex: "masked_email", width: 220, ellipsis: true },
                    { title: t("userAccess.maskedPhone"), dataIndex: "masked_phone", width: 160, ellipsis: true },
                    {
                      title: t("userAccess.authorizedApps"),
                      width: 160,
                      render: (_, record: DeveloperManagedUser) => {
                        const authorizedApps = record.authorized_apps ?? [];
                        return (
                          <div
                            style={{
                              alignItems: "center",
                              display: "flex",
                              gap: 8,
                              justifyContent: "space-between",
                              width: "100%",
                            }}
                          >
                            <Typography.Text type="secondary">
                              {t("userAccess.authorizedAppsShortCount", { count: authorizedApps.length })}
                            </Typography.Text>
                            <Button size={isMobile ? "small" : "middle"} onClick={() => setAuthorizedAppsDrawerUser(record)}>
                              {t("common.detail")}
                            </Button>
                          </div>
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
                    </>
                  ) : null}
                </Space>
              </Card>
            ),
          },
          {
            key: "groupMembers",
            label: t("userAccess.groupMembersTab"),
            children: (
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Card>
                  <Space direction="vertical" size={12} style={{ width: "100%" }}>
                    <Typography.Text strong>{t("userAccess.selectGroup")}</Typography.Text>
                    <Select
                      style={{ width: "100%" }}
                      value={selectedGroupId || undefined}
                      showSearch
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        String(option?.label || "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      onChange={(value) => {
                        setSelectedGroupId(value);
                        setSelectedGroupMemberIDs([]);
                        onManagedUsersAppFilterChange("");
                        onManagedUsersGroupFilterChange(value ? [value] : []);
                      }}
                      options={groups.map((group) => ({
                        value: group.id,
                        label: group.name,
                      }))}
                    />
                    <Typography.Text type="secondary">
                      {t("userAccess.groupMembersHint")}
                    </Typography.Text>
                  </Space>
                </Card>
                <Card
                  title={t("userAccess.groupMembers")}
                  extra={
                    <Space wrap>
                      <Input.Search
                        allowClear
                        placeholder={t("userAccess.searchUserByEmail")}
                        style={{ width: isMobile ? "100%" : 260, maxWidth: "100%" }}
                        value={emailSearchInput}
                        disabled={!selectedGroupId}
                        onChange={(event) => {
                          const value = event.target.value;
                          setEmailSearchInput(value);
                          if (value === "" && managedUsersEmailKeyword !== "") {
                            onManagedUsersEmailKeywordChange("");
                          }
                        }}
                        onSearch={(value) =>
                          onManagedUsersEmailKeywordChange(value.trim())
                        }
                      />
                      <Typography.Text type="secondary">
                        {t("userAccess.selectedCurrentAppUsers", { count: selectedGroupMemberIDs.length })}
                      </Typography.Text>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        disabled={!selectedGroupId}
                        onClick={openAddGroupMemberModal}
                      >
                        {t("userAccess.addGroupMembers")}
                      </Button>
                      <Button
                        danger
                        disabled={!selectedGroupId || selectedGroupMemberIDs.length === 0}
                        onClick={() => void removeSelectedGroupMembers()}
                      >
                        {t("userAccess.removeFromGroup")}
                      </Button>
                      <Button
                        type="dashed"
                        disabled={!selectedGroupId}
                        onClick={() => openBanModal(selectedGroupMemberIDs)}
                      >
                        {selectedGroupMemberIDs.length > 0
                          ? t("userAccess.banSelectedUsers")
                          : t("userAccess.banUser")}
                      </Button>
                    </Space>
                  }
                >
                  <Table
                    rowKey="user_id"
                    scroll={{ x: "max-content" }}
                    rowSelection={{
                      selectedRowKeys: selectedGroupMemberIDs,
                      onChange: (selectedRowKeys) =>
                        setSelectedGroupMemberIDs(selectedRowKeys as string[]),
                    }}
                    pagination={{
                      current: managedUsersPage,
                      pageSize: managedUsersPageSize,
                      total: selectedGroupId ? managedUsersTotal : 0,
                      showSizeChanger: true,
                      pageSizeOptions: [10, 20, 50, 100],
                      onChange: (page, pageSize) =>
                        onManagedUsersPageChange(page, pageSize),
                      onShowSizeChange: (_, pageSize) =>
                        onManagedUsersPageChange(1, pageSize),
                    }}
                    dataSource={selectedGroupId ? managedUsers : []}
                    locale={{
                      emptyText: selectedGroupId
                        ? t("common.noData")
                        : t("userAccess.selectGroupFirst"),
                    }}
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
                          const activeBans = (record.app_bans ?? []).filter((item) =>
                            accessApps.some((app) => app.app_id === item.app_id),
                          );
                          if (activeBans.length === 0) {
                            return <Tag color="green">{t("userAccess.normalStatus")}</Tag>;
                          }
                          return (
                            <Space wrap>
                              {activeBans.map((ban) => (
                                <Space key={ban.app_id} wrap>
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
                              ))}
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
                    {
                      title: t("userAccess.logAction"),
                      width: 200,
                      render: (_, record: DeveloperAccessLog) =>
                        buildAccessLogDisplay(record, t).action,
                    },
                    {
                      title: t("userAccess.logSummary"),
                      width: 420,
                      ellipsis: true,
                      render: (_, record: DeveloperAccessLog) =>
                        buildAccessLogDisplay(record, t).summary,
                    },
                    {
                      title: t("userAccess.logTime"),
                      dataIndex: "created_at",
                      width: 180,
                      ellipsis: true,
                      render: (value: string) => formatAccessLogTime(value),
                    },
                  ]}
                />
              </Card>
            ),
          },
        ]}
      />
      <Drawer
        title={
          authorizedAppsDrawerUser
            ? t("userAccess.userAccessDetailTitle", {
                name:
                  authorizedAppsDrawerUser.display_name ||
                  authorizedAppsDrawerUser.masked_email ||
                  authorizedAppsDrawerUser.user_id,
              })
            : t("common.detail")
        }
        placement="right"
        width={isMobile ? "100%" : 420}
        open={Boolean(authorizedAppsDrawerUser)}
        onClose={() => setAuthorizedAppsDrawerUser(null)}
      >
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <Typography.Text strong>
              {t("userAccess.authorizedApps")}
            </Typography.Text>
            <Typography.Text>
              {t("userAccess.authorizedAppsCount", {
                count: drawerAuthorizedApps.length,
              })}
            </Typography.Text>
            {drawerAuthorizedApps.length > 0 ? (
              <Space direction="vertical" size={6} style={{ width: "100%" }}>
                {drawerAuthorizedApps.map((app) => (
                  <Typography.Text key={app.app_id}>
                    {app.app_name}
                  </Typography.Text>
                ))}
              </Space>
            ) : (
              <Typography.Text>{t("common.noData")}</Typography.Text>
            )}
          </Space>
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <Typography.Text strong>
              {t("userAccess.bannedApps")}
            </Typography.Text>
            {drawerBannedApps.length > 0 ? (
              <Space direction="vertical" size={8} style={{ width: "100%" }}>
                {drawerBannedApps.map((ban) => {
                  const appName =
                    accessApps.find((app) => app.app_id === ban.app_id)?.name ||
                    ban.app_id;
                  return (
                    <Space key={ban.app_id} direction="vertical" size={2}>
                      <Typography.Text>{appName}</Typography.Text>
                      <Typography.Text>
                        {t("userAccess.banReasonWithValue", {
                          reason: ban.reason || t("userAccess.bannedStatus"),
                        })}
                      </Typography.Text>
                    </Space>
                  );
                })}
              </Space>
            ) : (
              <Typography.Text>{t("userAccess.noBannedApps")}</Typography.Text>
            )}
          </Space>
        </Space>
      </Drawer>
      <Modal
        title={
          editingGroup
            ? t("userAccess.editGroup")
            : t("userAccess.createGroup")
        }
        open={groupModalOpen}
        width={isMobile ? "calc(100vw - 24px)" : 520}
        okText={t("common.confirm")}
        cancelText={t("common.cancel")}
        onOk={() => void submitGroup()}
        onCancel={() => {
          setGroupModalOpen(false);
        }}
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
        title={
          banTargetUserIDs.length > 0
            ? t("userAccess.banSelectedUsers")
            : t("userAccess.banUser")
        }
        open={banModalOpen}
        width={isMobile ? "calc(100vw - 24px)" : 520}
        okText={t("common.confirm")}
        cancelText={t("common.cancel")}
        okButtonProps={{ loading: banSubmitting }}
        onOk={() => void submitBan()}
        onCancel={() => {
          if (!banSubmitting) {
            setBanModalOpen(false);
            setBanTargetUserIDs([]);
          }
        }}
      >
        <Form layout="vertical" form={banForm}>
          {banTargetUserIDs.length > 0 ? (
            <Form.Item>
              <Typography.Text type="secondary">
                {t("userAccess.banSelectedUsersDescription", {
                  count: banTargetUserIDs.length,
                })}
              </Typography.Text>
            </Form.Item>
          ) : null}
          <Form.Item
            name="app_ids"
            label={t("userAccess.logApp")}
            rules={[{ required: true, message: t("userAccess.selectAtLeastOneApp") }]}
          >
            <Select
              mode="multiple"
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                String(option?.label || "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={accessApps.map((item) => ({
                value: item.app_id,
                label: `${item.name} (${item.client_id})`,
              }))}
            />
          </Form.Item>
          {banTargetUserIDs.length === 0 ? (
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
          ) : null}
          <Form.Item name="reason" label={t("userAccess.banReason")} rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={t("userAccess.addGroupMembers")}
        open={addGroupMemberModalOpen}
        width={isMobile ? "calc(100vw - 24px)" : 520}
        okText={t("common.confirm")}
        cancelText={t("common.cancel")}
        onOk={() => void submitAddGroupMembers()}
        onCancel={() => setAddGroupMemberModalOpen(false)}
      >
        <Form layout="vertical" form={groupMemberForm}>
          <Form.Item label={t("userAccess.searchCandidateUser")}>
            <Input.Search
              allowClear
              placeholder={t("userAccess.searchCandidateUserPlaceholder")}
              value={memberCandidateSearchInput}
              onChange={(event) => {
                const value = event.target.value;
                setMemberCandidateSearchInput(value);
                if (value === "" && memberCandidateEmailKeyword !== "") {
                  onMemberCandidateEmailKeywordChange("");
                }
              }}
              onSearch={(value) =>
                onMemberCandidateEmailKeywordChange(value.trim())
              }
            />
          </Form.Item>
          <Form.Item
            name="user_ids"
            label={t("userAccess.logUser")}
            rules={[{ required: true, message: t("userAccess.selectAtLeastOneUser") }]}
          >
            <Select
              mode="multiple"
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                String(option?.label || "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={memberCandidateUsers
                .filter((item) => !(item.group_ids ?? []).includes(selectedGroupId))
                .map((item) => ({
                  value: item.user_id,
                  label: `${item.display_name || item.user_id} (${item.masked_email || item.masked_phone || item.user_id})`,
                }))}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={t("userAccess.batchSetGroups")}
        open={batchGroupModalOpen}
        width={isMobile ? "calc(100vw - 24px)" : 520}
        okText={t("common.confirm")}
        cancelText={t("common.cancel")}
        okButtonProps={{ loading: batchGroupSubmitting }}
        onOk={() => void submitBatchGroupUpdate()}
        onCancel={() => {
          if (!batchGroupSubmitting) {
            setBatchGroupModalOpen(false);
          }
        }}
      >
        <Form layout="vertical" form={batchGroupForm}>
          <Form.Item>
            <Typography.Text type="secondary">
              {t("userAccess.batchSetGroupsDescription", { count: batchTargetUserIDs.length })}
            </Typography.Text>
          </Form.Item>
          <Form.Item name="mode" label={t("userAccess.batchGroupMode")} initialValue="append">
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              options={[
                { label: t("userAccess.batchGroupModeAppend"), value: "append" },
                { label: t("userAccess.batchGroupModeReplace"), value: "replace" },
                { label: t("userAccess.batchGroupModeRemove"), value: "remove" },
              ]}
            />
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
