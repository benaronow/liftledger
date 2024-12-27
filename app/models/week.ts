import mongoose, { Model } from "mongoose";
import { Week } from "../../types";
import weekSchema from "./schema/week";

const WeekModel: Model<Week> =
  mongoose.models.Week || mongoose.model("Week", weekSchema);

export default WeekModel;
