import { useState } from "react";
import { ActionDialog, DialogAction } from "@/app/components/ActionDialog";
import { useBlock } from "@/app/layoutProviders/BlockProvider";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import { FaSave } from "react-icons/fa";
import { Spinner } from "react-bootstrap";
import { useEditBlock } from "./EditBlockProvider";

export const SaveBlockDialog = () => {
  const router = useRouter();
  const {
    curBlock,
    templateBlock,
    unsetTemplateBlock,
    createBlock,
    updateBlock,
    setEditingWeekIdx,
  } = useBlock();
  const { saveDialogOpen, setSaveDialogOpen } = useEditBlock();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    if (curBlock) {
      await updateBlock(templateBlock);
    } else {
      await createBlock(templateBlock);
    }

    unsetTemplateBlock();
    setEditingWeekIdx(0);
    setSaving(false);
    router.push("/dashboard");
  };

  const actions: DialogAction[] = [
    {
      icon: <IoArrowBack fontSize={28} />,
      onClick: () => setSaveDialogOpen(false),
      variant: "primaryInverted",
      disabled: saving,
    },
    {
      icon: saving ? (
        <Spinner animation="border" variant="light" />
      ) : (
        <FaSave style={{ fontSize: "22px" }} />
      ),
      onClick: handleSave,
      variant: "primary",
      disabled: saving,
    },
  ];

  return (
    <>
      {saveDialogOpen && (
        <ActionDialog
          open={saveDialogOpen}
          onClose={() => setSaveDialogOpen(false)}
          title="Save Block"
          actions={actions}
        >
          <div className="d-flex flex-column">
            <span className="text-white text-wrap mb-4">
              Are you sure you want to save this block?
            </span>
            <strong className="text-white text-wrap">
              {curBlock
                ? "This will overwrite your current block."
                : "This will become your active training block."}
            </strong>
          </div>
        </ActionDialog>
      )}
    </>
  );
};
