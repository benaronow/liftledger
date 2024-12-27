import { auth0 } from "@/lib/auth0";
import { Dashboard } from "../components/dashboard";

const Page = async () => {
  const session = await auth0.getSession();
  return <Dashboard session={session} />;
};

export default Page;
