import type { FastifyInstance } from "fastify";
import type { User } from "@liftledger/shared";
import { authorizeCaller } from "../../auth";
import { listUsers } from "./listUsers";
import { createUser } from "./createUser";
import { getUser } from "./getUser";

type IdParams = { id: string };

const userRoutes = async (app: FastifyInstance) => {
  app.get("/users", { preHandler: app.authenticate }, async (_req, reply) => {
    return listUsers({ reply });
  });

  app.post("/users", { preHandler: app.authenticate }, async (req, reply) => {
    return createUser({
      reply,
      body: req.body as Partial<User>,
      sub: req.user.sub,
    });
  });

  app.get<{ Params: IdParams }>(
    "/users/:id",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      return getUser({ reply, id });
    },
  );
};

export default userRoutes;
