import { Modal } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import { useCallback, useState } from "react";
import { batchDeleteDeveloperAccessLogs as batchDeleteDeveloperAccessLogsRequest } from "../services/adminApi";

export function useDeveloperAccessLogActions(
  sessionToken: string,
  selectedDeveloperAccessLogIds: string[],
  setSelectedDeveloperAccessLogIds: (value: string[]) => void,
  reload: () => Promise<void>,
  setError: (value?: string) => void,
  messageApi: MessageInstance,
) {
  const [deletingDeveloperAccessLogs, setDeletingDeveloperAccessLogs] =
    useState(false);

  const batchDeleteDeveloperAccessLogs = useCallback(async () => {
    setDeletingDeveloperAccessLogs(true);
    setError(undefined);
    try {
      await batchDeleteDeveloperAccessLogsRequest(
        sessionToken,
        selectedDeveloperAccessLogIds,
      );
      messageApi.success("已硬删除所选开发者访问日志");
      setSelectedDeveloperAccessLogIds([]);
      await reload();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "删除开发者访问日志失败",
      );
    } finally {
      setDeletingDeveloperAccessLogs(false);
    }
  }, [
    messageApi,
    reload,
    selectedDeveloperAccessLogIds,
    sessionToken,
    setError,
    setSelectedDeveloperAccessLogIds,
  ]);

  const confirmBatchDeleteDeveloperAccessLogs = useCallback(() => {
    Modal.confirm({
      title: "确认硬删除所选开发者访问日志？",
      content: "管理员硬删除后不可恢复，建议仅清理确认不再需要的记录。",
      okText: "确认删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: () => batchDeleteDeveloperAccessLogs(),
    });
  }, [batchDeleteDeveloperAccessLogs]);

  return {
    deletingDeveloperAccessLogs,
    confirmBatchDeleteDeveloperAccessLogs,
  };
}
