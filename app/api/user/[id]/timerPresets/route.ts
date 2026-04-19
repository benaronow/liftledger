import { connectDB } from "@/lib/connectDB";
import UserModel from "@/lib/models/user";
import { GetParams } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, { params }: GetParams) => {
  await connectDB();

  const user = await UserModel.findOne({ _id: (await params).id });

  return NextResponse.json({ timerPresets: user?.timerPresets });
};

export const PUT = async (req: NextRequest, { params }: GetParams) => {
  await connectDB();

  const timerPresets = await req.json();

  await UserModel.findOneAndUpdate(
    { _id: (await params).id },
    { $set: { timerPresets } },
    { new: true }
  );

  return NextResponse.json({ timerPresets });
};
