import { CalendarOutlined, CameraOutlined, EditOutlined, EnvironmentOutlined, GlobalOutlined, IdcardOutlined, SmileOutlined } from "@ant-design/icons";
import { Avatar, Button, Select, Space, Typography, Upload } from "antd";
import { useTranslation } from "react-i18next";
import type { CurrentUser } from "../types";
import { formatDateTime } from "../utils";
import { accountLocaleOptions, normalizeAccountLocale, type AccountLocale } from "../../../i18n/accountLocale";

type ProfileSectionProps = {
  user?: CurrentUser;
  avatarUrl: string;
  effectiveDisplayName: string;
  genderLabel: string;
  preferredLocale: AccountLocale;
  uploadingAvatar: boolean;
  savingPreferredLocale: boolean;
  onUploadAvatar: (file: File) => boolean;
  onEditDisplayName: () => void;
  onEditGender: () => void;
  onPreferredLocaleChange: (value: AccountLocale) => void;
  onSavePreferredLocale: () => void;
};

export function ProfileSection({
  user,
  avatarUrl,
  effectiveDisplayName,
  genderLabel,
  preferredLocale,
  uploadingAvatar,
  savingPreferredLocale,
  onUploadAvatar,
  onEditDisplayName,
  onEditGender,
  onPreferredLocaleChange,
  onSavePreferredLocale
}: ProfileSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="account-panel">
      <div className="account-section">
        <Typography.Title level={3}>{t("profile.title")}</Typography.Title>
        <div className="account-row-list">
          <div className="account-info-row">
            <div className="account-info-main">
              <span className="account-info-icon icon-violet">
                <CameraOutlined />
              </span>
              <div>
                <Typography.Text strong>{t("profile.avatar")}</Typography.Text>
                <Typography.Paragraph type="secondary">{t("profile.avatarDesc")}</Typography.Paragraph>
              </div>
            </div>
            <Space size={12}>
              {avatarUrl ? <Avatar size={44} src={avatarUrl} className="account-inline-avatar" /> : null}
              <Upload accept="image/*" showUploadList={false} beforeUpload={onUploadAvatar}>
                <Button loading={uploadingAvatar}>{t("common.uploadAvatar")}</Button>
              </Upload>
            </Space>
          </div>
          <div className="account-info-row">
            <div className="account-info-main">
              <span className="account-info-icon icon-violet">
                <EditOutlined />
              </span>
              <div>
                <Typography.Text strong>{t("profile.nickname")}</Typography.Text>
                <Typography.Paragraph type="secondary">{t("profile.nicknameDesc")}</Typography.Paragraph>
              </div>
            </div>
            <Space size={12}>
              <Typography.Text>{effectiveDisplayName || t("common.unset")}</Typography.Text>
              <Button type="link" onClick={onEditDisplayName}>
                {t("common.edit")}
              </Button>
            </Space>
          </div>
          <div className="account-info-row">
            <div className="account-info-main">
              <span className="account-info-icon icon-blue">
                <SmileOutlined />
              </span>
              <div>
                <Typography.Text strong>{t("profile.gender")}</Typography.Text>
                <Typography.Paragraph type="secondary">{t("profile.genderDesc")}</Typography.Paragraph>
              </div>
            </div>
            <Space size={12}>
              <Typography.Text>{genderLabel}</Typography.Text>
              <Button type="link" onClick={onEditGender}>
                {t("common.edit")}
              </Button>
            </Space>
          </div>
          <div className="account-info-row">
            <div className="account-info-main">
              <span className="account-info-icon icon-blue">
                <GlobalOutlined />
              </span>
              <div>
                <Typography.Text strong>{t("profile.languagePreference")}</Typography.Text>
                <Typography.Paragraph type="secondary">{t("profile.languagePreferenceDesc")}</Typography.Paragraph>
              </div>
            </div>
            <Space size={12} wrap>
              <Select
                value={preferredLocale}
                style={{ width: 260 }}
                showSearch
                optionFilterProp="label"
                options={accountLocaleOptions.map((item) => ({
                  value: item.value,
                  label: `${item.label} / ${item.englishLabel}`
                }))}
                filterOption={(input, option) =>
                  String(option?.label || "")
                    .toLowerCase()
                    .includes(input.trim().toLowerCase())
                }
                onChange={(value) => onPreferredLocaleChange(normalizeAccountLocale(value))}
              />
              <Button type="primary" loading={savingPreferredLocale} onClick={onSavePreferredLocale}>
                {t("common.save")}
              </Button>
            </Space>
          </div>
          <div className="account-info-row">
            <div className="account-info-main">
              <span className="account-info-icon icon-mint">
                <IdcardOutlined />
              </span>
              <div>
                <Typography.Text strong>{t("profile.userId")}</Typography.Text>
                <Typography.Paragraph type="secondary">{t("profile.userIdDesc")}</Typography.Paragraph>
              </div>
            </div>
            <Typography.Text copyable={Boolean(user?.id)}>{user?.id || "-"}</Typography.Text>
          </div>
          <div className="account-info-row">
            <div className="account-info-main">
              <span className="account-info-icon icon-mint">
                <CalendarOutlined />
              </span>
              <div>
                <Typography.Text strong>{t("profile.createdAt")}</Typography.Text>
                <Typography.Paragraph type="secondary">{t("profile.createdAtDesc")}</Typography.Paragraph>
              </div>
            </div>
            <Typography.Text>{formatDateTime(user?.created_at)}</Typography.Text>
          </div>
          <div className="account-info-row">
            <div className="account-info-main">
              <span className="account-info-icon icon-mint">
                <EnvironmentOutlined />
              </span>
              <div>
                <Typography.Text strong>{t("profile.country")}</Typography.Text>
                <Typography.Paragraph type="secondary">{t("profile.countryDesc")}</Typography.Paragraph>
              </div>
            </div>
            <Typography.Text>{user?.country || t("common.notFilled")}</Typography.Text>
          </div>
        </div>
      </div>
    </div>
  );
}
