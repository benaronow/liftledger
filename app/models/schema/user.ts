import { Schema } from "mongoose";

const userSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    birthday: { type: Date, required: true },
    benchMax: { type: Number, required: true },
    deadMax: { type: Number, required: true },
    squatMax: { type: Number, required: true },
    progress: { type: Object },
    blocks: { type: [{ type: Schema.Types.ObjectId, ref: "Block" }] },
    curBlock: { type: Schema.Types.ObjectId, ref: "Block" },
  },
  { collection: "User" }
);

export default userSchema;
