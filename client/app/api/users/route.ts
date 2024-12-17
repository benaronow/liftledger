
import { connect } from "@/app/dbConnect";
import UserModel from "@/app/models/user";
import { NextResponse } from "next/server";

export const GET = async () => {
    await connect();

    const users = await UserModel.find();

    return NextResponse.json({ data: users });
};