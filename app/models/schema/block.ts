import { Schema } from "mongoose";
import WeekModel from "../week";

const blockSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: false,
    },
    length: {
      type: String,
      required: false,
    },
    weeks: {
      type: WeekModel,
      required: false,
    },
  },
  { collection: "Block" }
);

export default blockSchema;
