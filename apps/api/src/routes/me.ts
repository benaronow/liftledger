import type { FastifyInstance } from "fastify";
import UserModel from "@liftledger/shared/models/user";
import BlockModel from "@liftledger/shared/models/block";
import { authorizeMe } from "../auth";
import { getAuth0Token, RATE_LIMIT_MESSAGE } from "../auth0Management";
import { env } from "../env";

const meRoutes = async (app: FastifyInstance) => {
  app.get("/users/me", { preHandler: app.authenticate }, async (req, reply) => {
    const auth = await authorizeMe(req, reply);
    if (!auth.ok) return;
    const { me } = auth;

    try {
      const user = await UserModel.findOne({ _id: me._id }).populate([
        { path: "blocks", model: BlockModel },
      ]);
      if (!user) return reply.code(404).send({ error: "User not found" });

      return user;
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      return reply.code(500).send({ error: "Failed to fetch current user" });
    }
  });

  app.delete(
    "/users/me",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const auth = await authorizeMe(req, reply);
      if (!auth.ok) return;
      const { me } = auth;

      const tokenResult = await getAuth0Token();
      if (!tokenResult.ok)
        return reply
          .code(tokenResult.status)
          .send({ error: tokenResult.message });

      const deleteRes = await fetch(
        `https://${env.AUTH0_TENANT_DOMAIN}/api/v2/users/${encodeURIComponent(req.user.sub)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${tokenResult.token}` },
        },
      );

      if (deleteRes.status === 429)
        return reply.code(429).send({ error: RATE_LIMIT_MESSAGE });

      if (!deleteRes.ok) {
        const error = (await deleteRes.json().catch(() => ({}))) as {
          message?: string;
        };
        return reply
          .code(deleteRes.status)
          .send({ error: error.message ?? "Failed to delete Auth0 account" });
      }

      try {
        await UserModel.findOneAndDelete({ _id: me._id });
      } catch (dbErr) {
        console.error(
          "Auth0 account deleted but MongoDB cleanup failed for id:",
          me._id,
          dbErr,
        );
      }

      return { ok: true };
    },
  );

  app.post(
    "/users/me/password-reset",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const auth = await authorizeMe(req, reply);
      if (!auth.ok) return;
      const { me } = auth;

      if (!req.user.sub.startsWith("auth0|"))
        return reply.code(400).send({
          error: "Password cannot be reset for connected accounts",
        });

      let res;
      try {
        res = await fetch(
          `https://${env.AUTH0_DOMAIN}/dbconnections/change_password`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              client_id: env.AUTH0_CLIENT_ID,
              email: me.email,
              connection: "Username-Password-Authentication",
            }),
          },
        );
      } catch (error) {
        console.error("Failed to reach Auth0 for password reset:", error);
        return reply.code(502).send({ error: "Failed to send reset email" });
      }

      if (res.status === 429)
        return reply.code(429).send({ error: RATE_LIMIT_MESSAGE });

      if (!res.ok)
        return reply
          .code(res.status)
          .send({ error: "Failed to send reset email" });

      return { ok: true };
    },
  );

  app.patch(
    "/users/me/email",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const auth = await authorizeMe(req, reply);
      if (!auth.ok) return;
      const { me } = auth;

      const { email } = (req.body ?? {}) as { email?: unknown };

      const isValidEmail =
        email &&
        typeof email === "string" &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isValidEmail)
        return reply.code(400).send({ error: "Invalid email" });

      if (!req.user.sub.startsWith("auth0|"))
        return reply
          .code(400)
          .send({ error: "Email cannot be changed for connected accounts" });

      const tokenResult = await getAuth0Token();
      if (!tokenResult.ok)
        return reply
          .code(tokenResult.status)
          .send({ error: tokenResult.message });
      const token = tokenResult.token;

      const auth0UsersByEmail = await fetch(
        `https://${env.AUTH0_TENANT_DOMAIN}/api/v2/users-by-email?email=${encodeURIComponent(email as string)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (auth0UsersByEmail.status === 429)
        return reply.code(429).send({ error: RATE_LIMIT_MESSAGE });
      const sameEmailUsers: { user_id: string }[] = auth0UsersByEmail.ok
        ? ((await auth0UsersByEmail.json()) as { user_id: string }[])
        : [];
      const sameEmailUserExists = sameEmailUsers.some(
        (u) => u.user_id.toLowerCase() !== req.user.sub.toLowerCase(),
      );
      if (sameEmailUserExists)
        return reply
          .code(409)
          .send({ error: "A user with this email already exists." });

      const oldEmail = me.email;

      const emailUpdate = await fetch(
        `https://${env.AUTH0_TENANT_DOMAIN}/api/v2/users/${encodeURIComponent(req.user.sub)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            email_verified: false,
            connection: "Username-Password-Authentication",
          }),
        },
      );

      if (emailUpdate.status === 429)
        return reply.code(429).send({ error: RATE_LIMIT_MESSAGE });

      if (!emailUpdate.ok) {
        const error = (await emailUpdate.json().catch(() => ({}))) as {
          message?: string;
        };
        return reply
          .code(emailUpdate.status)
          .send({ error: error.message ?? "Failed to update email" });
      }

      let updatedUser;
      try {
        updatedUser = await UserModel.findOneAndUpdate(
          { auth0Id: req.user.sub },
          { $set: { email } },
          { new: true },
        ).populate([{ path: "blocks", model: BlockModel }]);
      } catch (dbErr) {
        console.error(
          "Failed to update MongoDB email after Auth0 success — reverting Auth0:",
          dbErr,
        );

        const revertRes = await fetch(
          `https://${env.AUTH0_TENANT_DOMAIN}/api/v2/users/${encodeURIComponent(req.user.sub)}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: oldEmail,
              connection: "Username-Password-Authentication",
            }),
          },
        );
        if (!revertRes.ok) {
          console.error(
            "Failed to revert Auth0 email after MongoDB failure — accounts now out of sync for sub:",
            req.user.sub,
          );
        }

        return reply
          .code(500)
          .send({ error: "Failed to update email in database" });
      }

      // Fire-and-forget: send a verification link to the new address only
      // after both Auth0 and MongoDB have been updated successfully.
      void fetch(
        `https://${env.AUTH0_TENANT_DOMAIN}/api/v2/jobs/verification-email`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: req.user.sub,
            client_id: env.AUTH0_CLIENT_ID,
          }),
        },
      ).catch((err) =>
        console.error("Failed to send verification email:", err),
      );

      return updatedUser;
    },
  );
};

export default meRoutes;
