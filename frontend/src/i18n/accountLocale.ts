import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { remoteLocaleMap } from "./localeRemoteMap.generated";

type LocaleModule = {
  default: {
    translation: Record<string, unknown>;
  };
};

export const accountLocales = [
  "zh-CN",
  "zh-TW",
  "ja-JP",
  "en-US",
  "ko-KR",
  "pt-BR",
  "id-ID",
  "hi-IN",
  "ta-IN",
  "te-IN",
  "kn-IN",
  "mr-IN",
  "ml-IN",
  "bn-IN",
  "th-TH",
  "vi-VN",
  "ms-MY",
  "tr-TR",
  "ar-SA",
  "ru-RU",
  "es-419",
  "uk-UA",
  "uz-UZ",
  "as-IN",
  "fa-IR",
  "fr-FR",
  "it-IT",
  "he-IL",
  "si-LK",
  "pl-PL",
  "es-ES",
  "cs-CZ",
  "el-GR",
  "nl-NL",
  "de-DE",
  "bs-BA",
  "hr-HR",
  "fi-FI",
  "lv-LV",
  "ne-IN",
  "pt-PT",
  "ro-RO",
  "sr-RS",
  "sk-SK",
  "sl-SI",
  "lt-LT",
  "gu-IN",
  "hy-AM",
  "pa-IN",
  "ha-NG",
  "kk-KZ",
  "az-AZ",
  "or-IN",
  "sq-AL",
  "bg-BG",
  "ka-GE",
  "km-KH",
  "ca-ES",
  "ur-IN",
  "mk-MK",
  "hu-HU",
  "eu-ES",
  "mt-MT",
  "gl-ES",
  "be-BY",
  "da-DK",
  "et-EE",
  "nb-NO",
  "sv-SE",
  "ur-PK",
  "ne-NP",
  "bn-BD",
  "sw-KE"
] as const;

export type AccountLocale = (typeof accountLocales)[number];

export const ACCOUNT_LOCALE_STORAGE_KEY = "account_locale";

const accountLocaleLabelMap: Record<AccountLocale, string> = {
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  "ja-JP": "日本語",
  "en-US": "English",
  "ko-KR": "한국어",
  "pt-BR": "Português (Brasil)",
  "id-ID": "Bahasa Indonesia",
  "hi-IN": "हिन्दी",
  "ta-IN": "தமிழ்",
  "te-IN": "తెలుగు",
  "kn-IN": "ಕನ್ನಡ",
  "mr-IN": "मराठी",
  "ml-IN": "മലയാളം",
  "bn-IN": "বাংলা (ভারত)",
  "th-TH": "ภาษาไทย",
  "vi-VN": "Tiếng Việt",
  "ms-MY": "Bahasa Melayu",
  "tr-TR": "Türkçe",
  "ar-SA": "العربية",
  "ru-RU": "Русский",
  "es-419": "Español (América)",
  "uk-UA": "Українська",
  "uz-UZ": "O'zbekcha",
  "as-IN": "অসমীয়া",
  "fa-IR": "فارسی",
  "fr-FR": "Français",
  "it-IT": "Italiano",
  "he-IL": "עברית",
  "si-LK": "සිංහල",
  "pl-PL": "Polski",
  "es-ES": "Español (España)",
  "cs-CZ": "Čeština",
  "el-GR": "Ελληνικά",
  "nl-NL": "Nederlands",
  "de-DE": "Deutsch",
  "bs-BA": "Bosanski",
  "hr-HR": "Hrvatski",
  "fi-FI": "Suomi",
  "lv-LV": "Latviešu",
  "ne-IN": "नेपाली (भारत)",
  "pt-PT": "Português (Portugal)",
  "ro-RO": "Română",
  "sr-RS": "Српски",
  "sk-SK": "Slovenčina",
  "sl-SI": "Slovenščina",
  "lt-LT": "Lietuvių",
  "gu-IN": "ગુજરાતી",
  "hy-AM": "հայերեն",
  "pa-IN": "ਪੰਜਾਬੀ",
  "ha-NG": "Hausa",
  "kk-KZ": "Қазақ тілі",
  "az-AZ": "Azərbaycan",
  "or-IN": "ଓଡ଼ିଆ",
  "sq-AL": "Shqip",
  "bg-BG": "Български",
  "ka-GE": "ქართული",
  "km-KH": "ភាសាខ្មែរ",
  "ca-ES": "Català",
  "ur-IN": "اردو (بھارت)",
  "mk-MK": "Македонски",
  "hu-HU": "Magyar",
  "eu-ES": "Euskara",
  "mt-MT": "Malti",
  "gl-ES": "Galego",
  "be-BY": "Беларуская",
  "da-DK": "Dansk",
  "et-EE": "Eesti",
  "nb-NO": "Norsk bokmål",
  "sv-SE": "Svenska",
  "ur-PK": "اردو (پاکستان)",
  "ne-NP": "नेपाली (नेपाल)",
  "bn-BD": "বাংলা (বাংলাদেশ)",
  "sw-KE": "Kiswahili"
};

