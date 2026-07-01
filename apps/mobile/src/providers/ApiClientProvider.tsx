import { PropsWithChildren, useRef } from "react";
import { useAuth0 } from "react-native-auth0";
import { initApiClient } from "@liftledger/api-client";
import { env } from "../config/env";

export const ApiClientProvider = ({ children }: PropsWithChildren) => {
  const { getCredentials } = useAuth0();

  const getCredentialsRef = useRef(getCredentials);
  getCredentialsRef.current = getCredentials;

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
