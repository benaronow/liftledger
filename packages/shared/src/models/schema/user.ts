import { Schema } from "mongoose";

const userSchema: Schema = new Schema(
  {
    auth0Id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    birthday: { type: Date, required: true },
    programs: { type: [{ type: Schema.Types.ObjectId, ref: "Program" }] },
    curProgram: { type: Schema.Types.ObjectId, ref: "Program" },
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
