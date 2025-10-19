import { connectDB } from "@/app/connectDB";
import BlockModel from "@/app/models/block";
import UserModel from "@/app/models/user";
import { Block } from "@/app/types";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  await connectDB();

  const { uid, block }: { uid: string; block: Block } = await req.json();

  const newBlock = await BlockModel.create(block);

  await UserModel.findOneAndUpdate(
    { _id: uid },
    { $set: { curBlock: newBlock }, $addToSet: { blocks: newBlock } },
    { new: true }
  );

  return NextResponse.json(newBlock);
};