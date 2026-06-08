import { useCallback } from "react";
import { useAuth0 } from "react-native-auth0";
import { useSWRConfig } from "swr";

// Shared logout: clearSession ends the Auth0 session, then we wipe every SWR
// cache entry. Unlike web (whose logout triggers a full page reload that wipes
// the cache), clearSession leaves the JS context intact, so the previous user's
// cached data would otherwise survive and flash before the next user's data
// revalidates.
export const useLogout = () => {
  const { clearSession } = useAuth0();
  const { mutate } = useSWRConfig();

  return useCallback(async () => {
    await clearSession();
    await mutate(() => true, undefined, { revalidate: false });
  }, [clearSession, mutate]);
};
