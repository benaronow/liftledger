import { connectDB } from "@/lib/connectDB";
import UserModel from "@/lib/models/user";
import { User } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  await connectDB();

  const users = await UserModel.find();

  return NextResponse.json(users);
};

export const POST = async (req: NextRequest) => {
  await connectDB();

  const user: User = await req.json();
  const existingUser = await UserModel.findOne({ _id: user._id });
  if (existingUser) return;

  const newUser = await UserModel.create(user);
  return NextResponse.json(newUser);
};
