import { Space } from "antd";
import type { Policy } from "../../types";
import { PolicyTable } from "./PolicyTable";
import { StatisticGrid } from "./StatisticGrid";

type DashboardProps = {
  userCount: number;
  activeUsers: number;
  pendingApps: number;
  approvedApps: number;
  logCount: number;
  policies: Policy[];
  policyCount: number;
};

export function Dashboard({
  userCount,
  activeUsers,
  pendingApps,
  approvedApps,
  logCount,
  policies,
  policyCount,
}: DashboardProps) {
  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <StatisticGrid
        userCount={userCount}
        activeUsers={activeUsers}
        pendingApps={pendingApps}
        approvedApps={approvedApps}
        logCount={logCount}
        policyCount={policyCount}
      />
      <PolicyTable policies={policies} />
    </Space>
  );
}
