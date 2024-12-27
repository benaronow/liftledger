import mongoose, { Model } from "mongoose";
import { Day } from "../../types";
import daySchema from "./schema/day";

const DayModel: Model<Day> =
  mongoose.models.Day || mongoose.model("Day", daySchema);

export default DayModel;
