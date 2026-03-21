import { Button, Checkbox, Col, Form, Input, InputNumber, Row, Space, Typography } from "antd";
import type { FormInstance } from "antd";
import { useAdminI18n } from "../../../i18n";
import type { SystemSettings } from "../../../types";
import { SettingsCard } from "../../common/SettingsCard";

type EmailSettingsProps = {
  form: FormInstance<SystemSettings>;
  initialValues: SystemSettings;
  saving: boolean;
  testingEmail: boolean;
  testEmail: string;
  setTestEmail: (value: string) => void;
  onSave: () => void;
  onSendTest: () => void;
};

export function EmailSettings({
  form,
  initialValues,
  saving,
  testingEmail,
  testEmail,
  setTestEmail,
  onSave,
  onSendTest
}: EmailSettingsProps) {
  const { t } = useAdminI18n();

  return (
    <SettingsCard title={t("邮件服务")}>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="SMTP Host" name="smtp_host" rules={[{ required: true, message: t("请输入 SMTP Host") }]}>
              <Input placeholder="smtp.example.com" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="SMTP Port" name="smtp_port" rules={[{ required: true, message: t("请输入 SMTP Port") }]}>
              <Input placeholder="587" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="SMTP Username" name="smtp_username">
              <Input placeholder="mailer@example.com" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="SMTP Password"
              name="smtp_password"
              extra={
                initialValues.smtp_password_configured
                  ? t("已配置时留空保持不变，填写新值会立即更新。")
                  : t("首次配置后不会再回显明文，填写新值会立即更新。")
              }
            >
              <Input.Password
                placeholder={initialValues.smtp_password_configured ? t("留空保持当前密码，填写则更新") : t("SMTP 密码")}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="From Email" name="smtp_from" rules={[{ required: true, message: t("请输入发件邮箱") }]}>
              <Input placeholder="mailer@example.com" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={t("验证码有效期（分钟）")}
              name="smtp_verification_code_ttl_minutes"
              rules={[{ required: true, message: t("请输入验证码有效期") }]}
            >
              <InputNumber min={1} max={60} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="smtp_force_ssl"
          valuePropName="checked"
          extra={t("如果无法发送邮件，可关闭此项，会尝试使用 STARTTLS 并决定是否使用加密连接。")}
        >
          <Checkbox>{t("强制使用 SSL 连接")}</Checkbox>
        </Form.Item>

        <Space wrap>
          <Button type="primary" onClick={onSave} loading={saving}>
            {t("保存邮件设置")}
          </Button>
        </Space>

        <div className="settings-inline-tools">
          <Typography.Text strong>{t("测试发信")}</Typography.Text>
          <Space.Compact style={{ width: "100%" }}>
            <Input placeholder={t("输入测试收件邮箱")} value={testEmail} onChange={(event) => setTestEmail(event.target.value)} />
            <Button onClick={onSendTest} loading={testingEmail}>
              {t("发送测试邮件")}
            </Button>
          </Space.Compact>
        </div>
      </Form>
    </SettingsCard>
  );
}
