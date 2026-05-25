import { connectDB } from "@/lib/connectDB";
import UserModel from "@/lib/models/user";
import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

const getAuth0Token = async (): Promise<string> => {
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

  const data = await res.json();

  if (!data.access_token) {
    console.error("Auth0 token error:", data);
    throw new Error(
      data.error_description ?? "Failed to obtain management token",
    );
  }

  return data.access_token;
};

export const PATCH = async (req: NextRequest) => {
  const session = await auth0.getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, dbUserId } = await req.json();

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

  let token: string;
  try {
    token = await getAuth0Token();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }

  const auth0UsersByEmail = await fetch(
    `https://${process.env.AUTH0_TENANT_DOMAIN}/api/v2/users-by-email?email=${encodeURIComponent(email)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const sameEmailUsers: { user_id: string }[] = await auth0UsersByEmail.json();
  const sameEmailUserExists = sameEmailUsers.some((u) => u.user_id !== sub);
  if (sameEmailUserExists)
    return NextResponse.json(
      { error: "A user with this email already exists." },
      { status: 409 },
    );

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

  if (!emailUpdate.ok) {
    const error = await emailUpdate.json();
    return NextResponse.json(
      { error: error.message ?? "Failed to update email" },
      { status: emailUpdate.status },
    );
  }

  await connectDB();
  await UserModel.findByIdAndUpdate(dbUserId, { $set: { email } });

  return NextResponse.json({ ok: true });
};

export const DELETE = async () => {
  const session = await auth0.getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = session.user.sub;

  let token: string;
  try {
    token = await getAuth0Token();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }

  const deleteRes = await fetch(
    `https://${process.env.AUTH0_TENANT_DOMAIN}/api/v2/users/${encodeURIComponent(sub)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!deleteRes.ok) {
    let errorMsg = "Failed to delete Auth0 account";
    try {
      const error = await deleteRes.json();
      errorMsg = error.message ?? errorMsg;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      // Auth0 DELETE returns 204 No Content on success; error body may be empty
    }
    return NextResponse.json({ error: errorMsg }, { status: deleteRes.status });
  }

  await connectDB();
  await UserModel.deleteOne({ email: session.user.email });

  return NextResponse.json({ ok: true });
};

// POST: send password reset email via Auth0 Authentication API
export const POST = async () => {
  const session = await auth0.getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!session.user.sub.startsWith("auth0|"))
    return NextResponse.json(
      { error: "Password cannot be reset for connected accounts" },
      { status: 400 },
    );

  const res = await fetch(
    `https://${process.env.AUTH0_DOMAIN}/dbconnections/change_password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        email: session.user.email,
        connection: "Username-Password-Authentication",
      }),
    },
  );

  if (!res.ok)
    return NextResponse.json(
      { error: "Failed to send reset email" },
      { status: res.status },
    );

  return NextResponse.json({ ok: true });
};
