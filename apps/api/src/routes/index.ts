import type { FastifyInstance } from "fastify";
import usersRoutes from "./users";
import meRoutes from "./me";
import userByIdRoutes from "./userById";
import blockByIdRoutes from "./blockById";

export const registerRoutes = async (app: FastifyInstance) => {
  await app.register(usersRoutes);
  await app.register(meRoutes);
  await app.register(userByIdRoutes);
  await app.register(blockByIdRoutes);
};
