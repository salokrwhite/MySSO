import { Button, Col, Form, InputNumber, Row, Select, Space, Switch } from "antd";
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
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label={t("验证码有效期（分钟）")}
              name="smtp_verification_code_ttl_minutes"
              rules={[{ required: true, message: t("请输入验证码有效期") }]}
            >
              <InputNumber min={1} max={60} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={t("发送冷却时间（秒）")}
              name="smtp_verification_code_cooldown_seconds"
              rules={[{ required: true, message: t("请输入发送冷却时间") }]}
              extra={t("同一目标、同一用途在冷却期内不能重复发送。")}
            >
              <InputNumber min={0} max={3600} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          label={t("发送验证码前启用图形人机验证")}
          name="captcha_enabled"
          valuePropName="checked"
          extra={t("开启后，邮箱验证码、短信验证码、MFA 重发和登录补充验证发送前都必须先通过图形验证码。")}
        >
          <Switch />
        </Form.Item>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label={t("验证码长度")} name="captcha_CaptchaLen">
              <InputNumber min={4} max={8} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={t("图形验证码有效期（秒）")} name="captcha_ttl_seconds">
              <InputNumber min={30} max={900} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label={t("字符模式")} name="captcha_mode">
              <Select
                options={[
                  { value: 0, label: t("数字") },
                  { value: 1, label: t("字母") },
                  { value: 2, label: t("算术") },
                  { value: 3, label: t("数字和字母") }
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={t("加强干扰文字")} name="captcha_ComplexOfNoiseText">
              <InputNumber min={0} max={10} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={t("加强干扰点")} name="captcha_ComplexOfNoiseDot">
              <InputNumber min={0} max={10} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label={t("使用噪点")} name="captcha_IsShowNoiseDot" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={t("使用干扰文字")} name="captcha_IsShowNoiseText" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label={t("使用空心线")} name="captcha_IsShowHollowLine" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={t("使用波浪线")} name="captcha_IsShowSlimeLine" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={t("使用正弦线")} name="captcha_IsShowSineLine" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Space style={{ marginTop: 16 }}>
          <Button type="primary" onClick={onSave} loading={saving}>
            {t("保存验证码策略")}
          </Button>
        </Space>
      </Form>
    </SettingsCard>
  );
}
