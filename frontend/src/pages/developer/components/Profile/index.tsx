import {
  Avatar,
  Button,
  Card,
  Col,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
  message,
} from "antd";
import {
  AppstoreOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ACCOUNT_LOCALE_STORAGE_KEY,
  normalizeAccountLocale,
  type AccountLocale,
} from "../../../../i18n/accountLocale";
import { API_BASE, ApiError } from "../../../../api/client";
import { clearAllSessionMeta } from "../../../../authSession";
import { BatchRevokeModal } from "../../../user/components/BatchRevokeModal";
import { BindingsSection } from "../../../user/components/BindingsSection";
import { EditDisplayNameModal } from "../../../user/components/EditDisplayNameModal";
import { EditGenderModal } from "../../../user/components/EditGenderModal";
import { ProfileSection } from "../../../user/components/ProfileSection";
import {
  fetchUserAccountOverview,
  fetchUserConsents,
  revokeBatchConsentsRequest,
  revokeConsentRequest,
  updateUserConsentsCache,
  updateUserOverviewCache,
  updateUserProfile,
  uploadUserAvatarRequest,
} from "../../../user/services/userApi";
import type { Consent, CurrentUser } from "../../../user/types";
import { formatDateTime } from "../../../user/utils";
import { useDeveloperTranslation } from "../../i18n";

type DeveloperProfileProps = {
  sessionToken: string;
};

async function convertImageToWebp(file: File, failedMessage: string) {
  const imageURL = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error(failedMessage));
      nextImage.src = imageURL;
    });
    const targetSize = 320;
    const cropSize = Math.min(image.width, image.height);
    const offsetX = (image.width - cropSize) / 2;
    const offsetY = (image.height - cropSize) / 2;
    const canvas = document.createElement("canvas");
    canvas.width = targetSize;
    canvas.height = targetSize;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error(failedMessage);
    }
    context.drawImage(
      image,
      offsetX,
      offsetY,
      cropSize,
      cropSize,
      0,
      0,
      targetSize,
      targetSize,
    );
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), "image/webp", 0.9);
    });
    if (!blob) {
      throw new Error(failedMessage);
    }
    return blob;
  } finally {
    URL.revokeObjectURL(imageURL);
  }
}

