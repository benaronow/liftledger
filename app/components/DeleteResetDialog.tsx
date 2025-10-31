import { Action, ActionDialog } from "./ActionDialog";
import { FaTrash } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";

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
  const deleteActions: Action[] = [
    {
      text: <IoArrowBack />,
      onClick: onClose,
    },
    {
      text: <FaTrash />,
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
      <div className="d-flex flex-column">
        <span className="text-wrap" style={{ marginBottom: "20px" }}>
          {`Are you sure you want to delete this ${type}?`}
        </span>
        <span className="text-wrap" style={{ fontWeight: 900 }}>
          This action cannot be undone.
        </span>
      </div>
    </ActionDialog>
  );
};
