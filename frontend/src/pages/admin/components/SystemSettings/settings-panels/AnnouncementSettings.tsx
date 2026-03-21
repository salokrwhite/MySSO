import { Button, Form, Input, Switch, Typography } from "antd";
import type { FormInstance } from "antd";
import { useAdminI18n } from "../../../i18n";
import type { SystemSettings } from "../../../types";
import { SettingsCard } from "../../common/SettingsCard";

type AnnouncementSettingsProps = {
  form: FormInstance<SystemSettings>;
  initialValues: SystemSettings;
  saving: boolean;
  onSave: () => void;
};

export function AnnouncementSettings({ form, initialValues, saving, onSave }: AnnouncementSettingsProps) {
  const { t } = useAdminI18n();
  const userCenterEnabled = Form.useWatch("user_center_announcement_enabled", form);
  const developerEnabled = Form.useWatch("developer_announcement_enabled", form);

  return (
    <SettingsCard title={t("公告配置")}>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          label={t("开启用户中心公告")}
          name="user_center_announcement_enabled"
          valuePropName="checked"
          extra={t("开启后，用户中心顶部会显示该公告。")}
        >
          <Switch checkedChildren={t("已开启")} unCheckedChildren={t("已关闭")} />
        </Form.Item>
        <Form.Item
          label={t("用户中心公告内容")}
          name="user_center_announcement_content"
          rules={[
            {
              validator(_, value) {
                if (!userCenterEnabled || String(value || "").trim()) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t("开启用户中心公告后，请填写公告内容")));
              }
            }
          ]}
          extra={t("支持换行显示。关闭公告后可以保留内容，方便下次直接启用。")}
        >
          <Input.TextArea rows={6} placeholder={t("例如：\n系统将于今晚 23:00 至 23:30 进行维护升级，请提前保存业务数据。")} />
        </Form.Item>
        <Form.Item
          label={t("开启开发者后台公告")}
          name="developer_announcement_enabled"
          valuePropName="checked"
          extra={t("开启后，开发者后台顶部会显示该公告。")}
        >
          <Switch checkedChildren={t("已开启")} unCheckedChildren={t("已关闭")} />
        </Form.Item>
        <Form.Item
          label={t("开发者后台公告内容")}
          name="developer_announcement_content"
          rules={[
            {
              validator(_, value) {
                if (!developerEnabled || String(value || "").trim()) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t("开启开发者后台公告后，请填写公告内容")));
              }
            }
          ]}
          extra={t("支持换行显示。可以和用户中心公告设置完全不同。")}
        >
          <Input.TextArea rows={6} placeholder={t("例如：\n开发者控制台将于周六凌晨升级应用审核能力，期间部分接口可能短暂抖动。")} />
        </Form.Item>
        <Typography.Paragraph type="secondary" style={{ marginTop: 4 }}>
          {t("用户中心和开发者后台公告互相独立，只有在对应开关开启且内容非空时才会显示。")}
        </Typography.Paragraph>
        <Button type="primary" onClick={onSave} loading={saving}>
          {t("保存公告配置")}
        </Button>
      </Form>
    </SettingsCard>
  );
}