const englishLocaleLabelOverrides: Partial<Record<AccountLocale, string>> = {
  "ar-SA": "Arabic (Saudi Arabia)",
  "as-IN": "Assamese (India)",
  "az-AZ": "Azerbaijani",
  "be-BY": "Belarusian",
  "bg-BG": "Bulgarian",
  "bn-BD": "Bengali (Bangladesh)",
  "bn-IN": "Bengali (India)",
  "bs-BA": "Bosnian",
  "ca-ES": "Catalan",
  "cs-CZ": "Czech",
  "da-DK": "Danish",
  "de-DE": "German",
  "el-GR": "Greek",
  "en-US": "English (United States)",
  "es-419": "Spanish (Latin America)",
  "es-ES": "Spanish (Spain)",
  "et-EE": "Estonian",
  "eu-ES": "Basque",
  "fa-IR": "Persian",
  "fi-FI": "Finnish",
  "fr-FR": "French",
  "gl-ES": "Galician",
  "gu-IN": "Gujarati",
  "ha-NG": "Hausa",
  "he-IL": "Hebrew",
  "hi-IN": "Hindi",
  "hr-HR": "Croatian",
  "hu-HU": "Hungarian",
  "hy-AM": "Armenian",
  "id-ID": "Indonesian",
  "it-IT": "Italian",
  "ja-JP": "Japanese",
  "ka-GE": "Georgian",
  "kk-KZ": "Kazakh",
  "km-KH": "Khmer",
  "kn-IN": "Kannada",
  "ko-KR": "Korean",
  "lt-LT": "Lithuanian",
  "lv-LV": "Latvian",
  "mk-MK": "Macedonian",
  "ml-IN": "Malayalam",
  "mr-IN": "Marathi",
  "ms-MY": "Malay",
  "mt-MT": "Maltese",
  "nb-NO": "Norwegian Bokmal",
  "ne-IN": "Nepali (India)",
  "ne-NP": "Nepali (Nepal)",
  "nl-NL": "Dutch",
  "or-IN": "Odia",
  "pa-IN": "Punjabi",
  "pl-PL": "Polish",
  "pt-BR": "Portuguese (Brazil)",
  "pt-PT": "Portuguese (Portugal)",
  "ro-RO": "Romanian",
  "ru-RU": "Russian",
  "si-LK": "Sinhala",
  "sk-SK": "Slovak",
  "sl-SI": "Slovenian",
  "sq-AL": "Albanian",
  "sr-RS": "Serbian",
  "sv-SE": "Swedish",
  "sw-KE": "Swahili",
  "ta-IN": "Tamil",
  "te-IN": "Telugu",
  "th-TH": "Thai",
  "tr-TR": "Turkish",
  "uk-UA": "Ukrainian",
  "ur-IN": "Urdu (India)",
  "ur-PK": "Urdu (Pakistan)",
  "uz-UZ": "Uzbek",
  "vi-VN": "Vietnamese",
  "zh-CN": "Chinese (Simplified)",
  "zh-TW": "Chinese (Traditional)"
};

