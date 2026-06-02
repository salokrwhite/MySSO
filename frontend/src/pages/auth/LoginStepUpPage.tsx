import { Button, Card, Form, Input, Space, Typography, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ApiError, api } from "../../api/client";
import { handleLoginFlowResult, type LoginFlowResponse } from "./authLoginFlow";
import { useCaptchaGate } from "../../hooks/useCaptchaGate";

type StepUpMode = "none" | "email" | "sms" | "email_and_sms";

export function LoginStepUpPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingSMS, setSendingSMS] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const challengeToken = searchParams.get("step_up_challenge_token") || "";
  const stepUpMode = (searchParams.get("step_up_mode") || "none") as StepUpMode;
  const maskedEmailTarget = searchParams.get("masked_email_target") || "";
  const maskedPhoneTarget = searchParams.get("masked_phone_target") || "";
  const requiresEmail = stepUpMode === "email" || stepUpMode === "email_and_sms";
  const requiresSMS = stepUpMode === "sms" || stepUpMode === "email_and_sms";
  const [emailRemainingSeconds, setEmailRemainingSeconds] = useState(0);
  const [smsRemainingSeconds, setSMSRemainingSeconds] = useState(0);
  const [form] = Form.useForm<{ email_otp?: string; sms_otp?: string }>();
  const { requestCaptcha, captchaModal } = useCaptchaGate();

  useEffect(() => {
    if (emailRemainingSeconds <= 0 && smsRemainingSeconds <= 0) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setEmailRemainingSeconds((current) => (current > 0 ? current - 1 : 0));
      setSMSRemainingSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [emailRemainingSeconds, smsRemainingSeconds]);

  const description = useMemo(() => {
    if (stepUpMode === "email_and_sms") {
      return t("auth.loginStepUpDualDesc", {
        email: maskedEmailTarget,
        phone: maskedPhoneTarget,
      });
    }
    if (stepUpMode === "sms") {
      return t("auth.loginStepUpSMSDesc", { phone: maskedPhoneTarget });
    }
    return t("auth.loginStepUpEmailDesc", { email: maskedEmailTarget });
  }, [maskedEmailTarget, maskedPhoneTarget, stepUpMode, t]);

  function translateError(message: string) {
    switch (message) {
      case "invalid login step-up verification code":
        return t("errors.invalidLoginStepUpVerificationCode");
      case "login step-up challenge expired or invalid":
        return t("errors.loginStepUpChallengeExpiredOrInvalid");
      case "no available login verification target for current account":
        return t("errors.noAvailableLoginVerificationTargetForCurrentAccount");
      default:
        return message;
    }
  }

  async function sendCode(channel: "email" | "sms") {
    if (!challengeToken) {
      messageApi.error(t("auth.loginStepUpExpired"));
      return;
    }
    if (channel === "email") {
      setSendingEmail(true);
    } else {
      setSendingSMS(true);
    }
    try {
      const captchaPayload = await requestCaptcha({
        flow: "login_step_up",
        purpose: "login_step_up",
        target: `${challengeToken}:${channel}`,
      });
      const result = await api<{ cooldown_seconds?: number }>(
        "/auth/login-step-up/code",
        {
          method: "POST",
          body: JSON.stringify({
            challenge_token: challengeToken,
            channel,
            ...captchaPayload,
          }),
        },
      );
      if (channel === "email") {
        setEmailRemainingSeconds(Number(result.cooldown_seconds || 0));
      } else {
        setSMSRemainingSeconds(Number(result.cooldown_seconds || 0));
      }
      messageApi.success(
        t(channel === "email" ? "auth.sendOtpCodeSuccess" : "auth.sendPhoneOtpCodeSuccess"),
      );
    } catch (error) {
      if (error instanceof ApiError) {
        const retryAfterSeconds = Number(error.payload.retry_after_seconds || 0);
        if (retryAfterSeconds > 0) {
          if (channel === "email") {
            setEmailRemainingSeconds(retryAfterSeconds);
          } else {
            setSMSRemainingSeconds(retryAfterSeconds);
          }
          return;
        }
      }
      messageApi.error(error instanceof Error ? translateError(error.message) : t("auth.loginFailed"));
    } finally {
      if (channel === "email") {
        setSendingEmail(false);
      } else {
        setSendingSMS(false);
      }
    }
  }

  async function submit(values: { email_otp?: string; sms_otp?: string }) {
    if (!challengeToken) {
      messageApi.error(t("auth.loginStepUpExpired"));
      return;
    }
    setSubmitting(true);
    try {
      const result = await api<LoginFlowResponse>("/auth/login-step-up/complete", {
        method: "POST",
        body: JSON.stringify({
          challenge_token: challengeToken,
          email_otp: values.email_otp,
          sms_otp: values.sms_otp,
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
              {t("auth.loginStepUpTitle")}
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              {description}
            </Typography.Paragraph>
          </div>
          <Form form={form} layout="vertical" onFinish={(values) => void submit(values)}>
            {requiresEmail ? (
              <Form.Item label={t("auth.otpCode")} required>
                <Space.Compact style={{ width: "100%" }}>
                  <Form.Item
                    name="email_otp"
                    noStyle
                    rules={[{ required: true, message: t("auth.otpCode") }]}
                  >
                    <Input />
                  </Form.Item>
                  <Button
                    onClick={() => void sendCode("email")}
                    loading={sendingEmail}
                    disabled={emailRemainingSeconds > 0}
                  >
                    {emailRemainingSeconds > 0
                      ? `${emailRemainingSeconds}s`
                      : t("auth.sendOtpCode")}
                  </Button>
                </Space.Compact>
              </Form.Item>
            ) : null}
            {requiresSMS ? (
              <Form.Item label={t("auth.phoneOtpCode")} required>
                <Space.Compact style={{ width: "100%" }}>
                  <Form.Item
                    name="sms_otp"
                    noStyle
                    rules={[{ required: true, message: t("auth.phoneOtpCode") }]}
                  >
                    <Input />
                  </Form.Item>
                  <Button
                    onClick={() => void sendCode("sms")}
                    loading={sendingSMS}
                    disabled={smsRemainingSeconds > 0}
                  >
                    {smsRemainingSeconds > 0
                      ? `${smsRemainingSeconds}s`
                      : t("auth.sendPhoneOtpCode")}
                  </Button>
                </Space.Compact>
              </Form.Item>
            ) : null}
            <Button type="primary" htmlType="submit" block loading={submitting}>
              {t("auth.verifyAndLogin")}
            </Button>
          </Form>
          <Button block onClick={() => navigate({ pathname: "/login", search: location.search }, { replace: true })}>
            {t("auth.backToLogin")}
          </Button>
        </Space>
      </Card>
    </div>
  );
}
