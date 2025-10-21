import { Dialog } from "@mui/material";
import { ReactNode } from "react";
import { IoMdCloseCircle } from "react-icons/io";

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
  open: boolean;
  onClose: () => void;
  title: string;
  actions: Action[];
}

export type ChangeExerciseType = "name" | "apparatus" | "weightType";
export type SubmitExerciseType = "change" | "add" | "delete";

export const ActionDialog = ({
  children,
  open,
  onClose,
  title,
  actions,
}: Props) => {
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
      <div
        className="d-flex justify-content-between align-items-center w-100"
        style={{ height: "30px", padding: "5px" }}
      >
        <div style={{ width: "20px" }}>
          <button
            className="d-flex justify-content-center align-items-center border-0 bg-transparent p-0"
            style={{ fontSize: "20px", color: "red" }}
            onClick={onClose}
          >
            <IoMdCloseCircle />
          </button>
        </div>
        <span
          className="text-white"
          style={{ fontSize: "16px", fontWeight: 600 }}
        >
          {title}
        </span>
        <div style={{ width: "20px" }} />
      </div>
      <div style={{ padding: "0 5px" }}>
        <div
          className="d-flex flex-column bg-white text-nowrap justify-content-between"
          style={{
            padding: "10px",
            width: "240px",
            borderRadius: "5px",
            gap: "10px",
          }}
        >
          {children}
        </div>
      </div>
      <div
        className="d-flex justify-content-between align-items-center text-white"
        style={{ padding: "6px", gap: "5px" }}
      >
        {actions.map((action, idx) => (
          <button
            key={idx}
            className="d-flex justify-content-center align-items-center w-100 border-0 rounded"
            style={{
              ...(action.disabled ? action.disabledStyle : action.enabledStyle),
              height: "50px",
            }}
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
