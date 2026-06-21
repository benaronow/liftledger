import { useState } from "react";
import { ActionDialog, DialogAction } from "@/components/ActionDialog";
import { useMe, useQuitProgram } from "@liftledger/api-client";
import { useNavigate } from "react-router";
import { IoArrowBack } from "react-icons/io5";
import { Spinner } from "react-bootstrap";
import { useTemplate } from "../TemplateProvider";
import { FaStopCircle } from "react-icons/fa";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const QuitProgramDialog = ({ open, onClose }: Props) => {
  const navigate = useNavigate();
  const { data: curUser } = useMe();
  const { trigger: triggerQuitProgram, isMutating: quitting } = useQuitProgram();
  const { unsetTemplateProgram, setEditingWeekIdx } = useTemplate();
  const [error, setError] = useState("");

  const handleQuit = async () => {
    if (!curUser?._id) return;
    setError("");
    try {
      await triggerQuitProgram(curUser._id);
      unsetTemplateProgram();
      setEditingWeekIdx(0);
      navigate("/dashboard");
    } catch (e: unknown) {
      setError((e as Error).message || "Failed to quit program");
    }
  };

  const actions: DialogAction[] = [
    {
      icon: <IoArrowBack fontSize={28} />,
      onClick: onClose,
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

  if (!open) return null;

  return (
    <ActionDialog
      open={open}
      onClose={onClose}
      title="Quit Program"
      actions={actions}
    >
      <div className="d-flex flex-column">
        <span className="text-white text-wrap mb-4">
          Are you sure you want to quit this program?
        </span>
        <strong className="text-white text-wrap">
          The program will be saved to your history with the weeks completed so
          far.
        </strong>
      </div>
      {error && (
        <div className="text-danger mt-2" style={{ fontSize: "13px" }}>
          {error}
        </div>
      )}
    </ActionDialog>
  );
};
