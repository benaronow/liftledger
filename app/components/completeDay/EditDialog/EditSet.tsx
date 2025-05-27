import { getLastExerciseOccurrence } from "@/app/utils";
import { selectCurBlock } from "@/lib/features/user/userSlice";
import { Exercise } from "@/types";
import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()({
  note: {
    fontSize: "14px",
    whiteSpace: "wrap",
    marginBottom: "10px",
  },
  inputRow: {
    display: "flex",
    fontSize: "14px",
    alignItems: "center",
    border: "solid 2px #adafb3",
    borderRadius: "5px",
    padding: "5px",
    marginBottom: "10px",
  },
  input: {
    border: "none",
    outline: "none",
    fontSize: "16px",
    width: "100%",
  },
  rowName: {
    marginRight: "5px",
    fontWeight: "600",
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
  const curBlock = useSelector(selectCurBlock);
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
        <div className={classes.inputRow} key={setInfo.name}>
          <span className={classes.rowName}>{setInfo.title}</span>
          <input
            className={classes.input}
            value={setInfo.value}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleSetChange(e, setInfo.name as ChangeSetType);
            }}
          />
        </div>
      ))}
    </>
  );
};
