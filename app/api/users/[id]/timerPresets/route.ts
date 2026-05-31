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

    return NextResponse.json({ timerPresets: user.timerPresets });
  } catch (error) {
    console.error("Failed to fetch timer presets:", error);
    return NextResponse.json(
      { error: "Failed to fetch timer presets" },
      { status: 500 },
    );
  }
};

export const PUT = async (req: NextRequest, { params }: GetParams) => {
  const uid = (await params).id;
  const auth = await authorizeCaller(uid);
  if (!auth.ok) return auth.response;

  const timerPresets = await req.json();

  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: uid },
      { $set: { timerPresets } },
      { new: true },
    );
    if (!updatedUser) return userNotFoundResponse();

    return NextResponse.json({ timerPresets });
  } catch (error) {
    console.error("Failed to update timer presets:", error);
    return NextResponse.json(
      { error: "Failed to update timer presets" },
      { status: 500 },
    );
  }
};
