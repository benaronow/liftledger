import { env } from "./env";

export type TokenResult =
  | { ok: true; token: string }
  | { ok: false; status: number; message: string };

export const getAuth0Token = async (): Promise<TokenResult> => {
  const res = await fetch(`https://${env.AUTH0_TENANT_DOMAIN}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.AUTH0_MGMT_CLIENT_ID,
      client_secret: env.AUTH0_MGMT_CLIENT_SECRET,
      audience: `https://${env.AUTH0_TENANT_DOMAIN}/api/v2/`,
      grant_type: "client_credentials",
    }),
  });

  if (res.status === 429)
    return {
      ok: false,
      status: 429,
      message: "Auth0 rate limit exceeded — please try again in a moment",
    };

  const data = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    error_description?: string;
  };

  if (!res.ok || !data.access_token) {
    console.error("Auth0 token error:", data);
    return {
      ok: false,
      status: res.status || 500,
      message: data.error_description ?? "Failed to obtain management token",
    };
  }

  return { ok: true, token: data.access_token };
};

export const RATE_LIMIT_MESSAGE =
  "Auth0 rate limit exceeded — please try again in a moment";
