import { useCallback, useState } from "react";
import { ActionDialog, DialogAction } from "@/components/ActionDialog";
import {
  useMe,
  useUpdateUserProgram,
  useProgram,
} from "@liftledger/api-client";
import { useNavigate } from "react-router";
import { Program } from "@liftledger/shared";
import { IoArrowBack } from "react-icons/io5";
import { IoMdCheckmark } from "react-icons/io";
import { Spinner } from "react-bootstrap";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const FinishSessionDialog = ({ open, onClose }: Props) => {
  const navigate = useNavigate();
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { trigger: triggerUpdateUserProgram } = useUpdateUserProgram();
  const [finishing, setFinishing] = useState(false);

  const handleFinishSession = useCallback(async () => {
    if (!curUser?._id || !curProgram) return;

    setFinishing(true);
    const newProgram: Program = {
      ...curProgram,
      rotations: curProgram.rotations.toSpliced(
        curProgram.curRotationIdx,
        1,
        curProgram.rotations[curProgram.curRotationIdx].toSpliced(curProgram.curSessionIdx, 1, {
          ...curProgram.rotations[curProgram.curRotationIdx][curProgram.curSessionIdx],
          completedDate: new Date(),
        }),
      ),
    };

    await triggerUpdateUserProgram({ userId: curUser._id, program: newProgram });
    setFinishing(false);
    navigate("/dashboard");
  }, [curUser?._id, curProgram, triggerUpdateUserProgram, navigate]);

  const actions: DialogAction[] = [
    {
      icon: <IoArrowBack fontSize={28} />,
      onClick: onClose,
      variant: "primaryInverted",
      disabled: finishing,
    },
    {
      icon: finishing ? (
        <Spinner animation="border" variant="light" />
      ) : (
        <IoMdCheckmark style={{ fontSize: "26px" }} />
      ),
      onClick: handleFinishSession,
      variant: "primary",
      disabled: finishing,
    },
  ];

  if (!open) return null;

  return (
    <ActionDialog
      open={open}
      onClose={onClose}
      title="Finish Session"
      actions={actions}
    >
      <div className="d-flex flex-column">
        <span className="text-white text-wrap mb-4">
          Are you sure you want to finish today&apos;s workout?
        </span>
        <strong className="text-white text-wrap">
          Once you finish, you can no longer edit exercises from this workout.
        </strong>
      </div>
    </ActionDialog>
  );
};
