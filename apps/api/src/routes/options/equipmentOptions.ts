import type { FastifyInstance } from "fastify";
import { authorizeCaller } from "../../auth";
import { getOptions } from "./helpers/getOptions";
import { addOption } from "./helpers/addOption";
import { renameOption } from "./helpers/renameOption";
import { removeOption } from "./helpers/removeOption";
import type { OptionField } from "./helpers/shared";

const BASE = "/users/:id/options/equipment";
const OPTION: OptionField = {
  field: "options.equipment",
  exerciseKey: "equipment",
};
const LABEL = "equipment";

type IdParams = { id: string };

const equipmentOptions = async (app: FastifyInstance) => {
  app.get<{ Params: IdParams }>(
    BASE,
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;
      return getOptions(auth.me, OPTION.field);
    },
  );

  app.put<{ Params: IdParams; Body: { value?: string } }>(
    BASE,
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;
      return addOption({
        reply,
        id,
        value: req.body?.value,
        me: auth.me,
        field: OPTION.field,
        label: LABEL,
      });
    },
  );

  app.patch<{
    Params: IdParams;
    Body: { from?: string; to?: string; scope?: string };
  }>(BASE, { preHandler: app.authenticate }, async (req, reply) => {
    const { id } = req.params;
    const auth = await authorizeCaller(req, reply, id);
    if (!auth.ok) return;
    const { from, to, scope } = req.body ?? {};
    return renameOption({
      reply,
      id,
      from,
      to,
      scope,
      me: auth.me,
      option: OPTION,
      label: LABEL,
    });
  });

  app.delete<{ Params: IdParams; Querystring: { value?: string } }>(
    BASE,
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;
      return removeOption({
        reply,
        id,
        value: req.query?.value,
        me: auth.me,
        field: OPTION.field,
        label: LABEL,
      });
    },
  );
};

export default equipmentOptions;
