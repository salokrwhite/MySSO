import { Form, Input, Modal, Switch } from "antd";
import { useEffect } from "react";
import { useAdminI18n } from "../../i18n";
import type { User } from "../../types";

type UserAnnouncementModalProps = {
  open: boolean;
  user?: User;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (enabled: boolean, content: string) => Promise<void>;
};

type FormValues = {
  enabled: boolean;
  content: string;
};

export function UserAnnouncementModal({ open, user, loading, onCancel, onSubmit }: UserAnnouncementModalProps) {
  const [form] = Form.useForm<FormValues>();
  const { t } = useAdminI18n();
  const enabled = Form.useWatch("enabled", form);

  useEffect(() => {
    if (!open) {
      return;
    }
    form.setFieldsValue({
      enabled: user?.personal_announcement_enabled === true,
      content: user?.personal_announcement_content || ""
    });
  }, [form, open, user]);

  return (
    <Modal
      open={open}
      title={user ? t("给 {{email}} 设置公告", { email: user.email }) : t("设置公告")}
      okText={t("保存")}
      cancelText={t("取消")}
      confirmLoading={loading}
      forceRender
      onCancel={onCancel}
      onOk={() => {
        void form.validateFields().then((values) => onSubmit(values.enabled, values.content));
      }}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item label={t("启用个人公告")} name="enabled" valuePropName="checked">
          <Switch checkedChildren={t("已开启")} unCheckedChildren={t("已关闭")} />
        </Form.Item>
        <Form.Item
          label={t("公告内容")}
          name="content"
          rules={[
            {
              validator(_, value) {
                if (!enabled || String(value || "").trim()) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t("开启个人公告后，请填写公告内容")));
              }
            }
          ]}
          extra={t("用户中心中会显示在全局公告上方。关闭后可清空或保留内容。")}
        >
          <Input.TextArea rows={5} placeholder={t("请输入要发给该用户的具体公告")} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
