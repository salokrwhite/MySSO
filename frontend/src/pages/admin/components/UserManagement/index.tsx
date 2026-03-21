import { Button, Card, Grid } from "antd";
import { useMemo, useState } from "react";
import type {
  CreateUserInput,
  UpdateUserInput,
  UpdateUserSecurityPolicyInput,
  User,
  UserSecurityPolicy,
} from "../../types";
import { BatchActions } from "./BatchActions";
import { CreateUserModal } from "./CreateUserModal";
import { EditUserModal } from "./EditUserModal";
import { UserAnnouncementModal } from "./UserAnnouncementModal";
import { UserAuthorizedAppsModal } from "./UserAuthorizedAppsModal";
import { UserDetailModal } from "./UserDetailModal";
import { UserOperationLogsModal } from "./UserOperationLogsModal";
import { UserSecurityPolicyModal } from "./UserSecurityPolicyModal";
import { UserTable } from "./UserTable";
import { getUserStatusMeta } from "./UserStatusTag";
import { useAdminI18n } from "../../i18n";

type UserManagementProps = {
  users: User[];
  selectedUserIds: string[];
  setSelectedUserIds: (value: string[]) => void;
  loading: boolean;
  refreshing: boolean;
  creatingUser: boolean;
  onRefresh: () => void;
  onBatchFreeze: () => void;
  onBatchUnfreeze: () => void;
  onBatchDelete: () => void;
  onToggleFreeze: (id: string, frozen: boolean) => void;
  onCreateUser: (values: CreateUserInput) => Promise<boolean>;
  editingUser: boolean;
  onUpdateUser: (userId: string, values: UpdateUserInput) => Promise<void>;
  announcingUser: boolean;
  onUpdateAnnouncement: (
    userId: string,
    enabled: boolean,
    content: string,
  ) => Promise<void>;
  securityPolicyUser?: User;
  securityPolicy?: UserSecurityPolicy;
  loadingSecurityPolicy: boolean;
  updatingSecurityPolicy: boolean;
  onOpenSecurityPolicy: (user: User) => void;
  onCloseSecurityPolicy: () => void;
  onUpdateSecurityPolicy: (
    userId: string,
    values: UpdateUserSecurityPolicyInput,
  ) => Promise<void>;
  sessionToken: string;
};

export function UserManagement(props: UserManagementProps) {
  const { t } = useAdminI18n();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [announcementUser, setAnnouncementUser] = useState<User>();
  const [authorizedAppsUser, setAuthorizedAppsUser] = useState<User>();
  const [detailUser, setDetailUser] = useState<User>();
  const [editingTargetUser, setEditingTargetUser] = useState<User>();
  const [operationLogsUser, setOperationLogsUser] = useState<User>();
  const [statusFilter, setStatusFilter] = useState("all");
  const [emailKeyword, setEmailKeyword] = useState("");

  const filteredUsers = useMemo(() => {
    const normalizedKeyword = emailKeyword.trim().toLowerCase();

    return props.users.filter((user) => {
      const matchesKeyword =
        normalizedKeyword === "" ||
        user.email.toLowerCase().includes(normalizedKeyword);
      const derivedStatus = getUserStatusMeta(
        user.status,
        user.deletion_scheduled_at,
      ).value;
      const matchesStatus =
        statusFilter === "all" || derivedStatus === statusFilter;
      return matchesKeyword && matchesStatus;
    });
  }, [emailKeyword, props.users, statusFilter]);

  return (
    <Card
      title={t("用户列表")}
      extra={
        <Button type="primary" block={isMobile} onClick={() => setCreateModalOpen(true)}>
          {t("新增用户")}
        </Button>
      }
    >
      <BatchActions
        selectedCount={props.selectedUserIds.length}
        loading={props.loading}
        refreshing={props.refreshing}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        emailKeyword={emailKeyword}
        onEmailKeywordChange={setEmailKeyword}
        onRefresh={props.onRefresh}
        onFreeze={props.onBatchFreeze}
        onUnfreeze={props.onBatchUnfreeze}
        onDelete={props.onBatchDelete}
      />
      <UserTable
        users={filteredUsers}
        selectedUserIds={props.selectedUserIds}
        setSelectedUserIds={props.setSelectedUserIds}
        onToggleFreeze={props.onToggleFreeze}
        onOpenDetail={setDetailUser}
        onOpenAuthorizedApps={setAuthorizedAppsUser}
        onOpenEdit={setEditingTargetUser}
        onOpenSecurityPolicy={props.onOpenSecurityPolicy}
        onOpenAnnouncement={setAnnouncementUser}
        onOpenOperationLogs={setOperationLogsUser}
      />
      <CreateUserModal
        open={createModalOpen}
        loading={props.creatingUser}
        onCancel={() => setCreateModalOpen(false)}
        onSubmit={props.onCreateUser}
      />
      <UserAnnouncementModal
        open={Boolean(announcementUser)}
        user={announcementUser}
        loading={props.announcingUser}
        onCancel={() => setAnnouncementUser(undefined)}
        onSubmit={async (enabled, content) => {
          if (!announcementUser) {
            return;
          }
          await props.onUpdateAnnouncement(
            announcementUser.id,
            enabled,
            content,
          );
          setAnnouncementUser(undefined);
        }}
      />
      <UserAuthorizedAppsModal
        open={Boolean(authorizedAppsUser)}
        user={authorizedAppsUser}
        onCancel={() => setAuthorizedAppsUser(undefined)}
      />
      <UserOperationLogsModal
        open={Boolean(operationLogsUser)}
        sessionToken={props.sessionToken}
        user={operationLogsUser}
        onCancel={() => setOperationLogsUser(undefined)}
      />
      <UserDetailModal
        open={Boolean(detailUser)}
        user={detailUser}
        onCancel={() => setDetailUser(undefined)}
      />
      <UserSecurityPolicyModal
        open={Boolean(props.securityPolicyUser)}
        user={props.securityPolicyUser}
        policy={props.securityPolicy}
        loading={props.loadingSecurityPolicy || props.updatingSecurityPolicy}
        onCancel={props.onCloseSecurityPolicy}
        onSubmit={props.onUpdateSecurityPolicy}
      />
      <EditUserModal
        open={Boolean(editingTargetUser)}
        user={editingTargetUser}
        loading={props.editingUser}
        onCancel={() => setEditingTargetUser(undefined)}
        onSubmit={async (userId, values) => {
          await props.onUpdateUser(userId, values);
        }}
      />
    </Card>
  );
}
