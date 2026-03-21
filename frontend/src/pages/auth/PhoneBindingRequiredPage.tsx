import { useState } from "react";
import { Button, Card, Form, Input, Space, Typography, message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiError, api } from "../../api/client";
import { useEmailCodeCooldown } from "../../utils/emailCodeCooldown";
import { withUpdatedSearch } from "../../utils/urlState";
import { useTranslation } from "react-i18next";
import { handleLoginFlowResult, type LoginFlowResponse } from "./authLoginFlow";

export function PhoneBindingRequiredPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const searchParams = new URLSearchParams(location.search);
  const [form] = Form.useForm<{ phone: string; code: string }>();
  const [sendingCode, setSendingCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const challengeToken = new URLSearchParams(location.search).get("challenge_token") || "";
  const reason = new URLSearchParams(location.search).get("reason") || "";
  const phone = Form.useWatch("phone", form) || "";
  const { remainingSeconds, startCooldown } = useEmailCodeCooldown(phone, "risk_phone_binding");
  const hasAuthorizationContext = Boolean(searchParams.get("client_id"));
  const usesAuthorizationFlowSession = searchParams.get("auth_flow") === "authorization";

  async function sendCode() {
    if (!challengeToken) {
      messageApi.error(t("errors.phoneBindingChallengeExpired"));
      return;
    }
    try {
      setSendingCode(true);
      const values = await form.validateFields(["phone"]);
      const result = await api<{ cooldown_seconds?: number }>("/auth/phone-binding/code", {
        method: "POST",
        body: JSON.stringify({
          challenge_token: challengeToken,
          phone: values.phone
        })
      });
      startCooldown(Number(result.cooldown_seconds || 0), values.phone);
      messageApi.success(t("auth.sendPhoneBindingCodeSuccess"));
    } catch (err) {
      if (err instanceof ApiError) {
        const retryAfterSeconds = Number(err.payload.retry_after_seconds || 0);
        if (retryAfterSeconds > 0) {
          startCooldown(retryAfterSeconds, form.getFieldValue("phone"));
          return;
        }
      }
      messageApi.error(err instanceof Error ? err.message : t("auth.sendPhoneBindingCodeFailed"));
    } finally {
      setSendingCode(false);
    }
  }

  async function submit(values: { phone: string; code: string }) {
    if (!challengeToken) {
      messageApi.error(t("errors.phoneBindingChallengeExpired"));
      return;
    }
    try {
      setSubmitting(true);
      const result = await api<LoginFlowResponse>("/auth/phone-binding/complete", {
        method: "POST",
        body: JSON.stringify({
          challenge_token: challengeToken,
          phone: values.phone,
          code: values.code
        })
      });
      messageApi.success(t("auth.phoneBindingSuccess"));
      await handleLoginFlowResult(result, { locationSearch: location.search, navigate });
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : t("auth.phoneBindingFailed"));
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
            <Typography.Title level={2}>{t("auth.phoneBindingPageTitle")}</Typography.Title>
            <Typography.Text type="secondary">
              {reason === "post_register" ? t("auth.phoneBindingRegisterDesc") : t("auth.phoneBindingLoginDesc")}
            </Typography.Text>
          </div>

          <Form form={form} layout="vertical" onFinish={submit}>
            <Form.Item label={t("auth.phone")} name="phone" rules={[{ required: true, message: t("errors.phoneNotBound") }]}>
              <Input placeholder="13800138000" />
            </Form.Item>
            <Form.Item label={t("auth.phoneOtpCode")} required>
              <Space.Compact style={{ width: "100%" }}>
                <Form.Item name="code" noStyle rules={[{ required: true, message: t("security.smsCodePlaceholder") }]}>
                  <Input placeholder={t("security.smsCodePlaceholder")} />
                </Form.Item>
                <Button onClick={() => void sendCode()} loading={sendingCode} disabled={remainingSeconds > 0}>
                  {remainingSeconds > 0 ? `${remainingSeconds}s` : t("auth.sendPhoneBindingCode")}
                </Button>
              </Space.Compact>
            </Form.Item>

            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Button onClick={() => navigate(`/login${location.search}`, { replace: true })}>{t("auth.backToLogin")}</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {t("auth.completePhoneBinding")}
              </Button>
            </Space>
          </Form>
        </Space>
      </Card>
    </div>
  );
}
