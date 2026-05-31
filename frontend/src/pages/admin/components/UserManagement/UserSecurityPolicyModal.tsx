import { Alert, Button, Drawer, Form, Radio, Skeleton, Space, Switch, Tag, Typography } from "antd";
import { useEffect } from "react";
import { useAdminI18n } from "../../i18n";
import type { UpdateUserSecurityPolicyInput, User, UserSecurityPolicy } from "../../types";

type UserSecurityPolicyModalProps = {
  open: boolean;
  user?: User;
  policy?: UserSecurityPolicy;
  loading: boolean;
  isMobile?: boolean;
  onCancel: () => void;
  onSubmit: (userId: string, values: UpdateUserSecurityPolicyInput) => Promise<void>;
};

export function UserSecurityPolicyModal({
  open,
  user,
  policy,
  loading,
  isMobile,
  onCancel,
  onSubmit,
}: UserSecurityPolicyModalProps) {
  const [form] = Form.useForm<UpdateUserSecurityPolicyInput>();
  const { t } = useAdminI18n();

  useEffect(() => {
    if (!open) {
      form.resetFields();
      return;
    }
    if (!policy) {
      form.setFieldsValue({
        force_phone_binding_next_login: false,
        force_mfa_enrollment_next_login: false,
        login_step_up_mode: "none",
      });
      return;
    }
    form.setFieldsValue({
      force_phone_binding_next_login: policy.force_phone_binding_next_login,
      force_mfa_enrollment_next_login: policy.force_mfa_enrollment_next_login,
      login_step_up_mode: policy.login_step_up_mode,
    });
  }, [form, open, policy]);

  const capabilityText = policy
    ? [
        policy.has_email ? t("已绑定邮箱") : t("未绑定邮箱"),
        policy.has_phone ? t("已绑定手机号") : t("未绑定手机号"),
      ]
    : [];

  function handleClose() {
    if (loading) {
      return;
    }
    onCancel();
  }

  function handleSubmit() {
    void form.validateFields().then((values) => {
      if (!user) {
        return;
      }
      void onSubmit(user.id, values);
    });
  }

  return (
    <Drawer
      title={user ? t("{{email}} 安全策略", { email: user.email }) : t("安全策略")}
      open={open}
      width={isMobile ? "100vw" : 560}
      placement="right"
      destroyOnClose
      maskClosable={!loading}
      onClose={handleClose}
      footer={
        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button disabled={loading} onClick={handleClose}>
            {t("取消")}
          </Button>
          <Button type="primary" loading={loading} disabled={!policy} onClick={handleSubmit}>
            {t("保存")}
          </Button>
        </Space>
      }
    >
      <Skeleton active loading={!policy}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {policy ? (
            <Alert
              type="info"
              showIcon
              message={t("当前账号能力")}
              description={
                <Space wrap>
                  {capabilityText.map((text) => (
                    <Tag key={text}>{text}</Tag>
                  ))}
                </Space>
              }
            />
          ) : null}
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {t("登录附加验证在运行时会自动降级：双验证缺手机号时降级为邮箱验证，缺邮箱时降级为手机号验证，两者都没有时本次登录会直接失败。")}
          </Typography.Paragraph>
          <Form form={form} layout="vertical" initialValues={{ login_step_up_mode: "none" }}>
            <Form.Item
              label={t("下次登录必须绑定手机号")}
              name="force_phone_binding_next_login"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item label={t("登录附加验证")} name="login_step_up_mode">
              <Radio.Group>
                <Space direction="vertical">
                  <Radio value="none">{t("不启用")}</Radio>
                  <Radio value="email">{t("邮箱验证")}</Radio>
                  <Radio value="sms">{t("手机号验证")}</Radio>
                  <Radio value="email_and_sms">{t("邮箱 + 手机号双验证")}</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label={t("下次登录后必须开启二级验证")}
              name="force_mfa_enrollment_next_login"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Form>
        </Space>
      </Skeleton>
    </Drawer>
  );
}
