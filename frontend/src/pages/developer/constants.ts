import type { TFunction } from "i18next";
import type { DeveloperPageType } from "./types";

export function buildDeveloperPageMeta(
  t: TFunction<"developer">,
): Record<DeveloperPageType, { title: string; description: string }> {
  return {
    dashboard: {
      title: t("pageMeta.dashboard.title"),
      description: t("pageMeta.dashboard.description"),
    },
    console: {
      title: t("pageMeta.console.title"),
      description: t("pageMeta.console.description"),
    },
    auditLogs: {
      title: t("pageMeta.auditLogs.title"),
      description: t("pageMeta.auditLogs.description"),
    },
    analytics: {
      title: t("pageMeta.analytics.title"),
      description: t("pageMeta.analytics.description"),
    },
    docsManual: {
      title: t("pageMeta.docsManual.title"),
      description: t("pageMeta.docsManual.description"),
    },
    docsExamples: {
      title: t("pageMeta.docsExamples.title"),
      description: t("pageMeta.docsExamples.description"),
    },
    docsExamplesGo: {
      title: t("pageMeta.docsExamplesGo.title"),
      description: t("pageMeta.docsExamplesGo.description"),
    },
    docsExamplesPHP: {
      title: t("pageMeta.docsExamplesPHP.title"),
      description: t("pageMeta.docsExamplesPHP.description"),
    },
    docsExamplesJava: {
      title: t("pageMeta.docsExamplesJava.title"),
      description: t("pageMeta.docsExamplesJava.description"),
    },
    docsExamplesNodejs: {
      title: t("pageMeta.docsExamplesNodejs.title"),
      description: t("pageMeta.docsExamplesNodejs.description"),
    },
    docsExamplesPython: {
      title: t("pageMeta.docsExamplesPython.title"),
      description: t("pageMeta.docsExamplesPython.description"),
    },
  };
}
