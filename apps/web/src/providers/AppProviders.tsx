import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { initApiClient } from "@liftledger/api-client";
import { PropsWithChildren } from "react";
import { SWRConfig } from "swr";
import { ThemeProvider } from "./ThemeProvider";

const ApiClientProvider = ({ children }: PropsWithChildren) => {
  const { getAccessTokenSilently } = useAuth0();
  initApiClient({
    baseURL: import.meta.env.VITE_API_URL,
    getToken: () => getAccessTokenSilently(),
  });
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
        <ApiClientProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </ApiClientProvider>
      </SWRConfig>
    </Auth0Provider>
  );
};
