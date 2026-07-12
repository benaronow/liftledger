import type { FastifyInstance } from "fastify";
import { authorizeCaller } from "../../../auth";
import { getTimerEnd } from "./getTimerEnd";
import { setTimerEnd } from "./setTimerEnd";
import { clearTimerEnd } from "./clearTimerEnd";

type IdParams = { id: string };

const timerEndRoutes = async (app: FastifyInstance) => {
  app.get<{ Params: IdParams }>(
    "/users/:id/timer/end",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      return getTimerEnd({ reply, id });
    },
  );

  app.put<{ Params: IdParams; Body: Date | string }>(
    "/users/:id/timer/end",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      const timerEnd = req.body;
      return setTimerEnd({ reply, id, timerEnd });
    },
  );

  app.delete<{ Params: IdParams }>(
    "/users/:id/timer/end",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      return clearTimerEnd({ reply, id });
    },
  );
};

export default timerEndRoutes;
