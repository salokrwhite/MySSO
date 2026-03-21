import { DownloadOutlined, ExclamationOutlined, LeftOutlined, LockOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Typography } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { CurrentUser } from "../types";
import { formatDateTime } from "../utils";

type PrivacySectionProps = {
  user?: CurrentUser;
  exportingUserData: boolean;
  deletingAccount: boolean;
  onRequestExportUserData: () => void;
  onRequestDeleteAccount: () => void;
};

export function PrivacySection({ user, exportingUserData, deletingAccount, onRequestExportUserData, onRequestDeleteAccount }: PrivacySectionProps) {
  const { t } = useTranslation();
  const [detailMode, setDetailMode] = useState<"list" | "delete-account">("list");

  if (detailMode === "delete-account") {
    return (
      <div className="account-panel">
        <div className="account-section privacy-delete-page">
          <button type="button" className="privacy-back-button" onClick={() => setDetailMode("list")}>
            <LeftOutlined />
          </button>
          <Typography.Title level={3}>{t("privacy.deleteTitle")}</Typography.Title>
          <div className="privacy-delete-hero">
            <div className="privacy-delete-icon">
              <ExclamationOutlined />
            </div>
            <Typography.Paragraph className="privacy-delete-copy">{t("privacy.deleteWarningPrimary")}</Typography.Paragraph>
            <Typography.Paragraph className="privacy-delete-copy">{t("privacy.deleteWarningSecondary")}</Typography.Paragraph>
            <Button type="primary" danger size="large" className="privacy-delete-action" loading={deletingAccount} onClick={onRequestDeleteAccount}>
              {t("privacy.deleteAction")}
            </Button>
            {user?.deletion_scheduled_at ? (
              <Typography.Text type="secondary">{t("privacy.deletePendingAt", { date: formatDateTime(user.deletion_scheduled_at) })}</Typography.Text>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-panel">
      <div className="account-section">
        <Typography.Title level={3}>{t("privacy.title")}</Typography.Title>
        <div className="privacy-action-list">
          <button type="button" className="privacy-action-row" onClick={onRequestExportUserData}>
            <span className="account-info-main">
              <span className="account-info-icon icon-blue">
                <DownloadOutlined />
              </span>
              <span className="privacy-action-copy">
                <Typography.Text strong>{t("privacy.exportTitle")}</Typography.Text>
                <Typography.Text type="secondary">{t("privacy.exportDesc")}</Typography.Text>
              </span>
            </span>
            <span className="privacy-action-copy" style={{ textAlign: "right" }}>
              <Typography.Text type="secondary">
                {exportingUserData ? t("common.saving") : t("privacy.exportAction")}
              </Typography.Text>
            </span>
          </button>
          <button type="button" className="privacy-action-row" onClick={() => setDetailMode("delete-account")}>
            <span className="account-info-main">
              <span className="account-info-icon icon-green">
                <LockOutlined />
              </span>
              <span className="privacy-action-copy">
                <Typography.Text strong>{t("privacy.deleteTitle")}</Typography.Text>
                <Typography.Text type="secondary">{t("privacy.deleteDesc")}</Typography.Text>
              </span>
            </span>
            <RightOutlined className="privacy-action-arrow" />
          </button>
        </div>
      </div>
    </div>
  );
}