const englishDisplayNames = new Intl.DisplayNames(["en"], { type: "language" });

function getEnglishLocaleLabel(locale: AccountLocale) {
  return englishLocaleLabelOverrides[locale] ?? englishDisplayNames.of(locale) ?? locale;
}

export const accountLocaleMeta: Record<
  AccountLocale,
  {
    label: string;
    englishLabel: string;
  }
> = Object.fromEntries(
  accountLocales.map((locale) => [
    locale,
    {
      label: accountLocaleLabelMap[locale],
      englishLabel: getEnglishLocaleLabel(locale)
    }
  ])
) as Record<AccountLocale, { label: string; englishLabel: string }>;

export const accountLocaleLabel: Record<AccountLocale, string> = Object.fromEntries(
  accountLocales.map((locale) => [locale, accountLocaleMeta[locale].label])
) as Record<AccountLocale, string>;

const fixedFirstRowLocales = accountLocales.slice(0, 5);
const sortedRemainingLocales = [...accountLocales.slice(5)].sort((left, right) =>
  accountLocaleMeta[left].englishLabel.localeCompare(accountLocaleMeta[right].englishLabel, "en", {
    sensitivity: "base"
  })
);

export const accountLocaleOptions = [...fixedFirstRowLocales, ...sortedRemainingLocales].map((locale) => ({
  value: locale,
  label: accountLocaleMeta[locale].label,
  englishLabel: accountLocaleMeta[locale].englishLabel
}));

const localLocaleLoaders: Record<AccountLocale, () => Promise<LocaleModule>> = Object.fromEntries(
  accountLocales.map((locale) => [
    locale,
    () => import(`./locales/${locale}.ts`) as Promise<LocaleModule>
  ])
) as Record<AccountLocale, () => Promise<LocaleModule>>;

const remoteLocaleEnabled = import.meta.env.VITE_REMOTE_LOCALE === "1";

const remoteLocaleLoaders: Record<AccountLocale, () => Promise<LocaleModule>> = Object.fromEntries(
  accountLocales.map((locale) => [
    locale,
    async () => {
      const remoteUrl = remoteLocaleMap[locale];
      if (!remoteUrl) {
        return localLocaleLoaders[locale]();
      }
      return import(/* @vite-ignore */ remoteUrl) as Promise<LocaleModule>;
    }
  ])
) as Record<AccountLocale, () => Promise<LocaleModule>>;

const localeLoaders = remoteLocaleEnabled ? remoteLocaleLoaders : localLocaleLoaders;

const exactLocaleMap: Record<string, AccountLocale> = Object.fromEntries(
  accountLocales.map((locale) => [locale.toLowerCase(), locale])
) as Record<string, AccountLocale>;

const baseLanguageFallbacks: Record<string, AccountLocale> = accountLocales.reduce(
  (result, locale) => {
    const baseLanguage = locale.split("-")[0];
    if (!result[baseLanguage]) {
      result[baseLanguage] = locale;
    }
    return result;
  },
  {
    no: "nb-NO",
    zh: "zh-CN"
  } as Record<string, AccountLocale>
);

const loadedLocales = new Set<AccountLocale>();

function resolveAccountLocale(value?: string | null): AccountLocale | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().replace(/_/g, "-").toLowerCase();
  if (!normalized) {
    return null;
  }

  if (exactLocaleMap[normalized]) {
    return exactLocaleMap[normalized];
  }

  if (normalized === "es-419") {
    return "es-419";
  }
  if (normalized.startsWith("zh-tw") || normalized.startsWith("zh-hk") || normalized.startsWith("zh-mo")) {
    return "zh-TW";
  }
  if (normalized.startsWith("zh-cn") || normalized.startsWith("zh-sg")) {
    return "zh-CN";
  }
  if (normalized.startsWith("pt-pt")) {
    return "pt-PT";
  }
  if (normalized.startsWith("pt-br")) {
    return "pt-BR";
  }

  const baseLanguage = normalized.split("-")[0];
  return baseLanguageFallbacks[baseLanguage] ?? null;
}

