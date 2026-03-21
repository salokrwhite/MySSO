import { useEffect } from "react";
import { Button, Form, Input, Modal, Space, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { getLastEmailCodeTarget, useEmailCodeCooldown } from "../../../utils/emailCodeCooldown";

type EmailFormValues = {
  email: string;
  code: string;
  current_password: string;
};

type EditEmailModalProps = {
  open: boolean;
  saving: boolean;
  sendingCode: boolean;
  onSave: (values: EmailFormValues) => void;
  onSendCode: (email: string) => void;
  onCancel: () => void;
};

export function EditEmailModal({
  open,
  saving,
  sendingCode,
  onSave,
  onSendCode,
  onCancel
}: EditEmailModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<EmailFormValues>();
  const email = Form.useWatch("email", form) || "";
  const { remainingSeconds } = useEmailCodeCooldown(email, "change_email");

  useEffect(() => {
    if (open) {
      const lastEmail = getLastEmailCodeTarget("change_email");
      if (lastEmail && !form.getFieldValue("email")) {
        form.setFieldValue("email", lastEmail);
      }
      return;
    }
    form.resetFields();
  }, [form, open]);

  return (
    <Modal
      title={t("security.editEmailTitle")}
      open={open}
      okText={saving ? t("common.saving") : t("common.save")}
      cancelText={t("common.cancel")}
      confirmLoading={saving}
      onOk={() => {
        void form.validateFields().then((values) => onSave(values));
      }}
      onCancel={onCancel}
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Typography.Text type="secondary">{t("security.changeEmailHint")}</Typography.Text>
        <Form form={form} layout="vertical">
          <Form.Item
            label={t("security.currentPassword")}
            name="current_password"
            rules={[{ required: true, message: t("security.currentPasswordPlaceholder") }]}
          >
            <Input.Password autoComplete="current-password" placeholder={t("security.currentPasswordPlaceholder")} />
          </Form.Item>
          <Form.Item
            label={t("security.newEmail")}
            name="email"
            rules={[
              { required: true, message: t("security.newEmailPlaceholder") },
              { type: "email", message: t("security.newEmailPlaceholder") }
            ]}
          >
            <Input placeholder={t("security.newEmailPlaceholder")} />
          </Form.Item>
          <Form.Item label={t("security.emailCode")} required>
            <Space.Compact style={{ width: "100%" }}>
              <Form.Item
                name="code"
                noStyle
                rules={[{ required: true, message: t("security.emailCodePlaceholder") }]}
              >
                <Input placeholder={t("security.emailCodePlaceholder")} />
              </Form.Item>
              <Button
                onClick={() => {
                  void form.validateFields(["email"]).then((values) => onSendCode(values.email));
                }}
                loading={sendingCode}
                disabled={remainingSeconds > 0}
              >
                {sendingCode
                  ? t("common.sendingCode")
                  : remainingSeconds > 0
                    ? `${remainingSeconds}s`
                    : t("common.sendCode")}
              </Button>
            </Space.Compact>
          </Form.Item>
        </Form>
      </Space>
    </Modal>
  );
}
