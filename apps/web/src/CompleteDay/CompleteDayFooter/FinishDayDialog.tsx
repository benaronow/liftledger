import { useCallback, useState } from "react";
import { ActionDialog, DialogAction } from "@/components/ActionDialog";
import {
  useMe,
  useUpdateUserBlock,
  useBlock,
} from "@liftledger/api-client";
import { useNavigate } from "react-router";
import { Block } from "@liftledger/shared";
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
  const { data: curBlock } = useBlock(curUser?._id, curUser?.curBlock);
  const { trigger: triggerUpdateUserBlock } = useUpdateUserBlock();
  const [finishing, setFinishing] = useState(false);

  const handleFinishDay = useCallback(async () => {
    if (!curUser?._id || !curBlock) return;

    setFinishing(true);
    const newBlock: Block = {
      ...curBlock,
      weeks: curBlock.weeks.toSpliced(
        curBlock.curWeekIdx,
        1,
        curBlock.weeks[curBlock.curWeekIdx].toSpliced(curBlock.curDayIdx, 1, {
          ...curBlock.weeks[curBlock.curWeekIdx][curBlock.curDayIdx],
          completedDate: new Date(),
        }),
      ),
    };

    await triggerUpdateUserBlock({ userId: curUser._id, block: newBlock });
    setFinishing(false);
    navigate("/dashboard");
  }, [curUser?._id, curBlock, triggerUpdateUserBlock, navigate]);

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
