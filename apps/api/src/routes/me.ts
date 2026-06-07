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

  app.patch(
    "/users/me/name",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const auth = await authorizeMe(req, reply);
      if (!auth.ok) return;
      const { me } = auth;

      const { fullName } = (req.body ?? {}) as { fullName?: unknown };

      const trimmedName =
        typeof fullName === "string" ? fullName.trim() : undefined;
      if (!trimmedName)
        return reply.code(400).send({ error: "Invalid name" });

      const tokenResult = await getAuth0Token();
      if (!tokenResult.ok)
        return reply
          .code(tokenResult.status)
          .send({ error: tokenResult.message });
      const token = tokenResult.token;

      const oldName = me.fullName;

      const nameUpdate = await fetch(
        `https://${env.AUTH0_TENANT_DOMAIN}/api/v2/users/${encodeURIComponent(req.user.sub)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          // Auth0's Management API treats the root `name` as read-only for
          // database-connection users (returns 400), so the editable name is
          // synced into user_metadata instead.
          body: JSON.stringify({ user_metadata: { full_name: trimmedName } }),
        },
      );

      if (nameUpdate.status === 429)
        return reply.code(429).send({ error: RATE_LIMIT_MESSAGE });

      if (!nameUpdate.ok) {
        const error = (await nameUpdate.json().catch(() => ({}))) as {
          message?: string;
        };
        return reply
          .code(nameUpdate.status)
          .send({ error: error.message ?? "Failed to update name" });
      }

      let updatedUser;
      try {
        updatedUser = await UserModel.findOneAndUpdate(
          { auth0Id: req.user.sub },
          { $set: { fullName: trimmedName } },
          { new: true },
        ).populate([{ path: "blocks", model: BlockModel }]);
      } catch (dbErr) {
        console.error(
          "Failed to update MongoDB name after Auth0 success — reverting Auth0:",
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
            body: JSON.stringify({ user_metadata: { full_name: oldName } }),
          },
        );
        if (!revertRes.ok) {
          console.error(
            "Failed to revert Auth0 name after MongoDB failure — accounts now out of sync for sub:",
            req.user.sub,
          );
        }

        return reply
          .code(500)
          .send({ error: "Failed to update name in database" });
      }

      return updatedUser;
    },
  );

  app.patch(
    "/users/me/username",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const auth = await authorizeMe(req, reply);
      if (!auth.ok) return;
      const { me } = auth;

      const { username } = (req.body ?? {}) as { username?: unknown };

      const trimmedUsername =
        typeof username === "string" ? username.trim() : undefined;
      if (!trimmedUsername)
        return reply.code(400).send({ error: "Invalid username" });

      // Connected (social) accounts don't have an Auth0 database username, so
      // for them we only update MongoDB. Database accounts (auth0|) sync to
      // Auth0 first, then MongoDB, reverting Auth0 if the DB write fails.
      const isDatabaseUser = req.user.sub.startsWith("auth0|");
      const oldUsername = me.username;

      let token: string | undefined;
      if (isDatabaseUser) {
        const tokenResult = await getAuth0Token();
        if (!tokenResult.ok)
          return reply
            .code(tokenResult.status)
            .send({ error: tokenResult.message });
        token = tokenResult.token;

        const usernameUpdate = await fetch(
          `https://${env.AUTH0_TENANT_DOMAIN}/api/v2/users/${encodeURIComponent(req.user.sub)}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: trimmedUsername,
              connection: "Username-Password-Authentication",
            }),
          },
        );

        if (usernameUpdate.status === 429)
          return reply.code(429).send({ error: RATE_LIMIT_MESSAGE });

        if (usernameUpdate.status === 409)
          return reply
            .code(409)
            .send({ error: "A user with this username already exists." });

        if (!usernameUpdate.ok) {
          const error = (await usernameUpdate.json().catch(() => ({}))) as {
            message?: string;
          };
          return reply
            .code(usernameUpdate.status)
            .send({ error: error.message ?? "Failed to update username" });
        }
      }

      let updatedUser;
      try {
        updatedUser = await UserModel.findOneAndUpdate(
          { auth0Id: req.user.sub },
          { $set: { username: trimmedUsername } },
          { new: true },
        ).populate([{ path: "blocks", model: BlockModel }]);
      } catch (dbErr) {
        console.error("Failed to update MongoDB username:", dbErr);

        // Only revert Auth0 if we actually changed it (database accounts).
        if (isDatabaseUser && token) {
          const revertRes = await fetch(
            `https://${env.AUTH0_TENANT_DOMAIN}/api/v2/users/${encodeURIComponent(req.user.sub)}`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                username: oldUsername,
                connection: "Username-Password-Authentication",
              }),
            },
          );
          if (!revertRes.ok) {
            console.error(
              "Failed to revert Auth0 username after MongoDB failure — accounts now out of sync for sub:",
              req.user.sub,
            );
          }
        }

        return reply
          .code(500)
          .send({ error: "Failed to update username in database" });
      }

      return updatedUser;
    },
  );
};

export default meRoutes;
