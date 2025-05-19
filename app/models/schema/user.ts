import { Schema } from "mongoose";

const userSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    birthday: { type: Date, required: true },
    blocks: { type: [{ type: Schema.Types.ObjectId, ref: "Block" }] },
    curBlock: { type: Schema.Types.ObjectId, ref: "Block" },
    curWeekIdx: Number,
    curDayIdx: Number,
  },
  { collection: "User" }
);

export default userSchema;
