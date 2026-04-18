import { ActionDialog, DialogAction } from "../components/ActionDialog";
import { Dispatch, SetStateAction } from "react";
import { Block, Day, Exercise } from "@/lib/types";
import { useBlock } from "@/app/providers/BlockProvider";
import { IoArrowBack } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";

interface Props {
  deletingIdx: number | undefined;
  setDeletingIdx: Dispatch<SetStateAction<number | undefined>>;
  exercisesState: Exercise[];
  setExercisesState: Dispatch<SetStateAction<Exercise[]>>;
}

export const DeleteExerciseDialog = ({
  deletingIdx,
  setDeletingIdx,
  exercisesState,
  setExercisesState,
}: Props) => {
  const { curBlock, updateBlock } = useBlock();

  const saveExercises = (exercises: Exercise[]) => {
    if (curBlock) {
      const newDays: Day[] = curBlock.weeks[curBlock.curWeekIdx].toSpliced(
        curBlock.curDayIdx,
        1,
        { ...curBlock.weeks[curBlock.curWeekIdx][curBlock.curDayIdx], exercises },
      );
      const newBlock: Block = {
        ...curBlock,
        weeks: curBlock.weeks.toSpliced(curBlock.curWeekIdx, 1, newDays),
      };
      updateBlock(newBlock);
    }
  };

  const handleRemoveAddon = () => {
    if (deletingIdx === undefined) return;
    const updated = exercisesState.filter((_, i) => i !== deletingIdx);
    setExercisesState(updated);
    saveExercises(updated);
    setDeletingIdx(undefined);
  };

  const deleteActions: DialogAction[] = [
    {
      icon: <IoArrowBack fontSize={28} />,
      onClick: () => setDeletingIdx(undefined),
      variant: "dangerInverted",
    },
    {
      icon: <FaTrash fontSize={26} />,
      onClick: handleRemoveAddon,
      variant: "danger",
    },
  ];

  return (
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
  );
};
