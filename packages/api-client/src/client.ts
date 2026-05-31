import axios, { AxiosInstance } from "axios";

type TokenGetter = () => Promise<string>;

let client: AxiosInstance | null = null;
let tokenGetter: TokenGetter | null = null;

export interface InitApiClientOptions {
  baseURL: string;
  getToken?: TokenGetter;
}

// Called once at app startup. Each platform (web, mobile) initializes with its
// own baseURL and (later) a token getter wired to that platform's Auth0 SDK.
export const initApiClient = ({ baseURL, getToken }: InitApiClientOptions) => {
  client = axios.create({ baseURL });
  if (getToken) tokenGetter = getToken;

  client.interceptors.request.use(async (config) => {
    if (tokenGetter) {
      try {
        const token = await tokenGetter();
        config.headers.set("Authorization", `Bearer ${token}`);
      } catch {
        // Auth0 throws when there's no active session — let the request go out
        // without a header so the API returns 401 and the UI can react.
      }
    }
    return config;
  });
};

// Wires the token-getter after init. Token availability is async (Auth0 SDK
// bootstraps after mount) so this is typically called from an effect inside
// the platform's Auth0Provider subtree.
export const setTokenGetter = (getter: TokenGetter | null) => {
  tokenGetter = getter;
};

export const getApiClient = (): AxiosInstance => {
  if (!client) {
    throw new Error(
      "@liftledger/api-client: initApiClient() must be called before any hook or mutation.",
    );
  }
  return client;
};
