"use client";

import Image from "next/image";
import { useSpinnerStyles } from "./useSpinnerStyles";

export const Spinner = () => {
  const { classes } = useSpinnerStyles();

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
