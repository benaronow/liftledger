import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { initApiClient, setTokenGetter } from "@liftledger/api-client";
import { PropsWithChildren } from "react";
import { SWRConfig } from "swr";

let apiClientReady = false;
const ensureApiClient = () => {
  if (apiClientReady) return;
  initApiClient({ baseURL: import.meta.env.VITE_API_URL });
  apiClientReady = true;
};
ensureApiClient();

const AxiosTokenBridge = ({ children }: PropsWithChildren) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  setTokenGetter(isAuthenticated ? () => getAccessTokenSilently() : null);
  return <>{children}</>;
};

export const AppProviders = ({ children }: PropsWithChildren) => {
  const redirectUri =
    typeof window !== "undefined" ? window.location.origin : undefined;

  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      }}
      cacheLocation="memory"
    >
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          dedupingInterval: 10_000,
        }}
      >
        <AxiosTokenBridge>{children}</AxiosTokenBridge>
      </SWRConfig>
    </Auth0Provider>
  );
};
