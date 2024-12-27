import { Schema } from "mongoose";

const userSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    birthday: {
      type: Date,
      required: false,
    },
    benchMax: {
      type: Number,
      required: false,
    },
    deadMax: {
      type: Number,
      required: false,
    },
    squatMax: {
      type: Number,
      required: false,
    },
  },
  { collection: "User" }
);

export default userSchema;
