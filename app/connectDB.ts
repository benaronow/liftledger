import mongoose from "mongoose";

const MONGO_URL = `${
  process.env.NEXT_PUBLIC_MONGODB_URI || "mongodb://127.0.0.1:27017"
}`;

export const connectDB = async () => {
  console.log(MONGO_URL);
  mongoose
    .connect(MONGO_URL)
    .catch((err) => console.log("MongoDB connection error: ", err));
};
