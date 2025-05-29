import { Dialog } from "@mui/material";
import { ReactNode } from "react";
import { makeStyles } from "tss-react/mui";
import { IoMdCloseCircle } from "react-icons/io";

const useStyles = makeStyles()({
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "30px",
    width: "100%",
    padding: "5px",
  },
  headerTitle: {
    color: "white",
    fontSize: "16px",
    fontWeight: 600,
  },
  headerPad: {
    fontSize: "18px",
    width: "20px",
    color: "red",
    padding: "0px",
  },
  closeButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    background: "transparent",
    padding: "0px",
    fontSize: "20px",
    color: "red",
  },
  inputContainer: {
    padding: "0px 5px",
  },
  input: {
    display: "flex",
    flexDirection: "column",
    padding: "10px",
    width: "240px",
    background: "white",
    borderRadius: "5px",
    whiteSpace: "nowrap",
    justifyContent: "space-between",
    gap: "10px",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "white",
    padding: "6px",
    gap: "5px",
  },
  button: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "50px",
    width: "100%",
    fontSize: "30px",
    border: "none",
    borderRadius: "5px",
    padding: "0px",
  },
});

interface ActionStyle {
  [key: string]: string;
}

export interface Action {
  text: ReactNode;
  enabledStyle: ActionStyle;
  disabled?: boolean;
  disabledStyle?: ActionStyle;
  onClick: () => void;
}

interface Props {
  readonly children: ReactNode;
  title: string;
  actions: Action[];
  open: boolean;
  onClose: () => void;
}

export type ChangeExerciseType = "name" | "apparatus" | "weightType";
export type SubmitExerciseType = "change" | "add" | "delete";

export const ActionDialog = ({
  children,
  title,
  actions,
  open,
  onClose,
}: Props) => {
  const { classes } = useStyles();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "10px",
          background: "#58585b",
        },
      }}
    >
      <div className={classes.header}>
        <div className={classes.headerPad}>
          <button className={classes.closeButton} onClick={onClose}>
            <IoMdCloseCircle />
          </button>
        </div>
        <span className={classes.headerTitle}>{title}</span>
        <div className={classes.headerPad} />
      </div>
      <div className={classes.inputContainer}>
        <div className={classes.input}>{children}</div>
      </div>
      <div className={classes.buttonRow}>
        {actions.map((action, idx) => (
          <button
            key={idx}
            className={classes.button}
            style={action.disabled ? action.disabledStyle : action.enabledStyle}
            disabled={action.disabled}
            onClick={action.onClick}
          >
            {action.text}
          </button>
        ))}
      </div>
    </Dialog>
  );
};
