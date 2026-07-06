import { useState } from "react";
import { ConfirmationDialog } from "../../../components/ConfirmationDialog";

interface Props {
  singular: string;
  pending: string | undefined;
  onDelete: (value: string) => Promise<void>;
  onClose: () => void;
}

export const DeleteOptionDialog = ({
  singular,
  pending,
  onDelete,
  onClose,
}: Props) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (pending === undefined) return;
    setDeleting(true);
    try {
      await onDelete(pending);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ConfirmationDialog
      open={pending !== undefined}
      onClose={onClose}
      title={`Delete ${singular}?`}
      destructive
      action="Delete"
      onConfirm={handleDelete}
      confirming={deleting}
      description={
        pending
          ? `"${pending}" will be removed from your list. Saved workouts that already use it are kept.`
          : undefined
      }
    />
  );
};
