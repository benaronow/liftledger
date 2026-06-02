import { initApiClient } from "@liftledger/api-client";
import { PropsWithChildren } from "react";
import { Auth0Provider, useAuth0 } from "react-native-auth0";
import { SWRConfig } from "swr";
import { env } from "../config/env";

// Mirror of apps/web/src/AppProviders.tsx. The only platform-specific seam:
// getToken pulls the access token from react-native-auth0's credentials
// manager (which silently refreshes), where web uses getAccessTokenSilently.
const ApiClientProvider = ({ children }: PropsWithChildren) => {
  const { getCredentials } = useAuth0();
  initApiClient({
    baseURL: env.apiUrl,
    getToken: async () => (await getCredentials()).accessToken,
  });
  return <>{children}</>;
};

export const MobileAppProviders = ({ children }: PropsWithChildren) => (
  <Auth0Provider domain={env.auth0Domain} clientId={env.auth0ClientId}>
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 10_000,
      }}
    >
      <ApiClientProvider>{children}</ApiClientProvider>
    </SWRConfig>
  </Auth0Provider>
);
