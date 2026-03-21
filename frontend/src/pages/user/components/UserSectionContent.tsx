import { BindingsSection } from "./BindingsSection";
import { HelpSection } from "./HelpSection";
import { PrivacySection } from "./PrivacySection";
import { ProfileSection } from "./ProfileSection";
import { SecuritySection } from "./SecuritySection";
import type {
  Consent,
  CurrentUser,
  PasskeyItem,
  UserSectionKey,
} from "../types";
import type { AccountLocale } from "../../../i18n/accountLocale";

type UserSectionContentProps = {
  activeSection: UserSectionKey;
  user?: CurrentUser;
  phoneVerificationEnabled: boolean;
  passkeys: PasskeyItem[];
  passkeySupported: boolean;
  avatarUrl: string;
  effectiveDisplayName: string;
  genderLabel: string;
  preferredLocale: AccountLocale;
  uploadingAvatar: boolean;
  savingPreferredLocale: boolean;
  exportingUserData: boolean;
  deletingAccount: boolean;
  consents: Consent[];
  revokingConsentId?: string;
  selectedConsentIds: string[];
  batchRevoking: boolean;
  onEditPhone: () => void;
  onEditEmail: () => void;
  onEditPassword: () => void;
  onToggleMFA: (checked: boolean) => void;
  mfaUpdating: boolean;
  onAddPasskey: () => void;
  onDeletePasskey: (id: string) => void;
  onUploadAvatar: (file: File) => boolean;
  onEditDisplayName: () => void;
  onEditGender: () => void;
  onPreferredLocaleChange: (value: AccountLocale) => void;
  onSavePreferredLocale: () => void;
  onRequestExportUserData: () => void;
  onRequestDeleteAccount: () => void;
  onSelectionChange: (value: string[]) => void;
  onRevokeConsent: (id: string) => void;
  onOpenBatchRevoke: () => void;
};

export function UserSectionContent({
  activeSection,
  user,
  phoneVerificationEnabled,
  passkeys,
  passkeySupported,
  avatarUrl,
  effectiveDisplayName,
  genderLabel,
  preferredLocale,
  uploadingAvatar,
  savingPreferredLocale,
  exportingUserData,
  deletingAccount,
  consents,
  revokingConsentId,
  selectedConsentIds,
  batchRevoking,
  onEditPhone,
  onEditEmail,
  onEditPassword,
  onToggleMFA,
  mfaUpdating,
  onAddPasskey,
  onDeletePasskey,
  onUploadAvatar,
  onEditDisplayName,
  onEditGender,
  onPreferredLocaleChange,
  onSavePreferredLocale,
  onRequestExportUserData,
  onRequestDeleteAccount,
  onSelectionChange,
  onRevokeConsent,
  onOpenBatchRevoke,
}: UserSectionContentProps) {
  if (activeSection === "security") {
    return (
      <SecuritySection
        user={user}
        phoneVerificationEnabled={phoneVerificationEnabled}
        onEditPhone={onEditPhone}
        onEditEmail={onEditEmail}
        onEditPassword={onEditPassword}
        onToggleMFA={onToggleMFA}
        mfaUpdating={mfaUpdating}
        passkeys={passkeys}
        passkeySupported={passkeySupported}
        onAddPasskey={onAddPasskey}
        onDeletePasskey={onDeletePasskey}
      />
    );
  }

  if (activeSection === "profile") {
    return (
      <ProfileSection
        user={user}
        avatarUrl={avatarUrl}
        effectiveDisplayName={effectiveDisplayName}
        genderLabel={genderLabel}
        preferredLocale={preferredLocale}
        uploadingAvatar={uploadingAvatar}
        savingPreferredLocale={savingPreferredLocale}
        onUploadAvatar={onUploadAvatar}
        onEditDisplayName={onEditDisplayName}
        onEditGender={onEditGender}
        onPreferredLocaleChange={onPreferredLocaleChange}
        onSavePreferredLocale={onSavePreferredLocale}
      />
    );
  }

  if (activeSection === "privacy") {
    return (
      <PrivacySection
        user={user}
        exportingUserData={exportingUserData}
        deletingAccount={deletingAccount}
        onRequestExportUserData={onRequestExportUserData}
        onRequestDeleteAccount={onRequestDeleteAccount}
      />
    );
  }

  if (activeSection === "bindings") {
    return (
      <BindingsSection
        consents={consents}
        revokingConsentId={revokingConsentId}
        selectedConsentIds={selectedConsentIds}
        batchRevoking={batchRevoking}
        onSelectionChange={onSelectionChange}
        onRevokeConsent={onRevokeConsent}
        onOpenBatchRevoke={onOpenBatchRevoke}
      />
    );
  }

  return <HelpSection />;
}

