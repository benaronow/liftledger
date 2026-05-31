import { authorizeMe, userNotFoundResponse } from "@/lib/auth";
import { getAuth0Token, rateLimitResponse } from "@/lib/auth0Management";
import BlockModel from "@/lib/models/block";
import UserModel from "@/lib/models/user";
import { NextResponse } from "next/server";

export const GET = async () => {
  const auth = await authorizeMe();
  if (!auth.ok) return auth.response;
  const { me } = auth;

  try {
    const user = await UserModel.findOne({ _id: me._id }).populate([
      { path: "blocks", model: BlockModel },
    ]);
    if (!user) return userNotFoundResponse();

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    return NextResponse.json(
      { error: "Failed to fetch current user" },
      { status: 500 },
    );
  }
};

export const DELETE = async () => {
  const auth = await authorizeMe();
  if (!auth.ok) return auth.response;
  const { me, session } = auth;

  const tokenResult = await getAuth0Token();
  if (!tokenResult.ok)
    return NextResponse.json(
      { error: tokenResult.message },
      { status: tokenResult.status },
    );
  const token = tokenResult.token;

  const deleteRes = await fetch(
    `https://${process.env.AUTH0_TENANT_DOMAIN}/api/v2/users/${encodeURIComponent(session.user.sub)}`,
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
    await UserModel.findOneAndDelete({ _id: me._id });
  } catch (dbErr) {
    console.error(
      "Auth0 account deleted but MongoDB cleanup failed for id:",
      me._id,
      dbErr,
    );
  }

  return NextResponse.json({ ok: true });
};
