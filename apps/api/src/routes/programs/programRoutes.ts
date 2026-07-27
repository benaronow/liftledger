import type { FastifyInstance } from "fastify";
import type { Program } from "@liftledger/shared";
import { authorizeCaller } from "../../auth";
import { createProgram } from "./createProgram";
import { quitProgram } from "./quitProgram";
import { getProgram } from "./getProgram";
import { updateProgram } from "./updateProgram";

type IdParams = { id: string };
type ProgramParams = { id: string; programId: string };

const programRoutes = async (app: FastifyInstance) => {
  app.post<{ Params: IdParams; Body: { program: Program } }>(
    "/users/:id/programs",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      const { program } = req.body;
      return createProgram({ reply, id, program });
    },
  );

  app.delete<{ Params: IdParams }>(
    "/users/:id/programs",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      return quitProgram({ reply, id });
    },
  );

  app.get<{ Params: ProgramParams }>(
    "/users/:id/programs/:programId",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id, programId } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      return getProgram({ reply, programId });
    },
  );

  app.put<{
    Params: ProgramParams;
    Body: { program: Program; historical?: boolean };
  }>(
    "/users/:id/programs/:programId",
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id, programId } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      const { program, historical } = req.body;
      return updateProgram({ reply, id, programId, program, historical });
    },
  );
};

export default programRoutes;
