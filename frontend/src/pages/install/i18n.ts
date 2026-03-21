import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n, { normalizeAccountLocale } from "../../i18n/accountLocale";
import zhCN from "./locales/zh-CN";
import enUS from "./locales/en-US";

const NAMESPACE = "install";

function resolveInstallLocale(language?: string | null) {
  const normalized = normalizeAccountLocale(language);
  if (normalized === "zh-CN" || normalized === "zh-TW") {
    return "zh-CN" as const;
  }
  return "en-US" as const;
}

function ensureInstallResource(language?: string | null) {
  const locale = resolveInstallLocale(language);
  const resource = locale === "zh-CN" ? zhCN : enUS;
  const targets = locale === "zh-CN" ? ["zh-CN", "zh-TW"] : ["en-US"];

  targets.forEach((lng) => {
    i18n.addResourceBundle(lng, NAMESPACE, resource, true, true);
  });
}

export function useInstallTranslation() {
  const translation = useTranslation(NAMESPACE);

  useEffect(() => {
    ensureInstallResource(i18n.language);
  }, [translation.i18n.language]);

  ensureInstallResource(translation.i18n.language);
  return translation;
}
