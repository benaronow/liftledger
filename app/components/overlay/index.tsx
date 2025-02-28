import { MenuOpenContext } from "@/app/providers/MenuOpenProvider";
import { useContext } from "react";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()({
  overlay: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "calc(100dvh - 50px)",
    background: "black",
    opacity: 0,
    transition: "opacity 0.4s linear",
    zIndex: -1,
  },
  overlayUp: {
    opacity: 0.4,
    zIndex: 1,
  },
});

export const Overlay = () => {
  const { classes } = useStyles();
  const { menuOpen, toggleMenuOpen } = useContext(MenuOpenContext);

  return (
    <div
      className={`${classes.overlay} ${menuOpen && classes.overlayUp}`}
      onClick={toggleMenuOpen}
    ></div>
  );
};
