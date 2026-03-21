import { Empty, Space, Typography } from "antd";
import type { SettingsTabKey } from "../../../types";
import { getSettingsTabMeta } from "../../../constants";
import { SettingsCard } from "../../common/SettingsCard";
import { useAdminI18n } from "../../../i18n";

type PlaceholderPanelProps = {
  tabKey: SettingsTabKey;
};

export function PlaceholderPanel({ tabKey }: PlaceholderPanelProps) {
  const { t } = useAdminI18n();
  const settingsTabMeta = getSettingsTabMeta(t);
  return (
    <SettingsCard title={settingsTabMeta[tabKey].title}>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <Space direction="vertical" size={4}>
            <Typography.Text strong>{settingsTabMeta[tabKey].title}</Typography.Text>
            <Typography.Text type="secondary">{settingsTabMeta[tabKey].description}</Typography.Text>
          </Space>
        }
      />
    </SettingsCard>
  );
}
