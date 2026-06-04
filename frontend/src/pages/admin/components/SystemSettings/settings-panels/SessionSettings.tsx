import { Button, Checkbox, Form } from "antd";
import type { FormInstance } from "antd";
import { useAdminI18n } from "../../../i18n";
import type { SystemSettings } from "../../../types";
import { SettingsCard } from "../../common/SettingsCard";

type SessionSettingsProps = {
  form: FormInstance<SystemSettings>;
  initialValues: SystemSettings;
  saving: boolean;
  onSave: () => void;
};

export function SessionSettings({ form, initialValues, saving, onSave }: SessionSettingsProps) {
  const { t } = useAdminI18n();

  return (
    <SettingsCard title={t("用户会话")}>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          name="allow_user_registration"
          valuePropName="checked"
          extra={t("关闭后，注册页会提示“当前系统不允许注册”，同时服务端会拒绝发送注册验证码和创建新用户。")}
        >
          <Checkbox>{t("允许新用户注册")}</Checkbox>
        </Form.Item>
        <Form.Item
          name="enable_phone_verification"
          valuePropName="checked"
          extra={t("关闭后，登录页不再显示手机号验证码登录，用户中心不再显示绑定/换绑手机号入口，同时服务端会拒绝相关手机号绑定与短信登录请求。")}
        >
          <Checkbox>{t("开启手机号验证")}</Checkbox>
        </Form.Item>
        <Form.Item
          name="enable_qr_login"
          valuePropName="checked"
          extra={t("开启后，登录页会显示扫码登录入口，已登录的 Android App 用户可以扫码确认并为网页端建立登录会话。")}
        >
          <Checkbox>{t("开启扫码登录")}</Checkbox>
        </Form.Item>
        <Button type="primary" onClick={onSave} loading={saving}>
          {t("保存用户会话设置")}
        </Button>
      </Form>
    </SettingsCard>
  );
}
