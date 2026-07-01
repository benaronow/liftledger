import { PropsWithChildren } from "react";
import { Auth0Provider } from "react-native-auth0";
import { SWRConfig } from "swr";
import { env } from "../config/env";
import { SnackbarProvider } from "./SnackbarProvider";
import { ThemeProvider } from "./ThemeProvider";
import { ApiClientProvider } from "./ApiClientProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";

export const AppProviders = ({ children }: PropsWithChildren) => (
  <Auth0Provider domain={env.auth0Domain} clientId={env.auth0ClientId}>
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 10_000,
      }}
    >
      <ApiClientProvider>
        <SafeAreaProvider>
          <ThemeProvider>
            <SnackbarProvider>{children}</SnackbarProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </ApiClientProvider>
    </SWRConfig>
  </Auth0Provider>
);
