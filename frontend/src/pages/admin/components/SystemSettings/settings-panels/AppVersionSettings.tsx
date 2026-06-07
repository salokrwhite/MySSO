import { Button, Checkbox, Form, Input, InputNumber } from "antd";
import type { FormInstance } from "antd";
import { useAdminI18n } from "../../../i18n";
import type { SystemSettings } from "../../../types";
import { SettingsCard } from "../../common/SettingsCard";

type AppVersionSettingsProps = {
  form: FormInstance<SystemSettings>;
  initialValues: SystemSettings;
  saving: boolean;
  onSave: () => void;
};

export function AppVersionSettings({ form, initialValues, saving, onSave }: AppVersionSettingsProps) {
  const { t } = useAdminI18n();

  return (
    <SettingsCard title={t("APP 版本")}>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          label={t("当前 APP 版本号")}
          name="app_current_version_code"
          extra={t("Android 端 versionCode 低于该值时，扫码登录确认会提示版本已过期，并引导下载最新版。")}
          rules={[{ required: true, type: "number", min: 1, message: t("请输入大于 0 的版本号") }]}
        >
          <InputNumber min={1} precision={0} style={{ width: "100%" }} placeholder="1" />
        </Form.Item>
        <Form.Item
          label={t("当前 APP 版本名称")}
          name="app_current_version_name"
          extra={t("展示给管理员识别的版本名，例如 1.0.0。")}
        >
          <Input placeholder="1.0.0" maxLength={64} />
        </Form.Item>
        <Form.Item
          label={t("APP 下载链接")}
          name="app_download_url"
          extra={t("登录页下载 APP 按钮和移动端过期提示都会使用该链接。仅支持 http 或 https。")}
          rules={[
            {
              validator: (_, value?: string) => {
                const nextValue = value?.trim();
                if (!nextValue) {
                  return Promise.resolve();
                }
                try {
                  const url = new URL(nextValue);
                  if (url.protocol === "http:" || url.protocol === "https:") {
                    return Promise.resolve();
                  }
                } catch {
                  return Promise.reject(new Error(t("请输入有效的 http 或 https 下载链接")));
                }
                return Promise.reject(new Error(t("请输入有效的 http 或 https 下载链接")));
              }
            }
          ]}
        >
          <Input placeholder="https://example.com/download/mysso.apk" />
        </Form.Item>
        <Form.Item
          name="app_force_update"
          valuePropName="checked"
          extra={t("开启后，低版本 APP 的过期提示不可跳过；用户点取消会退出 APP。关闭时只提示更新，取消后仍可继续使用。")}
        >
          <Checkbox>{t("强制更新")}</Checkbox>
        </Form.Item>
        <Button type="primary" onClick={onSave} loading={saving}>
          {t("保存 APP 版本设置")}
        </Button>
      </Form>
    </SettingsCard>
  );
}
