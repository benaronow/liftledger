import { NextResponse } from "next/server";
import { auth0 } from "./auth0";
import { connectDB } from "./connectDB";
import UserModel from "./models/user";
import { SessionData } from "@auth0/nextjs-auth0/types";
import { User } from "./types";

type AuthResponse =
  | { ok: true; me: User; session: SessionData }
  | { ok: false; response: NextResponse };

export const unauthorizedResponse = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

export const userNotFoundResponse = () =>
  NextResponse.json({ error: "User not found" }, { status: 404 });

// Authorizes a `/me` route. Confirms an active session and (optionally) loads
// the matching user document.
export const authorizeMe = async (): Promise<AuthResponse> => {
  await connectDB();

  const session = await auth0.getSession();
  if (!session) return { ok: false, response: unauthorizedResponse() };

  const curUser = await UserModel.findOne({ auth0Id: session.user.sub });
  if (!curUser) return { ok: false, response: userNotFoundResponse() };

  return { ok: true, me: curUser, session };
};

// Authorizes a route keyed by user `_id` in the URL. Confirms the user exists
// and the active session belongs to that user.
export const authorizeCaller = async (id: string): Promise<AuthResponse> => {
  const myAuth = await authorizeMe();
  if (!myAuth.ok) return myAuth;
  const { me, session } = myAuth;

  if (me._id?.toString() !== id)
    return { ok: false, response: unauthorizedResponse() };

  return { ok: true, me, session };
};
