"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useUser } from "./layoutProviders/UserProvider";
import { LogoSpinner } from "./components/LogoSpinner";

export const LiftLedger = () => {
  const router = useRouter();
  const { session, attemptedLogin, curUser, createUser } = useUser();

  const createNewUser = useCallback(async () => {
    if (session?.user.email) {
      await createUser({ email: session.user.email });
      router.push("/dashboard");
    }
  }, [session, createUser, router]);

  useEffect(() => {
    if (!session) router.push("/login");
    if (session && attemptedLogin) {
      if (curUser) {
        router.push("/dashboard");
      } else {
        createNewUser();
      }
    }
  }, [attemptedLogin, createNewUser]);

  return <LogoSpinner />;
};
