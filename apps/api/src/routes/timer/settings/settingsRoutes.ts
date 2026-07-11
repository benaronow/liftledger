import type { FastifyInstance } from "fastify";
import type { TimerSettings } from "@liftledger/shared";
import { authorizeCaller } from "../../../auth";
import { getTimerSettings } from "./getTimerSettings";
import { updateTimerSettings } from "./updateTimerSettings";

type IdParams = { id: string };

const timerSettingsRoutes = async (app: FastifyInstance) => {
  app.get<{ Params: IdParams }>(
    "/users/:id/timer/settings",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      return getTimerSettings({ reply, id });
    },
  );

  app.patch<{ Params: IdParams; Body: { patch?: Partial<TimerSettings> } }>(
    "/users/:id/timer/settings",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      const { patch } = req.body ?? {};
      return updateTimerSettings({ reply, id, patch });
    },
  );
};

export default timerSettingsRoutes;
