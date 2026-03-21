import { MenuOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Drawer } from "antd";
import { BatchRevokeModal } from "./components/BatchRevokeModal";
import { EditDisplayNameModal } from "./components/EditDisplayNameModal";
import { EditEmailModal } from "./components/EditEmailModal";
import { EditGenderModal } from "./components/EditGenderModal";
import { EditMFAModal } from "./components/EditMFAModal";
import { EditPasswordModal } from "./components/EditPasswordModal";
import { EditPhoneModal } from "./components/EditPhoneModal";
import { PasskeyManagementModals } from "./components/PasskeyManagementModals";
import { PrivacyActionModals } from "./components/PrivacyActionModals";
import { UserSectionContent } from "./components/UserSectionContent";
import { UserSidebar } from "./components/UserSidebar";
import { useUserPageController } from "./hooks/useUserPageController";

export function UserPage() {
  const controller = useUserPageController();

  if (!controller.sessionToken) {
    return null;
  }

  return (
    <div className="account-page">
      {controller.contextHolder}

      <div className="account-layout">
        {!controller.isMobile ? (
          <UserSidebar
            activeSection={controller.activeSection}
            avatarUrl={controller.avatarUrl}
            displayName={
              controller.effectiveDisplayName || controller.t("common.unsetShort")
            }
            contactLines={controller.contactLines}
            sectionItems={controller.sectionItems}
            onSectionChange={controller.openSection}
          />
        ) : null}

        <main className="account-main">
          {controller.user?.personal_announcement_enabled &&
          controller.user.personal_announcement_content ? (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              message={
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {controller.user.personal_announcement_content}
                </div>
              }
            />
          ) : null}
          {controller.userCenterAnnouncementEnabled &&
          controller.userCenterAnnouncementContent ? (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              message={
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {controller.userCenterAnnouncementContent}
                </div>
              }
            />
          ) : null}
          {controller.isMobile ? (
            <div className="account-mobile-toolbar">
              <Button
                icon={<MenuOutlined />}
                className="account-mobile-nav-button"
                onClick={() => controller.setMobileNavOpen(true)}
              >
                菜单
              </Button>
            </div>
          ) : null}
          <Card className="account-content-card" variant="borderless">
            <UserSectionContent
              activeSection={controller.activeSection}
              user={controller.user}
              phoneVerificationEnabled={controller.phoneVerificationEnabled}
              passkeys={controller.passkeys}
              passkeySupported={controller.passkeySupported}
              avatarUrl={controller.avatarUrl}
              effectiveDisplayName={controller.effectiveDisplayName}
              genderLabel={controller.genderLabel}
              preferredLocale={controller.preferredLocaleDraft}
              uploadingAvatar={controller.uploadingAvatar}
              savingPreferredLocale={controller.savingPreferredLocale}
              exportingUserData={controller.exportingUserData}
              deletingAccount={controller.deletingAccount}
              consents={controller.consents}
              revokingConsentId={controller.revokingConsentId}
              selectedConsentIds={controller.selectedConsentIds}
              batchRevoking={controller.batchRevoking}
              onEditPhone={() => controller.setEditingPhone(true)}
              onEditEmail={() => controller.setEditingEmail(true)}
              onEditPassword={() => controller.setEditingPassword(true)}
              onToggleMFA={controller.toggleMFA}
              mfaUpdating={controller.savingMFA}
              onAddPasskey={() => controller.setCreatingPasskey(true)}
              onDeletePasskey={(id) => {
                const nextItem =
                  controller.passkeys.find((item) => item.id === id) || null;
                controller.setDeletingPasskeyItem(nextItem);
              }}
              onUploadAvatar={controller.handleAvatarUpload}
              onEditDisplayName={() => {
                controller.setDisplayNameDraft(
                  controller.user?.display_name || "",
                );
                controller.setEditingDisplayName(true);
              }}
              onEditGender={() => {
                controller.setGenderDraft(controller.user?.gender || "");
                controller.setEditingGender(true);
              }}
              onPreferredLocaleChange={controller.setPreferredLocaleDraft}
              onSavePreferredLocale={() => {
                void controller.savePreferredLocale();
              }}
              onRequestExportUserData={() =>
                controller.setConfirmingExportUserData(true)
              }
              onRequestDeleteAccount={() =>
                controller.setConfirmingAccountDeletion(true)
              }
              onSelectionChange={controller.setSelectedConsentIds}
              onRevokeConsent={(id) => {
                void controller.revokeConsent(id);
              }}
              onOpenBatchRevoke={() => controller.setConfirmingBatchRevoke(true)}
            />
          </Card>
          <div className="account-footer-note">
            {controller.siteFooterText.trim() ? (
              <div className="account-footer-text">
                {controller.siteFooterText}
              </div>
            ) : null}
            <span>
              {controller.siteName} {controller.t("header.accountCenter")}
            </span>
            {controller.siteICPRecordNumber ? (
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noreferrer"
                className="account-footer-link"
              >
                {controller.siteICPRecordNumber}
              </a>
            ) : null}
            {controller.sitePublicSecurityRecordNumber ? (
              <a
                href={`https://beian.mps.gov.cn/#/query/webSearch?code=${controller.publicSecurityRecordQueryCode}`}
                target="_blank"
                rel="noreferrer"
                className="account-footer-link"
              >
                {controller.sitePublicSecurityRecordNumber}
              </a>
            ) : null}
          </div>
        </main>
      </div>

      <Drawer
        placement="left"
        open={controller.isMobile && controller.mobileNavOpen}
        onClose={() => controller.setMobileNavOpen(false)}
        width={320}
        className="account-mobile-drawer"
        closable
      >
        <UserSidebar
          activeSection={controller.activeSection}
          avatarUrl={controller.avatarUrl}
          displayName={
            controller.effectiveDisplayName || controller.t("common.unsetShort")
          }
          contactLines={controller.contactLines}
          sectionItems={controller.sectionItems}
          drawerMode
          onSectionChange={(nextSection) => {
            controller.setMobileNavOpen(false);
            controller.openSection(nextSection);
          }}
        />
      </Drawer>

      <EditDisplayNameModal
        open={controller.editingDisplayName}
        value={controller.displayNameDraft}
        saving={controller.savingDisplayName}
        onChange={controller.setDisplayNameDraft}
        onSave={() => void controller.saveDisplayName()}
        onCancel={() => {
          if (controller.savingDisplayName) {
            return;
          }
          controller.setDisplayNameDraft(controller.user?.display_name || "");
          controller.setEditingDisplayName(false);
        }}
      />

      <EditGenderModal
        open={controller.editingGender}
        value={controller.genderDraft}
        saving={controller.savingGender}
        onChange={controller.setGenderDraft}
        onSave={() => void controller.saveGender()}
        onCancel={() => {
          if (controller.savingGender) {
            return;
          }
          controller.setGenderDraft(controller.user?.gender || "");
          controller.setEditingGender(false);
        }}
      />

      <EditEmailModal
        open={controller.editingEmail}
        saving={controller.savingEmail}
        sendingCode={controller.sendingEmailCode}
        onSave={(values) => {
          void controller.saveEmail(values);
        }}
        onSendCode={(email) => {
          void controller.sendEmailChangeCode(email);
        }}
        onCancel={() => {
          if (controller.savingEmail || controller.sendingEmailCode) {
            return;
          }
          controller.setEditingEmail(false);
        }}
      />

      {controller.phoneVerificationEnabled ? (
        <EditPhoneModal
          open={controller.editingPhone}
          hasBoundPhone={Boolean(controller.user?.phone)}
          currentPhone={controller.user?.phone}
          saving={controller.savingPhone}
          sendingCurrentPhoneCode={controller.sendingCurrentPhoneCode}
          sendingNewPhoneCode={controller.sendingNewPhoneCode}
          onSave={(values) => {
            void controller.savePhone(values);
          }}
          onSendCurrentPhoneCode={() => {
            void controller.sendCurrentPhoneVerificationCode();
          }}
          onSendNewPhoneCode={(phone) => {
            void controller.sendPhoneChangeCode(phone);
          }}
          onCancel={() => {
            if (
              controller.savingPhone ||
              controller.sendingCurrentPhoneCode ||
              controller.sendingNewPhoneCode
            ) {
              return;
            }
            controller.setEditingPhone(false);
          }}
        />
      ) : null}

      <EditPasswordModal
        open={controller.editingPassword}
        saving={controller.savingPassword}
        onSave={(values) => {
          void controller.savePassword(values);
        }}
        onCancel={() => {
          if (controller.savingPassword) {
            return;
          }
          controller.setEditingPassword(false);
        }}
      />

      <EditMFAModal
        open={controller.editingMFA}
        mode={controller.mfaAction}
        saving={controller.savingMFA}
        requiresCurrentCode={Boolean(controller.user?.mfa_enabled)}
        sendingCurrentCode={controller.sendingCurrentMFACode}
        currentCodeRemainingSeconds={controller.currentMFACodeRemainingSeconds}
        hasEmail={Boolean(controller.user?.email)}
        hasPhone={Boolean(controller.user?.phone)}
        currentMethod={controller.user?.mfa_method}
        onSave={(values) => {
          void controller.saveMFA(values);
        }}
        onSendCurrentCode={(currentPassword) => {
          void controller.sendCurrentMFACode(currentPassword);
        }}
        onCancel={() => {
          if (
            controller.savingMFA ||
            controller.sendingCurrentMFACode
          ) {
            return;
          }
          controller.setEditingMFA(false);
        }}
      />

      <PasskeyManagementModals
        t={controller.t}
        userMfaEnabled={controller.user?.mfa_enabled}
        userMfaMethod={controller.user?.mfa_method}
        creatingPasskey={controller.creatingPasskey}
        savingPasskey={controller.savingPasskey}
        deletingPasskey={controller.deletingPasskey}
        deletingPasskeyItem={controller.deletingPasskeyItem}
        sendingCurrentMFACode={controller.sendingCurrentMFACode}
        currentMFACodeRemainingSeconds={
          controller.currentMFACodeRemainingSeconds
        }
        createPasskeyForm={controller.createPasskeyForm}
        deletePasskeyForm={controller.deletePasskeyForm}
        onAddPasskey={(values) => {
          void controller.addPasskey(values);
        }}
        onRemovePasskey={(values) => {
          void controller.removePasskey(values);
        }}
        onSendCurrentMFACode={(currentPassword) => {
          void controller.sendCurrentMFACode(currentPassword);
        }}
        onCloseCreate={() => {
          if (controller.savingPasskey) {
            return;
          }
          controller.createPasskeyForm.resetFields();
          controller.setCreatingPasskey(false);
        }}
        onCloseDelete={() => {
          if (controller.deletingPasskey) {
            return;
          }
          controller.deletePasskeyForm.resetFields();
          controller.setDeletingPasskeyItem(null);
        }}
      />

      <PrivacyActionModals
        t={controller.t}
        userPhone={controller.user?.phone}
        confirmingExportUserData={controller.confirmingExportUserData}
        exportingUserData={controller.exportingUserData}
        confirmingAccountDeletion={controller.confirmingAccountDeletion}
        deletingAccount={controller.deletingAccount}
        sendingDeleteEmailCode={controller.sendingDeleteEmailCode}
        sendingDeletePhoneCode={controller.sendingDeletePhoneCode}
        deleteEmailRemainingSeconds={controller.deleteEmailRemainingSeconds}
        deletePhoneRemainingSeconds={controller.deletePhoneRemainingSeconds}
        exportUserDataForm={controller.exportUserDataForm}
        deleteAccountForm={controller.deleteAccountForm}
        onExportUserData={(values) => {
          void controller.exportUserData(values);
        }}
        onDeleteAccount={(values) => {
          void controller.requestAccountDeletion(values);
        }}
        onSendDeleteEmailCode={() => {
          void controller.sendDeleteAccountEmailCode();
        }}
        onSendDeletePhoneCode={() => {
          void controller.sendDeleteAccountPhoneCode();
        }}
        onCloseExport={() => {
          if (controller.exportingUserData) {
            return;
          }
          controller.exportUserDataForm.resetFields();
          controller.setConfirmingExportUserData(false);
        }}
        onCloseDelete={() => {
          if (controller.deletingAccount) {
            return;
          }
          controller.deleteAccountForm.resetFields();
          controller.setConfirmingAccountDeletion(false);
        }}
      />

      <BatchRevokeModal
        open={controller.confirmingBatchRevoke}
        count={controller.selectedConsentIds.length}
        confirming={controller.batchRevoking}
        onConfirm={() => void controller.revokeSelectedConsents()}
        onCancel={() => {
          if (controller.batchRevoking) {
            return;
          }
          controller.setConfirmingBatchRevoke(false);
        }}
      />
    </div>
  );
}
