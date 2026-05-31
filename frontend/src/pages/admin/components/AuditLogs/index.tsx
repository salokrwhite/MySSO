import { Card } from "antd";
import type { AuditLog } from "../../types";
import { BatchActions } from "./BatchActions";
import { AuditLogTable } from "./AuditLogTable";
import { useAdminI18n } from "../../i18n";

type AuditLogsPanelProps = {
  logs: AuditLog[];
  logsTotal: number;
  currentPage: number;
  pageSize: number;
  selectedAuditLogIds: string[];
  setSelectedAuditLogIds: (value: string[]) => void;
  deletingAuditLogs: boolean;
  refreshing: boolean;
  onPageChange: (page: number, pageSize: number) => void;
  onBatchDelete: () => void;
};

export function AuditLogsPanel({
  logs,
  logsTotal,
  currentPage,
  pageSize,
  selectedAuditLogIds,
  setSelectedAuditLogIds,
  deletingAuditLogs,
  refreshing,
  onPageChange,
  onBatchDelete
}: AuditLogsPanelProps) {
  const { t } = useAdminI18n();

  return (
    <Card title={t("审计日志列表")}>
      <BatchActions selectedCount={selectedAuditLogIds.length} loading={deletingAuditLogs} onDelete={onBatchDelete} />
      <AuditLogTable
        logs={logs}
        cardless
        pagination={{
          current: currentPage,
          pageSize,
          total: logsTotal,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
          onChange: (page, nextPageSize) => onPageChange(page, nextPageSize || pageSize),
          onShowSizeChange: (_, nextPageSize) => onPageChange(1, nextPageSize)
        }}
        loading={refreshing}
        rowSelection={{
          selectedRowKeys: selectedAuditLogIds,
          onChange: (selectedRowKeys) => setSelectedAuditLogIds(selectedRowKeys as string[])
        }}
      />
    </Card>
  );
}
