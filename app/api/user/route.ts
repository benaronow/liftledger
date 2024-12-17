import { connectDB } from "@/app/connectDB";
import UserModel from "@/app/models/user";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  await connectDB();

  const users = await UserModel.find();

  return NextResponse.json(users);
};

export const POST = async (req: NextRequest) => {
  await connectDB();

  const user = await req.json();
  const newUser = await UserModel.create(user);

  return NextResponse.json(newUser);
};

export const DELETE = async (req: NextRequest) => {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const deleteInfo = await UserModel.deleteOne({ username: username });

  return NextResponse.json(deleteInfo);
};
