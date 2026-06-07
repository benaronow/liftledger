import { timingSafeEqual } from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import UserModel from "@liftledger/shared/models/user";
import { env } from "../env";

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

// Routes consumed by trusted server-to-server callers (e.g. Auth0 actions),
// not by end users. Authenticated with a shared secret header rather than a JWT.
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
    const trimmed = typeof username === "string" ? username.trim() : undefined;
    if (!trimmed)
      return reply.code(400).send({ error: "Invalid username" });

    try {
      const taken = await UserModel.exists({ username: trimmed });
      return { available: !taken };
    } catch (error) {
      console.error("Failed to check username availability:", error);
      return reply.code(500).send({ error: "Failed to check username" });
    }
  });
};

export default internalRoutes;
