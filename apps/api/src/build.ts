import fs from "node:fs";
import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  FastifyServerOptions,
} from "fastify";
import cors from "@fastify/cors";
import fjwt from "@fastify/jwt";
import buildGetJwks from "get-jwks";
import { env } from "./env";
import { registerRoutes } from "./routes";

export interface BuildOpts {
  // When set, bypasses JWT verification and treats every request as this user.
  // Tests use this; production never does.
  testAuth?: { sub: string };
  logger?: boolean;
  https?: { keyPath: string; certPath: string };
}

export const build = async (opts: BuildOpts = {}): Promise<FastifyInstance> => {
  const fastifyOpts: FastifyServerOptions = { logger: opts.logger ?? false };
  if (opts.https) {
    (fastifyOpts as FastifyServerOptions & { https: object }).https = {
      key: fs.readFileSync(opts.https.keyPath),
      cert: fs.readFileSync(opts.https.certPath),
    };
  }
  const app = Fastify(fastifyOpts);

  await app.register(cors, {
    origin: env.CORS_ORIGINS,
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  if (opts.testAuth) {
    const fakeUser = opts.testAuth;
    app.decorate(
      "authenticate",
      async (req: FastifyRequest, _reply: FastifyReply) => {
        req.user = fakeUser;
      },
    );
  } else {
    const getJwks = buildGetJwks();
    type DecodedJwt = {
      header: { kid: string; alg: string };
      payload: { iss: string };
    };
    await app.register(fjwt, {
      decode: { complete: true },
      secret: async (_request: FastifyRequest, token: unknown) => {
        const t = token as DecodedJwt;
        return getJwks.getPublicKey({
          kid: t.header.kid,
          domain: t.payload.iss,
          alg: t.header.alg,
        });
      },
      verify: {
        allowedAud: env.AUTH0_AUDIENCE,
        allowedIss: env.AUTH0_ISSUER_BASE_URL,
        algorithms: ["RS256"],
      },
    });

    app.decorate(
      "authenticate",
      async (req: FastifyRequest, reply: FastifyReply) => {
        try {
          await req.jwtVerify();
        } catch {
          reply.code(401).send({ error: "Unauthorized" });
        }
      },
    );
  }

  await registerRoutes(app);

  return app;
};
