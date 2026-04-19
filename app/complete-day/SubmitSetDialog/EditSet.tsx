import { Exercise } from "@/lib/types";
import { ChangeEvent, Dispatch, SetStateAction, useMemo } from "react";
import { LabeledInput } from "../../components/LabeledInput";
import { useCompletedExercises } from "@/app/providers/CompletedExercisesProvider";
import { useCompleteDay } from "../CompleteDayProvider";

interface Props {
  exerciseState?: Exercise;
  setExerciseState: Dispatch<SetStateAction<Exercise | undefined>>;
}

export const EditSet = ({ exerciseState, setExerciseState }: Props) => {
  const { exerciseToEdit: { setIdx } = { setIdx: 0 } } = useCompleteDay();
  const { findLatestOccurrence } = useCompletedExercises();

  const latestPreviousSetNote = useMemo(() => {
    return findLatestOccurrence(
      (e: Exercise) => {
        if (
          e.name === exerciseState?.name &&
          e.apparatus === exerciseState?.apparatus &&
          e.sets[setIdx]
        )
          return e.sets[setIdx].note !== "" ? e.sets[setIdx].note : "no note";
      },
      { includeCurrentDay: false },
    );
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
      {latestPreviousSetNote && latestPreviousSetNote !== "no note" && (
        <span className="small mb-2 text-wrap text-white">{`Previous note: ${latestPreviousSetNote}`}</span>
      )}
      <LabeledInput
        label="Reps:"
        textValue={exerciseState?.sets[setIdx]?.reps || ""}
        onChangeText={(e) => handleChange(e, "reps")}
        className="mb-2"
      />
      <LabeledInput
        label="Weight:"
        textValue={exerciseState?.sets[setIdx]?.weight || ""}
        type="number"
        step="any"
        min="0"
        onChangeText={(e) => handleChange(e, "weight")}
        className="mb-2"
      />
      <LabeledInput
        label="Note:"
        textValue={exerciseState?.sets[setIdx]?.note}
        onChangeText={(e) => handleChange(e, "note")}
        className="mb-1"
      />
    </>
  );
};
