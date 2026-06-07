import { Button, Card, Form, Input, Radio, Space, Typography, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ApiError, api } from "../../api/client";
import { handleLoginFlowResult, type LoginFlowResponse } from "./authLoginFlow";
import { useCaptchaGate } from "../../hooks/useCaptchaGate";

export function ForcedMFAEnrollmentPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
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
  const [form] = Form.useForm<{ method: "email" | "sms"; otp: string }>();
  const { requestCaptcha, captchaModal } = useCaptchaGate();
  const selectedMethod = Form.useWatch("method", form) || availableMethods[0] || "email";

  useEffect(() => {
    if (remainingSeconds <= 0) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [remainingSeconds]);

  useEffect(() => {
    setRemainingSeconds(0);
  }, [selectedMethod]);

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
      case "invalid mfa enrollment verification code":
        return t("errors.invalidMfaEnrollmentVerificationCode");
      default:
        return message;
    }
  }

  async function sendCode() {
    if (!challengeToken) {
      messageApi.error(t("auth.forcedMfaEnrollmentExpired"));
      return;
    }
    setSending(true);
    try {
      const captchaPayload = await requestCaptcha({
        flow: "login_mfa_enrollment",
        purpose: "login_mfa_enrollment",
        target: `${challengeToken}:${selectedMethod}`,
      });
      const result = await api<{ cooldown_seconds?: number }>(
        "/auth/login-mfa-enrollment/code",
        {
          method: "POST",
          body: JSON.stringify({
            challenge_token: challengeToken,
            method: selectedMethod,
            ...captchaPayload,
          }),
        },
      );
      setRemainingSeconds(Number(result.cooldown_seconds || 0));
      messageApi.success(
        t(selectedMethod === "sms" ? "auth.sendPhoneOtpCodeSuccess" : "auth.sendOtpCodeSuccess"),
      );
    } catch (error) {
      if (error instanceof ApiError) {
        const retryAfterSeconds = Number(error.payload.retry_after_seconds || 0);
        if (retryAfterSeconds > 0) {
          setRemainingSeconds(retryAfterSeconds);
          return;
        }
      }
      messageApi.error(error instanceof Error ? translateError(error.message) : t("auth.loginFailed"));
    } finally {
      setSending(false);
    }
  }

  async function submit(values: { method: "email" | "sms"; otp: string }) {
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
          otp: values.otp,
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
      {captchaModal}
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
            <Form.Item label={t(selectedMethod === "sms" ? "auth.phoneOtpCode" : "auth.otpCode")} required>
              <Space.Compact style={{ width: "100%" }}>
                <Form.Item
                  name="otp"
                  noStyle
                  rules={[{ required: true, message: t("auth.otpCodeRequired") }]}
                >
                  <Input />
                </Form.Item>
                <Button
                  onClick={() => void sendCode()}
                  loading={sending}
                  disabled={remainingSeconds > 0}
                >
                  {remainingSeconds > 0
                    ? `${remainingSeconds}s`
                    : t(selectedMethod === "sms" ? "auth.sendPhoneOtpCode" : "auth.sendOtpCode")}
                </Button>
              </Space.Compact>
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
