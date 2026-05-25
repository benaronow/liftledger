"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useUser } from "./layoutContainer/UserProvider";
import { LogoSpinner } from "./components/LogoSpinner";

export const LiftLedger = () => {
  const router = useRouter();
  const { session, attemptedLogin, curUser, createUser } = useUser();

  const createNewUser = useCallback(async () => {
    if (session?.user.email) {
      await createUser({
        email: session.user.email,
        timerPresets: { 0: 120, 1: 150, 2: 180, 3: 210, 4: 240 },
      });
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
