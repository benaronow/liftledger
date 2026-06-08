import mongoose, { Model } from "mongoose";
import type { Program } from "../types";
import programSchema from "./schema/program";

const ProgramModel: Model<Program> =
  mongoose.models.Program || mongoose.model("Program", programSchema);

export default ProgramModel;
