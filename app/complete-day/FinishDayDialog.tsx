import { useCallback, useState } from "react";
import { ActionDialog, DialogAction } from "@/app/components/ActionDialog";
import { useCompleteDay } from "./CompleteDayProvider";
import { useBlock } from "@/app/layoutContainer/BlockProvider";
import { useRouter } from "next/navigation";
import { Block } from "@/lib/types";
import { IoArrowBack } from "react-icons/io5";
import { IoMdCheckmark } from "react-icons/io";
import { Spinner } from "react-bootstrap";

export const FinishDayDialog = () => {
  const router = useRouter();
  const { curBlock, updateBlock } = useBlock();
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

    // updateBlock invalidates the completedExercises cache via the api-client
    // mutation, so the SWR-backed provider refetches automatically.
    await updateBlock(newBlock);
    setFinishing(false);
    router.push("/dashboard");
  }, [curBlock, updateBlock, router]);

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
