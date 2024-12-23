import { auth0 } from "@/lib/auth0";
import { CreateAccount } from "../components/createAccount";

const Page = async () => {
  const session = await auth0.getSession();
  return <CreateAccount session={session} />;
};

export default Page;
