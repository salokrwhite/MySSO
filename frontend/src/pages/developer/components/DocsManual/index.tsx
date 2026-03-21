import { Alert, Card, Descriptions, Space, Table, Typography } from "antd";
import { API_BASE } from "../../../../api/client";
import { useDeveloperTranslation } from "../../i18n";
import type { ScopeDefinition } from "../../types";

export function DeveloperDocsManual({ scopes }: { scopes: ScopeDefinition[] }) {
  const { t } = useDeveloperTranslation();
  const availableScopes =
    scopes.length > 0
      ? scopes
      : [
          {
            key: "openid",
            display_name: "OpenID",
            description: "OIDC base scope used to identify the user.",
            enabled: true,
            developer_selectable: true,
          },
          {
            key: "profile",
            display_name: "Profile",
            description: "Allows reading basic public profile fields.",
            enabled: true,
            developer_selectable: true,
          },
          {
            key: "email",
            display_name: "Email",
            description: "Allows reading the user's email address.",
            enabled: true,
            developer_selectable: true,
          },
          {
            key: "phone",
            display_name: "Phone",
            description: "Allows reading the user's phone number.",
            enabled: true,
            developer_selectable: true,
          },
          {
            key: "role",
            display_name: "Role",
            description: "Allows reading user roles.",
            enabled: true,
            developer_selectable: true,
          },
          {
            key: "gateway.read",
            display_name: "Protected API Access",
            description: "Allows access to platform APIs protected by this scope.",
            enabled: true,
            developer_selectable: true,
          },
        ];
  const issuer = API_BASE.replace(/\/api$/, "");
  const discoveryURL = `${issuer}/.well-known/openid-configuration`;
  const jwksURL = `${issuer}/.well-known/jwks.json`;
  const tokenURL = `${issuer}/oauth2/token`;
  const userInfoURL = `${issuer}/oauth2/userinfo`;
  const browserLogoutURL = `${issuer}/oauth2/logout`;
  const apiLogoutURL = `${issuer}/api/auth/logout`;

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <Card title={t("docsManual.overview")}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.overviewDesc")}
          </Typography.Paragraph>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Issuer">{issuer}</Descriptions.Item>
            <Descriptions.Item label="Discovery">{discoveryURL}</Descriptions.Item>
            <Descriptions.Item label="JWKS">{jwksURL}</Descriptions.Item>
            <Descriptions.Item label="Authorize">{`${issuer}/oauth2/authorize`}</Descriptions.Item>
            <Descriptions.Item label="Token">{tokenURL}</Descriptions.Item>
            <Descriptions.Item label="UserInfo">{userInfoURL}</Descriptions.Item>
            <Descriptions.Item label={t("docsManual.browserLogoutEndpoint")}>
              {browserLogoutURL}
            </Descriptions.Item>
            <Descriptions.Item label={t("docsManual.apiLogoutEndpoint")}>
              {apiLogoutURL}
            </Descriptions.Item>
          </Descriptions>
          <Alert
            type="warning"
            showIcon
            message={t("docsManual.logoutAlertTitle")}
            description={t("docsManual.logoutAlertDesc")}
          />
        </Space>
      </Card>

      <Card title={t("docsManual.shortestSteps")}>
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          {(["1", "2", "3", "4", "5", "6", "7", "8"] as const).map((step) => (
            <Typography.Paragraph key={step} style={{ marginBottom: 0 }}>
              {t(`docsManual.steps.${step}`)}
            </Typography.Paragraph>
          ))}
        </Space>
      </Card>

      <Card title={t("docsManual.logoutModel")}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.logoutDesc")}
          </Typography.Paragraph>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label={t("docsManual.browserLogoutTitle")}>
              {t("docsManual.browserLogoutDesc")}
            </Descriptions.Item>
            <Descriptions.Item label={t("docsManual.apiLogoutTitle")}>
              {t("docsManual.apiLogoutDesc")}
            </Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>

      <Card title={t("docsManual.scopeMechanism")}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Alert type="info" showIcon message={t("docsManual.scopeAlert")} />
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t("docsManual.scopeDesc")}
          </Typography.Paragraph>
          <Table
            rowKey="key"
            pagination={false}
            columns={[
              {
                title: t("docsManual.scopeColumns.scope"),
                dataIndex: "key",
                width: 180,
                render: (value: string) => <Typography.Text code>{value}</Typography.Text>,
              },
              {
                title: t("docsManual.scopeColumns.displayName"),
                dataIndex: "display_name",
                width: 180,
              },
              {
                title: t("docsManual.scopeColumns.description"),
                dataIndex: "description",
              },
            ]}
            dataSource={availableScopes}
          />
        </Space>
      </Card>
    </Space>
  );
}
