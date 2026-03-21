import { Modal, Space, Typography } from "antd";
import type { AccountLocale } from "../../../../i18n/accountLocale";
import { useDeveloperTranslation } from "../../i18n";

type DeveloperLanguageModalProps = {
  open: boolean;
  currentLocale: AccountLocale;
  onClose: () => void;
  onSelect: (locale: AccountLocale) => void;
};

const developerLocaleOptions: Array<{
  value: AccountLocale;
  labelKey: "zhCN" | "enUS";
}> = [
  { value: "zh-CN", labelKey: "zhCN" },
  { value: "en-US", labelKey: "enUS" },
];

export function DeveloperLanguageModal({
  open,
  currentLocale,
  onClose,
  onSelect,
}: DeveloperLanguageModalProps) {
  const { t } = useDeveloperTranslation();

  return (
    <Modal
      title={t("appLayout.languageModalTitle")}
      open={open}
      footer={null}
      onCancel={onClose}
      width={520}
      centered
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        <Typography.Text type="secondary">
          {t("appLayout.languageModalDesc")}
        </Typography.Text>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          {developerLocaleOptions.map((locale) => {
            const active = locale.value === currentLocale;

            return (
              <button
                key={locale.value}
                type="button"
                onClick={() => {
                  onSelect(locale.value);
                  onClose();
                }}
                style={{
                  border: active
                    ? "1px solid #1677ff"
                    : "1px solid rgba(18, 38, 58, 0.08)",
                  background: active ? "rgba(22, 119, 255, 0.08)" : "#fff",
                  color: active ? "#1677ff" : "#12263a",
                  borderRadius: 14,
                  padding: "16px 18px",
                  fontSize: 16,
                  fontWeight: active ? 700 : 500,
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                {t(`appLayout.languages.${locale.labelKey}`)}
              </button>
            );
          })}
        </div>
      </Space>
    </Modal>
  );
}
