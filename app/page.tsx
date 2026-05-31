"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "./layoutContainer/UserProvider";
import { LogoSpinner } from "./components/LogoSpinner";

const IndexPage = () => {
  const router = useRouter();
  const { auth0User, attemptedLogin, curUser, createUser } = useUser();

  const createNewUser = useCallback(async () => {
    if (!auth0User?.sub || !auth0User.email) return;

    try {
      await createUser({
        auth0Id: auth0User.sub,
        email: auth0User.email,
        timerPresets: { 0: 120, 1: 150, 2: 180, 3: 210, 4: 240 },
      });
    } catch (e) {
      console.error("Failed to create user:", e);
      router.push("/login");
    }
  }, [auth0User, createUser, router]);

  useEffect(() => {
    if (!auth0User || !attemptedLogin) return;

    if (curUser) {
      router.push("/dashboard");
      return;
    }

    createNewUser();
  }, [auth0User, attemptedLogin, curUser, createNewUser, router]);

  return <LogoSpinner />;
};

export default IndexPage;
