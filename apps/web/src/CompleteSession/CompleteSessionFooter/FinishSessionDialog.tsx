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

export const FinishDayDialog = ({ open, onClose }: Props) => {
  const navigate = useNavigate();
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { trigger: triggerUpdateUserProgram } = useUpdateUserProgram();
  const [finishing, setFinishing] = useState(false);

  const handleFinishDay = useCallback(async () => {
    if (!curUser?._id || !curProgram) return;

    setFinishing(true);
    const newProgram: Program = {
      ...curProgram,
      weeks: curProgram.weeks.toSpliced(
        curProgram.curWeekIdx,
        1,
        curProgram.weeks[curProgram.curWeekIdx].toSpliced(curProgram.curDayIdx, 1, {
          ...curProgram.weeks[curProgram.curWeekIdx][curProgram.curDayIdx],
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
      onClick: handleFinishDay,
      variant: "primary",
      disabled: finishing,
    },
  ];

  if (!open) return null;

  return (
    <ActionDialog
      open={open}
      onClose={onClose}
      title="Finish Day"
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
