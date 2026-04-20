import { Exercise } from "@/lib/types";
import { ChangeEvent } from "react";
import { AddButton } from "@/app/components/AddButton";
import { ExerciseInfo } from "./ExerciseInfo";
import { useBlock } from "@/app/layoutProviders/BlockProvider";
import { LabeledInput } from "@/app/components/LabeledInput";
import { useEditBlock } from "../EditBlockProvider";
import { DeleteExerciseDialog } from "./DeleteExerciseDialog";

export const EditDay = () => {
  const { curBlock, templateBlock, setTemplateBlock, editingWeekIdx } =
    useBlock();
  const { editingDayIdx } = useEditBlock();

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
        {templateBlock.weeks[editingWeekIdx][editingDayIdx].exercises
          .filter((e) => !e.addedOn)
          .map((exercise, idx) => (
            <div
              key={idx}
              className={"d-flex flex-column w-100 align-items-center gap-2"}
            >
              <AddButton onClick={() => handleAddExercise(idx)} />
              <ExerciseInfo exercise={exercise} eIdx={idx} />
            </div>
          ))}
        <AddButton
          onClick={() =>
            handleAddExercise(
              templateBlock.weeks[editingWeekIdx][editingDayIdx].exercises
                .length,
            )
          }
        />
      </div>
      <DeleteExerciseDialog />
    </>
  );
};
