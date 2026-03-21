import { Button, Card, Form, Input, Space, Typography } from "antd";
import type { FormInstance } from "antd";
import { useAdminI18n } from "../../../i18n";
import type { SystemSettings } from "../../../types";
import { SettingsCard } from "../../common/SettingsCard";

type InternationalizationSettingsProps = {
  form: FormInstance<SystemSettings>;
  initialValues: SystemSettings;
  saving: boolean;
  onSave: () => void;
};

const templateSections: Array<{
  key: string;
  title: string;
  subjectField: keyof SystemSettings;
  bodyField: keyof SystemSettings;
  subjectFieldEn: keyof SystemSettings;
  bodyFieldEn: keyof SystemSettings;
}> = [
  {
    key: "login",
    title: "登录验证码邮件",
    subjectField: "login_code_subject_template",
    bodyField: "login_code_body_template",
    subjectFieldEn: "login_code_subject_template_en",
    bodyFieldEn: "login_code_body_template_en"
  },
  {
    key: "register",
    title: "注册验证码邮件",
    subjectField: "register_code_subject_template",
    bodyField: "register_code_body_template",
    subjectFieldEn: "register_code_subject_template_en",
    bodyFieldEn: "register_code_body_template_en"
  },
  {
    key: "reset-password",
    title: "找回密码验证码邮件",
    subjectField: "reset_password_code_subject_template",
    bodyField: "reset_password_code_body_template",
    subjectFieldEn: "reset_password_code_subject_template_en",
    bodyFieldEn: "reset_password_code_body_template_en"
  },
  {
    key: "delete-account",
    title: "注销账号验证码邮件",
    subjectField: "delete_account_code_subject_template",
    bodyField: "delete_account_code_body_template",
    subjectFieldEn: "delete_account_code_subject_template_en",
    bodyFieldEn: "delete_account_code_body_template_en"
  },
  {
    key: "change-email",
    title: "邮箱变更验证码邮件",
    subjectField: "change_email_code_subject_template",
    bodyField: "change_email_code_body_template",
    subjectFieldEn: "change_email_code_subject_template_en",
    bodyFieldEn: "change_email_code_body_template_en"
  }
];

export function InternationalizationSettings({
  form,
  initialValues,
  saving,
  onSave
}: InternationalizationSettingsProps) {
  const { t } = useAdminI18n();

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Card size="small">
        <Typography.Paragraph style={{ marginBottom: 8 }}>
          {t("登录页邮箱验证码会根据该邮箱已注册账号的国家/地区自动选择邮件语言；注册页邮箱验证码会根据用户在注册表单中选择的国家/地区自动选择邮件语言。")}
        </Typography.Paragraph>
        <Typography.Paragraph style={{ marginBottom: 8 }}>
          {t("中国大陆、中国香港、中国澳门、中国台湾使用中文模板；其他国家/地区使用英文模板。")}
        </Typography.Paragraph>
        <Typography.Text type="secondary">
          {t("{{code}} 为验证码，{{minutes}} 为有效分钟数，{{email}} 为目标邮箱，{{country}} 为注册国家。找回密码模板通常使用 {{code}}、{{minutes}}、{{email}}。")}
        </Typography.Text>
      </Card>

      <SettingsCard title={t("邮箱验证码国际化模板")}>
        <Form form={form} layout="vertical" initialValues={initialValues}>
          <Space direction="vertical" size={20} style={{ width: "100%" }}>
            {templateSections.map((section) => (
              <Card key={section.key} size="small" title={t(section.title)}>
                <Form.Item
                  label={t("中文主题模板")}
                  name={section.subjectField}
                  rules={[{ required: true, message: t("请输入中文主题模板") }]}
                >
                  <Input placeholder={t("请输入中文主题模板")} />
                </Form.Item>
                <Form.Item
                  label={t("中文正文模板")}
                  name={section.bodyField}
                  rules={[{ required: true, message: t("请输入中文正文模板") }]}
                >
                  <Input.TextArea rows={5} placeholder={t("请输入中文正文模板")} />
                </Form.Item>
                <Form.Item
                  label={t("英文主题模板")}
                  name={section.subjectFieldEn}
                  rules={[{ required: true, message: t("请输入英文主题模板") }]}
                >
                  <Input placeholder={t("请输入英文主题模板")} />
                </Form.Item>
                <Form.Item
                  label={t("英文正文模板")}
                  name={section.bodyFieldEn}
                  rules={[{ required: true, message: t("请输入英文正文模板") }]}
                >
                  <Input.TextArea rows={5} placeholder={t("请输入英文正文模板")} />
                </Form.Item>
              </Card>
            ))}

            <Space>
              <Button type="primary" onClick={onSave} loading={saving}>
                {t("保存国际化模板")}
              </Button>
            </Space>
          </Space>
        </Form>
      </SettingsCard>
    </Space>
  );
}
