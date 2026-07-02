import { Schema } from "mongoose";
import { DEFAULT_EXERCISE_NAMES } from "../../exerciseNames";
import { DEFAULT_EXERCISE_EQUIPMENT } from "../../exerciseEquipment";
import { DEFAULT_WEIGHT_TYPES } from "../../weightTypes";

const userSchema: Schema = new Schema(
  {
    auth0Id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    programs: { type: [{ type: Schema.Types.ObjectId, ref: "Program" }] },
    curProgram: { type: Schema.Types.ObjectId, ref: "Program" },
    timerEnd: { type: Date },
    timerPresets: {
      type: Map,
      of: Number,
      required: true,
    },
    gyms: { type: [String] },
    exerciseNames: {
      type: [String],
      default: () => [...DEFAULT_EXERCISE_NAMES],
    },
    exerciseEquipment: {
      type: [String],
      default: () => [...DEFAULT_EXERCISE_EQUIPMENT],
    },
    weightTypes: {
      type: [String],
      default: () => [...DEFAULT_WEIGHT_TYPES],
    },
    defaultWeightType: {
      type: String,
      default: "lbs",
    },
  },
  { collection: "User" },
);

export default userSchema;
