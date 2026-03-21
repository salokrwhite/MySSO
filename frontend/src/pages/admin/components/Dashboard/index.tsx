import { Space } from "antd";
import type { AuditLog, Policy } from "../../types";
import { PolicyTable } from "./PolicyTable";
import { StatisticGrid } from "./StatisticGrid";

type DashboardProps = {
  userCount: number;
  activeUsers: number;
  pendingApps: number;
  approvedApps: number;
  logs: AuditLog[];
  policies: Policy[];
};

export function Dashboard({
  userCount,
  activeUsers,
  pendingApps,
  approvedApps,
  logs,
  policies
}: DashboardProps) {
  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <StatisticGrid
        userCount={userCount}
        activeUsers={activeUsers}
        pendingApps={pendingApps}
        approvedApps={approvedApps}
        logCount={logs.length}
        policyCount={policies.length}
      />
      <PolicyTable policies={policies} />
    </Space>
  );
}
