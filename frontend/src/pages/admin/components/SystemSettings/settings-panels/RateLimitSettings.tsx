import { Button, Card, Form, InputNumber, Space, Switch, Typography } from "antd";
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

export function RateLimitSettings({ form, initialValues, saving, onSave }: RateLimitSettingsProps) {
  const { t } = useAdminI18n();
  const numberRule = (label: string) => [{ required: true, message: t("请输入{{label}}", { label: t(label) }) }];

  return (
    <SettingsCard title={t("限流管理")}>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Card size="small" title={t("基础开关")} style={{ marginBottom: 16 }}>
          <Form.Item label={t("启用限流保护")} name="rate_limit_enabled" valuePropName="checked">
            <Switch checkedChildren={t("已启用")} unCheckedChildren={t("已关闭")} />
          </Form.Item>
          <Form.Item label={t("启用发码挑战参数")} name="send_challenge_enabled" valuePropName="checked">
            <Switch checkedChildren={t("已启用")} unCheckedChildren={t("已关闭")} />
          </Form.Item>
          <Form.Item label={t("挑战参数有效期（秒）")} name="challenge_token_ttl_seconds" rules={numberRule("挑战参数有效期")}>
            <InputNumber min={1} max={600} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("达到该 IP 分钟请求数后要求挑战")} name="challenge_required_after_ip_minute_count" rules={numberRule("挑战阈值")}>
            <InputNumber min={0} max={10000} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("达到该 IP 小时请求数后要求附加验证码")} name="captcha_required_after_ip_hour_count" rules={numberRule("附加验证码阈值")}>
            <InputNumber min={0} max={100000} style={{ width: "100%" }} />
          </Form.Item>
        </Card>

        <Card size="small" title={t("认证失败限流")} style={{ marginBottom: 16 }}>
          <Form.Item label={t("失败计数窗口（分钟）")} name="auth_attempt_window_minutes" rules={numberRule("失败计数窗口")}>
            <InputNumber min={1} max={1440} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("命中后锁定时长（分钟）")} name="auth_attempt_lock_minutes" rules={numberRule("锁定时长")}>
            <InputNumber min={1} max={1440} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("密码登录单账号失败上限")} name="password_login_account_attempt_limit" rules={numberRule("密码登录单账号失败上限")}>
            <InputNumber min={0} max={1000} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("邮箱/短信 OTP 单账号失败上限")} name="otp_login_account_attempt_limit" rules={numberRule("OTP 单账号失败上限")}>
            <InputNumber min={0} max={1000} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("MFA 单账号失败上限")} name="mfa_login_account_attempt_limit" rules={numberRule("MFA 单账号失败上限")}>
            <InputNumber min={0} max={1000} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("单 IP 失败上限")} name="auth_attempt_ip_limit" rules={numberRule("单 IP 失败上限")}>
            <InputNumber min={0} max={10000} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("设备维度失败上限（首方设备 ID cookie）")} name="auth_attempt_device_limit" rules={numberRule("设备维度失败上限")}>
            <InputNumber min={0} max={10000} style={{ width: "100%" }} />
          </Form.Item>
        </Card>

        <Card size="small" title={t("邮件公开发码限流")} style={{ marginBottom: 16 }}>
          <Form.Item label={t("单目标冷却（秒）")} name="email_target_cooldown_seconds" rules={numberRule("单目标冷却时间")}>
            <InputNumber min={0} max={3600} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("单 IP 每分钟上限")} name="email_ip_minute_limit" rules={numberRule("单 IP 每分钟上限")}>
            <InputNumber min={0} max={100000} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("单 IP 每小时上限")} name="email_ip_hour_limit" rules={numberRule("单 IP 每小时上限")}>
            <InputNumber min={0} max={100000} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("单 IP 每小时唯一目标上限")} name="email_ip_hour_unique_target_limit" rules={numberRule("唯一目标上限")}>
            <InputNumber min={0} max={100000} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("全站每分钟总量上限")} name="email_global_minute_limit" rules={numberRule("每分钟总量上限")}>
            <InputNumber min={0} max={1000000} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("全站每小时总量上限")} name="email_global_hour_limit" rules={numberRule("每小时总量上限")}>
            <InputNumber min={0} max={1000000} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("熔断持续时长（分钟）")} name="email_fuse_minutes" rules={numberRule("邮件熔断时长")}>
            <InputNumber min={1} max={1440} style={{ width: "100%" }} />
          </Form.Item>
        </Card>

        <Card size="small" title={t("短信公开发码限流")} style={{ marginBottom: 16 }}>
          <Form.Item label={t("单目标冷却（秒）")} name="sms_target_cooldown_seconds" rules={numberRule("单目标冷却时间")}>
            <InputNumber min={0} max={3600} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("单 IP 每分钟上限")} name="sms_ip_minute_limit" rules={numberRule("单 IP 每分钟上限")}>
            <InputNumber min={0} max={100000} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("单 IP 每小时上限")} name="sms_ip_hour_limit" rules={numberRule("单 IP 每小时上限")}>
            <InputNumber min={0} max={100000} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("单 IP 每小时唯一目标上限")} name="sms_ip_hour_unique_target_limit" rules={numberRule("唯一目标上限")}>
            <InputNumber min={0} max={100000} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("全站每分钟总量上限")} name="sms_global_minute_limit" rules={numberRule("每分钟总量上限")}>
            <InputNumber min={0} max={1000000} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("全站每小时总量上限")} name="sms_global_hour_limit" rules={numberRule("每小时总量上限")}>
            <InputNumber min={0} max={1000000} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("熔断持续时长（分钟）")} name="sms_fuse_minutes" rules={numberRule("短信熔断时长")}>
            <InputNumber min={1} max={1440} style={{ width: "100%" }} />
          </Form.Item>
        </Card>

        <Card size="small" title={t("管理员测试发信限流")} style={{ marginBottom: 16 }}>
          <Form.Item label={t("测试邮件每分钟上限")} name="admin_test_email_minute_limit" rules={numberRule("测试邮件每分钟上限")}>
            <InputNumber min={0} max={10000} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("测试邮件每日上限")} name="admin_test_email_daily_limit" rules={numberRule("测试邮件每日上限")}>
            <InputNumber min={0} max={100000} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("测试短信每分钟上限")} name="admin_test_sms_minute_limit" rules={numberRule("测试短信每分钟上限")}>
            <InputNumber min={0} max={10000} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("测试短信每日上限")} name="admin_test_sms_daily_limit" rules={numberRule("测试短信每日上限")}>
            <InputNumber min={0} max={100000} style={{ width: "100%" }} />
          </Form.Item>
        </Card>

        <Card size="small" className="settings-hint-card">
          <Typography.Text type="secondary">
            {t("认证限流会按账号、IP 和首方设备 ID cookie 执行。公开发码接口会先校验挑战参数，再执行目标冷却、来源限流和全局熔断。")}
          </Typography.Text>
        </Card>

        <Space style={{ marginTop: 16 }}>
          <Button type="primary" onClick={onSave} loading={saving}>
            {t("保存限流管理")}
          </Button>
        </Space>
      </Form>
    </SettingsCard>
  );
}
