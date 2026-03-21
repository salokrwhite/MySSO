import { Card, Typography } from "antd";
import type { PropsWithChildren, ReactNode } from "react";

type SettingsCardProps = PropsWithChildren<{
  title: string;
  description?: string;
  extra?: ReactNode;
}>;

export function SettingsCard({ title, description, extra, children }: SettingsCardProps) {
  return (
    <Card className="settings-panel-card" title={title} extra={extra}>
      {description ? (
        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          {description}
        </Typography.Paragraph>
      ) : null}
      {children}
    </Card>
  );
}
