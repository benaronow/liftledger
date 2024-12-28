import { LLHeader } from "./LLHeader";
import { auth0 } from "@/lib/auth0";

export const Header = async () => {
  const session = await auth0.getSession();
  return <LLHeader session={session}></LLHeader>;
};
