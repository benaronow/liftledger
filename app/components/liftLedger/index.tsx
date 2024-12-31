"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { LoginContext } from "../providers/loginContext";
import { makeStyles } from "tss-react/mui";
import Image from "next/image";
import { keyframes } from "tss-react";

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const useStyles = makeStyles()({
  container: {
    marginTop: '50px',
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    height: "calc(100vh - 120px)",
    alignItems: "center",
  },
  desc: {
    marginBottom: "20px",
  },
  logo: {
    animation: `${spin} 1s infinite ease`,
  },
  "@keyframes rotate": {
    "0%": {
      transform: "rotate(0)",
    },
    "50%": {
      transform: "rotate(180deg)",
    },
    "100%": {
      transform: "translateY(360deg)",
    },
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
      <Image
        className={classes.logo}
        src="/icon.png"
        alt="Description of image"
        height={50}
        width={50}
      />
    </div>
  );
};
