import type { FastifyInstance } from "fastify";
import mongoose from "mongoose";

// Unauthenticated liveness/readiness probe for the platform (Fly) health
// check. Reports 200 only when Mongo is connected (readyState 1) so a machine
// that lost its DB connection is taken out of rotation.
const healthRoutes = async (app: FastifyInstance) => {
  app.get("/health", async (_req, reply) => {
    const dbConnected = mongoose.connection.readyState === 1;
    return reply
      .code(dbConnected ? 200 : 503)
      .send({ status: dbConnected ? "ok" : "degraded", db: dbConnected });
  });
};

export default healthRoutes;
