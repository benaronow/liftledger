"use client";

import { SessionData } from "@auth0/nextjs-auth0/server";
import { useLiftLedger } from "./useLiftLedger";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface LiftLedgerProps {
  session: SessionData | null;
}

export const LiftLedger = ({ session }: LiftLedgerProps) => {
  const router = useRouter();
  const auth0_email = session?.user.email || "";
  const { attemptedLogin, curUser } = useLiftLedger(auth0_email);

  useEffect(() => {
    console.log(session, attemptedLogin, curUser);
    if (!session) router.push("/dashboard");
    if (session && attemptedLogin) {
      router.push(curUser ? "/dashboard" : "/create-account");
    }
  }, [attemptedLogin]);

  return <span>Hello</span>;
};
