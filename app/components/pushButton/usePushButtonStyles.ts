import { makeStyles } from "tss-react/mui";

export const usePushButtonStyles = makeStyles<{
  height: number;
  width: number;
  topColor: string;
  sideColor: string;
  borderRadius: number;
  variant?: "tall" | "short";
}>()((_, { height, width, topColor, sideColor, borderRadius, variant }) => ({
  container: {
    height: `${
      (height ?? 30) + (variant === "tall" ? 10 : variant === "short" ? 3 : 5)
    }px`,
    width: `${width ?? 60}px`,
  },
  button: {
    height: `${height ?? 30}px`,
    width: `${width ?? 60}px`,
    borderRadius: borderRadius,
  },
  buttonTop: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    background: topColor,
    transition: "transform 0.1s",
    transform: `translateY(-${height ?? 30}px)`,
    "&:active": {
      transform: `translateY(-${
        (height ?? 30) - (variant === "tall" ? 9 : variant === "short" ? 2 : 4)
      }px)`,
    },
  },
  buttonBottom: {
    background: sideColor,
    borderRadius: borderRadius,
    transform: `translateY(${
      variant === "tall" ? 10 : variant === "short" ? 3 : 5
    }px)`,
  },
}));
