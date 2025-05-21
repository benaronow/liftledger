import { ReactNode } from "react";
import { usePushButtonStyles } from "./usePushButtonStyles";

interface PushButtonProps {
  readonly children?: ReactNode;
  className?: string;
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
  className,
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
        className={`${className} ${classes.button} ${classes.buttonTop}`}
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
};
