import { Button, Form, Input, Modal, Radio, Space, Typography } from "antd";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

type MFAFormValues = {
  method?: "email" | "sms";
  current_password: string;
  current_mfa_code?: string;
};

type EditMFAModalProps = {
  open: boolean;
  saving: boolean;
  hasEmail: boolean;
  hasPhone: boolean;
  currentMethod?: string;
  mode: "enable" | "disable";
  requiresCurrentCode: boolean;
  sendingCurrentCode: boolean;
  currentCodeRemainingSeconds: number;
  onSave: (values: MFAFormValues) => void;
  onSendCurrentCode: (currentPassword: string) => void;
  onCancel: () => void;
};

export function EditMFAModal({
  open,
  saving,
  hasEmail,
  hasPhone,
  currentMethod,
  mode,
  requiresCurrentCode,
  sendingCurrentCode,
  currentCodeRemainingSeconds,
  onSave,
  onSendCurrentCode,
  onCancel
}: EditMFAModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<MFAFormValues>();
  const currentCodeSendable = requiresCurrentCode && (currentMethod === "email" || currentMethod === "sms");
  const modalTitle = t(mode === "enable" ? "security.mfaTitleEnable" : "security.mfaTitleDisable");
  const modalHint = t(mode === "enable" ? "security.mfaHintEnable" : "security.mfaHintDisable");
  const currentMFAHint =
    currentMethod === "sms"
      ? t("security.currentMfaCodeHintSMS")
      : currentMethod === "email"
        ? t("security.currentMfaCodeHintEmail")
        : t("security.currentMfaCodeHintManual");

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        method:
          mode === "enable"
            ? currentMethod === "sms" && hasPhone
              ? "sms"
              : hasEmail
                ? "email"
                : hasPhone
                  ? "sms"
                  : undefined
            : undefined,
        current_password: "",
        current_mfa_code: ""
      });
      return;
    }
    form.resetFields();
  }, [currentMethod, form, hasEmail, hasPhone, mode, open]);

  return (
    <Modal
      title={modalTitle}
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
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Typography.Text type="secondary">{modalHint}</Typography.Text>
        <Form form={form} layout="vertical">
          <Form.Item
            name="current_password"
            label={t("security.currentPassword")}
            rules={[{ required: true, message: t("security.currentPasswordPlaceholder") }]}
          >
            <Input.Password autoComplete="current-password" placeholder={t("security.currentPasswordPlaceholder")} />
          </Form.Item>
          {requiresCurrentCode ? (
            <>
              <Typography.Text type="secondary">{currentMFAHint}</Typography.Text>
              <Form.Item
                name="current_mfa_code"
                label={t("security.currentMfaCode")}
                rules={[{ required: true, message: t("security.currentMfaCodePlaceholder") }]}
              >
                {currentCodeSendable ? (
                  <Space.Compact style={{ width: "100%" }}>
                    <Input placeholder={t("security.currentMfaCodePlaceholder")} />
                    <Button
                      loading={sendingCurrentCode}
                      disabled={currentCodeRemainingSeconds > 0}
                      onClick={() => {
                        void form
                          .validateFields(["current_password"])
                          .then((values) => {
                            onSendCurrentCode(values.current_password);
                          })
                          .catch(() => undefined);
                      }}
                    >
                      {currentCodeRemainingSeconds > 0
                        ? `${currentCodeRemainingSeconds}s`
                        : t(currentMethod === "sms" ? "auth.sendPhoneOtpCode" : "auth.sendOtpCode")}
                    </Button>
                  </Space.Compact>
                ) : (
                  <Input placeholder={t("security.currentMfaCodePlaceholder")} />
                )}
              </Form.Item>
            </>
          ) : null}
          {mode === "enable" ? (
            <Form.Item name="method" label={t("security.mfaMethod")} rules={[{ required: true }]}>
              <Radio.Group>
                <Space direction="vertical" size={12}>
                  {hasEmail ? <Radio value="email">{t("security.mfaMethodEmail")}</Radio> : null}
                  {hasPhone ? <Radio value="sms">{t("security.mfaMethodSMS")}</Radio> : null}
                </Space>
              </Radio.Group>
            </Form.Item>
          ) : null}
        </Form>
      </Space>
    </Modal>
  );
}
