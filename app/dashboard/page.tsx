import { auth0 } from "@/lib/auth0";
import { LiftLedger } from "../components/liftLedger";

const Page = async () => {
  const session = await auth0.getSession();
  return <LiftLedger session={session} />;
};

export default Page;
