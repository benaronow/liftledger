import { useState } from "react";
import { DeleteAccountDialog } from "./DeleteAccountDialog";
import { ActionButton } from "@/app/components/ActionButton";
import { FaTrash } from "react-icons/fa";

export const DangerZone = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <div className="d-flex flex-column w-100 rounded bg-danger gap-3 py-3 px-4">
        <h2 className="text-white text-center">Danger Zone</h2>
        <ActionButton
          label="Delete Account"
          icon={<FaTrash />}
          variant="dangerInverted"
          onClick={() => setDeleteDialogOpen(true)}
        />
      </div>
      <DeleteAccountDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </>
  );
};
