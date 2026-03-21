import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { normalizeAccountLocale } from "../../i18n/accountLocale";
import zhCN from "./locales/zh-CN";
import enUS from "./locales/en-US";

type Vars = Record<string, string | number>;

function resolveAdminLocale(language?: string | null) {
  const normalized = normalizeAccountLocale(language);
  if (normalized === "zh-CN" || normalized === "zh-TW") {
    return "zh-CN" as const;
  }
  return "en-US" as const;
}

function applyVars(template: string, vars?: Vars) {
  if (!vars) {
    return template;
  }
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? ""));
}

export function useAdminI18n() {
  const { i18n } = useTranslation();
  const locale = resolveAdminLocale(i18n.language);
  const dict = useMemo(
    () => (locale === "zh-CN" ? zhCN : enUS),
    [locale],
  );

  const t = useCallback(
    (key: string, vars?: Vars) => applyVars(dict[key] ?? key, vars),
    [dict],
  );

  return { t, locale };
}

function localizeAdminDom(root: ParentNode, translate: (key: string) => string) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    const node = current as Text;
    const original = node.textContent || "";
    const trimmed = original.trim();
    if (trimmed) {
      const translated = translate(trimmed);
      if (translated !== trimmed) {
        node.textContent = original.replace(trimmed, translated);
      }
    }
    current = walker.nextNode();
  }

  const elements = root instanceof Element ? [root, ...Array.from(root.querySelectorAll("*"))] : Array.from(root.querySelectorAll?.("*") || []);
  elements.forEach((element) => {
    ["placeholder", "title", "aria-label"].forEach((attr) => {
      const value = element.getAttribute(attr);
      if (!value) {
        return;
      }
      const translated = translate(value.trim());
      if (translated !== value.trim()) {
        element.setAttribute(attr, translated);
      }
    });
  });
}

export function useAdminDocumentLocalization(active: boolean) {
  const { t, locale } = useAdminI18n();

  useEffect(() => {
    if (!active || locale !== "en-US") {
      return;
    }

    const run = () => localizeAdminDom(document.body, t);
    run();

    const observer = new MutationObserver(() => {
      run();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [active, locale, t]);
}
