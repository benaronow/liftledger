import { Schema } from "mongoose";
import ExerciseModel from "../exercise";

const daySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    exercises: {
      type: ExerciseModel,
      required: false,
    },
  },
  { collection: "Week" }
);

export default daySchema;
