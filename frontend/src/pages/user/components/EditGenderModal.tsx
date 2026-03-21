import { Modal, Select } from "antd";
import { useTranslation } from "react-i18next";

type EditGenderModalProps = {
  open: boolean;
  value: string;
  saving: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function EditGenderModal({ open, value, saving, onChange, onSave, onCancel }: EditGenderModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      title={t("profile.editGenderTitle")}
      open={open}
      okText={saving ? t("common.saving") : t("common.save")}
      cancelText={t("common.cancel")}
      confirmLoading={saving}
      onOk={onSave}
      onCancel={onCancel}
    >
      <Select
        value={value}
        style={{ width: "100%" }}
        options={[
          { value: "", label: t("common.unset") },
          { value: "male", label: t("profile.genderMale") },
          { value: "female", label: t("profile.genderFemale") },
          { value: "other", label: t("profile.genderOther") }
        ]}
        onChange={onChange}
      />
    </Modal>
  );
}
