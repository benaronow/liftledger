import { authorizeCaller, userNotFoundResponse } from "@/lib/auth";
import BlockModel from "@/lib/models/block";
import UserModel from "@/lib/models/user";
import { GetParams } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest, { params }: GetParams) => {
  const uid = (await params).id;
  const auth = await authorizeCaller(uid);
  if (!auth.ok) return auth.response;

  const user = await UserModel.findOne({ _id: uid });
  if (!user) return userNotFoundResponse();

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

  const revertBlock = async () => {
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
  };

  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: uid },
      { $unset: { curBlock: "" } },
      { new: true },
    );
    if (!updatedUser) {
      await revertBlock();
      return userNotFoundResponse();
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    await revertBlock();
    return NextResponse.json(
      { error: `Failed to update user: ${error}` },
      { status: 500 },
    );
  }
};
