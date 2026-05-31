import { useState } from "react";
import { ActionDialog, DialogAction } from "@/components/ActionDialog";
import { useMe, useQuitBlock } from "@liftledger/api-client";
import { useNavigate } from "react-router";
import { IoArrowBack } from "react-icons/io5";
import { Spinner } from "react-bootstrap";
import { useEditBlock } from "./EditBlockProvider";
import { FaStopCircle } from "react-icons/fa";

export const QuitBlockDialog = () => {
  const navigate = useNavigate();
  const { data: curUser } = useMe();
  const { trigger: triggerQuitBlock, isMutating: quitting } = useQuitBlock();
  const { unsetTemplateBlock, setEditingWeekIdx, quitDialogOpen, setQuitDialogOpen } =
    useEditBlock();
  const [error, setError] = useState("");

  const handleQuit = async () => {
    if (!curUser?._id) return;
    setError("");
    try {
      await triggerQuitBlock(curUser._id);
      unsetTemplateBlock();
      setEditingWeekIdx(0);
      navigate("/dashboard");
    } catch (e: unknown) {
      setError((e as Error).message || "Failed to quit block");
    }
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
          {error && (
            <div className="text-danger mt-2" style={{ fontSize: "13px" }}>
              {error}
            </div>
          )}
        </ActionDialog>
      )}
    </>
  );
};
