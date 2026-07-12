import type { FastifyInstance } from "fastify";
import healthRoutes from "./health";
import userRoutes from "./users/userRoutes";
import meRoutes from "./me/meRoutes";
import optionRoutes from "./options";
import timerEndRoutes from "./timer/end/endRoutes";
import timerSettingsRoutes from "./timer/settings/settingsRoutes";
import programRoutes from "./programs/programRoutes";
import completedExerciseRoutes from "./completedExercises";
import internalRoutes from "./internal/internalRoutes";

export const registerRoutes = async (app: FastifyInstance) => {
  await app.register(healthRoutes);
  await app.register(userRoutes);
  await app.register(meRoutes);
  await app.register(optionRoutes);
  await app.register(timerEndRoutes);
  await app.register(timerSettingsRoutes);
  await app.register(programRoutes);
  await app.register(completedExerciseRoutes);
  await app.register(internalRoutes);
};
