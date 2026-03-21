import { Modal } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import { useCallback, useState } from "react";
import { batchDeleteEmailSendLogs, batchDeletePhoneSendLogs } from "../services/adminApi";

export function useEmailSendLogActions(
  sessionToken: string,
  selectedLogIds: string[],
  setSelectedLogIds: (value: string[]) => void,
  reload: () => Promise<void>,
  setError: (value?: string) => void,
  messageApi: MessageInstance
) {
  const [deletingEmailSendLogs, setDeletingEmailSendLogs] = useState(false);

  const performDelete = useCallback(async () => {
    setDeletingEmailSendLogs(true);
    setError(undefined);
    try {
      await batchDeleteEmailSendLogs(sessionToken, selectedLogIds);
      messageApi.success("已删除所选邮件发信记录");
      setSelectedLogIds([]);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除邮件发信记录失败");
    } finally {
      setDeletingEmailSendLogs(false);
    }
  }, [messageApi, reload, selectedLogIds, sessionToken, setError, setSelectedLogIds]);

  const confirmBatchDeleteEmailSendLogs = useCallback(() => {
    Modal.confirm({
      title: "确认删除所选邮件发信记录？",
      content: "删除后不可恢复，请确认这些记录已经不再需要。",
      okText: "确认删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: () => performDelete()
    });
  }, [performDelete]);

  return { deletingEmailSendLogs, confirmBatchDeleteEmailSendLogs };
}

export function usePhoneSendLogActions(
  sessionToken: string,
  selectedLogIds: string[],
  setSelectedLogIds: (value: string[]) => void,
  reload: () => Promise<void>,
  setError: (value?: string) => void,
  messageApi: MessageInstance
) {
  const [deletingPhoneSendLogs, setDeletingPhoneSendLogs] = useState(false);

  const performDelete = useCallback(async () => {
    setDeletingPhoneSendLogs(true);
    setError(undefined);
    try {
      await batchDeletePhoneSendLogs(sessionToken, selectedLogIds);
      messageApi.success("已删除所选手机号发信记录");
      setSelectedLogIds([]);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除手机号发信记录失败");
    } finally {
      setDeletingPhoneSendLogs(false);
    }
  }, [messageApi, reload, selectedLogIds, sessionToken, setError, setSelectedLogIds]);

  const confirmBatchDeletePhoneSendLogs = useCallback(() => {
    Modal.confirm({
      title: "确认删除所选手机号发信记录？",
      content: "删除后不可恢复，请确认这些记录已经不再需要。",
      okText: "确认删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: () => performDelete()
    });
  }, [performDelete]);

  return { deletingPhoneSendLogs, confirmBatchDeletePhoneSendLogs };
}
