import { Form, Input, Modal, Select } from "antd";
import { useEffect } from "react";
import { getCountries } from "../../../../utils/countries";
import { useAdminI18n } from "../../i18n";
import type { UpdateUserInput, User } from "../../types";

type EditUserModalProps = {
  open: boolean;
  user?: User;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (userId: string, values: UpdateUserInput) => Promise<void>;
};

function toInitialValues(user?: User): UpdateUserInput {
  return {
    email: user?.email || "",
    display_name: user?.display_name || "",
    freeze_reason: user?.freeze_reason || "",
    phone: user?.phone || "",
    password: "",
    role: user?.role || "user",
    status: user?.status || "active",
    country: user?.country || "CN",
    gender: user?.gender || undefined,
  };
}

export function EditUserModal({
  open,
  user,
  loading,
  onCancel,
  onSubmit,
}: EditUserModalProps) {
  const [form] = Form.useForm<UpdateUserInput>();
  const { t, locale } = useAdminI18n();
  const countryOptions = getCountries(locale);
  const status = Form.useWatch("status", form);

  useEffect(() => {
    if (open) {
      form.setFieldsValue(toInitialValues(user));
    } else {
      form.resetFields();
    }
  }, [form, open, user]);

  return (
    <Modal
      title={t("编辑用户")}
      open={open}
      okText={t("保存")}
      cancelText={t("取消")}
      confirmLoading={loading}
      forceRender
      destroyOnHidden
      onCancel={onCancel}
      onOk={() => {
        if (!user) {
          return;
        }
        void form.validateFields().then(async (values) => {
          await onSubmit(user.id, {
            ...values,
            display_name: values.display_name.trim(),
            freeze_reason:
              values.status === "frozen"
                ? values.freeze_reason?.trim() || ""
                : "",
            phone: values.phone.trim(),
            password: values.password?.trim() || undefined,
            country: values.country,
            gender: values.gender || undefined,
          });
          onCancel();
        });
      }}
    >
      <Form form={form} layout="vertical">
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
        <Form.Item name="phone" label={t("手机号")}>
          <Input placeholder={t("选填")} />
        </Form.Item>
        <Form.Item
          name="password"
          label={t("新密码")}
          rules={[{ min: 8, message: t("密码至少 8 位") }]}
          extra={t("留空则不修改密码")}
        >
          <Input.Password placeholder={t("留空则不修改")} />
        </Form.Item>
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
        <Form.Item name="gender" label={t("性别")}>
          <Select
            allowClear
            placeholder={t("请选择")}
            options={[
              { label: t("男"), value: "male" },
              { label: t("女"), value: "female" },
              { label: t("其他"), value: "other" },
            ]}
          />
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
              { label: t("待激活"), value: "pending" },
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
      </Form>
    </Modal>
  );
}
