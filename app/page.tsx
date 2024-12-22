import type { Metadata } from "next";
import { FitnessLog } from "./components/fitnessLog";
import { auth0 } from "@/lib/auth0";
import { Login } from "./components/login";

export default async function IndexPage() {
  const session = await auth0.getSession();
  return session ? <FitnessLog session={session} /> : <Login />;
}

export const metadata: Metadata = {
  title: "Fitness Log",
};
