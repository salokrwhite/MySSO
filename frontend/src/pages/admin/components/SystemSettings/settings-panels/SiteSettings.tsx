import { Button, Form, Input } from "antd";
import type { FormInstance } from "antd";
import { useAdminI18n } from "../../../i18n";
import type { SystemSettings } from "../../../types";
import { ImageUploadPreview } from "../../common/ImageUploadPreview";
import { SettingsCard } from "../../common/SettingsCard";

type SiteSettingsProps = {
  form: FormInstance<SystemSettings>;
  initialValues: SystemSettings;
  siteLogoFieldValue?: string;
  backendOrigin: string;
  saving: boolean;
  onSave: () => void;
  onUpload: (file: File) => void;
  onClearLogo: () => void;
};

export function SiteSettings({
  form,
  initialValues,
  siteLogoFieldValue,
  backendOrigin,
  saving,
  onSave,
  onUpload,
  onClearLogo
}: SiteSettingsProps) {
  const { t } = useAdminI18n();

  return (
    <SettingsCard title={t("站点信息")}>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          label={t("站点名称（中文）")}
          name="site_name"
          rules={[{ required: true, message: t("请输入站点名称") }]}
          extra={t("中文语言模式下显示这个名称。")}
        >
          <Input placeholder={t("例如：统一认证中心")} />
        </Form.Item>
        <Form.Item
          label={t("站点名称（英文）")}
          name="site_name_en"
          rules={[{ required: true, message: t("请输入英文站点名称") }]}
          extra={t("除中文外的所有语言模式都显示这个名称。")}
        >
          <Input placeholder={t("例如：MySSO")} />
        </Form.Item>
        <Form.Item
          label={t("浏览器页签标题（中文）")}
          name="site_browser_title"
          extra={t("中文语言模式下显示这个页签标题。留空时回退到默认标题 MySSO Console。")}
        >
          <Input placeholder={t("例如：统一认证中心")} />
        </Form.Item>
        <Form.Item
          label={t("浏览器页签标题（英文）")}
          name="site_browser_title_en"
          extra={t("除中文外的所有语言模式都显示这个页签标题。留空时回退到默认标题 MySSO Console。")}
        >
          <Input placeholder={t("例如：MySSO Console")} />
        </Form.Item>
        <Form.Item
          label={t("网站备案号")}
          name="site_icp_record_number"
          extra={t("保存后会显示在账号中心底部，点击后跳转到工信部备案查询页面。")}
        >
          <Input placeholder={t("例如：京ICP备12345678号")} />
        </Form.Item>
        <Form.Item
          label={t("认证页底部文字")}
          name="site_footer_text"
          extra={t("支持换行输入。保存后会显示在登录、注册、找回密码和授权确认相关页面底部。")}
        >
          <Input.TextArea rows={4} placeholder={t("例如：\n版权所有 © 统一认证中心\n服务时间：工作日 09:00 - 18:00")} />
        </Form.Item>
        <Form.Item
          label={t("网安备案号")}
          name="site_public_security_record_number"
          extra={t("例如：浙公网安备33021202002887号。点击后会根据数字部分跳转到公安备案查询页面。")}
        >
          <Input placeholder={t("例如：浙公网安备33021202002887号")} />
        </Form.Item>
        <Form.Item label={t("站点图标")} extra={t("上传后会自动转换为 WebP，并统一用于系统品牌图标。")}>
          <ImageUploadPreview
            value={siteLogoFieldValue}
            backendOrigin={backendOrigin}
            onUpload={onUpload}
            onClear={onClearLogo}
          />
        </Form.Item>
        <Form.Item
          label={t("统一认证 Client ID")}
          name="oidc_first_party_client_id"
          rules={[{ required: true, message: t("请输入统一认证 Client ID") }]}
          extra={t("用于站点自身登录页接入统一认证流程。保存后会同步内置第一方客户端。")}
        >
          <Input placeholder={t("例如：demo-client")} />
        </Form.Item>
        <Form.Item
          label={t("统一认证 Client Secret")}
          name="oidc_first_party_client_secret"
          extra={
            initialValues.oidc_first_party_client_secret_configured
              ? t("仅供站点自身第一方客户端使用。已配置时留空保持不变，填写新值会立即更新。")
              : t("仅供站点自身第一方客户端使用。首次配置时必填。")
          }
        >
          <Input.Password
            placeholder={initialValues.oidc_first_party_client_secret_configured ? t("留空保持当前密钥，填写则更新") : t("例如：demo-secret")}
          />
        </Form.Item>
        <Form.Item
          label={t("统一认证 Scope")}
          name="oidc_first_party_scope"
          rules={[{ required: true, message: t("请输入统一认证 Scope") }]}
          extra={t("多个 scope 以空格分隔，例如 openid profile email gateway.read。")}
        >
          <Input placeholder="openid profile email gateway.read" />
        </Form.Item>
        <Form.Item
          label={t("前端门户地址")}
          name="frontend_base_url"
          rules={[{ required: true, message: t("请输入前端门户地址") }]}
          extra={t("用于生成站点自身统一认证客户端的回调地址，例如 http://localhost:5173。保存后会同步回调为该地址下的 /callback。")}
        >
          <Input placeholder={t("例如：http://localhost:5173")} />
        </Form.Item>
        <Form.Item
          label={t("免确认 Client ID 白名单")}
          name="oidc_auto_approve_client_ids"
          extra={t("命中的客户端登录后会直接授权，不弹确认窗。支持逗号或换行分隔；第一方 Client ID 会自动免确认。")}
        >
          <Input.TextArea rows={4} placeholder={t("例如：\nportal-web\nadmin-web")} />
        </Form.Item>
        <Form.Item
          label={t("免确认回调域名白名单")}
          name="oidc_auto_approve_redirect_hosts"
          extra={t("命中的 redirect_uri 主机名会直接授权。支持逗号或换行分隔，例如 localhost、sso.example.com。")}
        >
          <Input.TextArea rows={4} placeholder={t("例如：\nlocalhost\napp.example.com")} />
        </Form.Item>
        <Button type="primary" onClick={onSave} loading={saving}>
          {t("保存站点信息")}
        </Button>
      </Form>
    </SettingsCard>
  );
}
