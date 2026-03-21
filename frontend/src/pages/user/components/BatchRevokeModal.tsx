import { Modal, Space, Typography } from "antd";
import { useTranslation } from "react-i18next";

type BatchRevokeModalProps = {
  open: boolean;
  count: number;
  confirming: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function BatchRevokeModal({ open, count, confirming, onConfirm, onCancel }: BatchRevokeModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      title={t("bindings.batchRevokeConfirmTitle")}
      open={open}
      okText={confirming ? t("common.saving") : t("common.confirm")}
      cancelText={t("common.cancel")}
      confirmLoading={confirming}
      okButtonProps={{ danger: true }}
      onOk={onConfirm}
      onCancel={onCancel}
    >
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Typography.Text type="secondary">{t("bindings.batchRevokeConfirmDesc", { count })}</Typography.Text>
      </Space>
    </Modal>
  );
}
