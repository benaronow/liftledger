"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import { useCreateUser, useMe } from "@liftledger/api-client";
import { LogoSpinner } from "./components/LogoSpinner";

const IndexPage = () => {
  const router = useRouter();
  const { user: auth0User, isAuthenticated } = useAuth0();
  const { data: curUser, isLoading, error } = useMe(isAuthenticated);
  const { trigger: createUser } = useCreateUser();

  // Equivalent to the old `attemptedLogin`: SWR has settled (either data or
  // a 404 error has come back). Once true, page.tsx can decide whether to
  // redirect to dashboard or auto-create the DB record.
  const attemptedLogin =
    isAuthenticated && !isLoading && (curUser !== undefined || error !== undefined);

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
