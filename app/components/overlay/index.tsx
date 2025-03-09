"use client";

import { useContext } from "react";
import { useOverlayStyles } from "./useOverlayStyles";
import { ScreenStateContext } from "@/app/providers/screenStateProvider";

export const Overlay = () => {
  const { classes } = useOverlayStyles();
  const { overlayOn, toggleScreenState } = useContext(ScreenStateContext);

  return (
    <div
      className={`${classes.overlay} ${overlayOn && classes.overlayUp}`}
      onClick={() => toggleScreenState("overlay", false)}
    ></div>
  );
};
