import { Button, Form, Input, Space, Upload } from "antd";
import { useAdminI18n } from "../../i18n";

type ImageUploadPreviewProps = {
  value?: string;
  backendOrigin: string;
  onUpload: (file: File) => void;
  onClear: () => void;
};

export function ImageUploadPreview({ value, backendOrigin, onUpload, onClear }: ImageUploadPreviewProps) {
  const { t } = useAdminI18n();

  return (
    <Space size={12} wrap style={{ width: "100%" }}>
      <Upload
        accept="image/*"
        showUploadList={false}
        beforeUpload={(file) => {
          onUpload(file as File);
          return false;
        }}
      >
        <Button>{t("上传图标")}</Button>
      </Upload>
      <Form.Item name="site_logo_data_url" noStyle>
        <Input type="hidden" />
      </Form.Item>
      {value ? (
        <div className="site-logo-preview">
          <img
            src={String(value).startsWith("http") ? String(value) : `${backendOrigin}${String(value)}`}
            alt={t("站点图标预览")}
            className="site-logo-preview-image"
          />
          <Button type="link" danger onClick={onClear}>
            {t("清除图标")}
          </Button>
        </div>
      ) : null}
    </Space>
  );
}
