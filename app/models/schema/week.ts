import { Schema } from "mongoose";
import DayModel from "../day";

const weekSchema: Schema = new Schema(
  {
    number: {
      type: String,
      required: true,
    },
    days: {
      type: DayModel,
      required: false,
    },
  },
  { collection: "Week" }
);

export default weekSchema;
