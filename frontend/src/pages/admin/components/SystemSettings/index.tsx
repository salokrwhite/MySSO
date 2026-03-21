import { Card, Tabs, Typography } from "antd";
import { getSettingsTabMeta } from "../../constants";
import type { ScopeDefinition, SettingsTabKey, SystemSettings } from "../../types";
import { SettingsTabContent } from "./SettingsTabContent";
import type { FormInstance } from "antd";
import { useAdminI18n } from "../../i18n";

type SystemSettingsPanelProps = {
  activeSettingsTab: SettingsTabKey;
  onTabChange: (key: string) => void;
  tabs: Array<{ key: SettingsTabKey; label: string }>;
  settings: SystemSettings;
  siteForm: FormInstance<SystemSettings>;
  smtpForm: FormInstance<SystemSettings>;
  verificationForm: FormInstance<SystemSettings>;
  intlForm: FormInstance<SystemSettings>;
  sessionForm: FormInstance<SystemSettings>;
  smsForm: FormInstance<SystemSettings>;
  announcementForm: FormInstance<SystemSettings>;
  riskForm: FormInstance<SystemSettings>;
  rateLimitForm: FormInstance<SystemSettings>;
  scopes: ScopeDefinition[];
  savingSettings: boolean;
  savingScopeKey?: string;
  deletingScopeKey?: string;
  testingEmail: boolean;
  testingSMS: boolean;
  testEmail: string;
  setTestEmail: (value: string) => void;
  testSMSProvider: string;
  setTestSMSProvider: (value: string) => void;
  testSMSPhone: string;
  setTestSMSPhone: (value: string) => void;
  testSMSContent: string;
  setTestSMSContent: (value: string) => void;
  siteLogoFieldValue?: string;
  backendOrigin: string;
  smsProvider?: string;
  smsTemplateProvider?: string;
  onSaveSite: () => void;
  onSaveEmail: () => void;
  onSaveVerification: () => void;
  onSaveIntl: () => void;
  onSaveSession: () => void;
  onSaveSMS: () => void;
  onSaveAnnouncement: () => void;
  onSaveRisk: () => void;
  onSaveRateLimit: () => void;
  onSaveScope: (scope: ScopeDefinition) => void;
  onDeleteScope: (key: string) => void;
  onUploadSiteLogo: (file: File) => void;
  onClearSiteLogo: () => void;
  onSendTestEmail: () => void;
  onSendTestSMS: () => void;
};

export function SystemSettingsPanel(props: SystemSettingsPanelProps) {
  const { t } = useAdminI18n();
  const settingsTabMeta = getSettingsTabMeta(t);
  return (
    <Card className="settings-shell-card" styles={{ body: { paddingTop: 12 } }}>
      <Tabs
        activeKey={props.activeSettingsTab}
        className="settings-tabs"
        items={props.tabs.map((item) => ({
          key: item.key,
          label: item.label
        }))}
        onChange={props.onTabChange}
      />

      <div className="settings-section-head">
        <Typography.Title level={5} style={{ marginBottom: 4 }}>
          {settingsTabMeta[props.activeSettingsTab].title}
        </Typography.Title>
        <Typography.Text type="secondary">{settingsTabMeta[props.activeSettingsTab].description}</Typography.Text>
      </div>

      <SettingsTabContent
        tabKey={props.activeSettingsTab}
        settings={props.settings}
        siteForm={props.siteForm}
        smtpForm={props.smtpForm}
        verificationForm={props.verificationForm}
        intlForm={props.intlForm}
        sessionForm={props.sessionForm}
        smsForm={props.smsForm}
        announcementForm={props.announcementForm}
        riskForm={props.riskForm}
        rateLimitForm={props.rateLimitForm}
        scopes={props.scopes}
        savingSettings={props.savingSettings}
        savingScopeKey={props.savingScopeKey}
        deletingScopeKey={props.deletingScopeKey}
        testingEmail={props.testingEmail}
        testingSMS={props.testingSMS}
        testEmail={props.testEmail}
        setTestEmail={props.setTestEmail}
        testSMSProvider={props.testSMSProvider}
        setTestSMSProvider={props.setTestSMSProvider}
        testSMSPhone={props.testSMSPhone}
        setTestSMSPhone={props.setTestSMSPhone}
        testSMSContent={props.testSMSContent}
        setTestSMSContent={props.setTestSMSContent}
        siteLogoFieldValue={props.siteLogoFieldValue}
        backendOrigin={props.backendOrigin}
        smsProvider={props.smsProvider}
        smsTemplateProvider={props.smsTemplateProvider}
        onSaveSite={props.onSaveSite}
        onSaveEmail={props.onSaveEmail}
        onSaveVerification={props.onSaveVerification}
        onSaveIntl={props.onSaveIntl}
        onSaveSession={props.onSaveSession}
        onSaveSMS={props.onSaveSMS}
        onSaveAnnouncement={props.onSaveAnnouncement}
        onSaveRisk={props.onSaveRisk}
        onSaveRateLimit={props.onSaveRateLimit}
        onSaveScope={props.onSaveScope}
        onDeleteScope={props.onDeleteScope}
        onUploadSiteLogo={props.onUploadSiteLogo}
        onClearSiteLogo={props.onClearSiteLogo}
        onSendTestEmail={props.onSendTestEmail}
        onSendTestSMS={props.onSendTestSMS}
      />
    </Card>
  );
}
