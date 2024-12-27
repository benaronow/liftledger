import { connectDB } from "@/app/connectDB";
import UserModel from "@/app/models/user";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  await connectDB();

  const { uid, block } = await req.json();
  const user = await UserModel.findOneAndUpdate(
    { _id: mongoose.Types.ObjectId.createFromTime(uid) },
    { $addToSet: { blocks: block }, $set: { curBlock: block } },
    { new: true }
  );
  return NextResponse.json(user);
};
