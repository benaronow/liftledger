import { ActionDialog, DialogAction } from "@/app/components/ActionDialog";
import { useBlock } from "@/app/layoutProviders/BlockProvider";
import { useEditBlock } from "../EditBlockProvider";
import { IoArrowBack } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";

export const DeleteExerciseDialog = () => {
  const { templateBlock, setTemplateBlock, editingWeekIdx } = useBlock();
  const { editingDayIdx, deletingExerciseIdx, setDeletingExerciseIdx } =
    useEditBlock();

  const handleRemoveExercise = () => {
    if (templateBlock.weeks[editingWeekIdx][editingDayIdx].exercises.length > 1)
      setTemplateBlock({
        ...templateBlock,
        weeks: templateBlock.weeks.map((week, wIdx) =>
          wIdx === editingWeekIdx
            ? week.map((day, dIdx) =>
                dIdx === editingDayIdx && deletingExerciseIdx !== undefined
                  ? {
                      ...day,
                      exercises: day.exercises.toSpliced(
                        deletingExerciseIdx,
                        1,
                      ),
                    }
                  : day,
              )
            : week,
        ),
      });
    setDeletingExerciseIdx(undefined);
  };

  const deleteActions: DialogAction[] = [
    {
      icon: <IoArrowBack fontSize={28} />,
      onClick: () => setDeletingExerciseIdx(undefined),
      variant: "dangerInverted",
    },
    {
      icon: <FaTrash fontSize={26} />,
      onClick: handleRemoveExercise,
      variant: "danger",
    },
  ];

  return (
    <>
      {deletingExerciseIdx !== undefined && (
        <ActionDialog
          open={deletingExerciseIdx !== undefined}
          onClose={() => setDeletingExerciseIdx(undefined)}
          title="Delete Exercise"
          actions={deleteActions}
        >
          <div className="d-flex flex-column">
            <span className="text-white text-wrap mb-4">
              Are you sure you want to delete this exercise?
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
