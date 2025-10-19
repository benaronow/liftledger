import { DatePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { ChangeEvent } from "react";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()({
  inputRow: {
    display: "flex",
    fontSize: "14px",
    alignItems: "center",
    border: "solid 2px #adafb3",
    borderRadius: "5px",
    padding: "5px",
    background: "white",
    color: "black",
    width: "100%",
  },
  input: {
    border: "none",
    outline: "none",
    fontSize: "16px",
    width: "100%",
  },
  rowName: {
    marginRight: "5px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
});

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
  const { classes } = useStyles();

  return (
    <div className={classes.inputRow}>
      <span className={classes.rowName}>{label}</span>
      {onChangeText && (
        <input
          className={classes.input}
          value={textValue}
          onChange={onChangeText}
          disabled={disabled}
        />
      )}
      {onChangeDate && (
        <DatePicker
          className={classes.input}
          value={dateValue}
          onChange={onChangeDate}
        />
      )}
    </div>
  );
};
