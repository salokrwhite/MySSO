import { UserOutlined } from "@ant-design/icons";
import { Avatar, Menu, Typography } from "antd";
import type { UserSectionItem } from "../constants";
import type { UserSectionKey } from "../types";

type UserSidebarProps = {
  activeSection: UserSectionKey;
  avatarUrl: string;
  displayName: string;
  contactLines: string[];
  sectionItems: UserSectionItem[];
  onSectionChange: (key: UserSectionKey) => void;
  drawerMode?: boolean;
};

export function UserSidebar({
  activeSection,
  avatarUrl,
  displayName,
  contactLines,
  sectionItems,
  onSectionChange,
  drawerMode = false
}: UserSidebarProps) {
  return (
    <aside className={`account-sidebar${drawerMode ? " account-sidebar-drawer" : ""}`}>
      <div className="account-profile-card">
        <div className="account-profile-hero">
          <Avatar
            size={92}
            className={avatarUrl ? "account-avatar account-avatar-image" : "account-avatar"}
            src={avatarUrl || undefined}
            icon={avatarUrl ? undefined : <UserOutlined />}
          />
          <Typography.Title level={4} style={{ marginBottom: 8 }}>
            {displayName}
          </Typography.Title>
          {contactLines.map((line) => (
            <Typography.Text key={line} className="account-profile-subtitle">
              {line}
            </Typography.Text>
          ))}
        </div>

        <Menu
          className="account-nav-menu"
          mode="inline"
          selectedKeys={[activeSection]}
          items={sectionItems}
          onClick={({ key }) => onSectionChange(key as UserSectionKey)}
        />
      </div>
    </aside>
  );
}
