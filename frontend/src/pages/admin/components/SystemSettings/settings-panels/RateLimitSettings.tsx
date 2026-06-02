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
      description={t("当前仅限制开发者后台“用户分组与访问”的邮箱搜索接口。")}
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
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
