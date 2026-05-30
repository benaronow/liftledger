import { connectDB } from "@/lib/connectDB";
import UserModel from "@/lib/models/user";
import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

type TokenResult =
  | { ok: true; token: string }
  | { ok: false; status: number; message: string };

const getAuth0Token = async (): Promise<TokenResult> => {
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

const rateLimitResponse = () =>
  NextResponse.json(
    { error: "Auth0 rate limit exceeded — please try again in a moment" },
    { status: 429 },
  );

export const PATCH = async (req: NextRequest) => {
  const session = await auth0.getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email } = await req.json();

  const isValidEmail =
    email &&
    typeof email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValidEmail)
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  const sub = session.user.sub;
  if (!sub.startsWith("auth0|"))
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
    (u) => u.user_id.toLowerCase() !== sub.toLowerCase(),
  );
  if (sameEmailUserExists)
    return NextResponse.json(
      { error: "A user with this email already exists." },
      { status: 409 },
    );

  await connectDB();
  const existingUser = await UserModel.findOne({ auth0Id: sub });
  if (!existingUser)
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  const oldEmail = existingUser.email;

  const emailUpdate = await fetch(
    `https://${process.env.AUTH0_TENANT_DOMAIN}/api/v2/users/${encodeURIComponent(sub)}`,
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
      { auth0Id: sub },
      { $set: { email } },
      { new: true },
    );
  } catch (dbErr) {
    console.error(
      "Failed to update MongoDB email after Auth0 success — reverting Auth0:",
      dbErr,
    );

    const revertRes = await fetch(
      `https://${process.env.AUTH0_TENANT_DOMAIN}/api/v2/users/${encodeURIComponent(sub)}`,
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
        sub,
      );
    }

    return NextResponse.json(
      { error: "Failed to update email in database" },
      { status: 500 },
    );
  }

  return NextResponse.json(updatedUser);
};

export const DELETE = async (req: NextRequest) => {
  const { id } = await req.json();
  if (!id)
    return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await connectDB();
  const user = await UserModel.findOne({ _id: id });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const session = await auth0.getSession();
  if (!session || session.user.sub !== user.auth0Id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = user.auth0Id;

  const tokenResult = await getAuth0Token();
  if (!tokenResult.ok)
    return NextResponse.json(
      { error: tokenResult.message },
      { status: tokenResult.status },
    );
  const token = tokenResult.token;

  const deleteRes = await fetch(
    `https://${process.env.AUTH0_TENANT_DOMAIN}/api/v2/users/${encodeURIComponent(sub)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (deleteRes.status === 429) return rateLimitResponse();

  if (!deleteRes.ok) {
    const error = await deleteRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: error.message ?? "Failed to delete Auth0 account" },
      { status: deleteRes.status },
    );
  }

  try {
    await UserModel.findOneAndDelete({ _id: id });
  } catch (dbErr) {
    console.error(
      "Auth0 account deleted but MongoDB cleanup failed for id:",
      id,
      dbErr,
    );
  }

  return NextResponse.json({ ok: true });
};

// POST: send password reset email via Auth0 Authentication API
export const POST = async () => {
  const session = await auth0.getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = session.user.sub;
  if (!sub.startsWith("auth0|"))
    return NextResponse.json(
      { error: "Password cannot be reset for connected accounts" },
      { status: 400 },
    );

  // Use the email from MongoDB rather than the session, since the session
  // email can be stale if the user updated their email in the same session.
  await connectDB();
  const dbUser = await UserModel.findOne({ auth0Id: sub }, { email: 1 });
  if (!dbUser)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const res = await fetch(
    `https://${process.env.AUTH0_DOMAIN}/dbconnections/change_password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        email: dbUser.email,
        connection: "Username-Password-Authentication",
      }),
    },
  );

  if (res.status === 429) return rateLimitResponse();

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to send reset email" },
      { status: res.status },
    );
  }

  return NextResponse.json({ ok: true });
};
