import { Day, Exercise } from "@/lib/types";
import { ChangeEvent, useState } from "react";
import { AddButton } from "../../components/AddButton";
import { ExerciseInfo } from "./ExerciseInfo";
import { useBlock } from "@/app/providers/BlockProvider";
import { LabeledInput } from "@/app/components/LabeledInput";
import { DialogAction, ActionDialog } from "@/app/components/ActionDialog";
import { IoArrowBack } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";

interface EditDayProps {
  editingDay: number;
}

export const EditDay = ({ editingDay }: EditDayProps) => {
  const { templateBlock, setTemplateBlock, editingWeekIdx } = useBlock();
  const [deletingIdx, setDeletingIdx] = useState<number | undefined>(undefined);

  const shouldEditDay = (day: Day) => {
    return day.name === templateBlock.weeks[editingWeekIdx][editingDay].name;
  };

  const handleDayNameInput = (
    e: ChangeEvent<HTMLInputElement>,
    dayIdx: number
  ) => {
    setTemplateBlock({
      ...templateBlock,
      weeks: templateBlock.weeks.map((week, idx) =>
        idx === editingWeekIdx
          ? week.map((day, idx) =>
              idx === dayIdx ? { ...day, name: e.target.value } : day
            )
          : week
      ),
    });
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

  const deleteActions: DialogAction[] = [
    {
      icon: <IoArrowBack fontSize={28} />,
      onClick: () => setDeletingIdx(undefined),
      variant: "dangerInverted",
    },
    {
      icon: <FaTrash fontSize={26} />,
      onClick: () => {
        handleRemoveExercise();
        setDeletingIdx(undefined);
      },
      variant: "danger",
    },
  ];

  return (
    <>
      <div
        className="d-flex flex-column align-items-center w-100"
        style={{ fontFamily: "League+Spartan", fontSize: "16px" }}
      >
        <div className="w-100" style={{ marginBottom: "20px" }}>
          <LabeledInput
            label="Name:"
            textValue={templateBlock.weeks[editingWeekIdx][editingDay].name}
            onChangeText={(e: ChangeEvent<HTMLInputElement>) =>
              handleDayNameInput(e, editingDay)
            }
          />
        </div>
        {templateBlock.weeks[editingWeekIdx][editingDay].exercises.map(
          (exercise, idx) => (
            <div key={idx} className={exercise.addedOn ? "d-none" : ""}>
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
            </div>
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
      <ActionDialog
        open={deletingIdx !== undefined}
        onClose={() => setDeletingIdx(undefined)}
        title={"Delete Exercise"}
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
    </>
  );
};
