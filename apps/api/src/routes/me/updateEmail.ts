import type { FastifyReply } from "fastify";
import UserModel from "@liftledger/shared/models/user";
import ProgramModel from "@liftledger/shared/models/program";
import type { AuthedUser } from "../../auth";
import { getAuth0Token, RATE_LIMIT_MESSAGE } from "../../auth0Management";
import { env } from "../../env";

export const updateEmail = async ({
  reply,
  me,
  sub,
  email,
}: {
  reply: FastifyReply;
  me: AuthedUser;
  sub: string;
  email?: unknown;
}) => {
  const isValidEmail =
    email &&
    typeof email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValidEmail) return reply.code(400).send({ error: "Invalid email" });

  if (!sub.startsWith("auth0|"))
    return reply
      .code(400)
      .send({ error: "Email cannot be changed for connected accounts" });

  const tokenResult = await getAuth0Token();
  if (!tokenResult.ok)
    return reply.code(tokenResult.status).send({ error: tokenResult.message });
  const token = tokenResult.token;

  const auth0UsersByEmail = await fetch(
    `https://${env.AUTH0_TENANT_DOMAIN}/api/v2/users-by-email?email=${encodeURIComponent(email as string)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (auth0UsersByEmail.status === 429)
    return reply.code(429).send({ error: RATE_LIMIT_MESSAGE });
  const sameEmailUsers: { user_id: string }[] = auth0UsersByEmail.ok
    ? ((await auth0UsersByEmail.json()) as { user_id: string }[])
    : [];
  const sameEmailUserExists = sameEmailUsers.some(
    (u) => u.user_id.toLowerCase() !== sub.toLowerCase(),
  );
  if (sameEmailUserExists)
    return reply
      .code(409)
      .send({ error: "A user with this email already exists." });

  const oldEmail = me.email;

  const emailUpdate = await fetch(
    `https://${env.AUTH0_TENANT_DOMAIN}/api/v2/users/${encodeURIComponent(sub)}`,
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

  if (emailUpdate.status === 429)
    return reply.code(429).send({ error: RATE_LIMIT_MESSAGE });

  if (!emailUpdate.ok) {
    const error = (await emailUpdate.json().catch(() => ({}))) as {
      message?: string;
    };
    return reply
      .code(emailUpdate.status)
      .send({ error: error.message ?? "Failed to update email" });
  }

  let updatedUser;
  try {
    updatedUser = await UserModel.findOneAndUpdate(
      { auth0Id: sub },
      { $set: { email } },
      { new: true },
    ).populate([{ path: "programs", model: ProgramModel }]);
  } catch (dbErr) {
    console.error(
      "Failed to update MongoDB email after Auth0 success — reverting Auth0:",
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
        body: JSON.stringify({
          email: oldEmail,
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

    return reply
      .code(500)
      .send({ error: "Failed to update email in database" });
  }

  // Fire-and-forget: send a verification link to the new address only
  // after both Auth0 and MongoDB have been updated successfully.
  void fetch(
    `https://${env.AUTH0_TENANT_DOMAIN}/api/v2/jobs/verification-email`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: sub,
        client_id: env.AUTH0_CLIENT_ID,
      }),
    },
  ).catch((err) => console.error("Failed to send verification email:", err));

  return updatedUser;
};
