import mongoose, { Model } from "mongoose";
import { User } from "../../types";
import userSchema from "./schema/user";

const UserModel: Model<User> = mongoose.models.User || mongoose.model("User", userSchema);

export default UserModel;
