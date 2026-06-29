import { Exercise } from "@liftledger/shared";
import { ChangeEvent, Dispatch, SetStateAction, useMemo } from "react";
import {
  findLatestOccurrence,
  useCompletedExercises,
  useMe,
} from "@liftledger/api-client";
import { LabeledTextInput } from "@/components/inputs";

interface Props {
  exerciseState?: Exercise;
  setExerciseState: Dispatch<SetStateAction<Exercise | undefined>>;
  setIdx: number;
}

// Empty input → null; an unparseable string → null. Reps are whole numbers,
// weight allows decimals.
const commitNumber = (text: string, kind: "reps" | "weight"): number | null => {
  if (text.trim() === "") return null;
  const n = kind === "weight" ? parseFloat(text) : parseInt(text, 10);
  return Number.isNaN(n) ? null : n;
};

export const EditSet = ({ exerciseState, setExerciseState, setIdx }: Props) => {
  const { data: curUser } = useMe();
  const { data: completedExercises } = useCompletedExercises(curUser?._id);

  const latestPreviousSetNote = useMemo(() => {
    return findLatestOccurrence(
      completedExercises,
      (e: Exercise) =>
        e.name === exerciseState?.name &&
        e.apparatus === exerciseState?.apparatus &&
        !!e.sets[setIdx],
    )?.sets[setIdx].note;
  }, [exerciseState, setIdx, completedExercises]);

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
            ? commitNumber(e.target.value, "reps")
            : exerciseState.sets[setIdx].reps,
        weight:
          type === "weight"
            ? commitNumber(e.target.value, "weight")
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