export function normalizeAccountLocale(value?: string | null): AccountLocale {
  return resolveAccountLocale(value) ?? "en-US";
}

export function getStoredAccountLocale(): AccountLocale {
  if (typeof window === "undefined") {
    return "en-US";
  }
  return normalizeAccountLocale(window.localStorage.getItem(ACCOUNT_LOCALE_STORAGE_KEY));
}

function detectBrowserAccountLocale(): AccountLocale {
  if (typeof window === "undefined") {
    return "en-US";
  }

  const candidates = [window.navigator.language, ...(window.navigator.languages || [])]
    .map((item) => item?.trim())
    .filter(Boolean) as string[];

  for (const candidate of candidates) {
    const matchedLocale = resolveAccountLocale(candidate);
    if (matchedLocale) {
      return matchedLocale;
    }
  }

  return "en-US";
}

export function getBrowserAccountLocale(): AccountLocale {
  return detectBrowserAccountLocale();
}

function isAuthenticationRoute(pathname: string) {
  return [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/authorize",
    "/login-mfa",
    "/phone-binding-required",
    "/login-deletion-confirm",
    "/callback",
    "/logout-complete",
    "/account-session-conflict"
  ].includes(pathname);
}

function getRequestedInitialLocale(): AccountLocale {
  if (typeof window === "undefined") {
    return "en-US";
  }

  const search = new URLSearchParams(window.location.search);
  const localeFromQuery = search.get("locale");
  if (localeFromQuery) {
    return normalizeAccountLocale(localeFromQuery);
  }

  if (isAuthenticationRoute(window.location.pathname)) {
    return detectBrowserAccountLocale();
  }

  const storedLocale = window.localStorage.getItem(ACCOUNT_LOCALE_STORAGE_KEY);
  if (storedLocale) {
    return normalizeAccountLocale(storedLocale);
  }

  return detectBrowserAccountLocale();
}

export async function ensureAccountLocaleLoaded(locale: AccountLocale) {
  if (loadedLocales.has(locale)) {
    return;
  }
  const module = await localeLoaders[locale]();
  i18n.addResourceBundle(locale, "translation", module.default.translation, true, true);
  loadedLocales.add(locale);
}

const requestedInitialLocale = getRequestedInitialLocale();
const baseChangeLanguage = i18n.changeLanguage.bind(i18n);

let initializationPromise: Promise<void> | null = null;

async function initializeAccountLocale() {
  await i18n.use(initReactI18next).init({
    resources: {},
    lng: requestedInitialLocale,
    fallbackLng: "en-US",
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });
  await ensureAccountLocaleLoaded("en-US");
  if (requestedInitialLocale !== "en-US") {
    await ensureAccountLocaleLoaded(requestedInitialLocale);
  }
  await baseChangeLanguage(requestedInitialLocale);
}

if (!i18n.isInitialized) {
  initializationPromise = initializeAccountLocale();
}

export function waitForAccountLocaleReady() {
  return initializationPromise ?? Promise.resolve();
}

i18n.changeLanguage = ((language?: string, callback?: (error: unknown, t: unknown) => void) => {
  const nextLocale = normalizeAccountLocale(language);
  const run = async () => {
    if (initializationPromise) {
      await initializationPromise;
    }
    await ensureAccountLocaleLoaded(nextLocale);
    return baseChangeLanguage(nextLocale, callback);
  };
  return run() as ReturnType<typeof i18n.changeLanguage>;
}) as typeof i18n.changeLanguage;

export default i18n;
