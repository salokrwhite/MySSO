import { useCallback } from "react";
import { useAdminI18n } from "../i18n";
import {
  createApp as createAppRequest,
  deleteApp as deleteAppRequest,
  resetAdminAppSecret,
  reviewApp as reviewAppRequest,
  setAdminAppDisabled,
  updateApp as updateAppRequest,
} from "../services/adminApi";
import type { AppItem } from "../types";

type AppInput = {
  name: string;
  icon_url?: string;
  description?: string;
  redirect_uris: string[];
  post_logout_redirect_uris?: string[];
  frontchannel_logout_uri?: string;
  allow_get_session_logout?: boolean;
  scopes: string[];
};

export function useAppReview(sessionToken: string, reload: () => Promise<void>, setError: (value?: string) => void) {
  const { t } = useAdminI18n();
  const createApp = useCallback(
    async (values: AppInput) => {
      try {
        await createAppRequest(sessionToken, values);
        await reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : t("创建应用失败"));
      }
    },
    [reload, sessionToken, setError, t]
  );

  const reviewApp = useCallback(
    async (id: string, approved: boolean, comment?: string) => {
      try {
        await reviewAppRequest(sessionToken, id, approved, comment);
        await reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : t("审核失败"));
      }
    },
    [reload, sessionToken, setError, t]
  );

  const deleteApp = useCallback(
    async (id: string) => {
      try {
        await deleteAppRequest(sessionToken, id);
        await reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : t("删除应用失败"));
      }
    },
    [reload, sessionToken, setError, t]
  );

  const updateApp = useCallback(
    async (id: string, values: AppInput) => {
      try {
        await updateAppRequest(sessionToken, id, values);
        await reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : t("更新应用失败"));
      }
    },
    [reload, sessionToken, setError, t]
  );

  const resetSecret = useCallback(
    async (id: string): Promise<AppItem | undefined> => {
      try {
        const app = await resetAdminAppSecret(sessionToken, id);
        await reload();
        return app;
      } catch (err) {
        setError(err instanceof Error ? err.message : t("重置密钥失败"));
        return undefined;
      }
    },
    [reload, sessionToken, setError, t]
  );

  const setDisabled = useCallback(
    async (id: string, disabled: boolean) => {
      try {
        await setAdminAppDisabled(sessionToken, id, disabled);
        await reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : t("更新应用状态失败"));
      }
    },
    [reload, sessionToken, setError, t]
  );

  return { createApp, reviewApp, deleteApp, updateApp, resetSecret, setDisabled };
}
