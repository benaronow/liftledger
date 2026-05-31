import { authorizeMe } from "@/lib/auth";
import { rateLimitResponse } from "@/lib/auth0Management";
import { NextResponse } from "next/server";

export const POST = async () => {
  const auth = await authorizeMe();
  if (!auth.ok) return auth.response;
  const { session, me } = auth;

  if (!session.user.sub.startsWith("auth0|"))
    return NextResponse.json(
      { error: "Password cannot be reset for connected accounts" },
      { status: 400 },
    );

  let res;
  try {
    res = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/dbconnections/change_password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: process.env.AUTH0_CLIENT_ID,
          email: me.email,
          connection: "Username-Password-Authentication",
        }),
      },
    );
  } catch (error) {
    console.error("Failed to reach Auth0 for password reset:", error);
    return NextResponse.json(
      { error: "Failed to send reset email" },
      { status: 502 },
    );
  }

  if (res.status === 429) return rateLimitResponse();

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to send reset email" },
      { status: res.status },
    );
  }

  return NextResponse.json({ ok: true });
};
