import { Form, Grid, message } from "antd";
import { API_BASE, ApiError } from "../../../api/client";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  setLastEmailCodeTarget,
  useEmailCodeCooldown,
} from "../../../utils/emailCodeCooldown";
import { buildSearchString, withUpdatedSearch } from "../../../utils/urlState";
import i18n, {
  ACCOUNT_LOCALE_STORAGE_KEY,
  normalizeAccountLocale,
  type AccountLocale,
} from "../../../i18n/accountLocale";
import { clearAllSessionMeta, readSessionToken } from "../../../authSession";
import {
  getStoredSiteName,
  persistSiteBranding,
  resolveSiteNameForLocale,
} from "../../../siteBranding";
import {
  browserSupportsPasskey,
  createPasskeyCredential,
} from "../../../utils/webauthn";
import { useCaptchaGate } from "../../../hooks/useCaptchaGate";
import { getSectionItems } from "../constants";
import type {
  Consent,
  CurrentUser,
  PasskeyItem,
  UserSectionKey,
} from "../types";
import { translateAccountError } from "../utils/accountErrors";
import { clearBrowserSession } from "../utils/session";
import {
  deleteAccountRequest,
  deletePasskeyRequest,
  exportUserDataRequest,
  fetchPublicSiteBranding,
  fetchPublicUserSettings,
  fetchUserAccountOverview,
  fetchUserConsents,
  fetchUserPasskeys,
  preparePasskeyRegistration,
  revokeBatchConsentsRequest,
  revokeConsentRequest,
  sendCurrentMFACodeRequest,
  sendEmailCode,
  sendPhoneCode,
  updateUserConsentsCache,
  updateUserOverviewCache,
  updateUserPasskeysCache,
  updateUserEmail,
  updateUserMFA,
  updateUserPassword,
  updateUserPhone,
  updateUserProfile,
  uploadUserAvatarRequest,
  verifyPasskeyRegistration,
} from "../services/userApi";

type SaveEmailValues = {
  email: string;
  code: string;
  current_password: string;
};

type SavePhoneValues = {
  current_phone_code?: string;
  phone: string;
  code: string;
  current_password: string;
};

type SavePasswordValues = {
  current_password: string;
  new_password: string;
};

type SaveMFAValues = {
  method?: "email" | "sms";
  current_password: string;
  current_mfa_code?: string;
};

type PasskeyValues = {
  name: string;
  current_password: string;
  current_mfa_code?: string;
};

type DeletePasskeyValues = {
  current_password: string;
  current_mfa_code?: string;
};

type DeleteAccountValues = {
  current_password: string;
  email_code: string;
  phone_code?: string;
};

type ExportUserDataValues = {
  current_password: string;
};

async function convertImageToWebp(file: File, t: (key: string) => string) {
  const imageURL = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error(t("common.imageReadFailed")));
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
      throw new Error(t("common.imageProcessUnsupported"));
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
      throw new Error(t("common.avatarConvertFailed"));
    }
    return blob;
  } finally {
    URL.revokeObjectURL(imageURL);
  }
}

