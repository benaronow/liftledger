import type { FastifyReply } from "fastify";
import { getAuth0Token, RATE_LIMIT_MESSAGE } from "../../auth0Management";
import { env } from "../../env";

// Live Auth0 profile for the authenticated caller. Intentionally does NOT use
// authorizeMe — it must work before a DB user exists (onboarding) so it only
// requires a valid token and reads straight from the Auth0 Management API.
// Surfaces email verification status and the Auth0 username (used to prefill
// the account-creation form for database-connection accounts).
export const getMeAuth0 = async ({
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
    `https://${env.AUTH0_TENANT_DOMAIN}/api/v2/users/${encodeURIComponent(sub)}`,
    { headers: { Authorization: `Bearer ${tokenResult.token}` } },
  );

  if (res.status === 429)
    return reply.code(429).send({ error: RATE_LIMIT_MESSAGE });

  if (!res.ok) {
    const error = (await res.json().catch(() => ({}))) as {
      message?: string;
    };
    return reply
      .code(res.status)
      .send({ error: error.message ?? "Failed to fetch Auth0 profile" });
  }

  const auth0User = (await res.json().catch(() => ({}))) as {
    email_verified?: boolean;
    username?: string;
  };

  return {
    emailVerified: auth0User.email_verified === true,
    username: auth0User.username ?? null,
  };
};
