import { connectDB } from "@/app/connectDB";
import BlockModel from "@/app/models/block";
import UserModel from "@/app/models/user";
import { Block, BlockOp } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  await connectDB();

  const { uid, block, type }: { uid: string; block: Block; type: BlockOp } =
    await req.json();

  if (type === BlockOp.New) {
    const newBlock = await BlockModel.create(block);
    await UserModel.findOneAndUpdate(
      { _id: uid },
      { $set: { curBlock: newBlock }, $addToSet: { blocks: newBlock } },
      { new: true }
    ).populate([
      { path: "blocks", model: BlockModel },
      { path: "curBlock", model: BlockModel },
    ]);
    return NextResponse.json(newBlock);
  }

  if (type === BlockOp.EditWeek) {
    const newBlock = await BlockModel.findOneAndUpdate(
      { _id: block._id },
      { $set: { weeks: block.weeks } },
      { new: true }
    );
    return NextResponse.json(newBlock);
  }

  if (type === BlockOp.AddWeek) {
    const newBlock = await BlockModel.findOneAndUpdate(
      { _id: block._id },
      { $addToSet: { weeks: block.weeks[block.weeks.length - 1] } },
      { new: true }
    );
    return NextResponse.json(newBlock);
  }

  if (type === BlockOp.Complete) {
    const newBlock = await BlockModel.findOneAndUpdate(
      { _id: block._id },
      { $set: { weeks: block.weeks } },
      { new: true }
    );
    return NextResponse.json(newBlock);
  }
};
