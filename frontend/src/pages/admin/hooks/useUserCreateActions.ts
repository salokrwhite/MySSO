import type { MessageInstance } from "antd/es/message/interface";
import { useCallback, useState } from "react";
import { useAdminI18n } from "../i18n";
import { createUser as createUserRequest } from "../services/adminApi";
import type { CreateUserInput } from "../types";

export function useUserCreateActions(
  sessionToken: string,
  reload: () => Promise<void>,
  setError: (value?: string) => void,
  messageApi: MessageInstance
) {
  const { t } = useAdminI18n();
  const [creatingUser, setCreatingUser] = useState(false);

  const createUser = useCallback(
    async (input: CreateUserInput) => {
      setCreatingUser(true);
      setError(undefined);
      try {
        await createUserRequest(sessionToken, input);
        messageApi.success(t("用户已创建"));
        await reload();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : t("新增用户失败"));
        return false;
      } finally {
        setCreatingUser(false);
      }
    },
    [messageApi, reload, sessionToken, setError, t]
  );

  return {
    creatingUser,
    createUser
  };
}
