import { COLORS } from "@/lib/colors";
import { ChangeEvent, JSX } from "react";
import { FormSelect } from "react-bootstrap";
import { LabeledInputContainer } from "./LabeledInputContainer";

type Props = {
  className?: string;
  height?: string | number;
  width?: string | number;
  label?: string;
  error?: string;
  value?: string | number;
  options: string[];
  includeEmptyOption?: boolean;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  renderEnd?: () => JSX.Element;
  onBlur?: () => void;
};

export const LabeledSelect = ({
  className,
  height,
  width,
  label,
  error,
  value,
  options,
  includeEmptyOption,
  onChange,
  disabled,
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
      <FormSelect
        className="w-100 p-1 border-0 overflow-hidden text-truncate"
        value={value}
        onChange={onChange}
        style={{
          height: height ?? 35,
          width: width ?? "100%",
          background: disabled ? COLORS.textDisabled : "",
        }}
        disabled={disabled}
      >
        {includeEmptyOption && <option value="">-- Select --</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </FormSelect>
    </LabeledInputContainer>
  );
};
