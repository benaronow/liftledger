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

        const trimmedUsername =
          typeof incoming.username === "string"
            ? incoming.username.trim()
            : "";
        const trimmedName =
          typeof incoming.fullName === "string" ? incoming.fullName.trim() : "";

        // All three are required by the schema; reject up front with a clear
        // message rather than letting Mongoose validation throw a 500.
        if (!trimmedName || !trimmedUsername || !incoming.email)
          return reply.code(400).send({
            error: "Full name, username, and email are required",
          });
        incoming.username = trimmedUsername;
        incoming.fullName = trimmedName;

        const existingUser = await UserModel.findOne({
          auth0Id: incoming.auth0Id,
        });
        if (existingUser)
          return reply.code(400).send({ error: "User already exists" });

        // The DB is the source of truth for usernames/emails — reject taken
        // ones with a friendly 409 instead of a duplicate-key 500.
        if (await UserModel.exists({ username: trimmedUsername }))
          return reply
            .code(409)
            .send({ error: "A user with this username already exists." });
        if (await UserModel.exists({ email: incoming.email }))
          return reply
            .code(409)
            .send({ error: "A user with this email already exists." });

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
