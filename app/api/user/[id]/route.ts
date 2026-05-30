import { auth0 } from "@/lib/auth0";
import { connectDB } from "@/lib/connectDB";
import UserModel from "@/lib/models/user";
import { GetParams, User } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

const authorize = async (_id: string) => {
  await connectDB();

  const user = await UserModel.findOne({ _id });
  if (!user)
    return {
      ok: false,
      response: NextResponse.json({ error: "User not found" }, { status: 404 }),
    };

  const session = await auth0.getSession();
  if (!session || session.user.sub !== user.auth0Id)
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };

  return { ok: true, user };
};

export const GET = async (req: NextRequest, { params }: GetParams) => {
  const _id = (await params).id;
  const result = await authorize(_id);
  if (!result.ok) return result.response;

  return NextResponse.json(result.user);
};

export const PUT = async (req: NextRequest, { params }: GetParams) => {
  const _id = (await params).id;
  const result = await authorize(_id);
  if (!result.ok) return result.response;

  const user: User = await req.json();
  const updatedUser = await UserModel.findOneAndUpdate(
    { _id },
    { $set: user },
    { new: true },
  );

  return NextResponse.json(updatedUser);
};

export const DELETE = async (req: NextRequest, { params }: GetParams) => {
  const _id = (await params).id;
  const result = await authorize(_id);
  if (!result.ok) return result.response;

  const deleteInfo = await UserModel.deleteOne({ _id });

  return NextResponse.json(deleteInfo);
};
