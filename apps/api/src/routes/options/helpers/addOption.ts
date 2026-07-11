import type { FastifyReply } from "fastify";
import { getOptions } from "./getOptions";
import { populatedUser, type OptionField, type UserDoc } from "./shared";

export const addOption = async ({
  reply,
  id,
  value,
  me,
  field,
  label,
}: {
  reply: FastifyReply;
  id: string;
  value?: string;
  me: UserDoc;
  field: OptionField["field"];
  label: string;
}) => {
  const trimmed = value?.trim();
  if (!trimmed) return reply.code(400).send({ error: "Invalid value" });

  try {
    const list = getOptions(me, field);
    const exists = list.some((o) => o.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      me.set(field, [...list, trimmed]);
      await me.save();
    }
    return await populatedUser(id);
  } catch (error) {
    console.error(`Failed to add ${label}:`, error);
    return reply.code(500).send({ error: `Failed to add ${label}` });
  }
};
