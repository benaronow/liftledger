import { Schema } from "mongoose";
import { DEFAULT_EXERCISE_NAMES } from "../../exerciseNames";
import { DEFAULT_EXERCISE_EQUIPMENT } from "../../exerciseEquipment";
import { DEFAULT_UNITS } from "../../units";

const userSchema: Schema = new Schema(
  {
    auth0Id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    programs: { type: [{ type: Schema.Types.ObjectId, ref: "Program" }] },
    curProgram: { type: Schema.Types.ObjectId, ref: "Program" },
    timerSettings: {
      end: { type: Date },
      presets: {
        type: Map,
        of: Number,
        required: true,
      },
      defaultEnabled: { type: Boolean, default: true },
      defaultTime: { type: Number, default: 120 },
      exerciseOverrides: {
        type: Map,
        of: Number,
        default: () => ({}),
      },
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
    units: {
      type: [String],
      default: () => [...DEFAULT_UNITS],
    },
    defaultUnit: {
      type: String,
      default: "lbs",
    },
  },
  { collection: "User" },
);

export default userSchema;
