import { DARK_COLORS } from "@liftledger/shared";
import { ReactNode } from "react";
import { useTheme } from "@/providers/ThemeProvider";

export type Variant =
  | "primary"
  | "primaryInverted"
  | "danger"
  | "dangerInverted";

interface Props {
  label?: string;
  icon: ReactNode;
  onClick: () => void;
  height?: string | number;
  width?: string | number;
  variant?: Variant;
  disabled?: boolean;
  roundedSide?: "start" | "end" | "top" | "bottom" | "0";
  border?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ActionButton = ({
  label,
  icon,
  onClick,
  height,
  width,
  variant,
  disabled,
  roundedSide,
  border,
  className,
  style,
}: Props) => {
  const { colors } = useTheme();
  const getButtonStyle = (
    variant: Variant | undefined,
    disabled: boolean | undefined,
  ) => {
    switch (variant) {
      case "primaryInverted":
        return {
          background: disabled ? colors.textDisabled : "white",
          color: disabled ? DARK_COLORS.primaryDisabled : DARK_COLORS.primary,
        };
      case "danger":
        return {
          background: disabled
            ? DARK_COLORS.dangerDisabled
            : DARK_COLORS.danger,
          color: disabled ? colors.textDisabled : "white",
        };
      case "dangerInverted":
        return {
          background: disabled ? colors.textDisabled : "white",
          color: disabled ? DARK_COLORS.dangerDisabled : DARK_COLORS.danger,
        };
      case "primary":
      default:
        return {
          background: disabled
            ? DARK_COLORS.primaryDisabled
            : DARK_COLORS.primary,
          color: disabled ? colors.textDisabled : "white",
        };
    }
  };

  return (
    <button
      style={{
        background: getButtonStyle(variant, disabled).background,
        color: getButtonStyle(variant, disabled).color,
        height: height ?? 35,
        minHeight: height ?? undefined,
        width: width ?? "100%",
        minWidth: width ?? undefined,
        ...(style ?? {}),
      }}
      className={`d-flex align-items-center justify-content-center ${border ?? "border-0"} gap-2 rounded${
        roundedSide ? `-${roundedSide}` : ""
      } text-nowrap px-2 py-1 ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {label && <strong>{label}</strong>}
      {icon}
    </button>
  );
};
