import { connectDB } from "@/app/connectDB";
import BlockModel from "@/app/models/block";
import UserModel from "@/app/models/user";
import { GetParams } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, { params }: GetParams) => {
  await connectDB();

  const user = await UserModel.findOne({ email: (await params).id }).populate([
    { path: "blocks", model: BlockModel },
  ]);

  return NextResponse.json(user);
};
