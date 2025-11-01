import { COLORS } from "@/lib/colors";
import { ReactNode } from "react";

export type Variant =
  | "primary"
  | "primaryInverted"
  | "danger"
  | "dangerInverted";

interface Props {
  label?: string;
  icon: ReactNode;
  onClick: () => void;
  height?: number;
  width?: number;
  variant?: Variant;
  disabled?: boolean;
  className?: string;
}

export const ActionButton = ({
  label,
  icon,
  onClick,
  height,
  width,
  variant,
  disabled,
  className,
}: Props) => {
  const getButtonStyle = (
    variant: Variant | undefined,
    disabled: boolean | undefined
  ) => {
    switch (variant) {
      case "primaryInverted":
        return {
          background: disabled ? COLORS.textDisabled : "white",
          color: disabled ? COLORS.primaryDisabled : COLORS.primary,
        };
      case "danger":
        return {
          background: disabled ? COLORS.dangerDisabled : COLORS.danger,
          color: disabled ? COLORS.textDisabled : "white",
        };
      case "dangerInverted":
        return {
          background: disabled ? COLORS.textDisabled : "white",
          color: disabled ? COLORS.dangerDisabled : COLORS.danger,
        };
      case "primary":
      default:
        return {
          background: disabled ? COLORS.primaryDisabled : COLORS.primary,
          color: disabled ? COLORS.textDisabled : "white",
        };
    }
  };

  return (
    <button
      style={{
        background: getButtonStyle(variant, disabled).background,
        color: getButtonStyle(variant, disabled).color,
        height: height ?? 35,
        width: width ?? "100%",
      }}
      className={`d-flex align-items-center justify-content-center border-0 gap-2 rounded text-nowrap px-2 py-1 ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {icon}
      {label && <span>{label}</span>}
    </button>
  );
};
