import { Exercise } from "@/lib/types";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useMemo,
  useState,
} from "react";
import { LabeledInput } from "../../components/LabeledInput";
import { useCompletedExercises } from "@/app/providers/CompletedExercisesProvider";

interface Props {
  setIdx: number;
  exerciseState: Exercise;
  setExerciseState: Dispatch<SetStateAction<Exercise>>;
}

export const EditSet = ({ setIdx, exerciseState, setExerciseState }: Props) => {
  const { findLatestOccurrence } = useCompletedExercises();
  const [tempWeight, setTempWeight] = useState(
    setIdx !== undefined ? `${exerciseState.sets[setIdx].weight || ""}` : "",
  );
  type ChangeSetType = "reps" | "weight" | "note";

  const setInfoMap = [
    {
      name: "reps",
      title: "Reps:",
      value: setIdx !== undefined ? exerciseState?.sets[setIdx]?.reps : "",
    },
    {
      name: "weight",
      title: "Weight:",
      value: tempWeight,
    },
    {
      name: "note",
      title: "Note:",
      value: setIdx !== undefined ? exerciseState?.sets[setIdx]?.note : "",
    },
  ];

  const latestPreviousSetNote = useMemo(() => {
    return findLatestOccurrence(
      (e: Exercise) => {
        if (
          e.name === exerciseState.name &&
          e.apparatus === exerciseState.apparatus &&
          e.sets[setIdx]
        )
          return e.sets[setIdx].note !== "" ? e.sets[setIdx].note : "no note";
      },
      { includeCurrentDay: false },
    );
  }, [exerciseState, setIdx, findLatestOccurrence]);

  const handleSetChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: ChangeSetType,
  ) => {
    setExerciseState({
      ...exerciseState,
      sets: exerciseState?.sets.toSpliced(setIdx, 1, {
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

    if (
      type === "weight" &&
      /^$|^-?(?:\d+\.\d*|\d+\.?|\.?\d+)$/.test(e.target.value)
    )
      setTempWeight(e.target.value);
  };

  return (
    <>
      {latestPreviousSetNote && latestPreviousSetNote !== "no note" && (
        <span className="small mb-2 text-wrap text-white">{`Previous note: ${latestPreviousSetNote}`}</span>
      )}
      {setInfoMap.map((setInfo, i) => (
        <LabeledInput
          key={setInfo.name}
          label={setInfo.title}
          textValue={setInfo.value}
          onChangeText={(e: ChangeEvent<HTMLInputElement>) => {
            handleSetChange(e, setInfo.name as ChangeSetType);
          }}
          className={i !== setInfoMap.length - 1 ? "mb-2" : "mb-1"}
        />
      ))}
    </>
  );
};
