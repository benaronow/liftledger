import { connectDB } from "@/lib/connectDB";
import BlockModel from "@/lib/models/block";
import UserModel from "@/lib/models/user";
import { Block } from "@/lib/types";
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
