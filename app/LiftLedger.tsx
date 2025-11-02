"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "./providers/UserProvider";
import { useScreenState } from "@/app/providers/ScreenStateProvider";
import { useTheme } from "@mui/material";
import { Spinner } from "./components/spinner";

export const LiftLedger = () => {
  const router = useRouter();
  const { session, attemptedLogin, curUser, setIntroMessageOpen } = useUser();
  const { innerWidth } = useScreenState();
  const theme = useTheme();

  useEffect(() => {
    if (!session) router.push("/dashboard");
    if (session && attemptedLogin) {
      router.push(curUser ? "/dashboard" : "/create-account");
    }
    if (
      typeof window !== "undefined" &&
      innerWidth &&
      innerWidth < theme.breakpoints.values["sm"]
    ) {
      setIntroMessageOpen(
        !window.matchMedia("(display-mode: standalone)").matches
      );
    }
  }, [attemptedLogin]);

  return <Spinner />;
};