export function useUserPageController() {
  const sessionToken = readSessionToken();
  const [messageApi, contextHolder] = message.useMessage();
  const { requestCaptcha, captchaModal } = useCaptchaGate();
  const { t } = useTranslation();
  const screens = Grid.useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();
  const { section } = useParams<{ section?: string }>();
  const sharedSearch = buildSearchString(location.search);

  const [siteName, setSiteName] = useState(getStoredSiteName(i18n.language));
  const [siteFooterText, setSiteFooterText] = useState(
    localStorage.getItem("site_footer_text") || "",
  );
  const [siteICPRecordNumber, setSiteICPRecordNumber] = useState(
    localStorage.getItem("site_icp_record_number") || "",
  );
  const [sitePublicSecurityRecordNumber, setSitePublicSecurityRecordNumber] =
    useState(localStorage.getItem("site_public_security_record_number") || "");
  const [userCenterAnnouncementEnabled, setUserCenterAnnouncementEnabled] =
    useState(false);
  const [userCenterAnnouncementContent, setUserCenterAnnouncementContent] =
    useState("");
  const [phoneVerificationEnabled, setPhoneVerificationEnabled] =
    useState(true);
  const [user, setUser] = useState<CurrentUser>();
  const [consents, setConsents] = useState<Consent[]>([]);
  const [error, setError] = useState<string>();
  const [passkeys, setPasskeys] = useState<PasskeyItem[]>([]);
  const [passkeysLoaded, setPasskeysLoaded] = useState(false);
  const [consentsLoaded, setConsentsLoaded] = useState(false);
  const [revokingConsentId, setRevokingConsentId] = useState<string>();
  const [selectedConsentIds, setSelectedConsentIds] = useState<string[]>([]);
  const [batchRevoking, setBatchRevoking] = useState(false);
  const [confirmingBatchRevoke, setConfirmingBatchRevoke] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [savingDisplayName, setSavingDisplayName] = useState(false);
  const [displayNameDraft, setDisplayNameDraft] = useState("");
  const [editingGender, setEditingGender] = useState(false);
  const [savingGender, setSavingGender] = useState(false);
  const [genderDraft, setGenderDraft] = useState("");
  const [preferredLocaleDraft, setPreferredLocaleDraft] =
    useState<AccountLocale>(
      normalizeAccountLocale(localStorage.getItem(ACCOUNT_LOCALE_STORAGE_KEY)),
    );
  const [savingPreferredLocale, setSavingPreferredLocale] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [sendingEmailCode, setSendingEmailCode] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [sendingCurrentPhoneCode, setSendingCurrentPhoneCode] = useState(false);
  const [sendingNewPhoneCode, setSendingNewPhoneCode] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [editingMFA, setEditingMFA] = useState(false);
  const [creatingPasskey, setCreatingPasskey] = useState(false);
  const [savingPasskey, setSavingPasskey] = useState(false);
  const [deletingPasskey, setDeletingPasskey] = useState(false);
  const [deletingPasskeyItem, setDeletingPasskeyItem] =
    useState<PasskeyItem | null>(null);
  const [mfaAction, setMFAAction] = useState<"enable" | "disable">("enable");
  const [savingMFA, setSavingMFA] = useState(false);
  const [sendingCurrentMFACode, setSendingCurrentMFACode] = useState(false);
  const [confirmingAccountDeletion, setConfirmingAccountDeletion] =
    useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [confirmingExportUserData, setConfirmingExportUserData] =
    useState(false);
  const [exportingUserData, setExportingUserData] = useState(false);
  const [sendingDeleteEmailCode, setSendingDeleteEmailCode] = useState(false);
  const [sendingDeletePhoneCode, setSendingDeletePhoneCode] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [deleteAccountForm] = Form.useForm<DeleteAccountValues>();
  const [exportUserDataForm] = Form.useForm<ExportUserDataValues>();
  const [createPasskeyForm] = Form.useForm<PasskeyValues>();
  const [deletePasskeyForm] = Form.useForm<DeletePasskeyValues>();

  const [emailCodeTarget, setEmailCodeTarget] = useState("");
  const [currentPhoneCodeTarget, setCurrentPhoneCodeTarget] = useState("");
  const [phoneCodeTarget, setPhoneCodeTarget] = useState("");
  const backendOrigin = useMemo(() => API_BASE.replace(/\/api$/, ""), []);

  const { startCooldown: startEmailCodeCooldown } = useEmailCodeCooldown(
    emailCodeTarget,
    "change_email",
  );
  const { startCooldown: startCurrentPhoneCodeCooldown } = useEmailCodeCooldown(
    currentPhoneCodeTarget,
    "verify_current_phone",
  );
  const { startCooldown: startPhoneCodeCooldown } = useEmailCodeCooldown(
    phoneCodeTarget,
    "change_phone",
  );

  const currentMFAChallengeTarget = (
    user?.mfa_method === "sms"
      ? user?.phone || ""
      : user?.mfa_method === "email"
        ? user?.email || ""
        : ""
  )
    .trim()
    .toLowerCase();

  const {
    remainingSeconds: currentMFACodeRemainingSeconds,
    startCooldown: startCurrentMFACodeCooldown,
  } = useEmailCodeCooldown(currentMFAChallengeTarget, "mfa_login");

  const deleteAccountEmailTarget = (user?.email || "").trim().toLowerCase();
  const deleteAccountPhoneTarget = (user?.phone || "").trim();
  const {
    remainingSeconds: deleteEmailRemainingSeconds,
    startCooldown: startDeleteEmailCooldown,
  } = useEmailCodeCooldown(deleteAccountEmailTarget, "delete_account");
  const {
    remainingSeconds: deletePhoneRemainingSeconds,
    startCooldown: startDeletePhoneCooldown,
  } = useEmailCodeCooldown(deleteAccountPhoneTarget, "delete_account");

  const isMobile = !screens.lg;
  const passkeySupported = browserSupportsPasskey();
  const sectionItems = useMemo(() => getSectionItems(t), [t]);
  const activeSection = useMemo<UserSectionKey>(() => {
    if (section && sectionItems.some((item) => item.key === section)) {
      return section as UserSectionKey;
    }
    return "security";
  }, [section, sectionItems]);

  const contactLines = useMemo(() => {
    const lines: string[] = [];
    if (user?.phone?.trim()) {
      lines.push(user.phone.trim());
    }
    if (user?.email?.trim()) {
      lines.push(user.email.trim());
    }
    return lines.length > 0 ? lines : ["-"];
  }, [user?.email, user?.phone]);

  const effectiveDisplayName = useMemo(() => {
    const rawDisplayName = user?.display_name?.trim() || "";
    if (!rawDisplayName) {
      return "";
    }
    const emailPrefix = user?.email?.split("@")[0]?.trim() || "";
    if (emailPrefix && rawDisplayName === emailPrefix) {
      return "";
    }
    return rawDisplayName;
  }, [user?.display_name, user?.email]);

  const avatarUrl = useMemo(() => {
    if (!user?.avatar_url) {
      return "";
    }
    return user.avatar_url.startsWith("http")
      ? user.avatar_url
      : `${backendOrigin}${user.avatar_url}`;
  }, [backendOrigin, user?.avatar_url]);

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

  const publicSecurityRecordQueryCode = useMemo(
    () => sitePublicSecurityRecordNumber.replace(/\D/g, ""),
    [sitePublicSecurityRecordNumber],
  );

  async function redirectToLogin() {
    clearAllSessionMeta();
    clearBrowserSession();
    navigate(
      {
        pathname: "/login",
        search: withUpdatedSearch(location.search, {
          redirect: location.pathname,
        }),
      },
      { replace: true },
    );
  }

  async function loadUser() {
    try {
      const result = await fetchUserAccountOverview(sessionToken);
      setUser(result.user);
      updateUserOverviewCache(result.user, sessionToken);
      setDisplayNameDraft(result.user.display_name || "");
      setGenderDraft(result.user.gender || "");
      setPreferredLocaleDraft(
        normalizeAccountLocale(result.user.preferred_locale),
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        void redirectToLogin();
        return;
      }
      if (err instanceof Error && err.message.toLowerCase().includes("session")) {
        void redirectToLogin();
        return;
      }
      setError(err instanceof Error ? err.message : t("common.loadingFailed"));
    }
  }

  async function loadConsents() {
    try {
      const items = await fetchUserConsents(sessionToken);
      setConsents(items);
      updateUserConsentsCache(items, sessionToken);
      setConsentsLoaded(true);
      setSelectedConsentIds((current) =>
        current.filter((id) => items.some((item) => item.id === id)),
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        void redirectToLogin();
        return;
      }
      if (err instanceof Error && err.message.toLowerCase().includes("session")) {
        void redirectToLogin();
        return;
      }
      setError(err instanceof Error ? err.message : t("common.loadingFailed"));
    }
  }

  async function loadPasskeys() {
    try {
      const items = await fetchUserPasskeys(sessionToken);
      setPasskeys(items);
      updateUserPasskeysCache(items, sessionToken);
      setPasskeysLoaded(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        void redirectToLogin();
        return;
      }
      if (err instanceof Error && err.message.toLowerCase().includes("session")) {
        void redirectToLogin();
        return;
      }
      setError(err instanceof Error ? err.message : t("common.loadingFailed"));
    }
  }

  useEffect(() => {
    if (!error) {
      return;
    }
    messageApi.error(error);
    setError(undefined);
  }, [error, messageApi]);

  useEffect(() => {
    let active = true;
    void fetchPublicUserSettings()
      .then((result) => {
        if (!active) {
          return;
        }
        setUserCenterAnnouncementEnabled(
          result.data?.user_center_announcement_enabled === true,
        );
        setUserCenterAnnouncementContent(
          String(result.data?.user_center_announcement_content || "").trim(),
        );
        setPhoneVerificationEnabled(
          result.data?.enable_phone_verification !== false,
        );
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setUserCenterAnnouncementEnabled(false);
        setUserCenterAnnouncementContent("");
        setPhoneVerificationEnabled(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!sessionToken) {
      void redirectToLogin();
      return;
    }
    if (!section || !sectionItems.some((item) => item.key === section)) {
      navigate(`/me/security${sharedSearch}`, { replace: true });
    }
  }, [navigate, section, sectionItems, sessionToken, sharedSearch]);

  useEffect(() => {
    if (!sessionToken) {
      return;
    }
    void loadUser();
  }, [sessionToken, t]);

  useEffect(() => {
    if (!sessionToken || activeSection !== "security" || passkeysLoaded) {
      return;
    }
    void loadPasskeys();
  }, [activeSection, passkeysLoaded, sessionToken]);

  useEffect(() => {
    if (!sessionToken || activeSection !== "bindings" || consentsLoaded) {
      return;
    }
    void loadConsents();
  }, [activeSection, consentsLoaded, sessionToken]);

  useEffect(() => {
    if (!isMobile) {
      setMobileNavOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    setSiteName(getStoredSiteName(i18n.language));
  }, [i18n.language]);

  useEffect(() => {
    void fetchPublicSiteBranding()
      .then((result) => {
        const nextName = resolveSiteNameForLocale(
          i18n.language,
          result.data.site_name,
          result.data.site_name_en,
        );
        const nextFooterText = result.data.site_footer_text || "";
        const nextICPRecordNumber =
          result.data.site_icp_record_number?.trim() || "";
        const nextPublicSecurityRecordNumber =
          result.data.site_public_security_record_number?.trim() || "";
        persistSiteBranding(result.data);
        setSiteName(nextName);
        setSiteFooterText(nextFooterText);
        setSiteICPRecordNumber(nextICPRecordNumber);
        setSitePublicSecurityRecordNumber(nextPublicSecurityRecordNumber);
        localStorage.setItem("site_footer_text", nextFooterText);
        localStorage.setItem("site_icp_record_number", nextICPRecordNumber);
        localStorage.setItem(
          "site_public_security_record_number",
          nextPublicSecurityRecordNumber,
        );
      })
      .catch(() => undefined);
  }, [i18n.language]);

  async function uploadUserAvatar(file: File) {
    const webpBlob = await convertImageToWebp(file, t);
    const nextAvatarURL = await uploadUserAvatarRequest(webpBlob);
    setUser((current) => {
      const nextUser = current
        ? { ...current, avatar_url: nextAvatarURL }
        : current;
      if (nextUser) {
        updateUserOverviewCache(nextUser, sessionToken);
      }
      return nextUser;
    });
    messageApi.success(t("common.avatarUpdated"));
  }

  async function revokeConsent(id: string) {
    setRevokingConsentId(id);
    try {
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
    setBatchRevoking(true);
    try {
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

  async function saveDisplayName() {
    setSavingDisplayName(true);
    setError(undefined);
    try {
      const result = await updateUserProfile(sessionToken, {
        display_name: displayNameDraft.trim(),
      });
      setUser(result.user);
      updateUserOverviewCache(result.user, sessionToken);
      setDisplayNameDraft(result.user.display_name || "");
      setEditingDisplayName(false);
      messageApi.success(t("common.profileUpdated"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("common.profileUpdateFailed"),
      );
    } finally {
      setSavingDisplayName(false);
    }
  }

  async function saveGender() {
    setSavingGender(true);
    setError(undefined);
    try {
      const result = await updateUserProfile(sessionToken, {
        gender: genderDraft,
      });
      setUser(result.user);
      updateUserOverviewCache(result.user, sessionToken);
      setGenderDraft(result.user.gender || "");
      setEditingGender(false);
      messageApi.success(t("common.profileUpdated"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("common.profileUpdateFailed"),
      );
    } finally {
      setSavingGender(false);
    }
  }

  async function savePreferredLocale() {
    try {
      setSavingPreferredLocale(true);
      setError(undefined);
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
      await loadUser();
      messageApi.success(t("profile.languagePreferenceSaved"));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("profile.languagePreferenceSaveFailed"),
      );
    } finally {
      setSavingPreferredLocale(false);
    }
  }

  async function sendEmailChangeCode(email: string) {
    try {
      setSendingEmailCode(true);
      setError(undefined);
      setEmailCodeTarget(email);
      setLastEmailCodeTarget(email, "change_email");
      const captchaPayload = await requestCaptcha({
        flow: "email_code",
        purpose: "change_email",
        target: email,
      });
      const result = await sendEmailCode({
        email,
        purpose: "change_email",
        ...captchaPayload,
      });
      startEmailCodeCooldown(Number(result.cooldown_seconds || 0), email);
      messageApi.success(t("common.sendCodeSuccess"));
    } catch (err) {
      if (err instanceof ApiError) {
        const retryAfterSeconds = Number(err.payload.retry_after_seconds || 0);
        if (retryAfterSeconds > 0) {
          startEmailCodeCooldown(retryAfterSeconds, email);
          return;
        }
      }
      setError(err instanceof Error ? err.message : t("common.loadingFailed"));
    } finally {
      setSendingEmailCode(false);
    }
  }

  async function sendPhoneChangeCode(phone: string) {
    try {
      setSendingNewPhoneCode(true);
      setPhoneCodeTarget(phone);
      setLastEmailCodeTarget(phone, "change_phone");
      const captchaPayload = await requestCaptcha({
        flow: "sms_code",
        purpose: "change_phone",
        target: phone,
      });
      const result = await sendPhoneCode(sessionToken, {
        phone,
        purpose: "change_phone",
        ...captchaPayload,
      });
      startPhoneCodeCooldown(Number(result.cooldown_seconds || 0), phone);
      messageApi.success(t("common.sendCodeSuccess"));
    } catch (err) {
      if (err instanceof ApiError) {
        const retryAfterSeconds = Number(err.payload.retry_after_seconds || 0);
        if (retryAfterSeconds > 0) {
          startPhoneCodeCooldown(retryAfterSeconds, phone);
        }
      }
      messageApi.error(
        translateAccountError(
          err instanceof Error ? err.message : t("common.loadingFailed"),
          t,
        ),
      );
    } finally {
      setSendingNewPhoneCode(false);
    }
  }

  async function sendCurrentPhoneVerificationCode() {
    if (!user?.phone) {
      return;
    }
    try {
      setSendingCurrentPhoneCode(true);
      setCurrentPhoneCodeTarget(user.phone);
      setLastEmailCodeTarget(user.phone, "verify_current_phone");
      const captchaPayload = await requestCaptcha({
        flow: "sms_code",
        purpose: "verify_current_phone",
        target: user.phone,
      });
      const result = await sendPhoneCode(sessionToken, {
        phone: user.phone,
        purpose: "verify_current_phone",
        ...captchaPayload,
      });
      startCurrentPhoneCodeCooldown(
        Number(result.cooldown_seconds || 0),
        user.phone,
      );
      messageApi.success(t("common.sendCodeSuccess"));
    } catch (err) {
      if (err instanceof ApiError) {
        const retryAfterSeconds = Number(err.payload.retry_after_seconds || 0);
        if (retryAfterSeconds > 0) {
          startCurrentPhoneCodeCooldown(retryAfterSeconds, user.phone);
        }
      }
      messageApi.error(
        translateAccountError(
          err instanceof Error ? err.message : t("common.loadingFailed"),
          t,
        ),
      );
    } finally {
      setSendingCurrentPhoneCode(false);
    }
  }

  async function saveEmail(values: SaveEmailValues) {
    try {
      setSavingEmail(true);
      setError(undefined);
      const result = await updateUserEmail(sessionToken, {
        email: values.email.trim(),
        code: values.code.trim(),
        current_password: values.current_password.trim(),
      });
      setUser(result.user);
      updateUserOverviewCache(result.user, sessionToken);
      setEditingEmail(false);
      messageApi.success(t("common.profileUpdated"));
    } catch (err) {
      setError(
        translateAccountError(
          err instanceof Error ? err.message : t("common.profileUpdateFailed"),
          t,
        ),
      );
    } finally {
      setSavingEmail(false);
    }
  }

  async function savePhone(values: SavePhoneValues) {
    try {
      setSavingPhone(true);
      setError(undefined);
      const result = await updateUserPhone(sessionToken, {
        phone: values.phone.trim(),
        code: values.code.trim(),
        current_phone_code: values.current_phone_code?.trim() || "",
        current_password: values.current_password.trim(),
      });
      setUser(result.user);
      updateUserOverviewCache(result.user, sessionToken);
      setEditingPhone(false);
      messageApi.success(t("common.profileUpdated"));
    } catch (err) {
      setError(
        translateAccountError(
          err instanceof Error ? err.message : t("common.profileUpdateFailed"),
          t,
        ),
      );
    } finally {
      setSavingPhone(false);
    }
  }

  async function savePassword(values: SavePasswordValues) {
    try {
      setSavingPassword(true);
      setError(undefined);
      await updateUserPassword(sessionToken, {
        current_password: values.current_password.trim(),
        new_password: values.new_password.trim(),
      });
      setEditingPassword(false);
      messageApi.success(t("common.profileUpdated"));
      window.setTimeout(() => {
        void redirectToLogin();
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("security.passwordUpdateFailed"),
      );
    } finally {
      setSavingPassword(false);
    }
  }

  async function sendCurrentMFACode(currentPassword: string) {
    if (!user?.mfa_enabled) {
      return;
    }
    if (user.mfa_method !== "email" && user.mfa_method !== "sms") {
      messageApi.error(t("errors.manualMfaCodeNotSendable"));
      return;
    }
    try {
      setSendingCurrentMFACode(true);
      setLastEmailCodeTarget(currentMFAChallengeTarget, "mfa_login");
      const captchaPayload = await requestCaptcha({
        flow: "current_mfa",
        purpose: "mfa_login",
        target: user.id,
      });
      const result = await sendCurrentMFACodeRequest(sessionToken, {
        current_password: currentPassword.trim(),
        ...captchaPayload,
      });
      startCurrentMFACodeCooldown(
        Number(result.cooldown_seconds || 0),
        currentMFAChallengeTarget,
      );
      messageApi.success(
        (result.method || user.mfa_method) === "sms"
          ? t("auth.sendPhoneOtpCodeSuccess")
          : t("auth.sendOtpCodeSuccess"),
      );
    } catch (err) {
      if (err instanceof ApiError) {
        const retryAfterSeconds = Number(err.payload.retry_after_seconds || 0);
        if (retryAfterSeconds > 0) {
          startCurrentMFACodeCooldown(
            retryAfterSeconds,
            currentMFAChallengeTarget,
          );
          return;
        }
      }
      messageApi.error(
        translateAccountError(
          err instanceof Error ? err.message : t("common.loadingFailed"),
          t,
        ),
      );
    } finally {
      setSendingCurrentMFACode(false);
    }
  }

  async function saveMFA(values: SaveMFAValues) {
    try {
      setSavingMFA(true);
      const result = await updateUserMFA(sessionToken, {
        enabled: mfaAction === "enable",
        method: mfaAction === "enable" ? values.method || "email" : "",
        current_password: values.current_password.trim(),
        current_mfa_code: values.current_mfa_code?.trim() || "",
      });
      setUser(result.user);
      updateUserOverviewCache(result.user, sessionToken);
      setEditingMFA(false);
      messageApi.success(t("common.profileUpdated"));
      window.setTimeout(() => {
        void redirectToLogin();
      }, 800);
    } catch (err) {
      messageApi.error(
        translateAccountError(
          err instanceof Error ? err.message : t("common.profileUpdateFailed"),
          t,
        ),
      );
    } finally {
      setSavingMFA(false);
    }
  }

  async function addPasskey(values: PasskeyValues) {
    if (!passkeySupported) {
      messageApi.error(t("errors.passkeyBrowserUnsupported"));
      return;
    }
    try {
      setSavingPasskey(true);
      const prepare = await preparePasskeyRegistration(sessionToken, {
        current_password: values.current_password.trim(),
        current_mfa_code: values.current_mfa_code?.trim() || "",
      });
      const credential = await createPasskeyCredential(prepare.options);
      const result = await verifyPasskeyRegistration(sessionToken, {
        challenge_token: prepare.challenge_token,
        credential,
        name: values.name.trim(),
        current_password: values.current_password.trim(),
        current_mfa_code: values.current_mfa_code?.trim() || "",
      });
      setPasskeys((current) => {
        const nextItems = [result.item, ...current];
        updateUserPasskeysCache(nextItems, sessionToken);
        return nextItems;
      });
      setCreatingPasskey(false);
      createPasskeyForm.resetFields();
      messageApi.success(t("auth.passkeyLoginSuccess"));
    } catch (err) {
      messageApi.error(
        translateAccountError(
          err instanceof Error ? err.message : t("common.loadingFailed"),
          t,
        ),
      );
    } finally {
      setSavingPasskey(false);
    }
  }

  async function removePasskey(values: DeletePasskeyValues) {
    if (!deletingPasskeyItem) {
      return;
    }
    try {
      setDeletingPasskey(true);
      await deletePasskeyRequest(sessionToken, deletingPasskeyItem.id, {
        current_password: values.current_password.trim(),
        current_mfa_code: values.current_mfa_code?.trim() || "",
      });
      setPasskeys((current) => {
        const nextItems = current.filter(
          (item) => item.id !== deletingPasskeyItem.id,
        );
        updateUserPasskeysCache(nextItems, sessionToken);
        return nextItems;
      });
      setDeletingPasskeyItem(null);
      deletePasskeyForm.resetFields();
      messageApi.success(t("common.revokeSuccess"));
    } catch (err) {
      messageApi.error(
        translateAccountError(
          err instanceof Error ? err.message : t("common.loadingFailed"),
          t,
        ),
      );
    } finally {
      setDeletingPasskey(false);
    }
  }

  function toggleMFA(checked: boolean) {
    setMFAAction(checked ? "enable" : "disable");
    setEditingMFA(true);
  }

  async function sendDeleteAccountEmailCode() {
    if (!deleteAccountEmailTarget) {
      messageApi.error(t("errors.emailNotBound"));
      return;
    }
    try {
      setSendingDeleteEmailCode(true);
      const captchaPayload = await requestCaptcha({
        flow: "email_code",
        purpose: "delete_account",
        target: deleteAccountEmailTarget,
      });
      const result = await sendEmailCode({
        email: deleteAccountEmailTarget,
        purpose: "delete_account",
        ...captchaPayload,
      });
      startDeleteEmailCooldown(
        Number(result.cooldown_seconds || 0),
        deleteAccountEmailTarget,
      );
      messageApi.success(t("privacy.sendDeleteEmailCodeSuccess"));
    } catch (err) {
      if (err instanceof ApiError) {
        const retryAfterSeconds = Number(err.payload.retry_after_seconds || 0);
        if (retryAfterSeconds > 0) {
          startDeleteEmailCooldown(retryAfterSeconds, deleteAccountEmailTarget);
          return;
        }
      }
      messageApi.error(
        translateAccountError(
          err instanceof Error
            ? err.message
            : t("privacy.sendDeleteEmailCodeFailed"),
          t,
        ),
      );
    } finally {
      setSendingDeleteEmailCode(false);
    }
  }

  async function sendDeleteAccountPhoneCode() {
    if (!deleteAccountPhoneTarget) {
      messageApi.error(t("errors.phoneNotBound"));
      return;
    }
    try {
      setSendingDeletePhoneCode(true);
      const captchaPayload = await requestCaptcha({
        flow: "sms_code",
        purpose: "delete_account",
        target: deleteAccountPhoneTarget,
      });
      const result = await sendPhoneCode(sessionToken, {
        phone: deleteAccountPhoneTarget,
        purpose: "delete_account",
        ...captchaPayload,
      });
      startDeletePhoneCooldown(
        Number(result.cooldown_seconds || 0),
        deleteAccountPhoneTarget,
      );
      messageApi.success(t("privacy.sendDeletePhoneCodeSuccess"));
    } catch (err) {
      if (err instanceof ApiError) {
        const retryAfterSeconds = Number(err.payload.retry_after_seconds || 0);
        if (retryAfterSeconds > 0) {
          startDeletePhoneCooldown(retryAfterSeconds, deleteAccountPhoneTarget);
          return;
        }
      }
      messageApi.error(
        translateAccountError(
          err instanceof Error
            ? err.message
            : t("privacy.sendDeletePhoneCodeFailed"),
          t,
        ),
      );
    } finally {
      setSendingDeletePhoneCode(false);
    }
  }

  async function requestAccountDeletion(values: DeleteAccountValues) {
    try {
      setDeletingAccount(true);
      setError(undefined);
      await deleteAccountRequest(sessionToken, {
        current_password: values.current_password.trim(),
        email_code: values.email_code.trim(),
        phone_code: values.phone_code?.trim() || "",
      });
      setConfirmingAccountDeletion(false);
      deleteAccountForm.resetFields();
      messageApi.success(t("privacy.deleteSuccess"));
      window.setTimeout(() => {
        void redirectToLogin();
      }, 800);
    } catch (err) {
      messageApi.error(
        err instanceof Error
          ? translateAccountError(err.message, t)
          : t("privacy.deleteFailed"),
      );
    } finally {
      setDeletingAccount(false);
    }
  }

  async function exportUserData(values: ExportUserDataValues) {
    try {
      setExportingUserData(true);
      const response = await exportUserDataRequest({
        current_password: values.current_password.trim(),
      });
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const fileNameMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
      const fileName = fileNameMatch
        ? decodeURIComponent(fileNameMatch[1])
        : "user-data.csv";
      const downloadUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(downloadUrl);
      exportUserDataForm.resetFields();
      setConfirmingExportUserData(false);
      messageApi.success(t("privacy.exportSuccess"));
    } catch (err) {
      messageApi.error(
        err instanceof Error
          ? translateAccountError(err.message, t)
          : t("privacy.exportFailed"),
      );
    } finally {
      setExportingUserData(false);
    }
  }

  function handleAvatarUpload(file: File) {
    setUploadingAvatar(true);
    setError(undefined);
    void uploadUserAvatar(file)
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : t("common.avatarUploadFailed"),
        );
      })
      .finally(() => {
        setUploadingAvatar(false);
      });
    return false;
  }

  function openSection(nextSection: UserSectionKey) {
    navigate(`/me/${nextSection}${sharedSearch}`);
  }

  return {
    sessionToken,
    contextHolder,
    captchaModal,
    t,
    navigate,
    sharedSearch,
    sectionItems,
    activeSection,
    isMobile,
    passkeySupported,
    phoneVerificationEnabled,
    userCenterAnnouncementEnabled,
    userCenterAnnouncementContent,
    user,
    consents,
    passkeys,
    contactLines,
    effectiveDisplayName,
    avatarUrl,
    genderLabel,
    siteName,
    siteFooterText,
    siteICPRecordNumber,
    sitePublicSecurityRecordNumber,
    publicSecurityRecordQueryCode,
    mobileNavOpen,
    setMobileNavOpen,
    editingDisplayName,
    savingDisplayName,
    displayNameDraft,
    setDisplayNameDraft,
    editingGender,
    savingGender,
    genderDraft,
    setGenderDraft,
    preferredLocaleDraft,
    setPreferredLocaleDraft,
    savingPreferredLocale,
    editingEmail,
    sendingEmailCode,
    savingEmail,
    editingPhone,
    sendingCurrentPhoneCode,
    sendingNewPhoneCode,
    savingPhone,
    editingPassword,
    savingPassword,
    editingMFA,
    mfaAction,
    savingMFA,
    sendingCurrentMFACode,
    currentMFACodeRemainingSeconds,
    creatingPasskey,
    savingPasskey,
    deletingPasskey,
    deletingPasskeyItem,
    revokingConsentId,
    uploadingAvatar,
    selectedConsentIds,
    setSelectedConsentIds,
    batchRevoking,
    confirmingBatchRevoke,
    setConfirmingBatchRevoke,
    confirmingAccountDeletion,
    deletingAccount,
    confirmingExportUserData,
    exportingUserData,
    sendingDeleteEmailCode,
    sendingDeletePhoneCode,
    deleteEmailRemainingSeconds,
    deletePhoneRemainingSeconds,
    createPasskeyForm,
    deletePasskeyForm,
    exportUserDataForm,
    deleteAccountForm,
    openSection,
    handleAvatarUpload,
    revokeConsent,
    revokeSelectedConsents,
    saveDisplayName,
    saveGender,
    savePreferredLocale,
    sendEmailChangeCode,
    sendPhoneChangeCode,
    sendCurrentPhoneVerificationCode,
    saveEmail,
    savePhone,
    savePassword,
    toggleMFA,
    sendCurrentMFACode,
    saveMFA,
    addPasskey,
    removePasskey,
    sendDeleteAccountEmailCode,
    sendDeleteAccountPhoneCode,
    requestAccountDeletion,
    exportUserData,
    setEditingDisplayName,
    setEditingGender,
    setEditingEmail,
    setEditingPhone,
    setEditingPassword,
    setEditingMFA,
    setCreatingPasskey,
    setDeletingPasskeyItem,
    setConfirmingAccountDeletion,
    setConfirmingExportUserData,
  };
}
