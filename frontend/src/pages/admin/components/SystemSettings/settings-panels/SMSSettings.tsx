import { Alert, Button, Card, Col, Form, Input, Row, Select, Space, Typography } from "antd";
import type { FormInstance } from "antd";
import { useAdminI18n } from "../../../i18n";
import type { SystemSettings } from "../../../types";
import { SettingsCard } from "../../common/SettingsCard";

type SMSSettingsProps = {
  form: FormInstance<SystemSettings>;
  initialValues: SystemSettings;
  saving: boolean;
  testingSMS: boolean;
  testSMSProvider: string;
  setTestSMSProvider: (value: string) => void;
  testSMSPhone: string;
  setTestSMSPhone: (value: string) => void;
  testSMSContent: string;
  setTestSMSContent: (value: string) => void;
  smsProvider?: string;
  smsTemplateProvider?: string;
  onSave: () => void;
  onSendTest: () => void;
};

export function SMSSettings({
  form,
  initialValues,
  saving,
  testingSMS,
  testSMSProvider,
  setTestSMSProvider,
  testSMSPhone,
  setTestSMSPhone,
  testSMSContent,
  setTestSMSContent,
  smsProvider,
  smsTemplateProvider,
  onSave,
  onSendTest
}: SMSSettingsProps) {
  const { t } = useAdminI18n();

  return (
    <SettingsCard title={t("发信配置")}>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          label={t("默认发信接口")}
          name="sms_provider"
          rules={[{ required: true, message: t("请选择默认发信接口") }]}
          extra={t("保存后写入数据库。短信宝与阿里云都复用本地验证码生成和校验逻辑。")}
        >
          <Select
            options={[
              { value: "disabled", label: t("未启用") },
              { value: "smsbao", label: t("短信宝") },
              { value: "aliyun", label: t("阿里云号码认证短信") }
            ]}
          />
        </Form.Item>

        {smsProvider === "disabled" ? (
          <Alert
            type="info"
            showIcon
            message={t("当前未启用短信发信接口")}
            description={t("可以先保存模板和各服务商参数，后面切换接口时无需重新录入。")}
            style={{ marginBottom: 16 }}
          />
        ) : null}

        {smsProvider === "smsbao" ? (
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("短信宝接口地址")}
                name="sms_api_base"
                rules={[{ required: true, message: t("请输入短信宝接口地址") }]}
                extra={t("默认地址为 http://api.smsbao.com/")}
              >
                <Input placeholder="http://api.smsbao.com/" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={t("短信宝账号")} name="sms_username" rules={[{ required: true, message: t("请输入短信宝账号") }]}>
                <Input placeholder={t("请输入短信宝账号")} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("短信宝密码")}
                name="sms_password"
                extra={
                  initialValues.sms_password_configured
                    ? t("已配置时留空保持不变，填写新值会立即更新。服务端发送时会按短信宝规则做 MD5。")
                    : t("首次配置后不会再回显明文。保存原始密码即可，服务端发送时会按短信宝规则做 MD5。")
                }
              >
                <Input.Password
                  placeholder={initialValues.sms_password_configured ? t("留空保持当前密码，填写则更新") : t("请输入短信宝密码")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={t("短信签名")} name="sms_signature" extra={t("若填写，短信宝发送时会自动追加为【签名】。")}>
                <Input placeholder={t("例如：MySSO")} />
              </Form.Item>
            </Col>
          </Row>
        ) : null}

        {smsProvider === "aliyun" ? (
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="AccessKey ID"
                name="aliyun_sms_access_key_id"
                rules={[{ required: true, message: t("请输入 AccessKey ID") }]}
              >
                <Input placeholder={t("请输入阿里云 AccessKey ID")} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="AccessKey Secret"
                name="aliyun_sms_access_key_secret"
                extra={
                  initialValues.aliyun_sms_access_key_secret_configured
                    ? t("已配置时留空保持不变，填写新值会立即更新。")
                    : t("首次配置后不会再回显明文，填写新值会立即更新。")
                }
              >
                <Input.Password
                  placeholder={
                    initialValues.aliyun_sms_access_key_secret_configured
                      ? t("留空保持当前密钥，填写则更新")
                      : t("请输入阿里云 AccessKey Secret")
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Endpoint"
                name="aliyun_sms_endpoint"
                rules={[{ required: true, message: t("请输入 Endpoint") }]}
                extra={t("号码认证短信默认使用 dypnsapi.aliyuncs.com。")}
              >
                <Input placeholder="dypnsapi.aliyuncs.com" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Region ID"
                name="aliyun_sms_region_id"
                rules={[{ required: true, message: t("请输入 Region ID") }]}
              >
                <Input placeholder="cn-hangzhou" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label={t("短信签名")} name="aliyun_sms_sign_name">
                <Input placeholder={t("请输入号码认证短信签名")} />
              </Form.Item>
            </Col>
          </Row>
        ) : null}

        <Card size="small" className="settings-hint-card" style={{ marginTop: 8 }}>
          <Typography.Text strong>{t("模板配置")}</Typography.Text>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
            {t("原“测试短信”区域已调整为模板配置。可通过下拉选择要维护的模板接口，并分别保存对应参数。")}
          </Typography.Paragraph>

          <Form.Item
            label={t("模板接口")}
            name="sms_template_provider"
            rules={[{ required: true, message: t("请选择模板接口") }]}
          >
            <Select
              options={[
                { value: "disabled", label: t("未启用") },
                { value: "smsbao", label: t("短信宝模板内容") },
                { value: "aliyun", label: t("阿里云模板编码") }
              ]}
            />
          </Form.Item>

          {smsTemplateProvider === "disabled" ? (
            <Alert
              type="info"
              showIcon
              message={t("当前未启用模板接口")}
              description={t("可以先完成发信接口配置，模板部分后续再补充。")}
              style={{ marginBottom: 16 }}
            />
          ) : null}

          {smsTemplateProvider === "smsbao" ? (
            <>
              <Form.Item
                label={t("手机号登录短信模板")}
                name="sms_login_template"
                rules={[{ required: true, message: t("请输入手机号登录短信模板") }]}
                extra={t("可用变量：{{code}}、{{minutes}}、{{signature}}。")}
              >
                <Input.TextArea rows={4} placeholder={t("请输入手机号登录短信模板")} />
              </Form.Item>
              <Form.Item
                label={t("注册短信模板")}
                name="sms_register_template"
                rules={[{ required: true, message: t("请输入注册短信模板") }]}
                extra={t("可用变量：{{code}}、{{minutes}}、{{signature}}。")}
              >
                <Input.TextArea rows={4} placeholder={t("请输入注册短信模板")} />
              </Form.Item>
              <Form.Item
                label={t("找回密码短信模板")}
                name="sms_reset_password_template"
                rules={[{ required: true, message: t("请输入找回密码短信模板") }]}
                extra={t("可用变量：{{code}}、{{minutes}}、{{signature}}。")}
              >
                <Input.TextArea rows={4} placeholder={t("请输入找回密码短信模板")} />
              </Form.Item>
              <Form.Item
                label={t("绑定手机号短信模板")}
                name="sms_bind_phone_template"
                rules={[{ required: true, message: t("请输入绑定手机号短信模板") }]}
                extra={t("可用变量：{{code}}、{{minutes}}、{{signature}}。")}
              >
                <Input.TextArea rows={4} placeholder={t("请输入绑定手机号短信模板")} />
              </Form.Item>
              <Form.Item
                label={t("注销账号短信模板")}
                name="sms_delete_account_template"
                rules={[{ required: true, message: t("请输入注销账号短信模板") }]}
                extra={t("可用变量：{{code}}、{{minutes}}、{{signature}}。")}
              >
                <Input.TextArea rows={4} placeholder={t("请输入注销账号短信模板")} />
              </Form.Item>
            </>
          ) : null}

          {smsTemplateProvider === "aliyun" ? (
            <>
              <Form.Item
                label={t("手机号登录模板 CODE")}
                name="aliyun_sms_login_template_code"
                rules={[{ required: true, message: t("请输入手机号登录模板 CODE") }]}
                extra={t("登录和短信 MFA 会共用这个模板 CODE。模板参数建议至少包含 code、minutes。")}
              >
                <Input placeholder={t("例如：SMS_100000001")} />
              </Form.Item>
              <Form.Item
                label={t("注册短信模板 CODE")}
                name="aliyun_sms_register_template_code"
                rules={[{ required: true, message: t("请输入注册模板 CODE") }]}
                extra={t("模板参数建议至少包含 code、minutes。")}
              >
                <Input placeholder={t("例如：SMS_123456789")} />
              </Form.Item>
              <Form.Item
                label={t("找回密码模板 CODE")}
                name="aliyun_sms_reset_template_code"
                rules={[{ required: true, message: t("请输入找回密码模板 CODE") }]}
              >
                <Input placeholder={t("例如：SMS_987654321")} />
              </Form.Item>
              <Form.Item
                label={t("绑定手机号模板 CODE")}
                name="aliyun_sms_bind_phone_template_code"
                rules={[{ required: true, message: t("请输入绑定手机号模板 CODE") }]}
                extra={t("绑定手机、校验当前手机和风控补绑会共用这个模板 CODE。")}
              >
                <Input placeholder={t("例如：SMS_123450000")} />
              </Form.Item>
              <Form.Item
                label={t("注销账号模板 CODE")}
                name="aliyun_sms_delete_template_code"
                rules={[{ required: true, message: t("请输入注销账号模板 CODE") }]}
              >
                <Input placeholder={t("例如：SMS_123450001")} />
              </Form.Item>
            </>
          ) : null}
        </Card>

        <Space wrap style={{ marginTop: 16 }}>
          <Button type="primary" onClick={onSave} loading={saving}>
            {t("保存发信配置")}
          </Button>
        </Space>

        <div className="settings-inline-tools">
          <Typography.Text strong>{t("测试发信接口")}</Typography.Text>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
            {t("配置保存后可在这里测试当前发信接口是否可用。")}
          </Typography.Paragraph>
          <Select
            placeholder={t("选择测试接口")}
            value={testSMSProvider}
            onChange={setTestSMSProvider}
            options={[
              { value: "disabled", label: t("未启用") },
              { value: "smsbao", label: t("短信宝") },
              { value: "aliyun", label: t("阿里云号码认证短信") }
            ]}
          />
          <Input
            placeholder={t("输入测试手机号")}
            value={testSMSPhone}
            onChange={(event) => setTestSMSPhone(event.target.value)}
          />
          <Input.TextArea
            rows={4}
            placeholder={t("输入测试短信内容")}
            value={testSMSContent}
            onChange={(event) => setTestSMSContent(event.target.value)}
          />
          <Space>
            <Button onClick={onSendTest} loading={testingSMS} disabled={testSMSProvider === "disabled"}>
              {t("发送测试短信")}
            </Button>
          </Space>
        </div>
      </Form>
    </SettingsCard>
  );
}
