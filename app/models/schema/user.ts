import { Schema } from "mongoose";

const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    favExercise: {
      type: String,
      required: true,
    },
  },
  { collection: "User" }
);

export default userSchema;
