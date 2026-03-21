import { Form, Input, Modal, Typography } from "antd";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

type PasswordFormValues = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

type EditPasswordModalProps = {
  open: boolean;
  saving: boolean;
  onSave: (values: PasswordFormValues) => void;
  onCancel: () => void;
};

export function EditPasswordModal({ open, saving, onSave, onCancel }: EditPasswordModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<PasswordFormValues>();

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [form, open]);

  return (
    <Modal
      title={t("security.editPasswordTitle")}
      open={open}
      forceRender
      okText={saving ? t("common.saving") : t("common.save")}
      cancelText={t("common.cancel")}
      confirmLoading={saving}
      onOk={() => {
        void form.validateFields().then((values) => onSave(values));
      }}
      onCancel={onCancel}
    >
      <Typography.Text type="secondary">{t("security.changePasswordHint")}</Typography.Text>
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          label={t("security.currentPassword")}
          name="current_password"
          rules={[{ required: true, message: t("security.currentPasswordPlaceholder") }]}
        >
          <Input.Password placeholder={t("security.currentPasswordPlaceholder")} />
        </Form.Item>
        <Form.Item
          label={t("security.newPassword")}
          name="new_password"
          rules={[
            { required: true, message: t("security.newPasswordPlaceholder") },
            { min: 8, message: t("security.passwordMinLength") }
          ]}
        >
          <Input.Password placeholder={t("security.newPasswordPlaceholder")} />
        </Form.Item>
        <Form.Item
          label={t("security.confirmPassword")}
          name="confirm_password"
          dependencies={["new_password"]}
          rules={[
            { required: true, message: t("security.confirmPasswordPlaceholder") },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("new_password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t("security.passwordMismatch")));
              }
            })
          ]}
        >
          <Input.Password placeholder={t("security.confirmPasswordPlaceholder")} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
