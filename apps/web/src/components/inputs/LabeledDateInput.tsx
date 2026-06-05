import { DARK_COLORS } from "@liftledger/shared";
import dayjs, { Dayjs } from "dayjs";
import { JSX } from "react";
import DatePicker from "react-datepicker";
import { LabeledInputContainer } from "./LabeledInputContainer";
import { useTheme } from "@/providers/ThemeProvider";

type Props = {
  className?: string;
  height?: string | number;
  width?: string | number;
  label?: string;
  error?: string;
  value?: Dayjs | null;
  onChange?: (value: Dayjs | null) => void;
  readOnly?: boolean;
  disabled?: boolean;
  renderEnd?: () => JSX.Element;
  onBlur?: () => void;
};

export const LabeledDateInput = ({
  className,
  height,
  width,
  label,
  error,
  value,
  onChange,
  readOnly,
  disabled,
  renderEnd,
  onBlur,
}: Props) => {
  const { colors } = useTheme();
  return (
    <LabeledInputContainer
      className={className}
      label={label}
      error={error}
      renderEnd={renderEnd}
      onBlur={onBlur}
    >
      <DatePicker
        selected={value && value.isValid() ? value.toDate() : null}
        onChange={(d: Date | null) => onChange?.(d ? dayjs(d) : null)}
        disabled={disabled}
        readOnly={readOnly}
        wrapperClassName="w-100"
        customInput={
          <input
            className="w-100 px-2 py-1 border-0 rounded"
            style={{
              fontSize: "16px",
              outlineColor: DARK_COLORS.primary,
              background: disabled ? colors.textDisabled : "white",
              height: height ?? 35,
              width: width ?? "100%",
            }}
          />
        }
      />
    </LabeledInputContainer>
  );
};
