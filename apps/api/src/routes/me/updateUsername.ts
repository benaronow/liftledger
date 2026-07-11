import type { FastifyReply } from "fastify";
import UserModel from "@liftledger/shared/models/user";
import ProgramModel from "@liftledger/shared/models/program";
import type { AuthedUser } from "../../auth";
import { getAuth0Token, RATE_LIMIT_MESSAGE } from "../../auth0Management";
import { env } from "../../env";

export const updateUsername = async ({
  reply,
  me,
  sub,
  username,
}: {
  reply: FastifyReply;
  me: AuthedUser;
  sub: string;
  username?: unknown;
}) => {
  const trimmedUsername =
    typeof username === "string" ? username.trim() : undefined;
  if (!trimmedUsername)
    return reply.code(400).send({ error: "Invalid username" });

  // The DB is the single source of truth for usernames, so reject the
  // change up front if another user has already taken this one.
  const usernameTaken = await UserModel.exists({
    username: trimmedUsername,
    auth0Id: { $ne: sub },
  });
  if (usernameTaken)
    return reply
      .code(409)
      .send({ error: "A user with this username already exists." });

  // Connected (social) accounts don't have an Auth0 database username, so
  // for them we only update MongoDB. Database accounts (auth0|) sync to
  // Auth0 first, then MongoDB, reverting Auth0 if the DB write fails.
  const isDatabaseUser = sub.startsWith("auth0|");
  const oldUsername = me.username;

  let token: string | undefined;
  if (isDatabaseUser) {
    const tokenResult = await getAuth0Token();
    if (!tokenResult.ok)
      return reply
        .code(tokenResult.status)
        .send({ error: tokenResult.message });
    token = tokenResult.token;

    const usernameUpdate = await fetch(
      `https://${env.AUTH0_TENANT_DOMAIN}/api/v2/users/${encodeURIComponent(sub)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: trimmedUsername,
          connection: "Username-Password-Authentication",
        }),
      },
    );

    if (usernameUpdate.status === 429)
      return reply.code(429).send({ error: RATE_LIMIT_MESSAGE });

    if (usernameUpdate.status === 409)
      return reply
        .code(409)
        .send({ error: "A user with this username already exists." });

    if (!usernameUpdate.ok) {
      const error = (await usernameUpdate.json().catch(() => ({}))) as {
        message?: string;
      };
      return reply
        .code(usernameUpdate.status)
        .send({ error: error.message ?? "Failed to update username" });
    }
  }

  let updatedUser;
  try {
    updatedUser = await UserModel.findOneAndUpdate(
      { auth0Id: sub },
      { $set: { username: trimmedUsername } },
      { new: true },
    ).populate([{ path: "programs", model: ProgramModel }]);
  } catch (dbErr) {
    console.error("Failed to update MongoDB username:", dbErr);

    // Only revert Auth0 if we actually changed it (database accounts).
    if (isDatabaseUser && token) {
      const revertRes = await fetch(
        `https://${env.AUTH0_TENANT_DOMAIN}/api/v2/users/${encodeURIComponent(sub)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: oldUsername,
            connection: "Username-Password-Authentication",
          }),
        },
      );
      if (!revertRes.ok) {
        console.error(
          "Failed to revert Auth0 username after MongoDB failure — accounts now out of sync for sub:",
          sub,
        );
      }
    }

    return reply
      .code(500)
      .send({ error: "Failed to update username in database" });
  }

  return updatedUser;
};
