import { Exercise } from "@liftledger/shared";
import { ChangeEvent, useState } from "react";
import { AddButton } from "@/components/AddButton";
import { ExerciseInfo } from "./ExerciseInfo";
import { useMe, useProgram } from "@liftledger/api-client";
import { useTemplate } from "../../TemplateProvider";
import { DeleteExerciseDialog } from "./DeleteExerciseDialog";
import { LabeledTextInput } from "@/components/inputs";

export const EditSession = () => {
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { templateProgram, setTemplateProgram, editingRotationIdx, editingSessionIdx } =
    useTemplate();
  const [deletingExerciseIdx, setDeletingExerciseIdx] = useState<
    number | undefined
  >(undefined);

  const handleSessionNameInput = (
    e: ChangeEvent<HTMLInputElement>,
    sessionIdx: number,
  ) => {
    setTemplateProgram({
      ...templateProgram,
      rotations: templateProgram.rotations.map((rotation, idx) =>
        idx === editingRotationIdx
          ? rotation.map((session, idx) =>
              idx === sessionIdx ? { ...session, name: e.target.value } : session,
            )
          : rotation,
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
      rotations: templateProgram.rotations.map((rotation, wIdx) =>
        wIdx === editingRotationIdx
          ? rotation.map((session, dIdx) =>
              dIdx === editingSessionIdx
                ? {
                    ...session,
                    exercises: session.exercises.toSpliced(idx, 0, newExercise),
                  }
                : session,
            )
          : rotation,
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
            value={templateProgram.rotations[editingRotationIdx][editingSessionIdx].name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleSessionNameInput(e, editingSessionIdx)
            }
          />
        </div>
        {templateProgram.rotations[editingRotationIdx][editingSessionIdx].exercises
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
              templateProgram.rotations[editingRotationIdx][editingSessionIdx].exercises
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
