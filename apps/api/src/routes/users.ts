import type { FastifyInstance } from "fastify";
import UserModel from "@liftledger/shared/models/user";
import type { User } from "@liftledger/shared";

const usersRoutes = async (app: FastifyInstance) => {
  app.get(
    "/users",
    { preHandler: app.authenticate },
    async (_req, reply) => {
      try {
        const users = await UserModel.find();
        return users;
      } catch (error) {
        console.error("Failed to list users:", error);
        return reply.code(500).send({ error: "Failed to list users" });
      }
    },
  );

  app.post(
    "/users",
    { preHandler: app.authenticate },
    async (req, reply) => {
      try {
        const body = req.body as Partial<User>;
        // Force the auth0Id to the authenticated caller — never trust the body.
        const incoming: Partial<User> = { ...body, auth0Id: req.user.sub };
        const existingUser = await UserModel.findOne({
          auth0Id: incoming.auth0Id,
        });
        if (existingUser)
          return reply.code(400).send({ error: "User already exists" });

        const newUser = await UserModel.create(incoming);
        return newUser;
      } catch (error) {
        console.error("Failed to create user:", error);
        return reply.code(500).send({ error: "Failed to create user" });
      }
    },
  );
};

export default usersRoutes;
