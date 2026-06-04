import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import type { FastifyInstance } from "fastify";
import { build } from "../src/build";

let mongod: MongoMemoryServer;

export const startDb = async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
};

export const stopDb = async () => {
  await mongoose.disconnect();
  await mongod.stop();
};

export const clearDb = async () => {
  for (const collection of Object.values(mongoose.connection.collections)) {
    await collection.deleteMany({});
  }
};

export const buildTestApp = async (
  sub = "auth0|test-user",
): Promise<FastifyInstance> => {
  return build({ testAuth: { sub } });
};
