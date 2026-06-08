import { useCallback } from "react";
import { useAuth0 } from "react-native-auth0";
import { useSWRConfig } from "swr";

export const useLogout = () => {
  const { clearSession } = useAuth0();
  const { mutate } = useSWRConfig();

  return useCallback(async () => {
    await clearSession();
    await mutate(() => true, undefined, { revalidate: false });
  }, [clearSession, mutate]);
};
