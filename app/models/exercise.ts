import mongoose, { Model } from "mongoose";
import { Exercise } from "../../types";
import exerciseSchema from "./schema/exercise";

const ExerciseModel: Model<Exercise> =
  mongoose.models.Exercise || mongoose.model("Exercise", exerciseSchema);

export default ExerciseModel;
