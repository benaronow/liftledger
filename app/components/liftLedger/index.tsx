"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { LoginContext } from "../../providers/loginProvider";
import { useAppDispatch } from "@/lib/hooks";
import { setMessageOpen } from "@/lib/features/user/userSlice";
import { ScreenStateContext } from "@/app/providers/screenStateProvider";
import { useTheme } from "@mui/material";
import { Spinner } from "../spinner";

export const LiftLedger = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { session, attemptedLogin, curUser } = useContext(LoginContext);
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
      dispatch(
        setMessageOpen(!window.matchMedia("(display-mode: standalone)").matches)
      );
    }
  }, [attemptedLogin]);

  return <Spinner />;
};
