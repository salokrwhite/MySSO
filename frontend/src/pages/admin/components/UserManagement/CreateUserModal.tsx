import { Form, Input, Modal, Select } from "antd";
import { useEffect } from "react";
import { getCountries } from "../../../../utils/countries";
import { useAdminI18n } from "../../i18n";
import type { CreateUserInput } from "../../types";

type CreateUserModalProps = {
  open: boolean;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateUserInput) => Promise<boolean>;
};

const initialValues: CreateUserInput = {
  email: "",
  display_name: "",
  password: "",
  role: "user",
  status: "active",
  country: "CN",
  freeze_reason: "",
};

export function CreateUserModal({
  open,
  loading,
  onCancel,
  onSubmit,
}: CreateUserModalProps) {
  const [form] = Form.useForm<CreateUserInput>();
  const { t, locale } = useAdminI18n();
  const countryOptions = getCountries(locale);
  const status = Form.useWatch("status", form);

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues);
    }
  }, [form, open]);

  return (
    <Modal
      title={t("新增用户")}
      open={open}
      okText={t("创建用户")}
      cancelText={t("取消")}
      confirmLoading={loading}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={() => {
        void form.validateFields().then(async (values) => {
          const success = await onSubmit({
            ...values,
            display_name: values.display_name.trim(),
            freeze_reason:
              values.status === "frozen"
                ? values.freeze_reason?.trim() || ""
                : "",
          });
          if (success) {
            form.resetFields();
            onCancel();
          }
        });
      }}
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          name="email"
          label={t("邮箱")}
          rules={[
            { required: true, message: t("请输入邮箱") },
            { type: "email", message: t("邮箱格式不正确") },
          ]}
        >
          <Input placeholder="user@example.com" />
        </Form.Item>
        <Form.Item name="display_name" label={t("显示名称")}>
          <Input placeholder={t("留空则自动根据邮箱生成")} />
        </Form.Item>
        <Form.Item
          name="password"
          label={t("初始密码")}
          rules={[
            { required: true, message: t("请输入初始密码") },
            { min: 8, message: t("密码至少 8 位") },
          ]}
        >
          <Input.Password placeholder={t("请输入初始密码")} />
        </Form.Item>
        <Form.Item
          name="role"
          label={t("角色")}
          rules={[{ required: true, message: t("请选择角色") }]}
        >
          <Select
            options={[
              { label: t("普通用户"), value: "user" },
              { label: t("开发者"), value: "developer" },
              { label: t("管理员"), value: "admin" },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="status"
          label={t("状态")}
          rules={[{ required: true, message: t("请选择状态") }]}
        >
          <Select
            options={[
              { label: t("正常"), value: "active" },
              { label: t("冻结"), value: "frozen" },
            ]}
          />
        </Form.Item>
        {status === "frozen" ? (
          <Form.Item name="freeze_reason" label={t("冻结理由")}>
            <Input.TextArea
              rows={4}
              maxLength={500}
              showCount
              placeholder={t("选填，登录时会展示给用户")}
            />
          </Form.Item>
        ) : null}
        <Form.Item
          name="country"
          label={t("国家/地区")}
          rules={[{ required: true, message: t("请选择国家/地区") }]}
        >
          <Select
            showSearch
            placeholder={t("请选择国家/地区")}
            optionFilterProp="label"
            options={countryOptions}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
