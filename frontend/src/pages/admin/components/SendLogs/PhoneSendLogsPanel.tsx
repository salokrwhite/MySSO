import { Card, Grid, Input, Space } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useAdminI18n } from "../../i18n";
import type { PhoneSendLog } from "../../types";
import { BatchActions } from "./BatchActions";
import { PhoneSendLogsTable } from "./PhoneSendLogsTable";

type PhoneSendLogsPanelProps = {
  logs: PhoneSendLog[];
  selectedLogIds: string[];
  setSelectedLogIds: (value: string[]) => void;
  deletingLogs: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onBatchDelete: () => void;
};

export function PhoneSendLogsPanel({
  logs,
  selectedLogIds,
  setSelectedLogIds,
  deletingLogs,
  refreshing,
  onRefresh,
  onBatchDelete
}: PhoneSendLogsPanelProps) {
  const { t } = useAdminI18n();
  const [keyword, setKeyword] = useState("");
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const filteredLogs = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) {
      return logs;
    }
    return logs.filter((item) => item.target_phone.toLowerCase().includes(normalizedKeyword));
  }, [keyword, logs]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
    if (current > maxPage) {
      setCurrent(maxPage);
    }
  }, [current, filteredLogs.length, pageSize]);

  return (
    <Card title={t("手机号发信记录")}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Input.Search
          allowClear
          placeholder={t("按手机号模糊搜索")}
          value={keyword}
          onChange={(event) => {
            setKeyword(event.target.value);
            setCurrent(1);
          }}
          style={{ width: isMobile ? "100%" : 280, maxWidth: "100%" }}
        />
        <BatchActions
          selectedCount={selectedLogIds.length}
          loading={deletingLogs}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onDelete={onBatchDelete}
          align={isMobile ? "start" : "end"}
        />
        <PhoneSendLogsTable
          logs={filteredLogs}
          pagination={{
            current,
            pageSize,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            onChange: (page, nextPageSize) => {
              setCurrent(page);
              if (nextPageSize && nextPageSize !== pageSize) {
                setPageSize(nextPageSize);
              }
            },
            onShowSizeChange: (_, nextPageSize) => {
              setCurrent(1);
              setPageSize(nextPageSize);
            }
          }}
          rowSelection={{
            selectedRowKeys: selectedLogIds,
            onChange: (selectedRowKeys) => setSelectedLogIds(selectedRowKeys as string[])
          }}
        />
      </Space>
    </Card>
  );
}
