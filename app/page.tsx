import type { Metadata } from "next";
import { LiftLedger } from "./components/liftLedger";
import { auth0 } from "@/lib/auth0";

export default async function IndexPage() {
  const session = await auth0.getSession();
  return <LiftLedger session={session} />;
}

export const metadata: Metadata = {
  title: "Fitness Log",
};
