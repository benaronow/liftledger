import type { FastifyReply } from "fastify";
import { getAuth0Token, RATE_LIMIT_MESSAGE } from "../../auth0Management";
import { env } from "../../env";

// Resend the Auth0 verification email for the authenticated caller. Like the
// Auth0 profile endpoint, this runs during onboarding before a DB user exists, so
// it only requires a valid token (no authorizeMe).
export const resendVerification = async ({
  reply,
  sub,
}: {
  reply: FastifyReply;
  sub: string;
}) => {
  const tokenResult = await getAuth0Token();
  if (!tokenResult.ok)
    return reply.code(tokenResult.status).send({ error: tokenResult.message });

  const res = await fetch(
    `https://${env.AUTH0_TENANT_DOMAIN}/api/v2/jobs/verification-email`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenResult.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: sub,
        // Mobile-only endpoint — send from the native client so the email
        // matches the one Auth0 sent at signup.
        client_id: env.AUTH0_MOBILE_CLIENT_ID,
      }),
    },
  );

  if (res.status === 429)
    return reply.code(429).send({ error: RATE_LIMIT_MESSAGE });

  if (!res.ok) {
    const error = (await res.json().catch(() => ({}))) as {
      message?: string;
    };
    return reply.code(res.status).send({
      error: error.message ?? "Failed to send verification email",
    });
  }

  return { ok: true };
};
