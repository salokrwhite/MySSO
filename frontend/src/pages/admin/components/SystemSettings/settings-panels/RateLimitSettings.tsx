import { Button, Col, Form, InputNumber, Row, Typography } from "antd";
import type { FormInstance } from "antd";
import { useAdminI18n } from "../../../i18n";
import type { SystemSettings } from "../../../types";
import { SettingsCard } from "../../common/SettingsCard";

type RateLimitSettingsProps = {
  form: FormInstance<SystemSettings>;
  initialValues: SystemSettings;
  saving: boolean;
  onSave: () => void;
};

export function RateLimitSettings({
  form,
  initialValues,
  saving,
  onSave,
}: RateLimitSettingsProps) {
  const { t } = useAdminI18n();

  return (
    <SettingsCard
      title={t("限流管理")}
      description={t("管理公开安全验证与高成本查询接口的短时间重复调用。")}
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Typography.Title level={5} style={{ marginTop: 0 }}>
          {t("图形验证码限流")}
        </Typography.Title>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              label={t("图片生成每分钟次数/IP")}
              name="captcha_image_rate_limit_per_minute"
              rules={[{ required: true, message: t("请输入图片生成限流次数") }]}
              extra={t("设置为 0 表示关闭该接口限流。")}
            >
              <InputNumber min={0} max={10000} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label={t("业务预检每分钟次数/IP")}
              name="captcha_precheck_rate_limit_per_minute"
              rules={[{ required: true, message: t("请输入业务预检限流次数") }]}
              extra={t("设置为 0 表示关闭该接口限流。")}
            >
              <InputNumber min={0} max={10000} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label={t("同一业务目标预检每分钟次数/IP")}
              name="captcha_target_rate_limit_per_minute"
              rules={[{ required: true, message: t("请输入同一业务目标限流次数") }]}
              extra={t("设置为 0 表示关闭该接口限流。")}
            >
              <InputNumber min={0} max={10000} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          {t("图形验证码限流按客户端 IP 计算；同一业务目标会额外按 flow、用途和目标计算。触发限制时接口返回 429。")}
        </Typography.Paragraph>

        <Typography.Title level={5}>
          {t("验证码每日发送上限")}
        </Typography.Title>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label={t("同一邮箱每日最多发送验证码")}
              name="email_verification_code_daily_limit"
              rules={[{ required: true, message: t("请输入邮箱验证码每日上限") }]}
              extra={t("按中国大陆时间自然日统计，设置为 0 表示不限制。")}
            >
              <InputNumber min={0} max={100000} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={t("同一手机号每日最多发送验证码")}
              name="sms_verification_code_daily_limit"
              rules={[{ required: true, message: t("请输入手机号验证码每日上限") }]}
              extra={t("按中国大陆时间自然日统计，设置为 0 表示不限制。")}
            >
              <InputNumber min={0} max={100000} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          {t("验证码发送上限跨登录、注册、找回密码、MFA、换绑和注销等全部业务场景累计。触发限制时接口返回 429，并在次日 0 点后恢复。")}
        </Typography.Paragraph>

        <Typography.Title level={5}>
          {t("开发者搜索限流")}
        </Typography.Title>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label={t("时间窗口（秒）")}
              name="developer_managed_users_search_window_seconds"
              rules={[{ required: true, message: t("请输入时间窗口") }]}
              extra={t("设置为 0 表示关闭该接口限流。")}
            >
              <InputNumber min={0} max={3600} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={t("窗口内最大搜索次数")}
              name="developer_managed_users_search_limit"
              rules={[{ required: true, message: t("请输入最大搜索次数") }]}
              extra={t("设置为 0 表示关闭该接口限流。")}
            >
              <InputNumber min={0} max={10000} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          {t("限流按开发者账号分别计算。触发限制时接口返回 429，并带有 Retry-After。")}
        </Typography.Paragraph>

        <Button type="primary" onClick={onSave} loading={saving}>
          {t("保存限流管理")}
        </Button>
      </Form>
    </SettingsCard>
  );
}
