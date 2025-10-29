import { COLORS } from "@/lib/colors";
import { ReactNode } from "react";

interface Props {
  label?: string;
  icon: ReactNode;
  onClick: () => void;
  height?: number;
  width?: number;
  disabled?: boolean;
  className?: string;
}

export const ActionButton = ({
  label,
  icon,
  onClick,
  height,
  width,
  disabled,
  className,
}: Props) => {
  return (
    <button
      style={{
        background: disabled ? COLORS.primaryDisabled : COLORS.primary,
        color: disabled ? COLORS.textDisabled : "white",
        height: height ?? 35,
        width: width ?? 35,
      }}
      className={`d-flex align-items-center justify-content-center border-0 gap-1 rounded ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      {label}
    </button>
  );
};
