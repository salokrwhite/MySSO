import { api } from "../api/client";
import i18n, { ACCOUNT_LOCALE_STORAGE_KEY, normalizeAccountLocale } from "./accountLocale";

type MeLocaleResponse = {
  user?: {
    id?: string;
    email?: string;
    display_name?: string;
    preferred_locale?: string;
  };
};

export async function applyPreferredLocaleFromSession() {
  const result = await api<MeLocaleResponse>("/me");
  const preferredLocale = result.user?.preferred_locale?.trim();
  if (!preferredLocale) {
    return result.user;
  }
  const normalizedLocale = normalizeAccountLocale(preferredLocale);
  localStorage.setItem(ACCOUNT_LOCALE_STORAGE_KEY, normalizedLocale);
  await i18n.changeLanguage(normalizedLocale);
  return result.user;
}
