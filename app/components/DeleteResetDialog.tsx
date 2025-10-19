import { Action, ActionDialog } from "./ActionDialog";
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
  isDeleting: boolean;
  onDelete: () => void;
}

export const DeleteDialog = ({
  onClose,
  type,
  isDeleting,
  onDelete,
}: Props) => {
  const { classes } = useStyles();

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
      open={isDeleting}
      onClose={onClose}
      title={`Delete ${titleType}`}
      actions={deleteActions}
    >
      <div className={classes.deleteContainer}>
        <span
          className={classes.deleteQuestion}
        >{`Are you sure you want to delete this ${type}?`}</span>
        <span className={classes.deleteDisclaimer}>
          This action cannot be undone.
        </span>
      </div>
    </ActionDialog>
  );
};
