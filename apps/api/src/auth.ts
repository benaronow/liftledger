import type { FastifyReply, FastifyRequest } from "fastify";
import UserModel from "@liftledger/shared/models/user";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string };
    user: { sub: string };
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

type AuthOk<T> = { ok: true; me: T };
type AuthErr = { ok: false };

export const authorizeMe = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<AuthOk<InstanceType<typeof UserModel>> | AuthErr> => {
  const me = await UserModel.findOne({ auth0Id: request.user.sub });
  if (!me) {
    reply.code(404).send({ error: "User not found" });
    return { ok: false };
  }
  return { ok: true, me };
};

export const authorizeCaller = async (
  request: FastifyRequest,
  reply: FastifyReply,
  id: string,
): Promise<AuthOk<InstanceType<typeof UserModel>> | AuthErr> => {
  const auth = await authorizeMe(request, reply);
  if (!auth.ok) return auth;
  if (auth.me._id?.toString() !== id) {
    reply.code(401).send({ error: "Unauthorized" });
    return { ok: false };
  }
  return auth;
};
