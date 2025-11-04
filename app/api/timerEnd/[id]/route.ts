import { connectDB } from "@/lib/connectDB";
import UserModel from "@/lib/models/user";
import { GetParams } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, { params }: GetParams) => {
  await connectDB();

  const user = await UserModel.findOne({ _id: (await params).id });

  return NextResponse.json({ timerEnd: user?.timerEnd });
};

export const PUT = async (req: NextRequest, { params }: GetParams) => {
  await connectDB();

  const timerEnd = await req.json();

  await UserModel.findOneAndUpdate(
    { _id: (await params).id },
    { $set: { timerEnd } },
    { new: true }
  );

  return NextResponse.json({ timerEnd });
};

export const DELETE = async (req: NextRequest, { params }: GetParams) => {
  await connectDB();

  await UserModel.findOneAndUpdate(
    { _id: (await params).id },
    { $unset: { timerEnd: null } },
    { new: true }
  );

  return NextResponse.json({ timerEnd: undefined });
};
