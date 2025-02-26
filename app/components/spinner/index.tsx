"use client";

import Image from "next/image";
import { keyframes } from "tss-react";
import { makeStyles } from "tss-react/mui";

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
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    height: "calc(100dvh - 100px)",
    alignItems: "center",
  },
  logo: {
    animation: `${spin} 1s infinite ease`,
  },
});

export const Spinner = () => {
  const { classes } = useStyles();

  return (
    <>
      <div className={classes.container}>
        <Image
          className={classes.logo}
          src="/icon.png"
          alt="Description of image"
          height={50}
          width={50}
        />
      </div>
    </>
  );
};
