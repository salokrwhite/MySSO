import { Modal } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import { useCallback, useState } from "react";
import { useAdminI18n } from "../i18n";
import { batchDeleteRiskLogs } from "../services/adminApi";

export function useRiskLogActions(
  sessionToken: string,
  selectedLogIds: string[],
  setSelectedLogIds: (value: string[]) => void,
  reload: () => Promise<void>,
  setError: (value?: string) => void,
  messageApi: MessageInstance
) {
  const { t } = useAdminI18n();
  const [deletingRiskLogs, setDeletingRiskLogs] = useState(false);

  const performDelete = useCallback(async () => {
    setDeletingRiskLogs(true);
    setError(undefined);
    try {
      await batchDeleteRiskLogs(sessionToken, selectedLogIds);
      messageApi.success(t("已删除所选风控日志"));
      setSelectedLogIds([]);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("删除风控日志失败"));
    } finally {
      setDeletingRiskLogs(false);
    }
  }, [messageApi, reload, selectedLogIds, sessionToken, setError, setSelectedLogIds, t]);

  const confirmBatchDeleteRiskLogs = useCallback(() => {
    Modal.confirm({
      title: t("确认删除所选风控日志？"),
      content: t("删除后不可恢复，建议仅清理确认不再需要的历史风控记录。"),
      okText: t("确认删除"),
      okButtonProps: { danger: true },
      cancelText: t("取消"),
      onOk: () => performDelete()
    });
  }, [performDelete, t]);

  return {
    deletingRiskLogs,
    confirmBatchDeleteRiskLogs
  };
}
