import { Modal, Space, Typography } from "antd";
import { accountLocaleOptions, type AccountLocale } from "../i18n/accountLocale";

type AccountLanguageModalProps = {
  open: boolean;
  currentLocale: AccountLocale;
  title: string;
  description: string;
  onClose: () => void;
  onSelect: (locale: AccountLocale) => void;
};

export function AccountLanguageModal({
  open,
  currentLocale,
  title,
  description,
  onClose,
  onSelect
}: AccountLanguageModalProps) {
  return (
    <Modal
      title={title}
      open={open}
      footer={null}
      onCancel={onClose}
      width="min(1080px, calc(100vw - 24px))"
      centered
      className="account-language-modal"
    >
      <Space direction="vertical" size={20} className="account-language-modal__content">
        <Typography.Text type="secondary" className="account-language-modal__description">
          {description}
        </Typography.Text>
        <div className="account-language-modal__grid">
          {accountLocaleOptions.map((locale) => {
            const active = locale.value === currentLocale;
            return (
              <button
                key={locale.value}
                type="button"
                onClick={() => {
                  onSelect(locale.value);
                  onClose();
                }}
                className={`account-language-modal__option${active ? " account-language-modal__option--active" : ""}`}
                aria-pressed={active}
              >
                <div className="account-language-modal__option-content">
                  <span className="account-language-modal__option-label">{locale.label}</span>
                  <span className="account-language-modal__option-english">
                    {locale.englishLabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Space>
    </Modal>
  );
}
