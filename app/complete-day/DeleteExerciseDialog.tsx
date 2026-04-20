import { ActionDialog, DialogAction } from "@/app/components/ActionDialog";
import { Block, Day, Exercise } from "@/lib/types";
import { useBlock } from "@/app/layoutProviders/BlockProvider";
import { IoArrowBack } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";
import { useCompleteDay } from "./CompleteDayProvider";
import { useState } from "react";
import { Spinner } from "react-bootstrap";

export const DeleteExerciseDialog = () => {
  const { curBlock, updateBlock } = useBlock();
  const { deletingIdx, setDeletingIdx, exercises } = useCompleteDay();
  const [deletingExercise, setDeletingExercise] = useState(false);

  const saveExercises = async (exercises: Exercise[]) => {
    if (curBlock) {
      const newDays: Day[] = curBlock.weeks[curBlock.curWeekIdx].toSpliced(
        curBlock.curDayIdx,
        1,
        {
          ...curBlock.weeks[curBlock.curWeekIdx][curBlock.curDayIdx],
          exercises,
        },
      );
      const newBlock: Block = {
        ...curBlock,
        weeks: curBlock.weeks.toSpliced(curBlock.curWeekIdx, 1, newDays),
      };
      await updateBlock(newBlock);
    }
  };

  const handleDeleteExercise = async () => {
    if (deletingIdx === undefined) return;

    setDeletingExercise(true);
    const updated = exercises.filter(
      (_: Exercise, i: number) => i !== deletingIdx,
    );
    await saveExercises(updated);
    setDeletingIdx(undefined);
    setDeletingExercise(false);
  };

  const deleteActions: DialogAction[] = [
    {
      icon: <IoArrowBack fontSize={28} />,
      onClick: () => setDeletingIdx(undefined),
      variant: "dangerInverted",
      disabled: deletingExercise,
    },
    {
      icon: deletingExercise ? (
        <Spinner animation="border" variant="light" />
      ) : (
        <FaTrash fontSize={26} />
      ),
      onClick: handleDeleteExercise,
      variant: "danger",
      disabled: deletingExercise,
    },
  ];

  return (
    <>
      {deletingIdx !== undefined && (
        <ActionDialog
          open={deletingIdx !== undefined}
          onClose={() => setDeletingIdx(undefined)}
          title="Remove Exercise"
          actions={deleteActions}
        >
          <div className="d-flex flex-column">
            <span className="text-white text-wrap mb-4">
              Are you sure you want to remove this add-on exercise?
            </span>
            <strong className="text-white text-wrap">
              This action cannot be undone.
            </strong>
          </div>
        </ActionDialog>
      )}
    </>
  );
};
