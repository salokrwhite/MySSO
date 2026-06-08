import { Alert, Button, Col, Divider, Form, Input, InputNumber, Row, Switch, Typography } from "antd";
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
    <SettingsCard title={t("风控管理")} description={t("配置账号登录风险评分、处置动作和注册后手机号绑定策略。")}>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          label={t("启用账号风控")}
          name="risk_control_enabled"
          valuePropName="checked"
          extra={t("开启后，登录会结合客户端风险信号、设备指纹、IP 黑名单、失败次数和行为规则做评分。")}
        >
          <Switch />
        </Form.Item>

        <Divider orientation="left" orientationMargin={0}>{t("登录风控评分")}</Divider>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label={t("中风险阈值")} name="risk_medium_threshold" rules={[{ required: true, message: t("请输入阈值") }]}>
              <InputNumber min={0} max={100} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={t("高风险阈值")} name="risk_high_threshold" rules={[{ required: true, message: t("请输入阈值") }]}>
              <InputNumber min={0} max={100} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={t("极高风险阈值")} name="risk_critical_threshold" rules={[{ required: true, message: t("请输入阈值") }]}>
              <InputNumber min={0} max={100} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={t("自动阻断阈值")} name="risk_auto_block_threshold" rules={[{ required: true, message: t("请输入阈值") }]}>
              <InputNumber min={0} max={100} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              label={t("综合评分统计周期（天）")}
              name="risk_score_window_days"
              rules={[{ required: true, message: t("请输入天数") }]}
              extra={t("综合评分统计该周期内事件最高评分，并与失败登录折算分取较高值。")}
            >
              <InputNumber min={1} max={365} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label={t("每次失败登录加分")}
              name="risk_failed_login_score_weight"
              rules={[{ required: true, message: t("请输入加分") }]}
              extra={t("周期内失败登录会按次数折算进综合评分。")}
            >
              <InputNumber min={0} max={100} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label={t("失败登录加分上限")}
              name="risk_failed_login_score_cap"
              rules={[{ required: true, message: t("请输入上限") }]}
              extra={t("限制失败登录对综合评分的最高贡献。")}
            >
              <InputNumber min={0} max={100} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label={t("5 分钟最大失败次数")} name="risk_max_failed_logins" rules={[{ required: true, message: t("请输入次数") }]}>
              <InputNumber min={1} max={100} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={t("锁定提示时长（分钟）")} name="risk_lockout_minutes" rules={[{ required: true, message: t("请输入分钟数") }]}>
              <InputNumber min={1} max={1440} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label={t("启用设备检查")} name="risk_enable_device_check" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={t("启用 IP/地理检查")} name="risk_enable_geo_check" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={t("启用行为检查")} name="risk_enable_behavior_check" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={t("启用 IP 黑名单")} name="risk_enable_ip_blacklist" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label={t("可信 IP 白名单")} name="risk_trusted_ips" extra={t("支持 JSON 数组或换行分隔；可填写单个 IP 或 CIDR。")}>
          <Input.TextArea rows={3} placeholder={'["127.0.0.1","10.0.0.0/8"]'} />
        </Form.Item>

        <Form.Item label={t("高风险国家/地区")} name="risk_high_risk_countries" extra={t("按 IP 归属地实时评分，支持国家码、国家/地区、省/州、城市，JSON 数组或换行分隔。")}>
          <Input.TextArea rows={3} placeholder={'["ZZ"]'} />
        </Form.Item>

        <Divider orientation="left" orientationMargin={0}>{t("风险缓释与可信设备")}</Divider>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label={t("启用风险缓释")}
              name="risk_enable_mitigation"
              valuePropName="checked"
              extra={t("二次验证通过或管理员标记误报后，按时效降低新设备、IP 变化和高风险地区的评分权重。")}
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={t("允许阻断后强校验放行")}
              name="risk_allow_block_step_up"
              valuePropName="checked"
              extra={t("仅对可恢复的高分阻断生效；IP 黑名单等硬阻断仍会直接拒绝。")}
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label={t("可信设备有效天数")} name="risk_trusted_device_days" rules={[{ required: true, message: t("请输入天数") }]}>
              <InputNumber min={0} max={365} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={t("风险缓释时长（小时）")} name="risk_mitigation_hours" rules={[{ required: true, message: t("请输入小时数") }]}>
              <InputNumber min={0} max={8760} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label={t("可信设备扣分")} name="risk_trusted_device_score_discount" rules={[{ required: true, message: t("请输入扣分") }]}>
              <InputNumber min={0} max={100} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={t("缓释期扣分")} name="risk_mitigation_score_discount" rules={[{ required: true, message: t("请输入扣分") }]}>
              <InputNumber min={0} max={100} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={t("高风险地区降权")} name="risk_high_risk_geo_discount" rules={[{ required: true, message: t("请输入降权值") }]}>
              <InputNumber min={0} max={100} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={t("新设备降权")} name="risk_new_device_discount" rules={[{ required: true, message: t("请输入降权值") }]}>
              <InputNumber min={0} max={100} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={t("IP 快速变化降权")} name="risk_ip_change_discount" rules={[{ required: true, message: t("请输入降权值") }]}>
              <InputNumber min={0} max={100} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" orientationMargin={0}>{t("注册后手机号绑定")}</Divider>

        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message={t("手机号绑定风控")}
          description={t("启用风控前，必须先在“邮件”和“发信配置”中完成邮件投递、短信接口和绑定手机号短信模板配置，否则保存会被拒绝。")}
        />

        <Form.Item
          label={t("启用手机号绑定风控")}
          name="risk_phone_binding_enabled"
          valuePropName="checked"
          extra={t("开启后，中国大陆注册用户会被随机分配到“注册后立即绑定”或“第 N 次登录触发绑定”两种策略。")}
        >
          <Switch />
        </Form.Item>

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
