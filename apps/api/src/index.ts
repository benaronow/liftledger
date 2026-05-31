import { build } from "./build";
import { connectMongo } from "./db";
import { env } from "./env";

const main = async () => {
  await connectMongo(env.MONGODB_URI);
  const app = await build({ logger: true });
  await app.listen({ port: env.PORT, host: "0.0.0.0" });
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
