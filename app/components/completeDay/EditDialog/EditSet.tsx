import { getLastExerciseOccurrence } from "@/app/utils";
import { Exercise } from "@/app/types";
import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { makeStyles } from "tss-react/mui";
import { LabeledInput } from "../../LabeledInput";
import { useBlock } from "@/app/providers/BlockProvider";

const useStyles = makeStyles()({
  note: {
    fontSize: "14px",
    whiteSpace: "wrap",
    marginBottom: "10px",
  },
});

interface Props {
  setIdx: number;
  exerciseState: Exercise;
  exercisesState: Exercise[];
  setExerciseState: Dispatch<SetStateAction<Exercise>>;
}

export const EditSet = ({
  setIdx,
  exerciseState,
  exercisesState,
  setExerciseState,
}: Props) => {
  const { classes } = useStyles();
  const { curBlock } = useBlock();
  const [tempWeight, setTempWeight] = useState(
    setIdx !== undefined ? `${exerciseState.sets[setIdx].weight || ""}` : ""
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

  const getPreviousSessionNote = (
    exercise: Exercise | undefined,
    setIdx: number
  ) => {
    if (curBlock && exercise) {
      const previousExercise = getLastExerciseOccurrence(curBlock, exercise);
      if (previousExercise) return previousExercise.sets[setIdx]?.note;
    }
  };

  const handleSetChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: ChangeSetType
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
      {getPreviousSessionNote(
        exercisesState.find(
          (e) =>
            e.name === exerciseState.name &&
            e.apparatus === exerciseState.apparatus
        ),
        setIdx || 0
      ) && (
        <span
          className={classes.note}
        >{`Previous note: ${getPreviousSessionNote(
          exercisesState.find(
            (e) =>
              e.name === exerciseState.name &&
              e.apparatus === exerciseState.apparatus
          ),
          setIdx || 0
        )}`}</span>
      )}
      {setInfoMap.map((setInfo) => (
        <LabeledInput
          key={setInfo.name}
          label={setInfo.title}
          textValue={setInfo.value}
          onChangeText={(e: ChangeEvent<HTMLInputElement>) => {
            handleSetChange(e, setInfo.name as ChangeSetType);
          }}
        />
      ))}
    </>
  );
};
