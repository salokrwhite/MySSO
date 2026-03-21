import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n, {
  normalizeAccountLocale,
  type AccountLocale,
} from "../../i18n/accountLocale";
import { developerRemoteLocaleMap } from "./developerLocaleRemoteMap.generated";

const NAMESPACE = "developer";
const remoteLocaleEnabled = import.meta.env.VITE_REMOTE_LOCALE === "1";

type DeveloperLocale = "zh-CN" | "en-US";
type DeveloperMessages = {
  menu: {
    dashboard: string;
    console: string;
    auditLogs: string;
    analytics: string;
    integration: string;
    docsManual: string;
    docsExamples: string;
  };
  appLayout: {
    title: string;
    role: string;
  };
};

type LocaleModule = {
  default: Record<string, unknown>;
};

const loaded = new Set<string>();
const loading = new Map<string, Promise<void>>();

const localLocaleLoaders: Record<DeveloperLocale, () => Promise<LocaleModule>> = {
  "zh-CN": () => import("./remote-locales/developer-zh-CN"),
  "en-US": () => import("./remote-locales/developer-en-US"),
};

const remoteLocaleLoaders: Record<DeveloperLocale, () => Promise<LocaleModule>> = {
  "zh-CN": async () => {
    const remoteUrl = developerRemoteLocaleMap["zh-CN"];
    if (!remoteUrl) {
      return localLocaleLoaders["zh-CN"]();
    }
    return import(/* @vite-ignore */ remoteUrl) as Promise<LocaleModule>;
  },
  "en-US": async () => {
    const remoteUrl = developerRemoteLocaleMap["en-US"];
    if (!remoteUrl) {
      return localLocaleLoaders["en-US"]();
    }
    return import(/* @vite-ignore */ remoteUrl) as Promise<LocaleModule>;
  },
};

const localeLoaders = remoteLocaleEnabled ? remoteLocaleLoaders : localLocaleLoaders;

const fallbackMessages: Record<DeveloperLocale, DeveloperMessages> = {
  "zh-CN": {
    menu: {
      dashboard: "首页仪表盘",
      console: "开发者控制台",
      auditLogs: "审计日志",
      analytics: "用户分析",
      integration: "对接文档",
      docsManual: "开发手册",
      docsExamples: "语言示例",
    },
    appLayout: {
      title: "开发者后台",
      role: "开发者",
    },
  },
  "en-US": {
    menu: {
      dashboard: "Dashboard",
      console: "Developer Console",
      auditLogs: "Audit Logs",
      analytics: "User Analytics",
      integration: "Integration Docs",
      docsManual: "Developer Manual",
      docsExamples: "Language Examples",
    },
    appLayout: {
      title: "Developer Portal",
      role: "Developer",
    },
  },
};

function resolveDeveloperLocale(language?: string | null): DeveloperLocale {
  const normalized = normalizeAccountLocale(language);
  if (normalized === "zh-CN" || normalized === "zh-TW") {
    return "zh-CN";
  }
  return "en-US";
}

function addDeveloperResourceBundles(
  locale: DeveloperLocale,
  resource: Record<string, unknown>,
) {
  const localesToRegister: AccountLocale[] =
    locale === "zh-CN" ? ["zh-CN", "zh-TW"] : ["en-US"];

  localesToRegister.forEach((lng) => {
    const key = `${lng}:${NAMESPACE}`;
    if (loaded.has(key)) {
      return;
    }
    i18n.addResourceBundle(lng, NAMESPACE, resource, true, true);
    loaded.add(key);
  });
}

export function isDeveloperTranslationsLoaded(language?: string | null) {
  const locale = resolveDeveloperLocale(language);
  return loaded.has(`${locale}:${NAMESPACE}`);
}

export async function ensureDeveloperTranslationsLoaded(language?: string | null) {
  const locale = resolveDeveloperLocale(language);
  const cacheKey = `${locale}:${NAMESPACE}`;

  if (loaded.has(cacheKey)) {
    return;
  }

  if (loading.has(cacheKey)) {
    await loading.get(cacheKey);
    return;
  }

  const task = localeLoaders[locale]()
    .then((module) => {
      addDeveloperResourceBundles(locale, module.default);
    })
    .finally(() => {
      loading.delete(cacheKey);
    });

  loading.set(cacheKey, task);
  await task;
}

export function developerLocaleKey(language?: string | null) {
  return resolveDeveloperLocale(language);
}

export function getDeveloperFallbackMessages(language?: string | null) {
  return fallbackMessages[resolveDeveloperLocale(language)];
}

export function useDeveloperTranslation() {
  const translation = useTranslation(NAMESPACE);
  const [ready, setReady] = useState(() =>
    isDeveloperTranslationsLoaded(i18n.language),
  );

  useEffect(() => {
    let active = true;
    if (isDeveloperTranslationsLoaded(i18n.language)) {
      setReady(true);
      return;
    }

    setReady(false);
    void ensureDeveloperTranslationsLoaded(i18n.language).then(() => {
      if (!active) {
        return;
      }
      setReady(true);
    });

    return () => {
      active = false;
    };
  }, [i18n.language]);

  return {
    ...translation,
    ready,
  };
}
