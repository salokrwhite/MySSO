import { Alert, Button, Col, Form, InputNumber, Row, Switch, Typography } from "antd";
import type { FormInstance } from "antd";
import { useAdminI18n } from "../../../i18n";
import type { SystemSettings } from "../../../types";
import { SettingsCard } from "../../common/SettingsCard";

type RiskControlSettingsProps = {
  form: FormInstance<SystemSettings>;
  initialValues: SystemSettings;
  saving: boolean;
  onSave: () => void;
};

export function RiskControlSettings({ form, initialValues, saving, onSave }: RiskControlSettingsProps) {
  const { t } = useAdminI18n();
  const riskEnabled = Form.useWatch("risk_control_enabled", form);

  return (
    <SettingsCard title={t("风控管理")} description={t("仅对注册地区为中国大陆（CN）的自注册用户生效。")}>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          label={t("启用手机号绑定风控")}
          name="risk_control_enabled"
          valuePropName="checked"
          extra={t("开启后，中国大陆注册用户会被随机分配到“注册后立即绑定”或“第 N 次登录触发绑定”两种策略。")}
        >
          <Switch />
        </Form.Item>

        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message={t("保存前置条件")}
          description={t("启用风控前，必须先在“邮件”和“发信配置”中完成邮件投递、短信接口和绑定手机号短信模板配置，否则保存会被拒绝。")}
        />

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label={t("注册后立即绑定概率（%）")}
              name="risk_immediate_bind_probability"
              rules={[{ required: true, message: t("请输入概率") }]}
              extra={t("命中后，用户注册成功会立即跳转到手机号绑定页，账号状态变为待激活。")}
            >
              <InputNumber min={0} max={100} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={t("延迟登录触发概率（%）")}
              name="risk_delayed_bind_probability"
              rules={[{ required: true, message: t("请输入概率") }]}
              extra={t("命中后，用户会在第 N 次登录时被要求绑定手机号；若未绑定，账号切换为待激活。")}
            >
              <InputNumber min={0} max={100} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label={t("延迟触发登录次数 N")}
          name="risk_delayed_bind_login_count"
          rules={[{ required: true, message: t("请输入登录次数") }]}
          extra={t("仅对“延迟登录触发”策略生效，例如填 3 表示第 3 次登录时开始强制要求绑定手机号。")}
        >
          <InputNumber min={1} precision={0} style={{ width: "100%" }} />
        </Form.Item>

        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          {t("两个概率之和必须等于 100。未绑定手机号时，用户账号会保持或切换为“待激活”，绑定完成后恢复正常。")}
        </Typography.Paragraph>

        <Button type="primary" onClick={onSave} loading={saving} disabled={!riskEnabled && saving}>
          {t("保存风控管理")}
        </Button>
      </Form>
    </SettingsCard>
  );
}
