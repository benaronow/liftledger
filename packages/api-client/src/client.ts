import axios, { AxiosInstance } from "axios";

type TokenGetter = () => Promise<string>;

let client: AxiosInstance | null = null;

export interface InitApiClientOptions {
  baseURL: string;
  getToken?: TokenGetter;
}

// Called once at app startup (idempotent — subsequent calls are no-ops).
// Each platform (web, mobile) initializes with its own baseURL and a token
// getter wired to that platform's Auth0 SDK.
export const initApiClient = ({ baseURL, getToken }: InitApiClientOptions) => {
  if (client) return;
  client = axios.create({ baseURL });

  client.interceptors.request.use(async (config) => {
    if (getToken) {
      try {
        const token = await getToken();
        config.headers.set("Authorization", `Bearer ${token}`);
      } catch {
        // Auth0 throws when there's no active session — let the request go out
        // without a header so the API returns 401 and the UI can react.
      }
    }
    return config;
  });
};

export const getApiClient = (): AxiosInstance => {
  if (!client) {
    throw new Error(
      "@liftledger/api-client: initApiClient() must be called before any hook or mutation.",
    );
  }
  return client;
};
