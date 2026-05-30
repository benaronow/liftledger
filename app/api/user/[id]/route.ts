import { connectDB } from "@/lib/connectDB";
import UserModel from "@/lib/models/user";
import { GetParams, User } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, { params }: GetParams) => {
  await connectDB();

  const user = await UserModel.findOne({ _id: (await params).id });

  return NextResponse.json(user);
};

export const PUT = async (req: NextRequest, { params }: GetParams) => {
  await connectDB();

  const user: User = await req.json();
  const updatedUser = await UserModel.findOneAndUpdate(
    { _id: (await params).id },
    { $set: user },
    { new: true },
  );

  return NextResponse.json(updatedUser);
};

export const DELETE = async (req: NextRequest, { params }: GetParams) => {
  await connectDB();

  const deleteInfo = await UserModel.deleteOne({ _id: (await params).id });

  return NextResponse.json(deleteInfo);
};
