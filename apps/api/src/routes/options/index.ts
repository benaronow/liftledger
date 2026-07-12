import type { FastifyInstance } from "fastify";
import exerciseNameOptions from "./exerciseNameOptions";
import equipmentOptions from "./equipmentOptions";
import gymOptions from "./gymOptions";
import unitOptions from "./unitOptions";

const optionRoutes = async (app: FastifyInstance) => {
  await app.register(exerciseNameOptions);
  await app.register(equipmentOptions);
  await app.register(gymOptions);
  await app.register(unitOptions);
};

export default optionRoutes;
