import { DesktopOutlined, KeyOutlined, LockOutlined, MailOutlined, MobileOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { Button, Space, Switch, Typography } from "antd";
import { useTranslation } from "react-i18next";
import type { CurrentUser, PasskeyItem } from "../types";
import { formatDateTime } from "../utils";

type SecuritySectionProps = {
  user?: CurrentUser;
  phoneVerificationEnabled: boolean;
  onEditPhone: () => void;
  onEditEmail: () => void;
  onEditPassword: () => void;
  onToggleMFA: (checked: boolean) => void;
  mfaUpdating: boolean;
  passkeys: PasskeyItem[];
  passkeySupported: boolean;
  onAddPasskey: () => void;
  onDeletePasskey: (id: string) => void;
};

export function SecuritySection({
  user,
  phoneVerificationEnabled,
  onEditPhone,
  onEditEmail,
  onEditPassword,
  onToggleMFA,
  mfaUpdating,
  passkeys,
  passkeySupported,
  onAddPasskey,
  onDeletePasskey
}: SecuritySectionProps) {
  const { t } = useTranslation();
  const showPhoneLoginMethod = phoneVerificationEnabled && (user?.country || "").trim().toUpperCase() === "CN";
  const hasEmail = Boolean(user?.email);
  const hasPhone = Boolean(user?.phone);
  const canUseMFA = user?.role !== "admin";
  const canConfigureMFA = hasEmail || hasPhone;
  const mfaMethodLabel =
    user?.mfa_method === "sms"
      ? t("security.mfaMethodSMS")
      : user?.mfa_method === "email"
        ? t("security.mfaMethodEmail")
        : t("common.unsetShort");

  return (
    <div className="account-panel">
      <div className="account-section">
        <Typography.Title level={3}>{t("security.loginMethods")}</Typography.Title>
        <div className="account-row-list">
          {showPhoneLoginMethod ? (
            <div className="account-info-row">
              <div className="account-info-main">
                <span className="account-info-icon icon-blue">
                  <MobileOutlined />
                </span>
                <div>
                  <Typography.Text strong>{t("security.phone")}</Typography.Text>
                  <Typography.Paragraph type="secondary">{t("security.phoneDesc")}</Typography.Paragraph>
                </div>
              </div>
              <Space size={12}>
                <Typography.Text>{user?.phone || t("common.unsetShort")}</Typography.Text>
                <Button type="link" onClick={onEditPhone}>
                  {user?.phone ? t("common.edit") : t("security.bindPhone")}
                </Button>
              </Space>
            </div>
          ) : null}
          <div className="account-info-row">
            <div className="account-info-main">
              <span className="account-info-icon icon-blue">
                <MailOutlined />
              </span>
              <div>
                <Typography.Text strong>{t("security.safeEmail")}</Typography.Text>
                <Typography.Paragraph type="secondary">{t("security.safeEmailDesc")}</Typography.Paragraph>
              </div>
            </div>
            <Space size={12}>
              <Typography.Text>{user?.email || "-"}</Typography.Text>
              <Button type="link" onClick={onEditEmail}>
                {t("common.edit")}
              </Button>
            </Space>
          </div>
          <div className="account-info-row">
            <div className="account-info-main">
              <span className="account-info-icon icon-orange">
                <LockOutlined />
              </span>
              <div>
                <Typography.Text strong>{t("security.changePassword")}</Typography.Text>
                <Typography.Paragraph type="secondary">{t("security.changePasswordDesc")}</Typography.Paragraph>
              </div>
            </div>
            <Button type="link" onClick={onEditPassword}>
              {t("common.edit")}
            </Button>
          </div>
          {canUseMFA ? (
            <div className="account-info-row">
              <div className="account-info-main">
                <span className="account-info-icon icon-green">
                  <SafetyCertificateOutlined />
                </span>
                <div>
                  <Typography.Text strong>{t("security.mfa")}</Typography.Text>
                  <Typography.Paragraph type="secondary">{t("security.mfaDesc")}</Typography.Paragraph>
                  {Boolean(user?.mfa_enabled) ? <Typography.Text type="secondary">{mfaMethodLabel}</Typography.Text> : null}
                </div>
              </div>
              <Space size={12}>
                <Switch checked={Boolean(user?.mfa_enabled)} loading={mfaUpdating} disabled={!canConfigureMFA} onChange={onToggleMFA} />
              </Space>
            </div>
          ) : null}
          <div className="account-info-row">
            <div className="account-info-main">
              <span className="account-info-icon icon-blue">
                <KeyOutlined />
              </span>
              <div>
                <Typography.Text strong>{t("security.passkeys")}</Typography.Text>
                <Typography.Paragraph type="secondary">{t("security.passkeysDesc")}</Typography.Paragraph>
                <Typography.Text type="secondary">
                  {passkeys.length > 0 ? `${passkeys.length}` : t("security.passkeyEmpty")}
                </Typography.Text>
              </div>
            </div>
            <Button type="link" disabled={!passkeySupported} onClick={onAddPasskey}>
              {t("security.addPasskey")}
            </Button>
          </div>
          {passkeys.map((passkey) => (
            <div className="account-info-row" key={passkey.id}>
              <div className="account-info-main">
                <span className="account-info-icon icon-green">
                  <KeyOutlined />
                </span>
                <div>
                  <Typography.Text strong>{passkey.name}</Typography.Text>
                  <Typography.Paragraph type="secondary">
                    {t("security.passkeyCreatedAt")}: {formatDateTime(passkey.created_at)}
                  </Typography.Paragraph>
                  <Typography.Text type="secondary">
                    {t("security.passkeyLastUsed")}: {passkey.last_used_at ? formatDateTime(passkey.last_used_at) : t("common.noRecord")}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    {t("security.passkeyLastUsedIP")}: {passkey.last_used_ip || t("common.noRecord")}
                  </Typography.Text>
                </div>
              </div>
              <Button danger type="link" onClick={() => onDeletePasskey(passkey.id)}>
                {t("security.deletePasskey")}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="account-section">
        <Typography.Title level={3}>{t("security.accountSecurity")}</Typography.Title>
        <div className="account-row-list">
          <div className="account-info-row">
            <div className="account-info-main">
              <span className="account-info-icon icon-warm">
                <DesktopOutlined />
              </span>
              <div>
                <Typography.Text strong>{t("security.recentLogin")}</Typography.Text>
                <Typography.Paragraph type="secondary">{t("security.recentLoginDesc")}</Typography.Paragraph>
              </div>
            </div>
            <div className="account-info-side">
              <Typography.Text>{user?.last_login_at ? formatDateTime(user.last_login_at) : t("common.noRecord")}</Typography.Text>
              <Typography.Text type="secondary">{user?.last_device_ip || ""}</Typography.Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
