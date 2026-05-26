import { DatePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { JSX } from "react";
import { LabeledInputContainer } from "./LabeledInputContainer";

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
  return (
    <LabeledInputContainer
      className={className}
      label={label}
      error={error}
      renderEnd={renderEnd}
      onBlur={onBlur}
    >
      <DatePicker
        value={value}
        onChange={onChange}
        disabled={disabled}
        readOnly={readOnly}
        className="w-100 rounded bg-white"
        slotProps={{
          textField: {
            fullWidth: true,
            sx: {
              "& .MuiPickersInputBase-root": {
                fontSize: "16px",
                padding: "4px 8px",
                width: width ?? "100%",
                height: height ?? 35,
              },
            },
          },
        }}
      />
    </LabeledInputContainer>
  );
};
