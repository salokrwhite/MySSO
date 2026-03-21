import {
  CheckOutlined,
  CopyOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { Alert, Button, Checkbox, Modal, Space, Typography, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useDeveloperTranslation } from "../../i18n";

type DeveloperSecretRevealModalProps = {
  open: boolean;
  title: string;
  clientId: string;
  clientSecret: string;
  onClose: () => void;
};

export function DeveloperSecretRevealModal({
  open,
  title,
  clientId,
  clientSecret,
  onClose,
}: DeveloperSecretRevealModalProps) {
  const { t } = useDeveloperTranslation();
  const [messageApi, contextHolder] = message.useMessage();
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (open) {
      setAcknowledged(false);
    }
  }, [open]);

  const csvContent = useMemo(() => {
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    return [
      "Client ID,Client Secret",
      `${escape(clientId)},${escape(clientSecret)}`,
    ].join("\n");
  }, [clientId, clientSecret]);

  async function handleCopy() {
    await navigator.clipboard.writeText(clientSecret);
    messageApi.success(t("common.codeCopied"));
  }

  function handleDownloadCsv() {
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `client-secret-${clientId}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {contextHolder}
      <Modal
        open={open}
        title={title}
        centered
        width={920}
        destroyOnHidden
        keyboard={false}
        closable={false}
        maskClosable={false}
        footer={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <Checkbox
              checked={acknowledged}
              onChange={(event) => setAcknowledged(event.target.checked)}
            >
              {t("console.secretAcknowledged")}
            </Checkbox>
            <Button type="primary" disabled={!acknowledged} onClick={onClose}>
              {t("common.confirm")}
            </Button>
          </div>
        }
        onCancel={onClose}
      >
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <div
            style={{
              border: "1px solid rgba(15, 23, 42, 0.08)",
              borderRadius: 18,
              padding: 24,
              background: "#ffffff",
            }}
          >
            <Space direction="vertical" size={18} style={{ width: "100%" }}>
              <Typography.Title level={2} style={{ margin: 0, fontSize: 20 }}>
                {t("console.secretSaveTitle")}
              </Typography.Title>
              <Alert
                showIcon
                type="warning"
                message={t("console.secretNotice")}
                style={{
                  borderRadius: 14,
                }}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "220px 1fr",
                  gap: 18,
                  padding: 24,
                  borderRadius: 16,
                  background: "#f1f5f9",
                }}
              >
                <Typography.Text strong style={{ fontSize: 18 }}>
                  {t("console.clientIdLabel")}
                </Typography.Text>
                <Typography.Text copyable={{ text: clientId }} style={{ fontSize: 18 }}>
                  {clientId}
                </Typography.Text>
                <Typography.Text strong style={{ fontSize: 18 }}>
                  {t("console.newClientSecret")}
                </Typography.Text>
                <Typography.Text style={{ fontSize: 18, wordBreak: "break-all" }}>
                  {clientSecret}
                </Typography.Text>
              </div>
              <Space size={28} wrap>
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  style={{ paddingInline: 0 }}
                  onClick={handleDownloadCsv}
                >
                  {t("console.downloadSecretCsv")}
                </Button>
                <Button
                  type="link"
                  icon={<CopyOutlined />}
                  style={{ paddingInline: 0 }}
                  onClick={() => void handleCopy()}
                >
                  {t("console.copyClientSecret")}
                </Button>
              </Space>
            </Space>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "#16a34a",
            }}
          >
            <CheckOutlined />
            <Typography.Text type="secondary">
              {t("console.secretFooterHint")}
            </Typography.Text>
          </div>
        </Space>
      </Modal>
    </>
  );
}
