import { Card, Typography } from "antd";
import { useTranslation } from "react-i18next";

export function HelpSection() {
  const { t } = useTranslation();

  return (
    <div className="account-panel">
      <div className="account-section">
        <Typography.Title level={3}>{t("help.title")}</Typography.Title>
        <div className="account-privacy-grid">
          <Card className="account-mini-card">
            <Typography.Text strong>{t("help.loginIssueTitle")}</Typography.Text>
            <Typography.Paragraph type="secondary">{t("help.loginIssueDesc")}</Typography.Paragraph>
          </Card>
          <Card className="account-mini-card">
            <Typography.Text strong>{t("help.protectTitle")}</Typography.Text>
            <Typography.Paragraph type="secondary">{t("help.protectDesc")}</Typography.Paragraph>
          </Card>
          <Card className="account-mini-card">
            <Typography.Text strong>{t("help.authIssueTitle")}</Typography.Text>
            <Typography.Paragraph type="secondary">{t("help.authIssueDesc")}</Typography.Paragraph>
          </Card>
        </div>
        <Card className="account-card" style={{ marginTop: 24 }}>
          <Typography.Title level={4} style={{ marginBottom: 12 }}>
            {t("help.contactTitle")}
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
            {t("help.contactDesc")}
          </Typography.Paragraph>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 24
            }}
          >
            <Card className="account-mini-card">
              <Typography.Title level={5} style={{ marginBottom: 16 }}>
                {t("help.contactMainlandTitle")}
              </Typography.Title>
              <Typography.Paragraph style={{ marginBottom: 8 }}>
                <Typography.Text strong>{t("help.contactPersonLabel")}</Typography.Text>
                <Typography.Text> {t("help.contactMainlandPersonValue")}</Typography.Text>
              </Typography.Paragraph>
              <Typography.Paragraph style={{ marginBottom: 8 }}>
                <Typography.Text strong>{t("help.contactPhoneLabel")}</Typography.Text>
                <Typography.Text> {t("help.contactMainlandPhoneValue")}</Typography.Text>
              </Typography.Paragraph>
              <Typography.Paragraph style={{ marginBottom: 8 }}>
                <Typography.Text strong>{t("help.contactEmailLabel")}</Typography.Text>
                <Typography.Text> {t("help.contactMainlandEmailValue")}</Typography.Text>
              </Typography.Paragraph>
              <Typography.Paragraph style={{ marginBottom: 0 }}>
                <Typography.Text strong>{t("help.contactHoursLabel")}</Typography.Text>
                <Typography.Text> {t("help.contactMainlandHoursValue")}</Typography.Text>
              </Typography.Paragraph>
            </Card>
            <Card className="account-mini-card">
              <Typography.Title level={5} style={{ marginBottom: 16 }}>
                {t("help.contactOverseasTitle")}
              </Typography.Title>
              <Typography.Paragraph style={{ marginBottom: 8 }}>
                <Typography.Text strong>{t("help.contactPersonLabel")}</Typography.Text>
                <Typography.Text> {t("help.contactOverseasPersonValue")}</Typography.Text>
              </Typography.Paragraph>
              <Typography.Paragraph style={{ marginBottom: 8 }}>
                <Typography.Text strong>{t("help.contactPhoneLabel")}</Typography.Text>
                <Typography.Text> {t("help.contactOverseasPhoneValue")}</Typography.Text>
              </Typography.Paragraph>
              <Typography.Paragraph style={{ marginBottom: 8 }}>
                <Typography.Text strong>{t("help.contactEmailLabel")}</Typography.Text>
                <Typography.Text> {t("help.contactOverseasEmailValue")}</Typography.Text>
              </Typography.Paragraph>
              <Typography.Paragraph style={{ marginBottom: 0 }}>
                <Typography.Text strong>{t("help.contactHoursLabel")}</Typography.Text>
                <Typography.Text> {t("help.contactOverseasHoursValue")}</Typography.Text>
              </Typography.Paragraph>
            </Card>
          </div>
          <Typography.Paragraph type="secondary" style={{ marginTop: 16, marginBottom: 0 }}>
            {t("help.contactRegionNotice")}
          </Typography.Paragraph>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {t("help.contactNotice")}
          </Typography.Paragraph>
        </Card>
      </div>
    </div>
  );
}
