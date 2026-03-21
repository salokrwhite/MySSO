import { normalizeAccountLocale } from "./i18n/accountLocale";

export const DEFAULT_SITE_NAME = "MySSO";
export const DEFAULT_BROWSER_TITLE = "MySSO Console";

export const SITE_NAME_STORAGE_KEY = "site_name";
export const SITE_NAME_EN_STORAGE_KEY = "site_name_en";
export const SITE_BROWSER_TITLE_STORAGE_KEY = "site_browser_title";
export const SITE_BROWSER_TITLE_EN_STORAGE_KEY = "site_browser_title_en";

export type SiteBrandingSettings = {
  site_name?: string;
  site_name_en?: string;
  site_browser_title?: string;
  site_browser_title_en?: string;
};

function trimValue(value?: string | null) {
  return value?.trim() || "";
}

export function isChineseBrandLocale(locale?: string | null) {
  return normalizeAccountLocale(locale).startsWith("zh-");
}

export function resolveSiteNameForLocale(locale?: string | null, siteName?: string | null, siteNameEn?: string | null) {
  return isChineseBrandLocale(locale) ? trimValue(siteName) || DEFAULT_SITE_NAME : trimValue(siteNameEn) || DEFAULT_SITE_NAME;
}

export function resolveBrowserTitleForLocale(
  locale?: string | null,
  siteBrowserTitle?: string | null,
  siteBrowserTitleEn?: string | null
) {
  return isChineseBrandLocale(locale)
    ? trimValue(siteBrowserTitle) || DEFAULT_BROWSER_TITLE
    : trimValue(siteBrowserTitleEn) || DEFAULT_BROWSER_TITLE;
}

export function persistSiteBranding(settings?: SiteBrandingSettings | null) {
  if (typeof window === "undefined" || !settings) {
    return;
  }
  window.localStorage.setItem(SITE_NAME_STORAGE_KEY, trimValue(settings.site_name));
  window.localStorage.setItem(SITE_NAME_EN_STORAGE_KEY, trimValue(settings.site_name_en));
  window.localStorage.setItem(SITE_BROWSER_TITLE_STORAGE_KEY, trimValue(settings.site_browser_title));
  window.localStorage.setItem(SITE_BROWSER_TITLE_EN_STORAGE_KEY, trimValue(settings.site_browser_title_en));
}

export function getStoredSiteName(locale?: string | null) {
  if (typeof window === "undefined") {
    return DEFAULT_SITE_NAME;
  }
  return resolveSiteNameForLocale(
    locale,
    window.localStorage.getItem(SITE_NAME_STORAGE_KEY),
    window.localStorage.getItem(SITE_NAME_EN_STORAGE_KEY)
  );
}

export function getStoredBrowserTitle(locale?: string | null) {
  if (typeof window === "undefined") {
    return DEFAULT_BROWSER_TITLE;
  }
  return resolveBrowserTitleForLocale(
    locale,
    window.localStorage.getItem(SITE_BROWSER_TITLE_STORAGE_KEY),
    window.localStorage.getItem(SITE_BROWSER_TITLE_EN_STORAGE_KEY)
  );
}
