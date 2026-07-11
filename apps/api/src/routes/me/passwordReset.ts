import type { FastifyReply } from "fastify";
import type { AuthedUser } from "../../auth";
import { RATE_LIMIT_MESSAGE } from "../../auth0Management";
import { env } from "../../env";

export const passwordReset = async ({
  reply,
  me,
  sub,
}: {
  reply: FastifyReply;
  me: AuthedUser;
  sub: string;
}) => {
  if (!sub.startsWith("auth0|"))
    return reply.code(400).send({
      error: "Password cannot be reset for connected accounts",
    });

  let res;
  try {
    res = await fetch(
      `https://${env.AUTH0_DOMAIN}/dbconnections/change_password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: env.AUTH0_CLIENT_ID,
          email: me.email,
          connection: "Username-Password-Authentication",
        }),
      },
    );
  } catch (error) {
    console.error("Failed to reach Auth0 for password reset:", error);
    return reply.code(502).send({ error: "Failed to send reset email" });
  }

  if (res.status === 429)
    return reply.code(429).send({ error: RATE_LIMIT_MESSAGE });

  if (!res.ok)
    return reply
      .code(res.status)
      .send({ error: "Failed to send reset email" });

  return { ok: true };
};
