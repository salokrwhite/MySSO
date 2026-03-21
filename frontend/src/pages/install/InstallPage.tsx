import { useEffect, useState } from "react";
import { Button, Card, Form, Input, InputNumber, Result, Space, Steps, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { ACCOUNT_LOCALE_STORAGE_KEY } from "../../i18n/accountLocale";
import { useInstallTranslation } from "./i18n";

type InstallStatus = {
  installed: boolean;
  configured_db: boolean;
  step: string;
  default_public_base_url?: string;
  default_issuer?: string;
  default_frontend_base_url?: string;
};

type InstallCompleteResult = {
  installed: boolean;
  reload_required?: boolean;
  message?: string;
};

type InstallFormValues = {
  db_host: string;
  db_port: number;
  db_name: string;
  db_user: string;
  db_password: string;
  public_base_url: string;
  frontend_base_url: string;
  issuer: string;
  admin_email: string;
  admin_display_name: string;
  admin_password: string;
  admin_password_confirm: string;
};

const initialValues: InstallFormValues = {
  db_host: "127.0.0.1",
  db_port: 3306,
  db_name: "sso",
  db_user: "sso",
  db_password: "",
  public_base_url: "http://localhost:8080",
  frontend_base_url: "http://localhost:5173",
  issuer: "http://localhost:8080",
  admin_email: "admin@example.com",
  admin_display_name: "Platform Admin",
  admin_password: "",
  admin_password_confirm: "",
};

export function InstallPage() {
  const navigate = useNavigate();
  const { t, i18n } = useInstallTranslation();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<InstallFormValues>();
  const [status, setStatus] = useState<InstallStatus>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dbValidated, setDBValidated] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [installComplete, setInstallComplete] = useState<InstallCompleteResult>();

  useEffect(() => {
    form.setFieldsValue({
      ...initialValues,
      public_base_url: window.location.origin.replace(/:\d+$/, ":8080"),
      frontend_base_url: window.location.origin,
      issuer: window.location.origin.replace(/:\d+$/, ":8080"),
    });
    void loadStatus();
  }, [form]);

  function updateInstallLocale(nextLocale: "zh-CN" | "en-US") {
    localStorage.setItem(ACCOUNT_LOCALE_STORAGE_KEY, nextLocale);
    void i18n.changeLanguage(nextLocale);
  }

  async function loadStatus() {
    setLoading(true);
    try {
      const result = await api<InstallStatus>("/install/status");
      setStatus(result);
      form.setFieldsValue({
        public_base_url: result.default_public_base_url || initialValues.public_base_url,
        frontend_base_url: result.default_frontend_base_url || initialValues.frontend_base_url,
        issuer: result.default_issuer || result.default_public_base_url || initialValues.issuer,
      });
      if (result.installed) {
        setInstallComplete({ installed: true });
      }
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : t("errors.statusFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function validateDB() {
    setSubmitting(true);
    try {
      const values = await form.validateFields(["db_host", "db_port", "db_name", "db_user", "db_password"]);
      await api("/install/validate-db", {
        method: "POST",
        body: JSON.stringify({
          db: {
            driver: "mysql",
            host: values.db_host,
            port: String(values.db_port),
            name: values.db_name,
            user: values.db_user,
            password: values.db_password,
            charset: "utf8mb4",
          },
        }),
      });
      setDBValidated(true);
      setCurrentStep(1);
      messageApi.success(t("database.validateSuccess"));
    } catch (err) {
      setDBValidated(false);
      messageApi.error(err instanceof Error ? err.message : t("database.validateFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  async function completeInstall() {
    setSubmitting(true);
    try {
      const values = form.getFieldsValue(true) as InstallFormValues;
      const result = await api<InstallCompleteResult>("/install/complete", {
        method: "POST",
        body: JSON.stringify({
          db: {
            driver: "mysql",
            host: values.db_host,
            port: String(values.db_port),
            name: values.db_name,
            user: values.db_user,
            password: values.db_password,
            charset: "utf8mb4",
          },
          public_base_url: values.public_base_url,
          frontend_base_url: values.frontend_base_url,
          issuer: values.issuer,
          admin_email: values.admin_email,
          admin_display_name: values.admin_display_name,
          admin_password: values.admin_password,
        }),
      });
      setStatus((current) => current ? { ...current, installed: true } : {
        installed: true,
        configured_db: true,
        step: "complete",
      });
      setInstallComplete(result);
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : t("errors.installFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  async function goNextStep() {
    try {
      if (currentStep === 0) {
        await validateDB();
        return;
      }
      if (currentStep === 1) {
        await form.validateFields(["public_base_url", "frontend_base_url", "issuer"]);
        setCurrentStep(2);
      }
    } catch {
      return;
    }
  }

  function goPrevStep() {
    setCurrentStep((value) => Math.max(0, value - 1));
  }

  if (loading) {
    return (
      <div className="center-page">
        <Card className="auth-card">
          <Typography.Text type="secondary">正在检查系统安装状态...</Typography.Text>
        </Card>
      </div>
    );
  }

  if (installComplete?.installed || status?.installed) {
    return (
      <div className="center-page">
        <Card className="auth-card">
          <Result
            status="success"
            title={t("page.finishedTitle")}
            subTitle={
              installComplete?.reload_required
                ? t("page.finishedReloadSubtitle")
                : t("page.finishedSubtitle")
            }
            extra={[
              <Button key="login" type="primary" onClick={() => navigate("/login", { replace: true })}>
                {t("page.finishedLogin")}
              </Button>,
              <Button key="home" onClick={() => navigate("/", { replace: true })}>
                {t("page.finishedHome")}
              </Button>,
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="center-page" style={{ padding: "48px 16px" }}>
      {contextHolder}
      <div className="auth-page-toolbar">
        <Space size={8}>
          <Button type="link" className="auth-language-button" onClick={() => updateInstallLocale("zh-CN")}>
            {t("language.zhCN")}
          </Button>
          <Button type="link" className="auth-language-button" onClick={() => updateInstallLocale("en-US")}>
            {t("language.enUS")}
          </Button>
        </Space>
      </div>
      <Card style={{ width: "min(880px, 100%)", borderRadius: 24 }}>
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <div>
            <Typography.Title level={2} style={{ marginBottom: 8 }}>
              {t("page.title")}
            </Typography.Title>
            <Typography.Text type="secondary">
              {t("page.description")}
            </Typography.Text>
          </div>

          <Steps
            current={currentStep}
            items={[
              { title: t("steps.database") },
              { title: t("steps.system") },
              { title: t("steps.admin") },
            ]}
          />

          <Form form={form} layout="vertical" onFinish={completeInstall}>
            {currentStep === 0 ? (
              <>
                <Typography.Title level={4}>{t("database.title")}</Typography.Title>
                <Typography.Paragraph type="secondary">
                  {t("database.description")}
                </Typography.Paragraph>
                <Form.Item label={t("database.host")} name="db_host" rules={[{ required: true, message: t("database.hostRequired") }]}>
                  <Input />
                </Form.Item>
                <Form.Item label={t("database.port")} name="db_port" rules={[{ required: true, message: t("database.portRequired") }]}>
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item label={t("database.name")} name="db_name" rules={[{ required: true, message: t("database.nameRequired") }]}>
                  <Input />
                </Form.Item>
                <Form.Item label={t("database.user")} name="db_user" rules={[{ required: true, message: t("database.userRequired") }]}>
                  <Input />
                </Form.Item>
                <Form.Item label={t("database.password")} name="db_password" rules={[{ required: true, message: t("database.passwordRequired") }]}>
                  <Input.Password />
                </Form.Item>
              </>
            ) : null}

            {currentStep === 1 ? (
              <>
                <Typography.Title level={4}>{t("system.title")}</Typography.Title>
                <Typography.Paragraph type="secondary">
                  {t("system.description")}
                </Typography.Paragraph>
                <Form.Item
                  label={t("system.publicBaseUrl")}
                  name="public_base_url"
                  rules={[{ required: true, message: t("system.publicBaseUrlRequired") }, { type: "url", message: t("system.urlInvalid") }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label={t("system.frontendBaseUrl")}
                  name="frontend_base_url"
                  rules={[{ required: true, message: t("system.frontendBaseUrlRequired") }, { type: "url", message: t("system.urlInvalid") }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item label={t("system.issuer")} name="issuer" rules={[{ required: true, message: t("system.issuerRequired") }, { type: "url", message: t("system.urlInvalid") }]}>
                  <Input />
                </Form.Item>
              </>
            ) : null}

            {currentStep === 2 ? (
              <>
                <Typography.Title level={4}>{t("admin.title")}</Typography.Title>
                <Typography.Paragraph type="secondary">
                  {t("admin.description")}
                </Typography.Paragraph>
                <Form.Item label={t("admin.email")} name="admin_email" rules={[{ required: true, message: t("admin.emailRequired") }, { type: "email", message: t("admin.emailInvalid") }]}>
                  <Input />
                </Form.Item>
                <Form.Item label={t("admin.displayName")} name="admin_display_name" rules={[{ required: true, message: t("admin.displayNameRequired") }]}>
                  <Input />
                </Form.Item>
                <Form.Item label={t("admin.password")} name="admin_password" rules={[{ required: true, message: t("admin.passwordRequired") }, { min: 8, message: t("admin.passwordMin") }]}>
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  label={t("admin.passwordConfirm")}
                  name="admin_password_confirm"
                  dependencies={["admin_password"]}
                  rules={[
                    { required: true, message: t("admin.passwordConfirmRequired") },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("admin_password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error(t("admin.passwordMismatch")));
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>
              </>
            ) : null}

            <Space style={{ marginTop: 16 }}>
              {currentStep > 0 ? <Button onClick={goPrevStep}>{t("actions.prev")}</Button> : null}
              {currentStep < 2 ? (
                <Button type="primary" onClick={() => void goNextStep()} loading={submitting}>
                  {currentStep === 0 ? t("actions.validateAndNext") : t("actions.next")}
                </Button>
              ) : (
                <Button type="primary" htmlType="submit" loading={submitting} disabled={!dbValidated}>
                  {t("actions.complete")}
                </Button>
              )}
              <Button onClick={() => navigate("/")}>{t("actions.backHome")}</Button>
            </Space>
          </Form>
        </Space>
      </Card>
    </div>
  );
}
