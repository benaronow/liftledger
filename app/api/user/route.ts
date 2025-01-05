import { connectDB } from "@/app/connectDB";
import UserModel from "@/app/models/user";
import { User } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  await connectDB();

  const users = await UserModel.find();

  return NextResponse.json(users);
};

export const POST = async (req: NextRequest) => {
  await connectDB();

  const user: User = await req.json();
  const existingUser = await UserModel.findOneAndUpdate(
    { _id: user._id },
    {
      $set: { progress: user.progress },
    },
    { new: true }
  );
  if (existingUser) return NextResponse.json(existingUser);

  const newUser = await UserModel.create(user);
  return NextResponse.json(newUser);
};

export const DELETE = async (req: NextRequest) => {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const deleteInfo = await UserModel.deleteOne({ email });

  return NextResponse.json(deleteInfo);
};
