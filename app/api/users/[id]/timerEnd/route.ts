import { authorizeCaller, userNotFoundResponse } from "@/lib/auth";
import UserModel from "@/lib/models/user";
import { GetParams } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, { params }: GetParams) => {
  const uid = (await params).id;
  const auth = await authorizeCaller(uid);
  if (!auth.ok) return auth.response;

  try {
    const user = await UserModel.findOne({ _id: uid });
    if (!user) return userNotFoundResponse();

    return NextResponse.json({ timerEnd: user.timerEnd });
  } catch (error) {
    console.error("Failed to fetch timer end:", error);
    return NextResponse.json(
      { error: "Failed to fetch timer end" },
      { status: 500 },
    );
  }
};

export const PUT = async (req: NextRequest, { params }: GetParams) => {
  const uid = (await params).id;
  const auth = await authorizeCaller(uid);
  if (!auth.ok) return auth.response;

  const timerEnd = await req.json();

  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: uid },
      { $set: { timerEnd } },
      { new: true },
    );
    if (!updatedUser) return userNotFoundResponse();

    return NextResponse.json({ timerEnd });
  } catch (error) {
    console.error("Failed to update timer end:", error);
    return NextResponse.json(
      { error: "Failed to update timer end" },
      { status: 500 },
    );
  }
};

export const DELETE = async (req: NextRequest, { params }: GetParams) => {
  const uid = (await params).id;
  const auth = await authorizeCaller(uid);
  if (!auth.ok) return auth.response;

  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: uid },
      { $unset: { timerEnd: null } },
      { new: true },
    );
    if (!updatedUser) return userNotFoundResponse();

    return NextResponse.json({ timerEnd: undefined });
  } catch (error) {
    console.error("Failed to clear timer end:", error);
    return NextResponse.json(
      { error: "Failed to clear timer end" },
      { status: 500 },
    );
  }
};
