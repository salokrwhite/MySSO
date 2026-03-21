import type { FormInstance } from "antd";
import type { ScopeDefinition, SettingsTabKey, SystemSettings } from "../../types";
import { AnnouncementSettings } from "./settings-panels/AnnouncementSettings";
import { EmailSettings } from "./settings-panels/EmailSettings";
import { InternationalizationSettings } from "./settings-panels/InternationalizationSettings";
import { RateLimitSettings } from "./settings-panels/RateLimitSettings";
import { RiskControlSettings } from "./settings-panels/RiskControlSettings";
import { ScopeSettings } from "./settings-panels/ScopeSettings";
import { SessionSettings } from "./settings-panels/SessionSettings";
import { SiteSettings } from "./settings-panels/SiteSettings";
import { SMSSettings } from "./settings-panels/SMSSettings";
import { VerificationSettings } from "./settings-panels/VerificationSettings";

type SettingsTabContentProps = {
  tabKey: SettingsTabKey;
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

export function SettingsTabContent(props: SettingsTabContentProps) {
  if (props.tabKey === "site") {
    return (
      <SiteSettings
        form={props.siteForm}
        initialValues={props.settings}
        siteLogoFieldValue={props.siteLogoFieldValue}
        backendOrigin={props.backendOrigin}
        saving={props.savingSettings}
        onSave={props.onSaveSite}
        onUpload={props.onUploadSiteLogo}
        onClearLogo={props.onClearSiteLogo}
      />
    );
  }

  if (props.tabKey === "email") {
    return (
      <EmailSettings
        form={props.smtpForm}
        initialValues={props.settings}
        saving={props.savingSettings}
        testingEmail={props.testingEmail}
        testEmail={props.testEmail}
        setTestEmail={props.setTestEmail}
        onSave={props.onSaveEmail}
        onSendTest={props.onSendTestEmail}
      />
    );
  }

  if (props.tabKey === "session") {
    return (
      <SessionSettings
        form={props.sessionForm}
        initialValues={props.settings}
        saving={props.savingSettings}
        onSave={props.onSaveSession}
      />
    );
  }

  if (props.tabKey === "verification") {
    return (
      <VerificationSettings
        form={props.verificationForm}
        initialValues={props.settings}
        saving={props.savingSettings}
        onSave={props.onSaveVerification}
      />
    );
  }

  if (props.tabKey === "intl") {
    return (
      <InternationalizationSettings
        form={props.intlForm}
        initialValues={props.settings}
        saving={props.savingSettings}
        onSave={props.onSaveIntl}
      />
    );
  }

  if (props.tabKey === "sms") {
    return (
      <SMSSettings
        form={props.smsForm}
        initialValues={props.settings}
        saving={props.savingSettings}
        testingSMS={props.testingSMS}
        testSMSProvider={props.testSMSProvider}
        setTestSMSProvider={props.setTestSMSProvider}
        testSMSPhone={props.testSMSPhone}
        setTestSMSPhone={props.setTestSMSPhone}
        testSMSContent={props.testSMSContent}
        setTestSMSContent={props.setTestSMSContent}
        smsProvider={props.smsProvider}
        smsTemplateProvider={props.smsTemplateProvider}
        onSave={props.onSaveSMS}
        onSendTest={props.onSendTestSMS}
      />
    );
  }

  if (props.tabKey === "media") {
    return (
      <AnnouncementSettings
        form={props.announcementForm}
        initialValues={props.settings}
        saving={props.savingSettings}
        onSave={props.onSaveAnnouncement}
      />
    );
  }

  if (props.tabKey === "addons") {
    return (
      <RiskControlSettings
        form={props.riskForm}
        initialValues={props.settings}
        saving={props.savingSettings}
        onSave={props.onSaveRisk}
      />
    );
  }

  if (props.tabKey === "queue") {
    return (
      <RateLimitSettings
        form={props.rateLimitForm}
        initialValues={props.settings}
        saving={props.savingSettings}
        onSave={props.onSaveRateLimit}
      />
    );
  }

  if (props.tabKey === "scope") {
    return (
      <ScopeSettings
        scopes={props.scopes}
        savingScopeKey={props.savingScopeKey}
        deletingScopeKey={props.deletingScopeKey}
        onSave={props.onSaveScope}
        onDelete={props.onDeleteScope}
      />
    );
  }

  return null;
}
