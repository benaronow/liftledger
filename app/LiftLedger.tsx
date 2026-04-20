"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "./layoutProviders/UserProvider";
import { Spinner } from "./components/spinner";

export const LiftLedger = () => {
  const router = useRouter();
  const { session, attemptedLogin, curUser } = useUser();

  useEffect(() => {
    if (!session) router.push("/dashboard");
    if (session && attemptedLogin) {
      router.push(curUser ? "/dashboard" : "/create-account");
    }
  }, [attemptedLogin]);

  return <Spinner />;
};
