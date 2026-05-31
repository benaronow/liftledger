import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { initApiClient, setTokenGetter } from "@liftledger/api-client";
import { PropsWithChildren } from "react";
import { SWRConfig } from "swr";

// Module-level — api-client is a singleton, so this only runs once.
let apiClientReady = false;
const ensureApiClient = () => {
  if (apiClientReady) return;
  initApiClient({ baseURL: import.meta.env.VITE_API_URL });
  apiClientReady = true;
};
ensureApiClient();

const AxiosTokenBridge = ({ children }: PropsWithChildren) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  // Render-time set so the api-client's axios interceptor sees the getter
  // before any child-tree fetch fires. Wiring this in useEffect would race —
  // effects run child-first, so a child SWR hook would fetch tokenless and we
  // would get the 401-then-200 cycle from earlier in the rebuild.
  setTokenGetter(isAuthenticated ? () => getAccessTokenSilently() : null);

  return <>{children}</>;
};

export const Providers = ({ children }: PropsWithChildren) => {
  // No SSR concern in Vite — module evaluates in the browser only, so window
  // is available on first render. Auth0Provider captures redirect_uri once on
  // mount, so it has to be set synchronously here.
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
