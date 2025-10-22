import { COLORS } from "@/lib/constants";
import { DatePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { ChangeEvent } from "react";
import { FormSelect } from "react-bootstrap";

interface Props {
  label: string;
  textValue?: string | number;
  dateValue?: Dayjs | null;
  options?: string[];
  onChangeText?: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeDate?: (value: Dayjs | null) => void;
  onChangeSelect?: (e: ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  className?: string;
}

export const LabeledInput = ({
  label,
  textValue,
  dateValue,
  options,
  onChangeText,
  onChangeDate,
  onChangeSelect,
  disabled,
  className,
}: Props) => {
  return (
    <div className={`d-flex flex-column align-items-start w-100 ${className}`}>
      <span
        className="fw-semibold text-nowrap text-white mb-1"
        style={{ fontSize: "14px" }}
      >
        {label}
      </span>
      {onChangeText && (
        <input
          className="w-100 rounded px-2 py-1 border-0"
          style={{
            fontSize: "16px",
            outlineColor: COLORS.primary,
            background: disabled ? COLORS.textDisabled : "white",
          }}
          value={textValue}
          onChange={onChangeText}
          disabled={disabled}
        />
      )}
      {onChangeDate && (
        <DatePicker
          value={dateValue}
          onChange={onChangeDate}
          className="w-100 rounded px-2 py-1 bg-white"
          slotProps={{
            textField: {
              fullWidth: true,
              sx: {
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
                "& .MuiInputBase-input": { fontSize: "16px", padding: 0 },
              },
            },
          }}
        />
      )}
      {options && onChangeSelect && (
        <FormSelect
          className="w-100 p-1 border-0"
          value={textValue}
          onChange={onChangeSelect}
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </FormSelect>
      )}
    </div>
  );
};
