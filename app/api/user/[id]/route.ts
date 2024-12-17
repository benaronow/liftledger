import { connect } from "@/app/dbConnect";
import UserModel from "@/app/models/user";
import { NextRequest, NextResponse } from "next/server";

interface GetParams {
    params: Promise<{ id: string }>
}

export const GET = async (req: NextRequest, { params }: GetParams) => {
    await connect();

    const user = await UserModel.findOne({ username: (await params).id });

    return NextResponse.json({ data: user });
};