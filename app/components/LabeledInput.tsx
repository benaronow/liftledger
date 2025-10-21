import { DatePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { ChangeEvent } from "react";

interface Props {
  label: string;
  textValue?: string | number;
  dateValue?: Dayjs | null;
  onChangeText?: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeDate?: (value: Dayjs | null) => void;
  disabled?: boolean;
}

export const LabeledInput = ({
  label,
  textValue,
  dateValue,
  onChangeText,
  onChangeDate,
  disabled,
}: Props) => {
  return (
    <div
      className="d-flex align-items-center w-100"
      style={{
        fontSize: "14px",
        border: "solid 2px #adafb3",
        borderRadius: "5px",
        padding: "5px",
        background: "white",
        color: "black",
      }}
    >
      <span className="fw-semibold text-nowrap" style={{ marginRight: "5px" }}>
        {label}
      </span>
      {onChangeText && (
        <input
          className="w-100"
          style={{ border: "none", outline: "none", fontSize: "16px" }}
          value={textValue}
          onChange={onChangeText}
          disabled={disabled}
        />
      )}
      {onChangeDate && (
        <DatePicker
          value={dateValue}
          onChange={onChangeDate}
          slotProps={{
            textField: {
              fullWidth: true,
              sx: {
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "& .MuiInputBase-input": { fontSize: "16px", padding: "0 8px" },
              },
            },
          }}
        />
      )}
    </div>
  );
};
