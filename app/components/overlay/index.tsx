"use client";

import { useOverlayStyles } from "./useOverlayStyles";
import { useScreenState } from "@/app/providers/ScreenStateProvider";

export const Overlay = () => {
  const { classes } = useOverlayStyles();
  const { overlayOn, toggleScreenState } = useScreenState();

  return (
    <div
      className={`${classes.overlay} ${overlayOn && classes.overlayUp}`}
      onClick={() => toggleScreenState("overlay", false)}
    ></div>
  );
};
