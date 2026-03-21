import { Modal } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import { useCallback, useState } from "react";
import { batchDeleteApps as batchDeleteAppsRequest } from "../services/adminApi";

export function useBatchAppActions(
  sessionToken: string,
  selectedAppIds: string[],
  setSelectedAppIds: (value: string[]) => void,
  reload: () => Promise<void>,
  setError: (value?: string) => void,
  messageApi: MessageInstance
) {
  const [deletingApps, setDeletingApps] = useState(false);

  const batchDeleteApps = useCallback(async () => {
    setDeletingApps(true);
    setError(undefined);
    try {
      await batchDeleteAppsRequest(sessionToken, selectedAppIds);
      messageApi.success("已删除所选应用");
      setSelectedAppIds([]);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除应用失败");
    } finally {
      setDeletingApps(false);
    }
  }, [messageApi, reload, selectedAppIds, sessionToken, setError, setSelectedAppIds]);

  const confirmBatchDeleteApps = useCallback(() => {
    Modal.confirm({
      title: "确认删除所选应用？",
      content: "删除后会硬删除应用及其相关授权数据，且不可恢复。",
      okText: "确认删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: () => batchDeleteApps()
    });
  }, [batchDeleteApps]);

  return {
    deletingApps,
    confirmBatchDeleteApps
  };
}
