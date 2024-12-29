"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { LoginContext } from "../providers/loginContext";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()({
  container: {
    textAlign: "center",
  },
});

export const Dashboard = () => {
  const { classes } = useStyles();
  const { session, attemptedLogin, curUser } = useContext(LoginContext);
  const router = useRouter();

  useEffect(() => {
    if (session && attemptedLogin && !curUser) {
      router.push("/create-account");
    }
  }, [attemptedLogin]);

  return (
    <div>
      {session ? (
        <span>Cool dashboard here!</span>
      ) : (
        <div className={classes.container}>
          <span>Create an account or log in to use LiftLedger!</span>
        </div>
      )}
    </div>
  );
};
