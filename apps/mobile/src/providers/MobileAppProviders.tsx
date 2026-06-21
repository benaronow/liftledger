import { initApiClient } from "@liftledger/api-client";
import { PropsWithChildren, useRef } from "react";
import { Auth0Provider, useAuth0 } from "react-native-auth0";
import { SWRConfig } from "swr";
import { env } from "../config/env";
import { SnackbarProvider } from "./SnackbarProvider";
import { ThemeProvider } from "./ThemeProvider";

// Mirror of apps/web/src/AppProviders.tsx. The only platform-specific seam:
// getToken pulls the access token from react-native-auth0's credentials
// manager (which silently refreshes), where web uses getAccessTokenSilently.
const ApiClientProvider = ({ children }: PropsWithChildren) => {
  const { getCredentials } = useAuth0();
  // Keep a live ref to the latest getCredentials so the token closure below
  // never goes stale, even though initApiClient only runs once.
  const getCredentialsRef = useRef(getCredentials);
  getCredentialsRef.current = getCredentials;

  // Configure the shared axios client once, synchronously on first render —
  // children's SWR hooks read it as they mount, so this must run before them
  // (not in an effect). The ref guard keeps later re-renders from redoing it.
  const initialized = useRef(false);
  if (!initialized.current) {
    initApiClient({
      baseURL: env.apiUrl,
      getToken: async () => (await getCredentialsRef.current()).accessToken,
    });
    initialized.current = true;
  }
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
      <ApiClientProvider>
        <ThemeProvider>
          <SnackbarProvider>{children}</SnackbarProvider>
        </ThemeProvider>
      </ApiClientProvider>
    </SWRConfig>
  </Auth0Provider>
);
