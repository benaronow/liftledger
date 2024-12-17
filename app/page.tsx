import type { Metadata } from "next";
import { FitnessLog } from "./components/fitnessLog";
import { auth0 } from "@/lib/auth0";

export default async function IndexPage() {
  const session = await auth0.getSession();
  console.log(session);
  if (!session) {
    return (
      <main>
        <a href="/auth/login?screen_hint=signup">Sign up</a>
        <a href="/auth/login">Log in</a>
      </main>
    );
  }

  return <FitnessLog />;
}

export const metadata: Metadata = {
  title: "Fitness Log",
};
