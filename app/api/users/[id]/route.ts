import { authorizeCaller, userNotFoundResponse } from "@/lib/auth";
import UserModel from "@/lib/models/user";
import { GetParams, User } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

const UPDATABLE_FIELDS = [
  "firstName",
  "lastName",
  "timerPresets",
  "gyms",
  "customExerciseNames",
  "customExerciseApparatuses",
] as const satisfies readonly (keyof User)[];

type UpdatableField = (typeof UPDATABLE_FIELDS)[number];

export const GET = async (req: NextRequest, { params }: GetParams) => {
  const uid = (await params).id;
  const auth = await authorizeCaller(uid);
  if (!auth.ok) return auth.response;

  try {
    const user = await UserModel.findOne({ _id: uid });
    if (!user) return userNotFoundResponse();

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
};

export const PUT = async (req: NextRequest, { params }: GetParams) => {
  const uid = (await params).id;
  const auth = await authorizeCaller(uid);
  if (!auth.ok) return auth.response;

  const body: Partial<User> = await req.json();
  const update: Partial<Pick<User, UpdatableField>> = {};
  for (const field of UPDATABLE_FIELDS) {
    if (field in body) update[field] = body[field] as never;
  }

  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: uid },
      { $set: update },
      { new: true },
    );
    if (!updatedUser) return userNotFoundResponse();

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
};
