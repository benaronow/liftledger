import { ActionDialog, DialogAction } from "@/components/ActionDialog";
import { useTemplate } from "../../TemplateProvider";
import { IoArrowBack } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";

interface Props {
  deletingExerciseIdx: number | undefined;
  onClose: () => void;
}

export const DeleteExerciseDialog = ({
  deletingExerciseIdx,
  onClose,
}: Props) => {
  const { templateProgram, setTemplateProgram, editingWeekIdx, editingDayIdx } =
    useTemplate();

  const handleRemoveExercise = () => {
    if (templateProgram.weeks[editingWeekIdx][editingDayIdx].exercises.length > 1)
      setTemplateProgram({
        ...templateProgram,
        weeks: templateProgram.weeks.map((week, wIdx) =>
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
    onClose();
  };

  const deleteActions: DialogAction[] = [
    {
      icon: <IoArrowBack fontSize={28} />,
      onClick: onClose,
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
          onClose={onClose}
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
