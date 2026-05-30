import { Schema } from "mongoose";

const userSchema: Schema = new Schema(
  {
    auth0Id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    blocks: { type: [{ type: Schema.Types.ObjectId, ref: "Block" }] },
    curBlock: { type: Schema.Types.ObjectId, ref: "Block" },
    timerEnd: { type: Date },
    timerPresets: {
      type: Map,
      of: Number,
      required: true,
    },
    gyms: { type: [String] },
    customExerciseNames: { type: [String], default: [] },
    customExerciseApparatuses: { type: [String], default: [] },
  },
  { collection: "User" },
);

export default userSchema;
