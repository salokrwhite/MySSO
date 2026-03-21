import { Modal } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import { useCallback, useState } from "react";
import { batchDeleteAuditLogs as batchDeleteAuditLogsRequest } from "../services/adminApi";

export function useAuditLogActions(
  sessionToken: string,
  selectedAuditLogIds: string[],
  setSelectedAuditLogIds: (value: string[]) => void,
  reload: () => Promise<void>,
  setError: (value?: string) => void,
  messageApi: MessageInstance
) {
  const [deletingAuditLogs, setDeletingAuditLogs] = useState(false);

  const batchDeleteAuditLogs = useCallback(async () => {
    setDeletingAuditLogs(true);
    setError(undefined);
    try {
      await batchDeleteAuditLogsRequest(sessionToken, selectedAuditLogIds);
      messageApi.success("已删除所选审计日志");
      setSelectedAuditLogIds([]);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除审计日志失败");
    } finally {
      setDeletingAuditLogs(false);
    }
  }, [messageApi, reload, selectedAuditLogIds, sessionToken, setError, setSelectedAuditLogIds]);

  const confirmBatchDeleteAuditLogs = useCallback(() => {
    Modal.confirm({
      title: "确认删除所选审计日志？",
      content: "删除后不可恢复，建议仅清理确认不再需要的历史记录。",
      okText: "确认删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: () => batchDeleteAuditLogs()
    });
  }, [batchDeleteAuditLogs]);

  return {
    deletingAuditLogs,
    confirmBatchDeleteAuditLogs
  };
}
