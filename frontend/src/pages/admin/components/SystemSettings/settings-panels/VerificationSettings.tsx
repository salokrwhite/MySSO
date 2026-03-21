import { Button, Card, Form, Input, InputNumber, Space, Typography } from "antd";
import type { FormInstance } from "antd";
import { useAdminI18n } from "../../../i18n";
import type { SystemSettings } from "../../../types";
import { SettingsCard } from "../../common/SettingsCard";

type VerificationSettingsProps = {
  form: FormInstance<SystemSettings>;
  initialValues: SystemSettings;
  saving: boolean;
  onSave: () => void;
};

export function VerificationSettings({ form, initialValues, saving, onSave }: VerificationSettingsProps) {
  const { t } = useAdminI18n();

  return (
    <SettingsCard title={t("验证码策略")}>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          label={t("验证码有效期（分钟）")}
          name="smtp_verification_code_ttl_minutes"
          rules={[{ required: true, message: t("请输入验证码有效期") }]}
        >
          <InputNumber min={1} max={60} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label={t("发送冷却时间（秒）")}
          name="smtp_verification_code_cooldown_seconds"
          rules={[{ required: true, message: t("请输入发送冷却时间") }]}
          extra={t("同一邮箱、同一用途在冷却期内不能重复发送。该限制由服务端强制执行，刷新页面不会重置。")}
        >
          <InputNumber min={0} max={3600} style={{ width: "100%" }} />
        </Form.Item>
        <Space style={{ marginTop: 16 }}>
          <Button type="primary" onClick={onSave} loading={saving}>
            {t("保存验证码策略")}
          </Button>
        </Space>
      </Form>
    </SettingsCard>
  );
}
