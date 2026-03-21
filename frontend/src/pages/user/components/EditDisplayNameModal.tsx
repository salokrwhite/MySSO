import { Input, Modal } from "antd";
import { useTranslation } from "react-i18next";

type EditDisplayNameModalProps = {
  open: boolean;
  value: string;
  saving: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function EditDisplayNameModal({
  open,
  value,
  saving,
  onChange,
  onSave,
  onCancel
}: EditDisplayNameModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      title={t("profile.editNicknameTitle")}
      open={open}
      okText={saving ? t("common.saving") : t("common.save")}
      cancelText={t("common.cancel")}
      confirmLoading={saving}
      onOk={onSave}
      onCancel={onCancel}
    >
      <Input
        value={value}
        maxLength={50}
        placeholder={t("profile.nicknamePlaceholder")}
        onChange={(event) => onChange(event.target.value)}
        onPressEnter={onSave}
      />
    </Modal>
  );
}
