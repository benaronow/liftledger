"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "./layoutProviders/UserProvider";
import { LogoSpinner } from "./components/LogoSpinner";

export const LiftLedger = () => {
  const router = useRouter();
  const { session, attemptedLogin, curUser } = useUser();

  useEffect(() => {
    if (!session) router.push("/dashboard");
    if (session && attemptedLogin) {
      router.push(curUser ? "/dashboard" : "/create-account");
    }
  }, [attemptedLogin]);

  return <LogoSpinner />;
};
