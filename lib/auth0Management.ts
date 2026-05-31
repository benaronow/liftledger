import { NextResponse } from "next/server";

export type TokenResult =
  | { ok: true; token: string }
  | { ok: false; status: number; message: string };

export const getAuth0Token = async (): Promise<TokenResult> => {
  const res = await fetch(
    `https://${process.env.AUTH0_TENANT_DOMAIN}/oauth/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.AUTH0_MGMT_CLIENT_ID,
        client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
        audience: `https://${process.env.AUTH0_TENANT_DOMAIN}/api/v2/`,
        grant_type: "client_credentials",
      }),
    },
  );

  if (res.status === 429)
    return {
      ok: false,
      status: 429,
      message: "Auth0 rate limit exceeded — please try again in a moment",
    };

  const data = await res.json();

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

export const rateLimitResponse = () =>
  NextResponse.json(
    { error: "Auth0 rate limit exceeded — please try again in a moment" },
    { status: 429 },
  );
