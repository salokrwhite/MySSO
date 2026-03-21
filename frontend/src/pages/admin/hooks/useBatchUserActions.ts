import { Input, Modal } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import { createElement, useCallback, useState } from "react";
import type { ChangeEvent } from "react";
import { useAdminI18n } from "../i18n";
import {
  batchDeleteUsers as batchDeleteUsersRequest,
  batchFreezeUsers as batchFreezeUsersRequest,
  freezeUser as freezeUserRequest,
  getUserSecurityPolicy as getUserSecurityPolicyRequest,
  updateUser as updateUserRequest,
  updateUserSecurityPolicy as updateUserSecurityPolicyRequest,
  updateUserAnnouncement as updateUserAnnouncementRequest
} from "../services/adminApi";
import type { UpdateUserInput, UpdateUserSecurityPolicyInput, User, UserSecurityPolicy } from "../types";

export function useBatchUserActions(
  sessionToken: string,
  selectedUserIds: string[],
  setSelectedUserIds: (value: string[]) => void,
  reload: () => Promise<void>,
  setError: (value?: string) => void,
  messageApi: MessageInstance
) {
  const { t } = useAdminI18n();
  const [batchActingUsers, setBatchActingUsers] = useState(false);
  const [announcingUser, setAnnouncingUser] = useState(false);
  const [editingUser, setEditingUser] = useState(false);
  const [securityPolicyUser, setSecurityPolicyUser] = useState<User>();
  const [securityPolicy, setSecurityPolicy] = useState<UserSecurityPolicy>();
  const [loadingSecurityPolicy, setLoadingSecurityPolicy] = useState(false);
  const [updatingSecurityPolicy, setUpdatingSecurityPolicy] = useState(false);

  const freezeUser = useCallback(
    async (id: string, frozen: boolean) => {
      if (frozen) {
        let reason = "";
        Modal.confirm({
          className: "freeze-user-confirm-modal",
          title: t("冻结用户"),
          content: createElement(Input.TextArea, {
            rows: 4,
            maxLength: 500,
            showCount: true,
            placeholder: t("选填冻结理由，登录时会展示给该用户"),
            onChange: (event: ChangeEvent<HTMLTextAreaElement>) => {
              reason = event.target.value;
            }
          }),
          okText: t("确认冻结"),
          okButtonProps: { danger: true },
          cancelText: t("取消"),
          onOk: async () => {
            try {
              await freezeUserRequest(sessionToken, id, true, reason);
              await reload();
            } catch (err) {
              setError(err instanceof Error ? err.message : t("操作失败"));
              throw err;
            }
          }
        });
        return;
      }
      try {
        await freezeUserRequest(sessionToken, id, frozen, "");
        await reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : t("操作失败"));
      }
    },
    [reload, sessionToken, setError, t]
  );

  const batchFreezeUsers = useCallback(
    async (frozen: boolean) => {
      if (frozen) {
        let reason = "";
        Modal.confirm({
          className: "freeze-user-confirm-modal",
          title: t("批量冻结用户"),
          content: createElement(Input.TextArea, {
            rows: 4,
            maxLength: 500,
            showCount: true,
            placeholder: t("选填统一冻结理由，登录时会展示给这些用户"),
            onChange: (event: ChangeEvent<HTMLTextAreaElement>) => {
              reason = event.target.value;
            }
          }),
          okText: t("确认冻结"),
          okButtonProps: { danger: true },
          cancelText: t("取消"),
          onOk: async () => {
            setBatchActingUsers(true);
            setError(undefined);
            try {
              await batchFreezeUsersRequest(sessionToken, selectedUserIds, true, reason);
              messageApi.success(t("已批量封禁所选用户"));
              setSelectedUserIds([]);
              await reload();
            } catch (err) {
              setError(err instanceof Error ? err.message : t("批量操作失败"));
              throw err;
            } finally {
              setBatchActingUsers(false);
            }
          }
        });
        return;
      }
      setBatchActingUsers(true);
      setError(undefined);
      try {
        await batchFreezeUsersRequest(sessionToken, selectedUserIds, frozen, "");
        messageApi.success(
          frozen ? t("已批量封禁所选用户") : t("已批量解封所选用户"),
        );
        setSelectedUserIds([]);
        await reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : t("批量操作失败"));
      } finally {
        setBatchActingUsers(false);
      }
    },
    [messageApi, reload, selectedUserIds, sessionToken, setError, setSelectedUserIds, t]
  );

  const batchDeleteUsers = useCallback(async () => {
    setBatchActingUsers(true);
    setError(undefined);
    try {
      await batchDeleteUsersRequest(sessionToken, selectedUserIds);
      messageApi.success(t("已删除所选用户"));
      setSelectedUserIds([]);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("删除失败"));
    } finally {
      setBatchActingUsers(false);
    }
  }, [messageApi, reload, selectedUserIds, sessionToken, setError, setSelectedUserIds, t]);

  const confirmBatchDeleteUsers = useCallback(() => {
    Modal.confirm({
      title: t("确认删除所选用户？"),
      content: t("删除后会同时清理这些用户的会话、授权、验证码以及其名下应用，且不可恢复。"),
      okText: t("确认删除"),
      okButtonProps: { danger: true },
      cancelText: t("取消"),
      onOk: () => batchDeleteUsers()
    });
  }, [batchDeleteUsers, t]);

  const updateUserAnnouncement = useCallback(
    async (userId: string, enabled: boolean, content: string) => {
      setAnnouncingUser(true);
      try {
        await updateUserAnnouncementRequest(sessionToken, userId, enabled, content);
        messageApi.success(enabled ? t("用户公告已保存") : t("用户公告已关闭"));
        await reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : t("公告保存失败"));
        throw err;
      } finally {
        setAnnouncingUser(false);
      }
    },
    [messageApi, reload, sessionToken, setError, t]
  );

  const updateUser = useCallback(
    async (userId: string, input: UpdateUserInput) => {
      setEditingUser(true);
      try {
        await updateUserRequest(sessionToken, userId, input);
        messageApi.success(t("用户信息已更新"));
        await reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : t("用户信息更新失败"));
        throw err;
      } finally {
        setEditingUser(false);
      }
    },
    [messageApi, reload, sessionToken, setError, t]
  );

  const openSecurityPolicy = useCallback(
    async (user: User) => {
      setSecurityPolicyUser(user);
      setSecurityPolicy(user.security_policy);
      setLoadingSecurityPolicy(true);
      try {
        const result = await getUserSecurityPolicyRequest(sessionToken, user.id);
        setSecurityPolicy(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("加载安全策略失败"));
      } finally {
        setLoadingSecurityPolicy(false);
      }
    },
    [sessionToken, setError, t]
  );

  const closeSecurityPolicy = useCallback(() => {
    setSecurityPolicyUser(undefined);
    setSecurityPolicy(undefined);
  }, []);

  const updateUserSecurityPolicy = useCallback(
    async (userId: string, input: UpdateUserSecurityPolicyInput) => {
      setUpdatingSecurityPolicy(true);
      try {
        const result = await updateUserSecurityPolicyRequest(sessionToken, userId, input);
        setSecurityPolicy(result);
        messageApi.success(t("用户安全策略已保存"));
        await reload();
        closeSecurityPolicy();
      } catch (err) {
        setError(err instanceof Error ? err.message : t("保存安全策略失败"));
        throw err;
      } finally {
        setUpdatingSecurityPolicy(false);
      }
    },
    [closeSecurityPolicy, messageApi, reload, sessionToken, setError, t]
  );

  return {
    batchActingUsers,
    announcingUser,
    editingUser,
    securityPolicyUser,
    securityPolicy,
    loadingSecurityPolicy,
    updatingSecurityPolicy,
    freezeUser,
    batchFreezeUsers,
    confirmBatchDeleteUsers,
    updateUser,
    updateUserAnnouncement,
    openSecurityPolicy,
    closeSecurityPolicy,
    updateUserSecurityPolicy
  };
}
