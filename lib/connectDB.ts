import mongoose from "mongoose";

const MONGO_URL = `${
  process.env.NEXT_PUBLIC_MONGODB_URI || "mongodb://127.0.0.1:27017"
}`;

declare global {
  var __mongooseConn: Promise<typeof mongoose> | undefined;
}

export const connectDB = async () => {
  if (!global.__mongooseConn) {
    global.__mongooseConn = mongoose.connect(MONGO_URL).catch((err) => {
      console.log("MongoDB connection error: ", err);
      throw err;
    });
  }
  return global.__mongooseConn;
};
