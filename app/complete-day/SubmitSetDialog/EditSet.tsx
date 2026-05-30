import { Exercise } from "@/lib/types";
import { ChangeEvent, Dispatch, SetStateAction, useMemo } from "react";
import { useCompletedExercises } from "@/app/layoutContainer/CompletedExercisesProvider";
import { useCompleteDay } from "../CompleteDayProvider";
import { LabeledTextInput } from "@/app/components/inputs";

interface Props {
  exerciseState?: Exercise;
  setExerciseState: Dispatch<SetStateAction<Exercise | undefined>>;
}

export const EditSet = ({ exerciseState, setExerciseState }: Props) => {
  const { exerciseToEdit: { setIdx } = { setIdx: 0 } } = useCompleteDay();
  const { findLatestOccurrence } = useCompletedExercises();

  const latestPreviousSetNote = useMemo(() => {
    return findLatestOccurrence(
      (e: Exercise) =>
        e.name === exerciseState?.name &&
        e.apparatus === exerciseState?.apparatus &&
        !!e.sets[setIdx],
    )?.sets[setIdx].note;
  }, [exerciseState, setIdx, findLatestOccurrence]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: "reps" | "weight" | "note",
  ) => {
    if (!exerciseState) return;

    setExerciseState({
      ...exerciseState,
      sets: exerciseState.sets.toSpliced(setIdx, 1, {
        ...exerciseState.sets[setIdx],
        reps:
          type === "reps"
            ? parseInt(e.target.value) || 0
            : exerciseState.sets[setIdx].reps,
        weight:
          type === "weight"
            ? parseFloat(e.target.value) || 0
            : exerciseState.sets[setIdx].weight,
        note:
          type === "note" ? e.target.value : exerciseState.sets[setIdx].note,
      }),
    });
  };

  return (
    <>
      {!!latestPreviousSetNote && (
        <span className="small mb-2 text-wrap text-white">{`Previous note: ${latestPreviousSetNote}`}</span>
      )}
      <LabeledTextInput
        label="Reps:"
        value={exerciseState?.sets[setIdx]?.reps || ""}
        onChange={(e) => handleChange(e, "reps")}
        className="mb-2"
      />
      <LabeledTextInput
        label="Weight:"
        value={exerciseState?.sets[setIdx]?.weight || ""}
        type="number"
        step="any"
        min="0"
        onChange={(e) => handleChange(e, "weight")}
        className="mb-2"
      />
      <LabeledTextInput
        label="Note:"
        value={exerciseState?.sets[setIdx]?.note}
        onChange={(e) => handleChange(e, "note")}
        className="mb-1"
      />
    </>
  );
};
