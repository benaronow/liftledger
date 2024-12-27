import { Schema } from "mongoose";

const exerciseSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    apparatus: {
      type: String,
      required: false,
    },
    musclesWorked: {
      type: [String],
      required: false,
    },
    sets: {
      type: Number,
      required: false,
    },
    reps: {
      type: [Number],
      required: false,
    },
    weight: {
      type: [Number],
      required: false,
    },
    weightType: {
      type: String,
      required: false,
    },
    unilateral: {
      type: Boolean,
      required: false,
    },
    prevSessionNote: {
      type: String,
      required: false,
    },
  },
  { collection: "Exercise" }
);

export default exerciseSchema;
