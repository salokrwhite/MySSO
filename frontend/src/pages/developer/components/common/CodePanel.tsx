import { Button, Space, Typography, message } from "antd";
import { useDeveloperTranslation } from "../../i18n";

export function CodePanel({
  title,
  language,
  code,
}: {
  title?: string;
  language?: string;
  code: string;
}) {
  const { t } = useDeveloperTranslation();

  return (
    <div
      style={{
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid rgba(15, 23, 42, 0.12)",
        background: "#0f172a",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          background: "rgba(148, 163, 184, 0.12)",
          borderBottom: "1px solid rgba(148, 163, 184, 0.16)",
        }}
      >
        <Space size={10}>
          {title ? (
            <Typography.Text style={{ color: "#e2e8f0" }}>
              {title}
            </Typography.Text>
          ) : null}
          {language ? (
            <Typography.Text style={{ color: "#94a3b8" }}>
              {language}
            </Typography.Text>
          ) : null}
        </Space>
        <Button
          size="small"
          onClick={() => {
            void navigator.clipboard.writeText(code);
            void message.success(t("common.codeCopied"));
          }}
        >
          {t("common.copy")}
        </Button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "16px 18px",
          whiteSpace: "pre-wrap",
          overflowX: "auto",
          color: "#e2e8f0",
          fontSize: 13,
          lineHeight: 1.7,
          fontFamily: "Consolas, Menlo, Monaco, monospace",
        }}
      >
        {code}
      </pre>
    </div>
  );
}
