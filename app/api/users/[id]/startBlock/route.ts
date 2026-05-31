import { authorizeCaller, userNotFoundResponse } from "@/lib/auth";
import BlockModel from "@/lib/models/block";
import UserModel from "@/lib/models/user";
import { Block, GetParams } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest, { params }: GetParams) => {
  const uid = (await params).id;
  const auth = await authorizeCaller(uid);
  if (!auth.ok) return auth.response;

  const { block }: { block: Block } = await req.json();

  let newBlock;
  try {
    newBlock = await BlockModel.create(block);
  } catch (error) {
    console.error("Failed to create block:", error);
    return NextResponse.json(
      { error: "Failed to create block" },
      { status: 500 },
    );
  }

  const deleteOrphanedBlock = async () => {
    try {
      await BlockModel.findOneAndDelete({ _id: newBlock._id });
    } catch (revertErr) {
      console.error(
        "Failed to delete orphaned block after user update failure:",
        revertErr,
      );
    }
  };

  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: uid },
      { $set: { curBlock: newBlock }, $addToSet: { blocks: newBlock } },
      { new: true },
    );
    if (!updatedUser) {
      await deleteOrphanedBlock();
      return userNotFoundResponse();
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    await deleteOrphanedBlock();
    console.error("Failed to start block:", error);
    return NextResponse.json(
      { error: "Failed to start block" },
      { status: 500 },
    );
  }
};
