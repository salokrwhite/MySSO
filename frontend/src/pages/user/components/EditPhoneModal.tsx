import { useEffect } from "react";
import { Button, Form, Input, Modal, Space, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { getLastEmailCodeTarget, useEmailCodeCooldown } from "../../../utils/emailCodeCooldown";

type PhoneFormValues = {
  current_phone_code?: string;
  phone: string;
  code: string;
  current_password: string;
};

type EditPhoneModalProps = {
  open: boolean;
  hasBoundPhone: boolean;
  currentPhone?: string;
  saving: boolean;
  sendingCurrentPhoneCode: boolean;
  sendingNewPhoneCode: boolean;
  onSave: (values: PhoneFormValues) => void;
  onSendCurrentPhoneCode: () => void;
  onSendNewPhoneCode: (phone: string) => void;
  onCancel: () => void;
};

export function EditPhoneModal({
  open,
  hasBoundPhone,
  currentPhone,
  saving,
  sendingCurrentPhoneCode,
  sendingNewPhoneCode,
  onSave,
  onSendCurrentPhoneCode,
  onSendNewPhoneCode,
  onCancel
}: EditPhoneModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<PhoneFormValues>();
  const phone = Form.useWatch("phone", form) || "";
  const currentPhoneDisplay = currentPhone || "";
  const { remainingSeconds: currentPhoneRemainingSeconds } = useEmailCodeCooldown(currentPhoneDisplay, "verify_current_phone");
  const { remainingSeconds } = useEmailCodeCooldown(phone, "change_phone");

  useEffect(() => {
    if (open) {
      const lastPhone = getLastEmailCodeTarget("change_phone");
      if (lastPhone && !form.getFieldValue("phone")) {
        form.setFieldValue("phone", lastPhone);
      }
      return;
    }
    form.resetFields();
  }, [form, open]);

  return (
    <Modal
      title={t("security.bindPhoneTitle")}
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
        <Typography.Text type="secondary">{hasBoundPhone ? t("security.rebindPhoneHint") : t("security.bindPhoneHint")}</Typography.Text>
        <Form form={form} layout="vertical">
          <Form.Item
            name="current_password"
            label={t("security.currentPassword")}
            rules={[{ required: true, message: t("security.currentPasswordPlaceholder") }]}
          >
            <Input.Password autoComplete="current-password" placeholder={t("security.currentPasswordPlaceholder")} />
          </Form.Item>
          {hasBoundPhone ? (
            <>
              <Form.Item label={t("security.currentPhone")}>
                <Input value={currentPhoneDisplay} disabled />
              </Form.Item>
              <Form.Item label={t("security.currentPhoneCode")} required>
                <Space.Compact style={{ width: "100%" }}>
                  <Form.Item
                    name="current_phone_code"
                    noStyle
                    rules={[{ required: true, message: t("security.currentPhoneCodePlaceholder") }]}
                  >
                    <Input placeholder={t("security.currentPhoneCodePlaceholder")} />
                  </Form.Item>
                  <Button onClick={onSendCurrentPhoneCode} loading={sendingCurrentPhoneCode} disabled={currentPhoneRemainingSeconds > 0}>
                    {sendingCurrentPhoneCode
                      ? t("common.sendingCode")
                      : currentPhoneRemainingSeconds > 0
                        ? `${currentPhoneRemainingSeconds}s`
                        : t("security.sendCurrentPhoneCode")}
                  </Button>
                </Space.Compact>
              </Form.Item>
            </>
          ) : null}
          <Form.Item
            label={t("security.newPhone")}
            name="phone"
            rules={[
              { required: true, message: t("security.newPhonePlaceholder") },
              { pattern: /^\+?[0-9]{6,20}$/, message: t("security.newPhonePlaceholder") }
            ]}
          >
            <Input placeholder={t("security.newPhonePlaceholder")} />
          </Form.Item>
          <Form.Item label={hasBoundPhone ? t("security.newPhoneCode") : t("security.smsCode")} required>
            <Space.Compact style={{ width: "100%" }}>
              <Form.Item name="code" noStyle rules={[{ required: true, message: t("security.smsCodePlaceholder") }]}>
                <Input placeholder={t("security.smsCodePlaceholder")} />
              </Form.Item>
              <Button
                onClick={() => {
                  void form.validateFields(["phone"]).then((values) => onSendNewPhoneCode(values.phone));
                }}
                loading={sendingNewPhoneCode}
                disabled={remainingSeconds > 0}
              >
                {sendingNewPhoneCode
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
