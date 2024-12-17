import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const MONGO_URL = `${process.env.NEXT_PUBLIC_MONGODB_URI || "mongodb://127.0.0.1:27017"}`;

export const connect = async () => {
  mongoose
    .connect(MONGO_URL)
    .catch((err) => console.log("MongoDB connection error: ", err));
};
