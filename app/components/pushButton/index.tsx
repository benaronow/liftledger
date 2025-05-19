import { ReactNode } from "react";
import { usePushButtonStyles } from "./usePushButtonStyles";

interface PushButtonProps {
  readonly children?: ReactNode;
  height?: number;
  width?: number;
  topColor?: string;
  sideColor?: string;
  borderRadius?: number;
  variant?: "tall" | "short";
  onClick?: () => void;
}

export const PushButton = ({
  children,
  height,
  width,
  topColor,
  sideColor,
  borderRadius,
  variant,
  onClick,
}: PushButtonProps) => {
  const { classes } = usePushButtonStyles({
    height: height ?? 30,
    width: width ?? 60,
    topColor: topColor ?? "#0096FF",
    sideColor: sideColor ?? "#004c81",
    borderRadius: borderRadius ?? 5,
    variant: variant,
  });

  return (
    <div className={classes.container}>
      <div className={`${classes.button} ${classes.buttonBottom}`} />
      <button
        className={`${classes.button} ${classes.buttonTop}`}
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
};
