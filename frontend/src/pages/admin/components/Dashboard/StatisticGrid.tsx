import { Card, Col, Row, Statistic } from "antd";
import { useAdminI18n } from "../../i18n";

type StatisticGridProps = {
  userCount: number;
  activeUsers: number;
  pendingApps: number;
  approvedApps: number;
  logCount: number;
  policyCount: number;
};

export function StatisticGrid({
  userCount,
  activeUsers,
  pendingApps,
  approvedApps,
  logCount,
  policyCount
}: StatisticGridProps) {
  const { t } = useAdminI18n();
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card>
          <Statistic title={t("用户总数")} value={userCount} />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <Statistic title={t("活跃用户")} value={activeUsers} />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <Statistic title={t("待审核应用")} value={pendingApps} />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <Statistic title={t("已通过应用")} value={approvedApps} />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <Statistic title={t("审计日志数")} value={logCount} />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <Statistic title={t("网关策略数")} value={policyCount} />
        </Card>
      </Col>
    </Row>
  );
}
