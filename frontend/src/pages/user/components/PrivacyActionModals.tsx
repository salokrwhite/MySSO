import { Button, Form, Input, Modal, Space, Typography } from "antd";
import type { FormInstance } from "antd/es/form";

type DeleteAccountValues = {
  current_password: string;
  email_code: string;
  phone_code?: string;
};

type ExportUserDataValues = {
  current_password: string;
};

type PrivacyActionModalsProps = {
  t: (key: string) => string;
  userPhone?: string;
  confirmingExportUserData: boolean;
  exportingUserData: boolean;
  confirmingAccountDeletion: boolean;
  deletingAccount: boolean;
  sendingDeleteEmailCode: boolean;
  sendingDeletePhoneCode: boolean;
  deleteEmailRemainingSeconds: number;
  deletePhoneRemainingSeconds: number;
  exportUserDataForm: FormInstance<ExportUserDataValues>;
  deleteAccountForm: FormInstance<DeleteAccountValues>;
  onExportUserData: (values: ExportUserDataValues) => void;
  onDeleteAccount: (values: DeleteAccountValues) => void;
  onSendDeleteEmailCode: () => void;
  onSendDeletePhoneCode: () => void;
  onCloseExport: () => void;
  onCloseDelete: () => void;
};

export function PrivacyActionModals({
  t,
  userPhone,
  confirmingExportUserData,
  exportingUserData,
  confirmingAccountDeletion,
  deletingAccount,
  sendingDeleteEmailCode,
  sendingDeletePhoneCode,
  deleteEmailRemainingSeconds,
  deletePhoneRemainingSeconds,
  exportUserDataForm,
  deleteAccountForm,
  onExportUserData,
  onDeleteAccount,
  onSendDeleteEmailCode,
  onSendDeletePhoneCode,
  onCloseExport,
  onCloseDelete,
}: PrivacyActionModalsProps) {
  return (
    <>
      <Modal
        open={confirmingExportUserData}
        title={t("privacy.exportTitle")}
        okText={t("privacy.exportAction")}
        cancelText={t("common.cancel")}
        okButtonProps={{ loading: exportingUserData }}
        onOk={() => {
          void exportUserDataForm.submit();
        }}
        onCancel={onCloseExport}
      >
        <Typography.Paragraph type="secondary">
          {t("privacy.exportPasswordVerifyDesc")}
        </Typography.Paragraph>
        <Form
          form={exportUserDataForm}
          layout="vertical"
          onFinish={(values) => {
            onExportUserData(values);
          }}
        >
          <Form.Item
            name="current_password"
            label={t("security.currentPassword")}
            rules={[
              {
                required: true,
                message: t("security.currentPasswordPlaceholder"),
              },
            ]}
          >
            <Input.Password
              autoComplete="current-password"
              placeholder={t("security.currentPasswordPlaceholder")}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={confirmingAccountDeletion}
        title={t("privacy.passwordVerifyTitle")}
        okText={t("privacy.confirmDeleteNow")}
        cancelText={t("common.cancel")}
        okButtonProps={{ danger: true, loading: deletingAccount }}
        onOk={() => {
          void deleteAccountForm.submit();
        }}
        onCancel={onCloseDelete}
      >
        <Typography.Paragraph type="secondary">
          {t("privacy.passwordVerifyDesc")}
        </Typography.Paragraph>
        <Form
          form={deleteAccountForm}
          layout="vertical"
          onFinish={(values) => {
            onDeleteAccount(values);
          }}
        >
          <Form.Item
            name="current_password"
            label={t("security.currentPassword")}
            rules={[
              {
                required: true,
                message: t("security.currentPasswordPlaceholder"),
              },
            ]}
          >
            <Input.Password
              autoComplete="current-password"
              placeholder={t("security.currentPasswordPlaceholder")}
            />
          </Form.Item>
          <Form.Item label={t("privacy.emailVerifyCode")} required>
            <Space.Compact style={{ width: "100%" }}>
              <Form.Item
                noStyle
                name="email_code"
                rules={[
                  {
                    required: true,
                    message: t("privacy.emailVerifyCodePlaceholder"),
                  },
                ]}
              >
                <Input placeholder={t("privacy.emailVerifyCodePlaceholder")} />
              </Form.Item>
              <Button
                onClick={onSendDeleteEmailCode}
                loading={sendingDeleteEmailCode}
                disabled={deleteEmailRemainingSeconds > 0 || deletingAccount}
              >
                {deleteEmailRemainingSeconds > 0
                  ? `${deleteEmailRemainingSeconds}s`
                  : t("privacy.sendDeleteEmailCode")}
              </Button>
            </Space.Compact>
          </Form.Item>
          {userPhone ? (
            <Form.Item label={t("privacy.phoneVerifyCode")} required>
              <Space.Compact style={{ width: "100%" }}>
                <Form.Item
                  noStyle
                  name="phone_code"
                  rules={[
                    {
                      required: true,
                      message: t("privacy.phoneVerifyCodePlaceholder"),
                    },
                  ]}
                >
                  <Input placeholder={t("privacy.phoneVerifyCodePlaceholder")} />
                </Form.Item>
                <Button
                  onClick={onSendDeletePhoneCode}
                  loading={sendingDeletePhoneCode}
                  disabled={deletePhoneRemainingSeconds > 0 || deletingAccount}
                >
                  {deletePhoneRemainingSeconds > 0
                    ? `${deletePhoneRemainingSeconds}s`
                    : t("privacy.sendDeletePhoneCode")}
                </Button>
              </Space.Compact>
            </Form.Item>
          ) : null}
        </Form>
      </Modal>
    </>
  );
}
