import { auth0 } from "@/lib/auth0";
import { connectDB } from "@/lib/connectDB";
import BlockModel from "@/lib/models/block";
import UserModel from "@/lib/models/user";
import { GetParams } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest, { params }: GetParams) => {
  await connectDB();

  const uid = (await params).id;
  const user = await UserModel.findOne({ _id: uid });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const session = await auth0.getSession();
  if (!session || session.user.sub !== user.auth0Id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const block = await BlockModel.findOne({ _id: user.curBlock });
  if (!block)
    return NextResponse.json(
      { error: "User does not have a current block" },
      { status: 400 },
    );

  const weeks = block.weeks.slice(0, block.curWeekIdx + 1);
  const endDate = new Date();

  try {
    await BlockModel.findOneAndUpdate(
      { _id: user.curBlock },
      { $set: { weeks, endDate } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update block: ${error}` },
      { status: 500 },
    );
  }

  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: uid },
      { $unset: { curBlock: "" } },
      { new: true },
    );

    return NextResponse.json(updatedUser);
  } catch (error) {
    try {
      await BlockModel.findOneAndUpdate(
        { _id: user.curBlock },
        { $set: { weeks: block.weeks }, $unset: { endDate: "" } },
      );
    } catch (revertErr) {
      console.error(
        "Failed to revert block update after user update failure:",
        revertErr,
      );
    }

    return NextResponse.json(
      { error: `Failed to update user: ${error}` },
      { status: 500 },
    );
  }
};
