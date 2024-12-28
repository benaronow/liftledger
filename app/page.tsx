import type { Metadata } from "next";
import { auth0 } from "@/lib/auth0";
import { LiftLedger } from "./components/liftLedger";

const IndexPage = async () => {
  const session = await auth0.getSession();
  return (
    <LiftLedger session={session}/>
  );
}

export const metadata: Metadata = {
  title: "LiftLedger",
};

export default IndexPage;
