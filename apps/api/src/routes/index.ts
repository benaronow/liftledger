import type { FastifyInstance } from "fastify";
import healthRoutes from "./health";
import usersRoutes from "./users";
import meRoutes from "./me";
import userByIdRoutes from "./userById";
import programByIdRoutes from "./programById";
import internalRoutes from "./internal";

export const registerRoutes = async (app: FastifyInstance) => {
  await app.register(healthRoutes);
  await app.register(usersRoutes);
  await app.register(meRoutes);
  await app.register(userByIdRoutes);
  await app.register(programByIdRoutes);
  await app.register(internalRoutes);
};
