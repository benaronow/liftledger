import { useCallback, useState } from "react";
import { ActionDialog, DialogAction } from "../components/ActionDialog";
import { useCompleteDay } from "./CompleteDayProvider";
import { useBlock } from "../layoutProviders/BlockProvider";
import { useCompletedExercises } from "../layoutProviders/CompletedExercisesProvider";
import { useUser } from "../layoutProviders/UserProvider";
import { useRouter } from "next/navigation";
import { Block } from "@/lib/types";
import { IoArrowBack } from "react-icons/io5";
import { IoMdCheckmark } from "react-icons/io";
import { Spinner } from "react-bootstrap";

export const FinishDayDialog = () => {
  const router = useRouter();
  const { curUser } = useUser();
  const { curBlock, updateBlock } = useBlock();
  const { getCompletedExercises } = useCompletedExercises();
  const { finishDayDialogOpen, setFinishDayDialogOpen } = useCompleteDay();
  const [finishing, setFinishing] = useState(false);

  const handleFinishDay = useCallback(async () => {
    if (!curBlock) return;

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

    await updateBlock(newBlock);
    getCompletedExercises(curUser?._id || "");
    setFinishing(false);
    router.push("/dashboard");
  }, [curBlock, updateBlock, router, curUser, getCompletedExercises]);

  const actions: DialogAction[] = [
    {
      icon: <IoArrowBack fontSize={28} />,
      onClick: () => setFinishDayDialogOpen(false),
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

  return (
    <>
      {finishDayDialogOpen && (
        <ActionDialog
          open={finishDayDialogOpen}
          onClose={() => setFinishDayDialogOpen(false)}
          title="Finish Day"
          actions={actions}
        >
          <div className="d-flex flex-column">
            <span className="text-white text-wrap mb-4">
              Are you sure you want to finish today&apos;s workout?
            </span>
            <strong className="text-white text-wrap">
              Once you finish, you can no longer edit exercises from this
              workout.
            </strong>
          </div>
        </ActionDialog>
      )}
    </>
  );
};
