import type { FastifyReply } from "fastify";
import { getOptions } from "./getOptions";
import { populatedUser, type OptionField, type UserDoc } from "./shared";

export const removeOption = async ({
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
  if (!value) return reply.code(400).send({ error: "Invalid value" });

  try {
    const list = getOptions(me, field);
    me.set(
      field,
      list.filter((o) => o !== value),
    );
    await me.save();
    return await populatedUser(id);
  } catch (error) {
    console.error(`Failed to delete ${label}:`, error);
    return reply.code(500).send({ error: `Failed to delete ${label}` });
  }
};
