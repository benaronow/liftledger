import { Action, ActionDialog } from "../ActionDialog";
import { GrPowerReset } from "react-icons/gr";
import { FaTrash } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()({
  deleteContainer: {
    display: "flex",
    flexDirection: "column",
  },
  deleteQuestion: {
    whiteSpace: "wrap",
    marginBottom: "20px",
  },
  deleteDisclaimer: {
    whiteSpace: "wrap",
    fontWeight: 900,
  },
});

interface Props {
  onClose: () => void;
  type: "day" | "exercise" | "set";
  isResetting: boolean;
  isDeleting: boolean;
  onReset: () => void;
  onDelete: () => void;
}

export const DeleteResetDialog = ({
  onClose,
  type,
  isResetting,
  isDeleting,
  onReset,
  onDelete,
}: Props) => {
  const { classes } = useStyles();

  const resetActions: Action[] = [
    {
      text: <IoArrowBack />,
      enabledStyle: {
        background: "white",
        color: "red",
        fontSize: "30px",
      },
      onClick: onClose,
    },
    {
      text: <GrPowerReset />,
      enabledStyle: {
        background: "red",
        color: "white",
        fontSize: "25px",
      },
      onClick: onReset,
    },
  ];

  const deleteActions: Action[] = [
    {
      text: <IoArrowBack />,
      enabledStyle: {
        background: "white",
        color: "red",
        fontSize: "30px",
      },
      onClick: onClose,
    },
    {
      text: <FaTrash />,
      enabledStyle: {
        background: "red",
        color: "white",
        fontSize: "28px",
      },
      onClick: onDelete,
    },
  ];

  const titleType = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <ActionDialog
      open={isResetting || isDeleting}
      onClose={onClose}
      title={
        isResetting
          ? `Reset ${titleType}${titleType === "Set" ? "" : "s"}`
          : `Delete ${titleType}`
      }
      actions={isResetting ? resetActions : deleteActions}
    >
      <div className={classes.deleteContainer}>
        <span className={classes.deleteQuestion}>{`Are you sure you want to ${
          isResetting
            ? `reset ${type === "set" ? "this set" : "all ${type}s"}`
            : `delete this ${type}`
        }?`}</span>
        <span className={classes.deleteDisclaimer}>
          This action cannot be undone.
        </span>
      </div>
    </ActionDialog>
  );
};