export function DeveloperProfile({ sessionToken }: DeveloperProfileProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const { t: developerT } = useDeveloperTranslation();
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<CurrentUser>();
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [savingDisplayName, setSavingDisplayName] = useState(false);
  const [displayNameDraft, setDisplayNameDraft] = useState("");
  const [editingGender, setEditingGender] = useState(false);
  const [savingGender, setSavingGender] = useState(false);
  const [genderDraft, setGenderDraft] = useState("");
  const [preferredLocaleDraft, setPreferredLocaleDraft] =
    useState<AccountLocale>(() =>
      normalizeAccountLocale(localStorage.getItem(ACCOUNT_LOCALE_STORAGE_KEY)),
    );
  const [savingPreferredLocale, setSavingPreferredLocale] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [revokingConsentId, setRevokingConsentId] = useState<string>();
  const [selectedConsentIds, setSelectedConsentIds] = useState<string[]>([]);
  const [batchRevoking, setBatchRevoking] = useState(false);
  const [confirmingBatchRevoke, setConfirmingBatchRevoke] = useState(false);
  const backendOrigin = API_BASE.replace(/\/api$/, "");

  const avatarUrl = useMemo(() => {
    if (!user?.avatar_url) {
      return "";
    }
    return user.avatar_url.startsWith("http")
      ? user.avatar_url
      : `${backendOrigin}${user.avatar_url}`;
  }, [backendOrigin, user?.avatar_url]);

  const effectiveDisplayName = useMemo(() => {
    const rawDisplayName = user?.display_name?.trim() || "";
    const emailPrefix = user?.email?.split("@")[0]?.trim() || "";
    if (emailPrefix && rawDisplayName === emailPrefix) {
      return "";
    }
    return rawDisplayName;
  }, [user?.display_name, user?.email]);

  const genderLabel = useMemo(() => {
    switch (user?.gender) {
      case "male":
        return t("profile.genderMale");
      case "female":
        return t("profile.genderFemale");
      case "other":
        return t("profile.genderOther");
      default:
        return t("common.unset");
    }
  }, [t, user?.gender]);

  const statusLabel = useMemo(() => {
    switch (user?.status) {
      case "active":
        return developerT("profile.status.active");
      case "frozen":
        return developerT("profile.status.frozen");
      case "pending":
        return developerT("profile.status.pending");
      case "deleting":
        return developerT("profile.status.deleting");
      default:
        return user?.status || "-";
    }
  }, [developerT, user?.status]);

  function redirectToLogin() {
    clearAllSessionMeta();
    window.location.assign("/login?redirect=/developer/profile");
  }

  async function loadProfile() {
    try {
      setLoading(true);
      const [overview, nextConsents] = await Promise.all([
        fetchUserAccountOverview(sessionToken),
        fetchUserConsents(sessionToken),
      ]);
      setUser(overview.user);
      setConsents(nextConsents);
      updateUserOverviewCache(overview.user, sessionToken);
      updateUserConsentsCache(nextConsents, sessionToken);
      setDisplayNameDraft(overview.user.display_name || "");
      setGenderDraft(overview.user.gender || "");
      setPreferredLocaleDraft(
        normalizeAccountLocale(overview.user.preferred_locale),
      );
      setSelectedConsentIds((current) =>
        current.filter((id) => nextConsents.some((item) => item.id === id)),
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        redirectToLogin();
        return;
      }
      messageApi.error(
        err instanceof Error ? err.message : developerT("profile.loadFailed"),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
  }, [sessionToken]);

  async function saveDisplayName() {
    try {
      setSavingDisplayName(true);
      const result = await updateUserProfile(sessionToken, {
        display_name: displayNameDraft.trim(),
      });
      setUser(result.user);
      updateUserOverviewCache(result.user, sessionToken);
      setDisplayNameDraft(result.user.display_name || "");
      setEditingDisplayName(false);
      messageApi.success(developerT("profile.updateSuccess"));
    } catch (err) {
      messageApi.error(
        err instanceof Error ? err.message : developerT("profile.updateFailed"),
      );
    } finally {
      setSavingDisplayName(false);
    }
  }

  async function saveGender() {
    try {
      setSavingGender(true);
      const result = await updateUserProfile(sessionToken, {
        gender: genderDraft,
      });
      setUser(result.user);
      updateUserOverviewCache(result.user, sessionToken);
      setGenderDraft(result.user.gender || "");
      setEditingGender(false);
      messageApi.success(developerT("profile.updateSuccess"));
    } catch (err) {
      messageApi.error(
        err instanceof Error ? err.message : developerT("profile.updateFailed"),
      );
    } finally {
      setSavingGender(false);
    }
  }

  async function savePreferredLocale() {
    try {
      setSavingPreferredLocale(true);
      const result = await updateUserProfile(sessionToken, {
        preferred_locale: preferredLocaleDraft,
      });
      setUser(result.user);
      updateUserOverviewCache(result.user, sessionToken);
      const nextLocale = normalizeAccountLocale(
        result.user.preferred_locale || preferredLocaleDraft,
      );
      setPreferredLocaleDraft(nextLocale);
      localStorage.setItem(ACCOUNT_LOCALE_STORAGE_KEY, nextLocale);
      await i18n.changeLanguage(nextLocale);
      messageApi.success(developerT("profile.updateSuccess"));
    } catch (err) {
      messageApi.error(
        err instanceof Error ? err.message : developerT("profile.updateFailed"),
      );
    } finally {
      setSavingPreferredLocale(false);
    }
  }

  function handleAvatarUpload(file: File) {
    setUploadingAvatar(true);
    void convertImageToWebp(file, t("common.avatarConvertFailed"))
      .then((webpBlob) => uploadUserAvatarRequest(webpBlob))
      .then((nextAvatarURL) => {
        setUser((current) => {
          const nextUser = current
            ? { ...current, avatar_url: nextAvatarURL }
            : current;
          if (nextUser) {
            updateUserOverviewCache(nextUser, sessionToken);
          }
          return nextUser;
        });
        messageApi.success(developerT("profile.updateSuccess"));
      })
      .catch((err) => {
        messageApi.error(
          err instanceof Error ? err.message : t("common.avatarUploadFailed"),
        );
      })
      .finally(() => setUploadingAvatar(false));
    return false;
  }

  async function revokeConsent(id: string) {
    try {
      setRevokingConsentId(id);
      await revokeConsentRequest(sessionToken, id);
      setConsents((current) => {
        const nextItems = current.filter((item) => item.id !== id);
        updateUserConsentsCache(nextItems, sessionToken);
        return nextItems;
      });
      setSelectedConsentIds((current) => current.filter((item) => item !== id));
      messageApi.success(t("common.revokeSuccess"));
    } catch (err) {
      messageApi.error(
        err instanceof Error ? err.message : t("common.revokeFailed"),
      );
    } finally {
      setRevokingConsentId(undefined);
    }
  }

  async function revokeSelectedConsents() {
    if (selectedConsentIds.length === 0) {
      return;
    }
    try {
      setBatchRevoking(true);
      await revokeBatchConsentsRequest(sessionToken, selectedConsentIds);
      const revokedIDs = new Set(selectedConsentIds);
      setConsents((current) => {
        const nextItems = current.filter((item) => !revokedIDs.has(item.id));
        updateUserConsentsCache(nextItems, sessionToken);
        return nextItems;
      });
      setSelectedConsentIds([]);
      setConfirmingBatchRevoke(false);
      messageApi.success(t("common.revokeSuccess"));
    } catch (err) {
      messageApi.error(
        err instanceof Error ? err.message : t("common.revokeFailed"),
      );
    } finally {
      setBatchRevoking(false);
    }
  }

  return (
    <div className="admin-profile-page">
      {contextHolder}
      <Card className="admin-profile-hero-card" loading={loading}>
        <div className="admin-profile-hero">
          <Space size={18} align="center" className="admin-profile-identity">
            <Avatar
              size={72}
              src={avatarUrl || undefined}
              icon={!avatarUrl ? <UserOutlined /> : undefined}
              className="admin-profile-avatar"
            />
            <div>
              <Space size={10} wrap>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {effectiveDisplayName || user?.email || developerT("appLayout.role")}
                </Typography.Title>
                <Tag color="blue">{developerT("appLayout.role")}</Tag>
              </Space>
            </div>
          </Space>
          <Button onClick={() => void loadProfile()}>
            {developerT("common.refresh")}
          </Button>
        </div>
        <Row gutter={[16, 16]} className="admin-profile-stats">
          <Col xs={24} sm={12} lg={8}>
            <Statistic
              title={developerT("profile.accountStatus")}
              value={statusLabel}
              prefix={<SafetyCertificateOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Statistic
              title={developerT("profile.authorizedApps")}
              value={consents.length}
              prefix={<AppstoreOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Statistic
              title={developerT("profile.createdAt")}
              value={formatDateTime(user?.created_at)}
              prefix={<CalendarOutlined />}
            />
          </Col>
        </Row>
      </Card>

      <Row gutter={[20, 20]} align="stretch">
        <Col xs={24} xl={10}>
          <Card className="admin-profile-card" variant="borderless">
            <ProfileSection
              user={user}
              avatarUrl={avatarUrl}
              effectiveDisplayName={effectiveDisplayName}
              genderLabel={genderLabel}
              preferredLocale={preferredLocaleDraft}
              uploadingAvatar={uploadingAvatar}
              savingPreferredLocale={savingPreferredLocale}
              showEmail
              hideLanguagePreference
              onUploadAvatar={handleAvatarUpload}
              onEditDisplayName={() => {
                setDisplayNameDraft(user?.display_name || "");
                setEditingDisplayName(true);
              }}
              onEditGender={() => {
                setGenderDraft(user?.gender || "");
                setEditingGender(true);
              }}
              onPreferredLocaleChange={setPreferredLocaleDraft}
              onSavePreferredLocale={() => void savePreferredLocale()}
            />
          </Card>
        </Col>
        <Col xs={24} xl={14}>
          <Card className="admin-profile-card admin-profile-bindings-card" variant="borderless">
            <BindingsSection
              consents={consents}
              revokingConsentId={revokingConsentId}
              selectedConsentIds={selectedConsentIds}
              batchRevoking={batchRevoking}
              onSelectionChange={setSelectedConsentIds}
              onRevokeConsent={(id) => void revokeConsent(id)}
              onOpenBatchRevoke={() => setConfirmingBatchRevoke(true)}
            />
          </Card>
        </Col>
      </Row>

      <EditDisplayNameModal
        open={editingDisplayName}
        value={displayNameDraft}
        saving={savingDisplayName}
        onChange={setDisplayNameDraft}
        onSave={() => void saveDisplayName()}
        onCancel={() => {
          if (savingDisplayName) {
            return;
          }
          setDisplayNameDraft(user?.display_name || "");
          setEditingDisplayName(false);
        }}
      />
      <EditGenderModal
        open={editingGender}
        value={genderDraft}
        saving={savingGender}
        onChange={setGenderDraft}
        onSave={() => void saveGender()}
        onCancel={() => {
          if (savingGender) {
            return;
          }
          setGenderDraft(user?.gender || "");
          setEditingGender(false);
        }}
      />
      <BatchRevokeModal
        open={confirmingBatchRevoke}
        count={selectedConsentIds.length}
        confirming={batchRevoking}
        onConfirm={() => void revokeSelectedConsents()}
        onCancel={() => {
          if (batchRevoking) {
            return;
          }
          setConfirmingBatchRevoke(false);
        }}
      />
    </div>
  );
}
