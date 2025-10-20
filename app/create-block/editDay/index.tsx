import { Day, Exercise } from "@/lib/types";
import React, { useState } from "react";
import { AddButton } from "../../components/AddButton";
import { ExerciseInfo } from "./ExerciseInfo";
import { DeleteDialog } from "../../components/DeleteResetDialog";
import { useBlock } from "@/app/providers/BlockProvider";

interface EditDayProps {
  editingDay: number;
}

export const EditDay = ({ editingDay }: EditDayProps) => {
  const { templateBlock, setTemplateBlock, editingWeekIdx } = useBlock();
  const [deletingIdx, setDeletingIdx] = useState<number | undefined>(undefined);

  const shouldEditDay = (day: Day) => {
    return day.name === templateBlock.weeks[editingWeekIdx][editingDay].name;
  };

  const handleAddExercise = (idx: number) => {
    const newExercise: Exercise = {
      name: "",
      apparatus: "",
      sets: [
        {
          reps: 0,
          weight: 0,
          completed: false,
          note: "",
        },
      ],
      weightType: "",
    };

    setTemplateBlock({
      ...templateBlock,
      weeks: templateBlock.weeks.map((week, wIdx) =>
        wIdx === editingWeekIdx
          ? week.map((day) =>
              shouldEditDay(day)
                ? {
                    ...day,
                    exercises: day.exercises.toSpliced(idx, 0, newExercise),
                  }
                : day
            )
          : week
      ),
    });
  };

  const handleRemoveExercise = () => {
    if (templateBlock.weeks[editingWeekIdx][editingDay].exercises.length > 1)
      setTemplateBlock({
        ...templateBlock,
        weeks: templateBlock.weeks.map((week, idx) =>
          idx === editingWeekIdx
            ? week.map((day) =>
                shouldEditDay(day) && deletingIdx !== undefined
                  ? {
                      ...day,
                      exercises: day.exercises.toSpliced(deletingIdx, 1),
                    }
                  : day
              )
            : week
        ),
      });
  };

  return (
    <>
      <div
        className="d-flex flex-column align-items-center w-100"
        style={{ fontFamily: "League+Spartan", fontSize: "16px" }}
      >
        {templateBlock.weeks[editingWeekIdx][editingDay].exercises.map(
          (exercise, idx) => (
            <React.Fragment key={idx}>
              <AddButton onClick={() => handleAddExercise(idx)} />
              <ExerciseInfo
                exercise={exercise}
                takenExercises={templateBlock.weeks[editingWeekIdx][
                  editingDay
                ].exercises.filter(
                  (e) =>
                    !(
                      e.name === exercise.name &&
                      e.apparatus === exercise.apparatus
                    )
                )}
                eIdx={idx}
                editingDay={editingDay}
                setDeletingIdx={setDeletingIdx}
              />
            </React.Fragment>
          )
        )}
        <AddButton
          onClick={() =>
            handleAddExercise(
              templateBlock.weeks[editingWeekIdx][editingDay].exercises.length
            )
          }
        />
      </div>
      <DeleteDialog
        onClose={() => {
          setDeletingIdx(undefined);
        }}
        type="exercise"
        isDeleting={deletingIdx !== undefined}
        onDelete={() => {
          handleRemoveExercise();
          setDeletingIdx(undefined);
        }}
      />
    </>
  );
};
