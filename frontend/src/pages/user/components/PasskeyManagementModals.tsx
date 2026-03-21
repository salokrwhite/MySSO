import { Button, Form, Input, Modal, Space, Typography } from "antd";
import type { FormInstance } from "antd/es/form";
import type { PasskeyItem } from "../types";

type PasskeyFormValues = {
  name: string;
  current_password: string;
  current_mfa_code?: string;
};

type DeletePasskeyFormValues = {
  current_password: string;
  current_mfa_code?: string;
};

type PasskeyManagementModalsProps = {
  t: (key: string) => string;
  userMfaEnabled?: boolean;
  userMfaMethod?: string;
  creatingPasskey: boolean;
  savingPasskey: boolean;
  deletingPasskey: boolean;
  deletingPasskeyItem: PasskeyItem | null;
  sendingCurrentMFACode: boolean;
  currentMFACodeRemainingSeconds: number;
  createPasskeyForm: FormInstance<PasskeyFormValues>;
  deletePasskeyForm: FormInstance<DeletePasskeyFormValues>;
  onAddPasskey: (values: PasskeyFormValues) => void;
  onRemovePasskey: (values: DeletePasskeyFormValues) => void;
  onSendCurrentMFACode: (currentPassword: string) => void;
  onCloseCreate: () => void;
  onCloseDelete: () => void;
};

export function PasskeyManagementModals({
  t,
  userMfaEnabled,
  userMfaMethod,
  creatingPasskey,
  savingPasskey,
  deletingPasskey,
  deletingPasskeyItem,
  sendingCurrentMFACode,
  currentMFACodeRemainingSeconds,
  createPasskeyForm,
  deletePasskeyForm,
  onAddPasskey,
  onRemovePasskey,
  onSendCurrentMFACode,
  onCloseCreate,
  onCloseDelete,
}: PasskeyManagementModalsProps) {
  return (
    <>
      <Modal
        title={t("security.addPasskey")}
        open={creatingPasskey}
        forceRender
        okText={savingPasskey ? t("common.saving") : t("common.save")}
        cancelText={t("common.cancel")}
        confirmLoading={savingPasskey}
        onOk={() => {
          void createPasskeyForm.validateFields().then((values) => {
            onAddPasskey(values);
          });
        }}
        onCancel={onCloseCreate}
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Typography.Text type="secondary">
            {t("security.passkeyManageVerify")}
          </Typography.Text>
          <Form form={createPasskeyForm} layout="vertical">
            <Form.Item
              name="name"
              label={t("security.passkeyName")}
              rules={[
                {
                  required: true,
                  message: t("security.passkeyNamePlaceholder"),
                },
              ]}
            >
              <Input placeholder={t("security.passkeyNamePlaceholder")} />
            </Form.Item>
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
            {userMfaEnabled ? (
              <Form.Item
                name="current_mfa_code"
                label={t("security.currentMfaCode")}
                rules={[
                  {
                    required: true,
                    message: t("security.currentMfaCodePlaceholder"),
                  },
                ]}
              >
                <Space.Compact style={{ width: "100%" }}>
                  <Input placeholder={t("security.currentMfaCodePlaceholder")} />
                  <Button
                    loading={sendingCurrentMFACode}
                    disabled={currentMFACodeRemainingSeconds > 0}
                    onClick={() => {
                      void createPasskeyForm
                        .validateFields(["current_password"])
                        .then((values) => {
                          onSendCurrentMFACode(values.current_password);
                        })
                        .catch(() => undefined);
                    }}
                  >
                    {currentMFACodeRemainingSeconds > 0
                      ? `${currentMFACodeRemainingSeconds}s`
                      : t(
                          userMfaMethod === "sms"
                            ? "auth.sendPhoneOtpCode"
                            : "auth.sendOtpCode",
                        )}
                  </Button>
                </Space.Compact>
              </Form.Item>
            ) : null}
          </Form>
        </Space>
      </Modal>

      <Modal
        title={t("security.deletePasskey")}
        open={Boolean(deletingPasskeyItem)}
        forceRender
        okText={deletingPasskey ? t("common.saving") : t("common.confirm")}
        cancelText={t("common.cancel")}
        confirmLoading={deletingPasskey}
        onOk={() => {
          void deletePasskeyForm.validateFields().then((values) => {
            onRemovePasskey(values);
          });
        }}
        onCancel={onCloseDelete}
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Typography.Text type="secondary">
            {deletingPasskeyItem
              ? `${t("security.deletePasskey")}：${deletingPasskeyItem.name}`
              : t("security.passkeyManageVerify")}
          </Typography.Text>
          <Form form={deletePasskeyForm} layout="vertical">
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
            {userMfaEnabled ? (
              <Form.Item
                name="current_mfa_code"
                label={t("security.currentMfaCode")}
                rules={[
                  {
                    required: true,
                    message: t("security.currentMfaCodePlaceholder"),
                  },
                ]}
              >
                <Space.Compact style={{ width: "100%" }}>
                  <Input placeholder={t("security.currentMfaCodePlaceholder")} />
                  <Button
                    loading={sendingCurrentMFACode}
                    disabled={currentMFACodeRemainingSeconds > 0}
                    onClick={() => {
                      void deletePasskeyForm
                        .validateFields(["current_password"])
                        .then((values) => {
                          onSendCurrentMFACode(values.current_password);
                        })
                        .catch(() => undefined);
                    }}
                  >
                    {currentMFACodeRemainingSeconds > 0
                      ? `${currentMFACodeRemainingSeconds}s`
                      : t(
                          userMfaMethod === "sms"
                            ? "auth.sendPhoneOtpCode"
                            : "auth.sendOtpCode",
                        )}
                  </Button>
                </Space.Compact>
              </Form.Item>
            ) : null}
          </Form>
        </Space>
      </Modal>
    </>
  );
}

