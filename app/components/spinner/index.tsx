"use client";

import { useSpinnerStyles } from "./useSpinnerStyles";

export const Spinner = () => {
  const { classes } = useSpinnerStyles();

  return (
    <div className={classes.container}>
      <img
        className={classes.logo}
        src="/icon.png"
        alt="Description of image"
        height={50}
        width={50}
      />
    </div>
  );
};
