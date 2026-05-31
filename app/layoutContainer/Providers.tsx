"use client";

import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useEffect, useState } from "react";
import { setTokenGetter } from "@/lib/config";

const AxiosTokenBridge = ({ children }: PropsWithChildren) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (!isAuthenticated) {
      setTokenGetter(null);
      return;
    }
    setTokenGetter(() => getAccessTokenSilently());
    return () => setTokenGetter(null);
  }, [isAuthenticated, getAccessTokenSilently]);

  return <>{children}</>;
};

export const Providers = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1 },
        },
      }),
  );

  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!}
      authorizationParams={{
        redirect_uri:
          typeof window !== "undefined" ? window.location.origin : undefined,
        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
      }}
      cacheLocation="memory"
    >
      <QueryClientProvider client={queryClient}>
        <AxiosTokenBridge>{children}</AxiosTokenBridge>
      </QueryClientProvider>
    </Auth0Provider>
  );
};
