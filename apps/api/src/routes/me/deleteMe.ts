import type { FastifyReply } from "fastify";
import UserModel from "@liftledger/shared/models/user";
import ProgramModel from "@liftledger/shared/models/program";
import type { AuthedUser } from "../../auth";
import { getAuth0Token, RATE_LIMIT_MESSAGE } from "../../auth0Management";
import { env } from "../../env";

export const deleteMe = async ({
  reply,
  me,
  sub,
}: {
  reply: FastifyReply;
  me: AuthedUser;
  sub: string;
}) => {
  const tokenResult = await getAuth0Token();
  if (!tokenResult.ok)
    return reply.code(tokenResult.status).send({ error: tokenResult.message });

  const deleteRes = await fetch(
    `https://${env.AUTH0_TENANT_DOMAIN}/api/v2/users/${encodeURIComponent(sub)}`,
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
    await ProgramModel.deleteMany({
      _id: { $in: me.programs as unknown as string[] },
    });
    await UserModel.findOneAndDelete({ _id: me._id });
  } catch (dbErr) {
    console.error(
      "Auth0 account deleted but MongoDB cleanup failed for id:",
      me._id,
      dbErr,
    );
  }

  return { ok: true };
};
