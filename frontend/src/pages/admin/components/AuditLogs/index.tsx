import { Card } from "antd";
import { useEffect, useState } from "react";
import type { AuditLog } from "../../types";
import { BatchActions } from "./BatchActions";
import { AuditLogTable } from "./AuditLogTable";
import { useAdminI18n } from "../../i18n";

type AuditLogsPanelProps = {
  logs: AuditLog[];
  selectedAuditLogIds: string[];
  setSelectedAuditLogIds: (value: string[]) => void;
  deletingAuditLogs: boolean;
  onBatchDelete: () => void;
};

export function AuditLogsPanel({
  logs,
  selectedAuditLogIds,
  setSelectedAuditLogIds,
  deletingAuditLogs,
  onBatchDelete
}: AuditLogsPanelProps) {
  const { t } = useAdminI18n();
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(logs.length / pageSize));
    if (current > maxPage) {
      setCurrent(maxPage);
    }
  }, [current, logs.length, pageSize]);

  return (
    <Card title={t("审计日志列表")}>
      <BatchActions selectedCount={selectedAuditLogIds.length} loading={deletingAuditLogs} onDelete={onBatchDelete} />
      <AuditLogTable
        logs={logs}
        cardless
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
          selectedRowKeys: selectedAuditLogIds,
          onChange: (selectedRowKeys) => setSelectedAuditLogIds(selectedRowKeys as string[])
        }}
      />
    </Card>
  );
}
