import { Button, Card, Space, Typography, message } from "antd";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../api/client";
import { pickAllowedSearchParams } from "../../utils/urlState";
import { handleLoginFlowResult, type LoginFlowResponse } from "./authLoginFlow";

function formatDateTime(value: string) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.replace("T", " ").replace(/Z$/, "");
  }
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  const seconds = `${date.getSeconds()}`.padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function LoginDeletionConfirmPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const searchParams = pickAllowedSearchParams(location.search);
  const rawSearchParams = new URLSearchParams(location.search);
  const challengeToken = rawSearchParams.get("deletion_challenge_token") || "";
  const deletionScheduledAt = rawSearchParams.get("deletion_scheduled_at") || "";
  const hasAuthorizationContext = Boolean(searchParams.get("client_id"));
  const usesAuthorizationFlowSession = searchParams.get("auth_flow") === "authorization";

  const scheduledTimeLabel = useMemo(() => formatDateTime(deletionScheduledAt), [deletionScheduledAt]);

  async function confirmLogin() {
    if (!challengeToken) {
      messageApi.error(t("auth.deletionConfirmExpired"));
      return;
    }
    setLoading(true);
    try {
      const result = await api<LoginFlowResponse>("/auth/deletion-login/confirm", {
        method: "POST",
        body: JSON.stringify({
          challenge_token: challengeToken
        })
      });
      await handleLoginFlowResult(result, { locationSearch: location.search, navigate });
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : t("auth.deletionConfirmFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="center-page">
      {contextHolder}
      <Card className="auth-card">
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <div>
            <Typography.Title level={3} style={{ marginBottom: 8 }}>
              {t("auth.deletionConfirmTitle")}
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              {t("auth.deletionConfirmScheduledAt", { date: scheduledTimeLabel })}
            </Typography.Paragraph>
          </div>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("auth.deletionConfirmDesc")}
          </Typography.Paragraph>
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Button type="primary" block loading={loading} onClick={() => void confirmLogin()}>
              {t("auth.deletionConfirmContinue")}
            </Button>
            <Button
              block
              onClick={() =>
                navigate({
                  pathname: "/login",
                  search: location.search
                })
              }
            >
              {t("auth.backToLogin")}
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
}
