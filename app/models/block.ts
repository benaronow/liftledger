import mongoose, { Model } from "mongoose";
import { Block } from "../../types";
import blockSchema from "./schema/block";

const BlockModel: Model<Block> =
  mongoose.models.Block || mongoose.model("Block", blockSchema);

export default BlockModel;
