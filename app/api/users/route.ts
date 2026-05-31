import { connectDB } from "@/lib/connectDB";
import UserModel from "@/lib/models/user";
import { User } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  try {
    await connectDB();

    const users = await UserModel.find();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to list users:", error);
    return NextResponse.json(
      { error: "Failed to list users" },
      { status: 500 },
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();

    const user: User = await req.json();
    const existingUser = await UserModel.findOne({ _id: user._id });
    if (existingUser)
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );

    const newUser = await UserModel.create(user);
    return NextResponse.json(newUser);
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
};
