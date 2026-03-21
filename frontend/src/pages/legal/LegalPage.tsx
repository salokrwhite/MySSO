import { LeftOutlined } from "@ant-design/icons";
import { Button, Card, Space, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/client";
import { getStoredSiteName, persistSiteBranding, resolveSiteNameForLocale } from "../../siteBranding";

type LegalKind = "agreement" | "privacy";

export function LegalPage() {
  const { kind } = useParams<{ kind?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [siteName, setSiteName] = useState(getStoredSiteName(i18n.language));
  const legalKind: LegalKind = kind === "privacy" ? "privacy" : "agreement";
  const backTo = useMemo(() => {
    const search = new URLSearchParams(location.search);
    const raw = search.get("back_to") || "";
    return raw.startsWith("/") ? raw : "/me/security";
  }, [location.search]);

  useEffect(() => {
    setSiteName(getStoredSiteName(i18n.language));
  }, [i18n.language]);

  useEffect(() => {
    void api<{ data?: { site_name?: string; site_name_en?: string } }>("/public/settings")
      .then((result) => {
        const nextSiteName = resolveSiteNameForLocale(i18n.language, result.data?.site_name, result.data?.site_name_en);
        persistSiteBranding(result.data);
        setSiteName(nextSiteName);
      })
      .catch(() => {
        // Keep the cached site name when public settings are unavailable.
      });
  }, [i18n.language]);

  const content = useMemo(() => {
    if (legalKind === "privacy") {
      return {
        title: t("legal.privacy.title"),
        updatedAt: t("legal.updatedAt", { date: t("legal.privacy.updatedAt") }),
        intro: t("legal.privacy.intro", { siteName }),
        sections: [
          {
            title: t("legal.privacy.sections.dataCollectionTitle"),
            paragraphs: [
              t("legal.privacy.sections.dataCollectionP1", { siteName }),
              t("legal.privacy.sections.dataCollectionP2", { siteName })
            ]
          },
          {
            title: t("legal.privacy.sections.dataUsageTitle"),
            paragraphs: [
              t("legal.privacy.sections.dataUsageP1", { siteName }),
              t("legal.privacy.sections.dataUsageP2", { siteName })
            ]
          },
          {
            title: t("legal.privacy.sections.dataSharingTitle"),
            paragraphs: [
              t("legal.privacy.sections.dataSharingP1", { siteName }),
              t("legal.privacy.sections.dataSharingP2", { siteName })
            ]
          },
          {
            title: t("legal.privacy.sections.userRightsTitle"),
            paragraphs: [
              t("legal.privacy.sections.userRightsP1", { siteName }),
              t("legal.privacy.sections.userRightsP2", { siteName })
            ]
          },
          {
            title: t("legal.privacy.sections.securityTitle"),
            paragraphs: [
              t("legal.privacy.sections.securityP1", { siteName }),
              t("legal.privacy.sections.securityP2", { siteName })
            ]
          }
        ]
      };
    }

    return {
      title: t("legal.agreement.title"),
      updatedAt: t("legal.updatedAt", { date: t("legal.agreement.updatedAt") }),
      intro: t("legal.agreement.intro", { siteName }),
      sections: [
        {
          title: t("legal.agreement.sections.accountTitle"),
          paragraphs: [
            t("legal.agreement.sections.accountP1", { siteName }),
            t("legal.agreement.sections.accountP2", { siteName })
          ]
        },
        {
          title: t("legal.agreement.sections.acceptableUseTitle"),
          paragraphs: [
            t("legal.agreement.sections.acceptableUseP1", { siteName }),
            t("legal.agreement.sections.acceptableUseP2", { siteName })
          ]
        },
        {
          title: t("legal.agreement.sections.authorizationTitle"),
          paragraphs: [
            t("legal.agreement.sections.authorizationP1", { siteName }),
            t("legal.agreement.sections.authorizationP2", { siteName })
          ]
        },
        {
          title: t("legal.agreement.sections.developerTitle"),
          paragraphs: [
            t("legal.agreement.sections.developerP1", { siteName }),
            t("legal.agreement.sections.developerP2", { siteName })
          ]
        },
        {
          title: t("legal.agreement.sections.liabilityTitle"),
          paragraphs: [
            t("legal.agreement.sections.liabilityP1", { siteName }),
            t("legal.agreement.sections.liabilityP2", { siteName })
          ]
        }
      ]
    };
  }, [legalKind, siteName, t]);

  return (
    <div className="legal-page-shell">
      <div className="legal-page-inner">
        <Button
          type="link"
          icon={<LeftOutlined />}
          className="legal-back-button"
          onClick={() => navigate(backTo)}
        >
          {t("legal.back")}
        </Button>
        <Card className="legal-card" variant="borderless">
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            <div>
              <Typography.Title level={1} className="legal-title">
                {content.title}
              </Typography.Title>
              <Typography.Text type="secondary">{content.updatedAt}</Typography.Text>
            </div>

            <Typography.Paragraph className="legal-intro">
              {content.intro}
            </Typography.Paragraph>

            <Space direction="vertical" size={20} style={{ width: "100%" }}>
              {content.sections.map((section) => (
                <section key={section.title} className="legal-section">
                  <Typography.Title level={3}>{section.title}</Typography.Title>
                  {section.paragraphs.map((paragraph) => (
                    <Typography.Paragraph key={paragraph}>{paragraph}</Typography.Paragraph>
                  ))}
                </section>
              ))}
            </Space>
          </Space>
        </Card>
      </div>
    </div>
  );
}
