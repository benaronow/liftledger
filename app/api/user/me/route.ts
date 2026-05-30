import { connectDB } from "@/lib/connectDB";
import BlockModel from "@/lib/models/block";
import UserModel from "@/lib/models/user";
import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export const GET = async () => {
  const session = await auth0.getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const user = await UserModel.findOne({
    auth0Id: session.user.sub,
  }).populate([{ path: "blocks", model: BlockModel }]);

  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(user);
};