import { useCallback } from "react";
import { useAdminI18n } from "../i18n";
import { deleteApp as deleteAppRequest, reviewApp as reviewAppRequest, updateApp as updateAppRequest } from "../services/adminApi";

export function useAppReview(sessionToken: string, reload: () => Promise<void>, setError: (value?: string) => void) {
  const { t } = useAdminI18n();
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
    async (
      id: string,
      values: {
        name: string;
        icon_url?: string;
        description?: string;
        redirect_uris: string[];
        post_logout_redirect_uris?: string[];
        frontchannel_logout_uri?: string;
        allow_get_session_logout?: boolean;
        scopes: string[];
      }
    ) => {
      try {
        await updateAppRequest(sessionToken, id, values);
        await reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : t("更新应用失败"));
      }
    },
    [reload, sessionToken, setError, t]
  );

  return { reviewApp, deleteApp, updateApp };
}
