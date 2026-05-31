import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

type TokenGetter = () => Promise<string>;

let tokenGetter: TokenGetter | null = null;

// Called by the AxiosTokenBridge component once Auth0Provider is ready.
// Without this hook, requests go out without an Authorization header — useful
// for routes that don't need auth (none right now) and for the brief moment
// before Auth0 finishes restoring its session.
export const setTokenGetter = (getter: TokenGetter | null) => {
  tokenGetter = getter;
};

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({ baseURL });

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (tokenGetter) {
      try {
        const token = await tokenGetter();
        config.headers.set("Authorization", `Bearer ${token}`);
      } catch {
        // Auth0 will throw if no active session; let the request go out without
        // a header so the server returns 401 and the UI can react accordingly.
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    console.log(error);
    return Promise.reject(error);
  },
);

export default api;
