"use client";

import { MenuOpenContext } from "@/app/providers/MenuOpenProvider";
import { useContext } from "react";
import { useOverlayStyles } from "./useOverlayStyles";

export const Overlay = () => {
  const { classes } = useOverlayStyles();
  const { menuOpen, toggleMenuOpen } = useContext(MenuOpenContext);

  return (
    <div
      className={`${classes.overlay} ${menuOpen && classes.overlayUp}`}
      onClick={toggleMenuOpen}
    ></div>
  );
};
