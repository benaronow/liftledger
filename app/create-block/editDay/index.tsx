import { Exercise } from "@/lib/types";
import { ChangeEvent, useState } from "react";
import { AddButton } from "../../components/AddButton";
import { ExerciseInfo } from "./ExerciseInfo";
import { useBlock } from "@/app/providers/BlockProvider";
import { LabeledInput } from "@/app/components/LabeledInput";
import { DialogAction, ActionDialog } from "@/app/components/ActionDialog";
import { IoArrowBack } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";

interface EditDayProps {
  editingDayIdx: number;
}

export const EditDay = ({ editingDayIdx }: EditDayProps) => {
  const { curBlock, templateBlock, setTemplateBlock, editingWeekIdx } =
    useBlock();
  const [deletingIdx, setDeletingIdx] = useState<number | undefined>(undefined);

  const handleDayNameInput = (
    e: ChangeEvent<HTMLInputElement>,
    dayIdx: number,
  ) => {
    setTemplateBlock({
      ...templateBlock,
      weeks: templateBlock.weeks.map((week, idx) =>
        idx === editingWeekIdx
          ? week.map((day, idx) =>
              idx === dayIdx ? { ...day, name: e.target.value } : day,
            )
          : week,
      ),
    });
  };

  const handleAddExercise = (idx: number) => {
    const newExercise: Exercise = {
      name: "",
      apparatus: "",
      gym: templateBlock.primaryGym || "",
      sets: [
        {
          reps: 0,
          weight: 0,
          completed: false,
          note: "",
        },
      ],
      weightType: curBlock ? "lbs" : "",
    };

    setTemplateBlock({
      ...templateBlock,
      weeks: templateBlock.weeks.map((week, wIdx) =>
        wIdx === editingWeekIdx
          ? week.map((day, dIdx) =>
              dIdx === editingDayIdx
                ? {
                    ...day,
                    exercises: day.exercises.toSpliced(idx, 0, newExercise),
                  }
                : day,
            )
          : week,
      ),
    });
  };

  const handleRemoveExercise = () => {
    if (templateBlock.weeks[editingWeekIdx][editingDayIdx].exercises.length > 1)
      setTemplateBlock({
        ...templateBlock,
        weeks: templateBlock.weeks.map((week, wIdx) =>
          wIdx === editingWeekIdx
            ? week.map((day, dIdx) =>
                dIdx === editingDayIdx && deletingIdx !== undefined
                  ? {
                      ...day,
                      exercises: day.exercises.toSpliced(deletingIdx, 1),
                    }
                  : day,
              )
            : week,
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
            textValue={templateBlock.weeks[editingWeekIdx][editingDayIdx].name}
            onChangeText={(e: ChangeEvent<HTMLInputElement>) =>
              handleDayNameInput(e, editingDayIdx)
            }
          />
        </div>
        {templateBlock.weeks[editingWeekIdx][editingDayIdx].exercises.map(
          (exercise, idx) => (
            <div
              key={idx}
              className={
                exercise.addedOn
                  ? "d-none"
                  : "d-flex flex-column w-100 align-items-center gap-2"
              }
            >
              <AddButton onClick={() => handleAddExercise(idx)} />
              <ExerciseInfo
                exercise={exercise}
                eIdx={idx}
                editingDayIdx={editingDayIdx}
                setDeletingIdx={setDeletingIdx}
              />
            </div>
          ),
        )}
        <AddButton
          onClick={() =>
            handleAddExercise(
              templateBlock.weeks[editingWeekIdx][editingDayIdx].exercises
                .length,
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
