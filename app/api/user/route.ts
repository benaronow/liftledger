
import { connect } from "@/app/dbConnect";
import UserModel from "@/app/models/user";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    await connect();

    const user = await req.json();
    const newUser = await UserModel.create(user);

    return NextResponse.json({ data: newUser })
}

export const DELETE = async (req: NextRequest) => {
    await connect();

    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    const deleteInfo = await UserModel.deleteOne({ username: username });

    return NextResponse.json({ data: deleteInfo })
}