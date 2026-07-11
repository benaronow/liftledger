import type { FastifyReply } from "fastify";
import ProgramModel from "@liftledger/shared/models/program";
import { getOptions } from "./getOptions";
import { populatedUser, type OptionField, type UserDoc } from "./shared";

export const renameOption = async ({
  reply,
  id,
  from,
  to,
  scope,
  me,
  option,
  label,
}: {
  reply: FastifyReply;
  id: string;
  from?: string;
  to?: string;
  scope?: string;
  me: UserDoc;
  option: OptionField;
  label: string;
}) => {
  const { field, exerciseKey } = option;
  const trimmedTo = typeof to === "string" ? to.trim() : "";
  if (
    !from ||
    !trimmedTo ||
    (scope !== "list" && scope !== "current" && scope !== "all")
  )
    return reply.code(400).send({ error: "Invalid rename request" });

  try {
    const list = getOptions(me, field);
    const collides = list.some(
      (o) =>
        o.toLowerCase() !== from.toLowerCase() &&
        o.toLowerCase() === trimmedTo.toLowerCase(),
    );
    if (collides)
      return reply.code(409).send({ error: `"${trimmedTo}" already exists` });

    const nextList = list.map((o) =>
      o.toLowerCase() === from.toLowerCase() ? trimmedTo : o,
    );
    me.set(field, nextList);
    await me.save();

    if (scope !== "list") {
      const programIds =
        scope === "current"
          ? me.curProgram
            ? [String(me.curProgram)]
            : []
          : me.programs.map((p) => String(p));

      const programs = await ProgramModel.find({ _id: { $in: programIds } });
      for (const program of programs) {
        let changed = false;
        for (const rotation of program.rotations) {
          for (const session of rotation) {
            // Gym also lives on the session itself, not just its exercises.
            if (exerciseKey === "gym" && session.gym === from) {
              session.gym = trimmedTo;
              changed = true;
            }
            for (const exercise of session.exercises) {
              if (exercise[exerciseKey] === from) {
                exercise[exerciseKey] = trimmedTo;
                changed = true;
              }
            }
          }
        }
        if (exerciseKey === "gym" && program.primaryGym === from) {
          program.primaryGym = trimmedTo;
          changed = true;
        }
        if (changed) {
          program.markModified("rotations");
          await program.save();
        }
      }
    }

    return await populatedUser(id);
  } catch (error) {
    console.error(`Failed to rename ${label}:`, error);
    return reply.code(500).send({ error: `Failed to rename ${label}` });
  }
};
