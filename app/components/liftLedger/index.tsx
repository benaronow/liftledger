"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { LoginContext } from "../providers/loginContext";
import { makeStyles } from "tss-react/mui";
import { CircularProgress } from "@mui/material";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    height: "calc(100vh - 130px)",
    alignItems: "center",
  },
  desc: {
    marginBottom: "20px",
  },
});

export const LiftLedger = () => {
  const { classes } = useStyles();
  const router = useRouter();
  const { session, attemptedLogin, curUser } = useContext(LoginContext);

  useEffect(() => {
    if (!session) router.push("/dashboard");
    if (session && attemptedLogin) {
      router.push(curUser ? "/dashboard" : "/create-account");
    }
  }, [attemptedLogin]);

  return (
    <div className={classes.container}>
      <span className={classes.desc}>Attempting login...</span>
      <CircularProgress />
    </div>
  );
};
