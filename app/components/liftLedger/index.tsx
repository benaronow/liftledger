"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { UserContext } from "../../providers/UserProvider";
import { ScreenStateContext } from "@/app/providers/ScreenStateProvider";
import { useTheme } from "@mui/material";
import { Spinner } from "../spinner";

export const LiftLedger = () => {
  const router = useRouter();
  const { session, attemptedLogin, curUser, setIntroMessageOpen } =
    useContext(UserContext);
  const { innerWidth } = useContext(ScreenStateContext);
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
