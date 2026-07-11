import type { FastifyInstance } from "fastify";
import { authorizeCaller } from "../../auth";
import { getOptions } from "./helpers/getOptions";
import { addOption } from "./helpers/addOption";
import { renameOption } from "./helpers/renameOption";
import { removeOption } from "./helpers/removeOption";
import { populatedUser, type OptionField } from "./helpers/shared";

const BASE = "/users/:id/options/units";
const OPTION: OptionField = { field: "units", exerciseKey: "unit" };
const LABEL = "unit";

type IdParams = { id: string };

const unitOptions = async (app: FastifyInstance) => {
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

  // Set the default unit, adding it to the units list if it isn't there yet. Its
  // own `default` sub-path keeps it distinct from the list add/rename/remove above.
  app.put<{ Params: IdParams; Body: { defaultUnit?: string } }>(
    `${BASE}/default`,
    { preHandler: app.authenticate },
    async (req, reply) => {
      const { id } = req.params;
      const auth = await authorizeCaller(req, reply, id);
      if (!auth.ok) return;

      const trimmed = req.body?.defaultUnit?.trim();
      if (!trimmed)
        return reply.code(400).send({ error: "Invalid default unit" });

      try {
        const list = getOptions(auth.me, OPTION.field);
        const listed = list.some(
          (o) => o.toLowerCase() === trimmed.toLowerCase(),
        );
        if (!listed) auth.me.set(OPTION.field, [...list, trimmed]);
        auth.me.set("defaultUnit", trimmed);
        await auth.me.save();
        return await populatedUser(id);
      } catch (error) {
        console.error("Failed to set default unit:", error);
        return reply.code(500).send({ error: "Failed to set default unit" });
      }
    },
  );
};

export default unitOptions;
