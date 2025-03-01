import { makeStyles } from "tss-react/mui";

export const useOverlayStyles = makeStyles()({
  overlay: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "calc(100dvh - 50px)",
    background: "black",
    opacity: 0,
    transition: "opacity 0.25s linear",
    zIndex: -1,
  },
  overlayUp: {
    opacity: 0.4,
    zIndex: 1,
  },
});
