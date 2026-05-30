"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "./layoutContainer/UserProvider";
import { LogoSpinner } from "./components/LogoSpinner";

const IndexPage = () => {
  const router = useRouter();
  const { session, attemptedLogin, curUser, createUser } = useUser();

  const createNewUser = useCallback(async () => {
    if (!session?.user.sub || !session.user.email) return;

    try {
      await createUser({
        auth0Id: session.user.sub,
        email: session.user.email,
        timerPresets: { 0: 120, 1: 150, 2: 180, 3: 210, 4: 240 },
      });
      router.push("/dashboard");
    } catch (e) {
      console.error("Failed to create user:", e);
      router.push("/login");
    }
  }, [session, createUser, router]);

  useEffect(() => {
    if (!session || !attemptedLogin) return;

    if (curUser) {
      router.push("/dashboard");
      return;
    }

    createNewUser();
  }, [session, attemptedLogin, curUser, createNewUser]);

  return <LogoSpinner />;
};

export default IndexPage;
