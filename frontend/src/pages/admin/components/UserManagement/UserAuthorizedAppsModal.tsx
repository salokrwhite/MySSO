import { List, Modal, Space, Tag, Typography } from "antd";
import type { User } from "../../types";

type UserAuthorizedAppsModalProps = {
  open: boolean;
  user?: User;
  onCancel: () => void;
};

function formatDateTime(value?: string) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(date);
}

export function UserAuthorizedAppsModal({ open, user, onCancel }: UserAuthorizedAppsModalProps) {
  return (
    <Modal title="已授权应用" open={open} footer={null} onCancel={onCancel} destroyOnHidden width={720}>
      {user ? (
        <>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
            查看该用户当前已授权的应用与授权范围。
          </Typography.Paragraph>
          {user.authorized_apps && user.authorized_apps.length > 0 ? (
            <List
              size="small"
              bordered
              dataSource={user.authorized_apps}
              renderItem={(app) => (
                <List.Item>
                  <div style={{ width: "100%" }}>
                    <Space size={8} wrap style={{ marginBottom: 8 }}>
                      <Typography.Text strong>{app.app_name || app.client_id}</Typography.Text>
                      <Tag color="blue">{app.client_id}</Tag>
                      <Typography.Text type="secondary">授权时间：{formatDateTime(app.created_at)}</Typography.Text>
                    </Space>
                    <div>
                      {(app.scopes || []).length > 0 ? (
                        <Space size={[8, 8]} wrap>
                          {(app.scopes || []).map((scope) => (
                            <Tag key={scope}>{scope}</Tag>
                          ))}
                        </Space>
                      ) : (
                        <Typography.Text type="secondary">未记录授权范围</Typography.Text>
                      )}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          ) : (
            <Typography.Text type="secondary">暂无授权应用</Typography.Text>
          )}
        </>
      ) : null}
    </Modal>
  );
}
