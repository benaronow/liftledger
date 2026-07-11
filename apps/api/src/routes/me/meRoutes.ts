import type { FastifyInstance } from "fastify";
import { authorizeMe } from "../../auth";
import { getMe } from "./getMe";
import { getMeAuth0 } from "./getMeAuth0";
import { resendVerification } from "./resendVerification";
import { deleteMe } from "./deleteMe";
import { passwordReset } from "./passwordReset";
import { updateEmail } from "./updateEmail";
import { updateName } from "./updateName";
import { updateUsername } from "./updateUsername";

const meRoutes = async (app: FastifyInstance) => {
  app.get("/users/me", { preHandler: app.authenticate }, async (req, reply) => {
    const auth = await authorizeMe(req, reply);
    if (!auth.ok) return;
    return getMe({ reply, me: auth.me });
  });

  app.get(
    "/users/me/auth0",
    { preHandler: app.authenticate },
    async (req, reply) => {
      return getMeAuth0({ reply, sub: req.user.sub });
    },
  );

  app.post(
    "/users/me/resend-verification",
    { preHandler: app.authenticate },
    async (req, reply) => {
      return resendVerification({ reply, sub: req.user.sub });
    },
  );

  app.delete(
    "/users/me",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const auth = await authorizeMe(req, reply);
      if (!auth.ok) return;
      return deleteMe({ reply, me: auth.me, sub: req.user.sub });
    },
  );

  app.post(
    "/users/me/password-reset",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const auth = await authorizeMe(req, reply);
      if (!auth.ok) return;
      return passwordReset({ reply, me: auth.me, sub: req.user.sub });
    },
  );

  app.patch(
    "/users/me/email",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const auth = await authorizeMe(req, reply);
      if (!auth.ok) return;
      const { email } = (req.body ?? {}) as { email?: unknown };
      return updateEmail({ reply, me: auth.me, sub: req.user.sub, email });
    },
  );

  app.patch(
    "/users/me/name",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const auth = await authorizeMe(req, reply);
      if (!auth.ok) return;
      const { fullName } = (req.body ?? {}) as { fullName?: unknown };
      return updateName({ reply, me: auth.me, sub: req.user.sub, fullName });
    },
  );

  app.patch(
    "/users/me/username",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const auth = await authorizeMe(req, reply);
      if (!auth.ok) return;
      const { username } = (req.body ?? {}) as { username?: unknown };
      return updateUsername({
        reply,
        me: auth.me,
        sub: req.user.sub,
        username,
      });
    },
  );
};

export default meRoutes;
