import { connectDB } from "@/lib/connectDB";
import BlockModel from "@/lib/models/block";
import UserModel from "@/lib/models/user";
import { GetParams } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest, { params }: GetParams) => {
  await connectDB();

  const { uid }: { uid: string } = await req.json();

  const block = await BlockModel.findOne({ _id: (await params).id });
  if (!block)
    return NextResponse.json({ error: "Block not found" }, { status: 404 });

  const trimmedWeeks = block.weeks.slice(0, block.curWeekIdx + 1);

  const updatedBlock = await BlockModel.findOneAndUpdate(
    { _id: (await params).id },
    { $set: { weeks: trimmedWeeks, endDate: new Date() } },
    { new: true },
  );

  await UserModel.findOneAndUpdate(
    { _id: uid },
    { $unset: { curBlock: "" } },
    { new: true },
  );

  return NextResponse.json(updatedBlock);
};
