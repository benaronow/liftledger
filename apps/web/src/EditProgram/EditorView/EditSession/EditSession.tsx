import { Exercise } from "@liftledger/shared";
import { ChangeEvent, useState } from "react";
import { AddButton } from "@/components/AddButton";
import { ExerciseInfo } from "./ExerciseInfo";
import { useMe, useProgram } from "@liftledger/api-client";
import { useTemplate } from "../../TemplateProvider";
import { DeleteExerciseDialog } from "./DeleteExerciseDialog";
import { LabeledTextInput } from "@/components/inputs";

export const EditDay = () => {
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { templateProgram, setTemplateProgram, editingWeekIdx, editingDayIdx } =
    useTemplate();
  const [deletingExerciseIdx, setDeletingExerciseIdx] = useState<
    number | undefined
  >(undefined);

  const handleDayNameInput = (
    e: ChangeEvent<HTMLInputElement>,
    dayIdx: number,
  ) => {
    setTemplateProgram({
      ...templateProgram,
      weeks: templateProgram.weeks.map((week, idx) =>
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
      gym: templateProgram.primaryGym || "",
      sets: [
        {
          reps: null,
          weight: null,
          completed: false,
          note: "",
        },
      ],
      weightType: curProgram ? "lbs" : "",
    };

    setTemplateProgram({
      ...templateProgram,
      weeks: templateProgram.weeks.map((week, wIdx) =>
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
          <LabeledTextInput
            label="Name:"
            value={templateProgram.weeks[editingWeekIdx][editingDayIdx].name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleDayNameInput(e, editingDayIdx)
            }
          />
        </div>
        {templateProgram.weeks[editingWeekIdx][editingDayIdx].exercises
          .filter((e) => !e.addedOn)
          .map((exercise, idx) => (
            <div
              key={idx}
              className={"d-flex flex-column w-100 align-items-center gap-2"}
            >
              <AddButton onClick={() => handleAddExercise(idx)} />
              <ExerciseInfo
                exercise={exercise}
                eIdx={idx}
                onRequestDelete={setDeletingExerciseIdx}
              />
            </div>
          ))}
        <AddButton
          onClick={() =>
            handleAddExercise(
              templateProgram.weeks[editingWeekIdx][editingDayIdx].exercises
                .length,
            )
          }
        />
      </div>
      <DeleteExerciseDialog
        deletingExerciseIdx={deletingExerciseIdx}
        onClose={() => setDeletingExerciseIdx(undefined)}
      />
    </>
  );
};
