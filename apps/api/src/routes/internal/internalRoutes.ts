import { timingSafeEqual } from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { env } from "../../env";
import { usernameAvailable } from "./usernameAvailable";
import { resetE2EUser } from "./resetE2EUser";
import { seedProgram } from "./seedProgram";

// Constant-time comparison that also avoids leaking length via early return.
const secretMatches = (provided: string, expected: string): boolean => {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
};

const isAuthorized = (req: FastifyRequest): boolean => {
  const expected = env.INTERNAL_API_SECRET;
  if (!expected) return false;
  const provided = req.headers["x-internal-secret"];
  return typeof provided === "string" && secretMatches(provided, expected);
};

const internalRoutes = async (app: FastifyInstance) => {
  // Username uniqueness gate for the Auth0 PreUserRegistration action. MongoDB
  // is the single source of truth for usernames, so the action asks us rather
  // than relying on Auth0's eventually-consistent user search.
  app.get("/internal/username-available", async (req, reply) => {
    if (!env.INTERNAL_API_SECRET)
      return reply.code(503).send({ error: "Internal API not configured" });
    if (!isAuthorized(req))
      return reply.code(401).send({ error: "Unauthorized" });

    const { username } = (req.query ?? {}) as { username?: unknown };
    return usernameAvailable({ reply, username });
  });

  app.post("/internal/e2e/reset", async (req, reply) => {
    if (!env.INTERNAL_API_SECRET || !env.E2E_TEST_AUTH0_ID)
      return reply.code(503).send({ error: "E2E reset not configured" });
    if (!isAuthorized(req))
      return reply.code(401).send({ error: "Unauthorized" });

    return resetE2EUser({ reply });
  });

  app.post("/internal/e2e/seed-program", async (req, reply) => {
    if (!env.INTERNAL_API_SECRET || !env.E2E_TEST_AUTH0_ID)
      return reply.code(503).send({ error: "E2E seed not configured" });
    if (!isAuthorized(req))
      return reply.code(401).send({ error: "Unauthorized" });

    return seedProgram({ reply });
  });
};

export default internalRoutes;
