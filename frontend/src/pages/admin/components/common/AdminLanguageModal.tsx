import { Modal, Space, Typography } from "antd";
import type { AccountLocale } from "../../../../i18n/accountLocale";
import { useAdminI18n } from "../../i18n";

type AdminLanguageModalProps = {
  open: boolean;
  currentLocale: AccountLocale;
  onClose: () => void;
  onSelect: (locale: AccountLocale) => void;
};

const adminLocaleOptions: Array<{
  value: AccountLocale;
  label: "简体中文" | "English";
}> = [
  { value: "zh-CN", label: "简体中文" },
  { value: "en-US", label: "English" },
];

export function AdminLanguageModal({
  open,
  currentLocale,
  onClose,
  onSelect,
}: AdminLanguageModalProps) {
  const { t } = useAdminI18n();

  return (
    <Modal
      title={t("语言切换")}
      open={open}
      footer={null}
      onCancel={onClose}
      width={520}
      centered
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        <Typography.Text type="secondary">
          {t("请选择管理员后台显示语言")}
        </Typography.Text>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          {adminLocaleOptions.map((locale) => {
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
                {locale.label}
              </button>
            );
          })}
        </div>
      </Space>
    </Modal>
  );
}
