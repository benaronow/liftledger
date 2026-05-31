"use client";

import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { initApiClient, setTokenGetter } from "@liftledger/api-client";
import { PropsWithChildren } from "react";
import { SWRConfig } from "swr";

// Configure the api-client singleton once at module load so any SWR fetcher
// running during initial render finds a configured axios instance.
let apiClientReady = false;
const ensureApiClient = () => {
  if (apiClientReady) return;
  initApiClient({ baseURL: process.env.NEXT_PUBLIC_API_URL! });
  apiClientReady = true;
};
ensureApiClient();

const AxiosTokenBridge = ({ children }: PropsWithChildren) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  // Set synchronously during render so the api-client's axios interceptor sees
  // the getter when the first child-tree fetch fires its effect. Wiring this in
  // useEffect would race: effects run child-first, so SWR fetches before the
  // bridge wires the token, resulting in a 401 → retry → 200 cycle.
  setTokenGetter(isAuthenticated ? () => getAccessTokenSilently() : null);

  return <>{children}</>;
};

export const Providers = ({ children }: PropsWithChildren) => {
  // "use client" component — body runs in the browser, so window is available
  // on first render. Auth0Provider captures redirect_uri at first mount and
  // stores it as the default for loginWithRedirect, so we have to set it on
  // that first render or it stays undefined forever.
  const redirectUri =
    typeof window !== "undefined" ? window.location.origin : undefined;

  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
      }}
      cacheLocation="memory"
    >
      <SWRConfig
        value={{
          // SWR's defaults assume multi-writer collaborative data and refetch
          // aggressively (focus, visibility, reconnect). For a workout tracker
          // where the same user is the only writer, those refetches are noise.
          // Per-hook config can still opt back in.
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
