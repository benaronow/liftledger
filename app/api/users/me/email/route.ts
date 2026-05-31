import { authorizeMe } from "@/lib/auth";
import { getAuth0Token, rateLimitResponse } from "@/lib/auth0Management";
import UserModel from "@/lib/models/user";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = async (req: NextRequest) => {
  const auth = await authorizeMe();
  if (!auth.ok) return auth.response;
  const { session, me } = auth;

  const { email } = await req.json();

  const isValidEmail =
    email &&
    typeof email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValidEmail)
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  if (!session.user.sub.startsWith("auth0|"))
    return NextResponse.json(
      { error: "Email cannot be changed for connected accounts" },
      { status: 400 },
    );

  const tokenResult = await getAuth0Token();
  if (!tokenResult.ok)
    return NextResponse.json(
      { error: tokenResult.message },
      { status: tokenResult.status },
    );
  const token = tokenResult.token;

  const auth0UsersByEmail = await fetch(
    `https://${process.env.AUTH0_TENANT_DOMAIN}/api/v2/users-by-email?email=${encodeURIComponent(email)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (auth0UsersByEmail.status === 429) return rateLimitResponse();
  const sameEmailUsers: { user_id: string }[] = auth0UsersByEmail.ok
    ? await auth0UsersByEmail.json()
    : [];
  const sameEmailUserExists = sameEmailUsers.some(
    (u) => u.user_id.toLowerCase() !== session.user.sub.toLowerCase(),
  );
  if (sameEmailUserExists)
    return NextResponse.json(
      { error: "A user with this email already exists." },
      { status: 409 },
    );

  const oldEmail = me.email;

  const emailUpdate = await fetch(
    `https://${process.env.AUTH0_TENANT_DOMAIN}/api/v2/users/${encodeURIComponent(session.user.sub)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        email_verified: false,
        connection: "Username-Password-Authentication",
      }),
    },
  );

  if (emailUpdate.status === 429) return rateLimitResponse();

  if (!emailUpdate.ok) {
    const error = await emailUpdate.json().catch(() => ({}));
    return NextResponse.json(
      { error: error.message ?? "Failed to update email" },
      { status: emailUpdate.status },
    );
  }

  let updatedUser;
  try {
    updatedUser = await UserModel.findOneAndUpdate(
      { auth0Id: session.user.sub },
      { $set: { email } },
      { new: true },
    );
  } catch (dbErr) {
    console.error(
      "Failed to update MongoDB email after Auth0 success — reverting Auth0:",
      dbErr,
    );

    const revertRes = await fetch(
      `https://${process.env.AUTH0_TENANT_DOMAIN}/api/v2/users/${encodeURIComponent(session.user.sub)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: oldEmail,
          email_verified: session.user.email_verified,
          connection: "Username-Password-Authentication",
        }),
      },
    );
    if (!revertRes.ok) {
      console.error(
        "Failed to revert Auth0 email after MongoDB failure — accounts now out of sync for sub:",
        session.user.sub,
      );
    }

    return NextResponse.json(
      { error: "Failed to update email in database" },
      { status: 500 },
    );
  }

  return NextResponse.json(updatedUser);
};
