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

  await connectDB();
  let oldUser;
  try {
    oldUser = await UserModel.findOneAndUpdate(
      { auth0Id: sub },
      { $set: { email } },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to update email in database" },
      { status: 500 },
    );
  }

  if (!oldUser)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

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

    try {
      await UserModel.findOneAndUpdate(
        { auth0Id: sub },
        { $set: { email: oldUser.email } },
      );
    } catch (revertErr) {
      console.error(
        "Failed to revert MongoDB email update after Auth0 failure:",
        revertErr,
      );
    }

    return NextResponse.json(
      { error: error.message ?? "Failed to update email" },
      { status: emailUpdate.status },
    );
  }

  try {
    const newUser = await UserModel.findOne({ auth0Id: sub });
    return NextResponse.json(newUser);
  } catch (e) {
    console.error("Failed to fetch updated user after email change:", e);
    return NextResponse.json(
      { error: "Email updated but failed to fetch updated user" },
      { status: 500 },
    );
  }
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

  await connectDB();
  let deletedUser;
  try {
    deletedUser = await UserModel.findOneAndDelete({ auth0Id: sub });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete account from database" },
      { status: 500 },
    );
  }

  if (!deletedUser)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const deleteRes = await fetch(
    `https://${process.env.AUTH0_TENANT_DOMAIN}/api/v2/users/${encodeURIComponent(sub)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!deleteRes.ok) {
    const error = await deleteRes.json();

    try {
      await UserModel.create(deletedUser.toObject());
    } catch (revertErr) {
      console.error(
        "Failed to restore MongoDB user after Auth0 failure:",
        revertErr,
      );
    }

    return NextResponse.json(
      { error: error.message ?? "Failed to delete Auth0 account" },
      { status: deleteRes.status },
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

  if (!res.ok)
    return NextResponse.json(
      { error: "Failed to send reset email" },
      { status: res.status },
    );

  return NextResponse.json({ ok: true });
};
