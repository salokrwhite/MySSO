import { Avatar, Button, Modal, Space, Table, Tag, Typography } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../../../api/client";
import type { Consent } from "../types";
import { formatDateTime } from "../utils";
import { fetchPublicSettings } from "../../../publicSettings";

type BindingsSectionProps = {
  consents: Consent[];
  revokingConsentId?: string;
  selectedConsentIds: string[];
  batchRevoking: boolean;
  onSelectionChange: (ids: string[]) => void;
  onRevokeConsent: (id: string) => void;
  onOpenBatchRevoke: () => void;
};

export function BindingsSection({
  consents,
  revokingConsentId,
  selectedConsentIds,
  batchRevoking,
  onSelectionChange,
  onRevokeConsent,
  onOpenBatchRevoke
}: BindingsSectionProps) {
  const { t } = useTranslation();
  const [tableScrollY, setTableScrollY] = useState(320);
  const [detailConsent, setDetailConsent] = useState<Consent | null>(null);
  const [siteLogoDataUrl, setSiteLogoDataUrl] = useState(localStorage.getItem("site_logo_data_url") || "");
  const [firstPartyClientID, setFirstPartyClientID] = useState("");
  const backendOrigin = API_BASE.replace(/\/api$/, "");

  function resolveAssetURL(value: string) {
    const nextValue = value.trim();
    if (!nextValue) {
      return "";
    }
    return nextValue.startsWith("http") ? nextValue : `${backendOrigin}${nextValue}`;
  }

  function getConsentIconURL(consent: Consent | null) {
    if (!consent) {
      return "";
    }
    if (consent.icon_url?.trim()) {
      return resolveAssetURL(consent.icon_url);
    }
    if (firstPartyClientID && consent.client_id === firstPartyClientID && siteLogoDataUrl.trim()) {
      return resolveAssetURL(siteLogoDataUrl);
    }
    return "";
  }

  function getScopeDescriptions(scopes: string[]) {
    return scopes.map((scope) => {
      switch (scope) {
        case "openid":
          return {
            key: scope,
            code: scope,
            title: t("bindings.scopeOpenIdTitle"),
            description: t("bindings.scopeOpenIdDesc")
          };
        case "profile":
          return {
            key: scope,
            code: scope,
            title: t("bindings.scopeProfileTitle"),
            description: t("bindings.scopeProfileDesc")
          };
        case "email":
          return {
            key: scope,
            code: scope,
            title: t("bindings.scopeEmailTitle"),
            description: t("bindings.scopeEmailDesc")
          };
        case "phone":
          return {
            key: scope,
            code: scope,
            title: t("bindings.scopePhoneTitle"),
            description: t("bindings.scopePhoneDesc")
          };
        case "gateway.read":
          return {
            key: scope,
            code: scope,
            title: t("bindings.scopeGatewayReadTitle"),
            description: t("bindings.scopeGatewayReadDesc")
          };
        default:
          return {
            key: scope,
            code: scope,
            title: t("bindings.scopeCustomTitle", { scope }),
            description: t("bindings.scopeCustomDesc")
          };
      }
    });
  }

  function renderAccessStatus(consent: Consent) {
    if (consent.access_status === "banned") {
      return <Tag color="red">{t("bindings.accessStatusBanned")}</Tag>;
    }
    if (consent.access_status === "restricted") {
      return <Tag color="orange">{t("bindings.accessStatusRestricted")}</Tag>;
    }
    return <Tag color="green">{t("bindings.accessStatusNormal")}</Tag>;
  }

  useEffect(() => {
    function updateTableScrollY() {
      const viewportHeight = window.innerHeight;
      const reservedHeight = viewportHeight <= 900 ? 300 : 360;
      setTableScrollY(Math.max(220, viewportHeight - reservedHeight));
    }

    updateTableScrollY();
    window.addEventListener("resize", updateTableScrollY);
    return () => window.removeEventListener("resize", updateTableScrollY);
  }, []);

  useEffect(() => {
    let active = true;
    void fetchPublicSettings()
      .then((result) => {
        if (!active) {
          return;
        }
        const nextLogo = result.site_logo_data_url?.trim() || "";
        const nextFirstPartyClientID =
          result.oidc_first_party_client_id?.trim() || "";
        setSiteLogoDataUrl(nextLogo);
        setFirstPartyClientID(nextFirstPartyClientID);
        localStorage.setItem("site_logo_data_url", nextLogo);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="account-panel bindings-panel">
      <div className="account-section bindings-section">
        <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
          <Typography.Title level={3}>{t("bindings.title")}</Typography.Title>
          <Button
            danger
            disabled={selectedConsentIds.length === 0}
            loading={batchRevoking}
            onClick={onOpenBatchRevoke}
          >
            {selectedConsentIds.length > 0
              ? `${t("bindings.batchRevoke")} (${selectedConsentIds.length})`
              : t("bindings.batchRevoke")}
          </Button>
        </Space>
        <div className="bindings-table-wrap">
          <Table
            className="bindings-table"
            rowKey="id"
            dataSource={consents}
            pagination={false}
            scroll={{ x: "max-content", y: tableScrollY }}
            rowSelection={{
              selectedRowKeys: selectedConsentIds,
              onChange: (keys) => onSelectionChange(keys.map(String))
            }}
            locale={{ emptyText: t("common.noAuthorizedApps") }}
            columns={[
              { title: t("bindings.appId"), dataIndex: "app_name" },
              { title: t("bindings.scopes"), dataIndex: "scopes", render: (value: string[]) => value.join(", ") || "-" },
              {
                title: t("bindings.createdAt"),
                dataIndex: "created_at",
                render: (value: string) => formatDateTime(value)
              },
              {
                title: t("bindings.status"),
                render: (_, record: Consent) => renderAccessStatus(record)
              },
              {
                title: t("bindings.action"),
                render: (_, record: Consent) => (
                  <Space size={4}>
                    <Button type="link" onClick={() => setDetailConsent(record)}>
                      {t("bindings.viewDetails")}
                    </Button>
                    <Button
                      danger
                      type="link"
                      loading={revokingConsentId === record.id}
                      onClick={() => onRevokeConsent(record.id)}
                    >
                      {t("bindings.revoke")}
                    </Button>
                  </Space>
                )
              }
            ]}
          />
        </div>
      </div>
      <Modal
        title={t("bindings.detailTitle")}
        open={Boolean(detailConsent)}
        footer={null}
        onCancel={() => setDetailConsent(null)}
      >
        {detailConsent ? (
          <Space direction="vertical" size={20} style={{ width: "100%" }}>
            <Space size={16} align="center">
              <Avatar
                shape="square"
                size={64}
                src={getConsentIconURL(detailConsent) || undefined}
                icon={!getConsentIconURL(detailConsent) ? <GlobalOutlined /> : undefined}
                style={{
                  borderRadius: 16,
                  background: "#fff7ef",
                  color: "#ff7a00",
                  border: "1px solid rgba(255, 122, 0, 0.18)"
                }}
              />
              <div>
                <Typography.Text type="secondary">{t("bindings.siteName")}</Typography.Text>
                <div>
                  <Typography.Title level={4} style={{ margin: "4px 0 0" }}>
                    {detailConsent.app_name || detailConsent.client_id}
                  </Typography.Title>
                </div>
              </div>
            </Space>
            <div>
              <Typography.Text type="secondary">{t("bindings.requestedPermissions")}</Typography.Text>
              <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                {detailConsent.scopes.length > 0 ? (
                  getScopeDescriptions(detailConsent.scopes).map((item) => (
                    <div
                      key={item.key}
                      style={{
                        padding: "14px 16px",
                        borderRadius: 14,
                        border: "1px solid rgba(18, 38, 58, 0.08)",
                        background: "#fafcff"
                      }}
                    >
                      <Space direction="vertical" size={6} style={{ width: "100%" }}>
                        <Space size={8} wrap>
                          <Typography.Text strong>{item.title}</Typography.Text>
                          <Tag color="orange">{item.code}</Tag>
                        </Space>
                        <Typography.Text type="secondary">{item.description}</Typography.Text>
                      </Space>
                    </div>
                  ))
                ) : (
                  <Typography.Text>{t("common.unsetShort")}</Typography.Text>
                )}
              </div>
            </div>
            <div>
              <Typography.Text type="secondary">{t("bindings.authorizedAt")}</Typography.Text>
              <div style={{ marginTop: 4 }}>
                <Typography.Text>{formatDateTime(detailConsent.created_at)}</Typography.Text>
              </div>
            </div>
            <div>
              <Typography.Text type="secondary">{t("bindings.accessStatus")}</Typography.Text>
              <div style={{ marginTop: 4 }}>{renderAccessStatus(detailConsent)}</div>
            </div>
            {detailConsent.access_status && detailConsent.access_status !== "normal" ? (
              <div style={{ display: "grid", gap: 8 }}>
                {detailConsent.restriction_reason ? (
                  <div>
                    <Typography.Text type="secondary">{t("bindings.reason")}</Typography.Text>
                    <div style={{ marginTop: 4 }}>
                      <Typography.Text>{detailConsent.restriction_reason}</Typography.Text>
                    </div>
                  </div>
                ) : null}
                {detailConsent.restricted_at ? (
                  <div>
                    <Typography.Text type="secondary">{t("bindings.effectiveAt")}</Typography.Text>
                    <div style={{ marginTop: 4 }}>
                      <Typography.Text>{formatDateTime(detailConsent.restricted_at)}</Typography.Text>
                    </div>
                  </div>
                ) : null}
                {detailConsent.expires_at ? (
                  <div>
                    <Typography.Text type="secondary">{t("bindings.expiresAt")}</Typography.Text>
                    <div style={{ marginTop: 4 }}>
                      <Typography.Text>{formatDateTime(detailConsent.expires_at)}</Typography.Text>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </Space>
        ) : null}
      </Modal>
    </div>
  );
}
