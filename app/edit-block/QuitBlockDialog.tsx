import { useState } from "react";
import { ActionDialog, DialogAction } from "@/app/components/ActionDialog";
import { useBlock } from "@/app/layoutProviders/BlockProvider";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import { Spinner } from "react-bootstrap";
import { useEditBlock } from "./EditBlockProvider";
import { FaStopCircle } from "react-icons/fa";

export const QuitBlockDialog = () => {
  const router = useRouter();
  const { unsetTemplateBlock, setEditingWeekIdx, quitBlock } = useBlock();
  const { quitDialogOpen, setQuitDialogOpen } = useEditBlock();
  const [quitting, setQuitting] = useState(false);

  const handleQuit = async () => {
    setQuitting(true);
    await quitBlock();
    unsetTemplateBlock();
    setEditingWeekIdx(0);
    setQuitting(false);
    router.push("/dashboard");
  };

  const actions: DialogAction[] = [
    {
      icon: <IoArrowBack fontSize={28} />,
      onClick: () => setQuitDialogOpen(false),
      variant: "dangerInverted",
      disabled: quitting,
    },
    {
      icon: quitting ? (
        <Spinner animation="border" variant="light" />
      ) : (
        <FaStopCircle style={{ fontSize: "30px" }} />
      ),
      onClick: handleQuit,
      variant: "danger",
      disabled: quitting,
    },
  ];

  return (
    <>
      {quitDialogOpen && (
        <ActionDialog
          open={quitDialogOpen}
          onClose={() => setQuitDialogOpen(false)}
          title="Quit Block"
          actions={actions}
        >
          <div className="d-flex flex-column">
            <span className="text-white text-wrap mb-4">
              Are you sure you want to quit this block?
            </span>
            <strong className="text-white text-wrap">
              The block will be saved to your history with the weeks completed
              so far.
            </strong>
          </div>
        </ActionDialog>
      )}
    </>
  );
};
