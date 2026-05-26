import { COLORS } from "@/lib/colors";
import { ChangeEvent, JSX } from "react";
import { LabeledInputContainer } from "./LabeledInputContainer";

type Props = {
  className?: string;
  height?: string | number;
  width?: string | number;
  label?: string;
  error?: string;
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  type?: string;
  step?: string | number;
  min?: string | number;
  renderEnd?: () => JSX.Element;
  onBlur?: () => void;
};

export const LabeledTextInput = ({
  className,
  height,
  width,
  label,
  error,
  value,
  onChange,
  placeholder,
  readOnly,
  disabled,
  type,
  step,
  min,
  renderEnd,
  onBlur,
}: Props) => {
  return (
    <LabeledInputContainer
      className={className}
      label={label}
      error={error}
      renderEnd={renderEnd}
      onBlur={onBlur}
    >
      <input
        className={`w-100 px-2 py-1 border-0 ${renderEnd ? "rounded-start" : "rounded"}`}
        style={{
          fontSize: "16px",
          outlineColor: COLORS.primary,
          background: disabled ? COLORS.textDisabled : "white",
          height: height ?? 35,
          width: width ?? "100%",
        }}
        type={type}
        step={step}
        min={min}
        value={value}
        onChange={onChange}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
      />
    </LabeledInputContainer>
  );
};
