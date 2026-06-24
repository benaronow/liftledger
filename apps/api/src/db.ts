import mongoose from "mongoose";

export const connectMongo = async (uri: string) => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  return mongoose.connection;
};

export const disconnectMongo = async () => {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
};
