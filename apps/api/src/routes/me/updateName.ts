import type { FastifyReply } from "fastify";
import UserModel from "@liftledger/shared/models/user";
import type { AuthedUser } from "../../auth";
import { getAuth0Token, RATE_LIMIT_MESSAGE } from "../../auth0Management";
import { env } from "../../env";

export const updateName = async ({
  reply,
  me,
  sub,
  fullName,
}: {
  reply: FastifyReply;
  me: AuthedUser;
  sub: string;
  fullName?: unknown;
}) => {
  const trimmedName =
    typeof fullName === "string" ? fullName.trim() : undefined;
  if (!trimmedName) return reply.code(400).send({ error: "Invalid name" });

  const tokenResult = await getAuth0Token();
  if (!tokenResult.ok)
    return reply.code(tokenResult.status).send({ error: tokenResult.message });
  const token = tokenResult.token;

  const oldName = me.fullName;

  const nameUpdate = await fetch(
    `https://${env.AUTH0_TENANT_DOMAIN}/api/v2/users/${encodeURIComponent(sub)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      // Auth0's Management API treats the root `name` as read-only for
      // database-connection users (returns 400), so the editable name is
      // synced into user_metadata instead.
      body: JSON.stringify({ user_metadata: { full_name: trimmedName } }),
    },
  );

  if (nameUpdate.status === 429)
    return reply.code(429).send({ error: RATE_LIMIT_MESSAGE });

  if (!nameUpdate.ok) {
    const error = (await nameUpdate.json().catch(() => ({}))) as {
      message?: string;
    };
    return reply
      .code(nameUpdate.status)
      .send({ error: error.message ?? "Failed to update name" });
  }

  let updatedUser;
  try {
    updatedUser = await UserModel.findOneAndUpdate(
      { auth0Id: sub },
      { $set: { fullName: trimmedName } },
      { new: true },
    );
  } catch (dbErr) {
    console.error(
      "Failed to update MongoDB name after Auth0 success — reverting Auth0:",
      dbErr,
    );

    const revertRes = await fetch(
      `https://${env.AUTH0_TENANT_DOMAIN}/api/v2/users/${encodeURIComponent(sub)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_metadata: { full_name: oldName } }),
      },
    );
    if (!revertRes.ok) {
      console.error(
        "Failed to revert Auth0 name after MongoDB failure — accounts now out of sync for sub:",
        sub,
      );
    }

    return reply.code(500).send({ error: "Failed to update name in database" });
  }

  return updatedUser;
};
