import type { Metadata } from "next";
import { auth0 } from "@/lib/auth0";
import { Login } from "./components/login";

const IndexPage = async () => {
  const session = await auth0.getSession();
  return (
    <Login session={session}/>
  );
}

export const metadata: Metadata = {
  title: "LiftLedger",
};

export default IndexPage;
