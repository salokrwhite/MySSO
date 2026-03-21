import { Modal } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import { useCallback, useState } from "react";
import { batchDeletePasskeyLogs } from "../services/adminApi";

function tableLabel(table: string) {
  switch (table) {
    case "passkeys":
      return "已绑定通行密钥";
    case "passkey_registration_challenges":
      return "注册挑战";
    case "passkey_login_challenges":
      return "登录挑战";
    default:
      return "Passkey 数据";
  }
}

export function usePasskeyLogActions(
  sessionToken: string,
  reload: () => Promise<void>,
  setError: (value?: string) => void,
  messageApi: MessageInstance
) {
  const [deletingPasskeyTable, setDeletingPasskeyTable] = useState<string>();

  const performDelete = useCallback(async (table: string, recordIds: string[]) => {
    setDeletingPasskeyTable(table);
    setError(undefined);
    try {
      await batchDeletePasskeyLogs(sessionToken, table, recordIds);
      messageApi.success(`已删除所选${tableLabel(table)}记录`);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除 Passkey 记录失败");
    } finally {
      setDeletingPasskeyTable(undefined);
    }
  }, [messageApi, reload, sessionToken, setError]);

  const confirmBatchDeletePasskeyLogs = useCallback((table: string, recordIds: string[]) => {
    Modal.confirm({
      title: `确认删除所选${tableLabel(table)}记录？`,
      content: "删除后不可恢复，请确认这些记录已经不再需要。",
      okText: "确认删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: () => performDelete(table, recordIds)
    });
  }, [performDelete]);

  return {
    deletingPasskeyTable,
    confirmBatchDeletePasskeyLogs
  };
}
