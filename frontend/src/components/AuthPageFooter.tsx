import { Typography } from "antd";

type AuthPageFooterProps = {
  text?: string;
};

export function AuthPageFooter({ text }: AuthPageFooterProps) {
  const content = text?.trim();
  if (!content) {
    return null;
  }

  return (
    <div className="auth-page-footer">
      <Typography.Paragraph className="auth-page-footer-text">{content}</Typography.Paragraph>
    </div>
  );
}
