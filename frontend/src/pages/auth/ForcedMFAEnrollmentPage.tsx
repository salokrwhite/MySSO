import { Button, Card, Form, Radio, Space, Typography, message } from "antd";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../api/client";
import { handleLoginFlowResult, type LoginFlowResponse } from "./authLoginFlow";

export function ForcedMFAEnrollmentPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const challengeToken = searchParams.get("mfa_enrollment_challenge_token") || "";
  const availableMethods = useMemo(() => {
    const raw = (searchParams.get("available_mfa_methods") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    return raw.includes("sms") ? (raw as Array<"email" | "sms">) : ["email"];
  }, [searchParams]);
  const [form] = Form.useForm<{ method: "email" | "sms" }>();

  function translateError(message: string) {
    switch (message) {
      case "mfa enrollment challenge expired or invalid":
        return t("errors.mfaEnrollmentChallengeExpiredOrInvalid");
      case "no available mfa method for current account":
        return t("errors.noAvailableMfaMethodForCurrentAccount");
      case "unsupported mfa method":
        return t("errors.unsupportedMfaMethod");
      case "email is not bound":
        return t("errors.emailNotBound");
      case "phone is not bound":
        return t("errors.phoneNotBound");
      default:
        return message;
    }
  }

  async function submit(values: { method: "email" | "sms" }) {
    if (!challengeToken) {
      messageApi.error(t("auth.forcedMfaEnrollmentExpired"));
      return;
    }
    setSubmitting(true);
    try {
      const result = await api<LoginFlowResponse>("/auth/login-mfa-enrollment/complete", {
        method: "POST",
        body: JSON.stringify({
          challenge_token: challengeToken,
          method: values.method,
        }),
      });
      await handleLoginFlowResult(result, { locationSearch: location.search, navigate });
    } catch (error) {
      messageApi.error(error instanceof Error ? translateError(error.message) : t("auth.loginFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="center-page">
      {contextHolder}
      <Card className="auth-card">
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <div>
            <Typography.Title level={3} style={{ marginBottom: 8 }}>
              {t("auth.forcedMfaEnrollmentTitle")}
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              {t("auth.forcedMfaEnrollmentDesc")}
            </Typography.Paragraph>
          </div>
          <Form
            form={form}
            layout="vertical"
            initialValues={{ method: availableMethods[0] || "email" }}
            onFinish={(values) => void submit(values)}
          >
            <Form.Item
              name="method"
              label={t("security.mfaMethod")}
              rules={[{ required: true, message: t("errors.unsupportedMfaMethod") }]}
            >
              <Radio.Group>
                {availableMethods.includes("email") ? (
                  <Radio value="email">{t("security.mfaMethodEmail")}</Radio>
                ) : null}
                {availableMethods.includes("sms") ? (
                  <Radio value="sms">{t("security.mfaMethodSMS")}</Radio>
                ) : null}
              </Radio.Group>
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={submitting}>
              {t("auth.completeForcedMfaEnrollment")}
            </Button>
          </Form>
          <Button block danger onClick={() => navigate("/login", { replace: true })}>
            {t("auth.cancelForcedMfaEnrollment")}
          </Button>
        </Space>
      </Card>
    </div>
  );
}
