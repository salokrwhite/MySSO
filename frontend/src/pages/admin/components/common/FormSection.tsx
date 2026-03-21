import { Space, Typography } from "antd";
import type { PropsWithChildren } from "react";

type FormSectionProps = PropsWithChildren<{
  title: string;
  description?: string;
}>;

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <div>
        <Typography.Text strong>{title}</Typography.Text>
        {description ? (
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {description}
          </Typography.Paragraph>
        ) : null}
      </div>
      {children}
    </Space>
  );
}
