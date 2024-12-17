import { connect } from "@/app/dbConnect";
import UserModel from "@/app/models/user";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, { params }: { params: { id: string }}) => {
    await connect();

    const user = await UserModel.findOne({ username: params.id });

    return NextResponse.json({ data: user });
};