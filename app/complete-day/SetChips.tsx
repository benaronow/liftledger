import { Exercise } from "@/lib/types";
import { makeStyles } from "tss-react/mui";
import { Dispatch, SetStateAction } from "react";
import { getLastExerciseOccurrence } from "../utils";
import { useBlock } from "../providers/BlockProvider";
import { COLORS } from "@/lib/constants";
import { BiPlusCircle } from "react-icons/bi";

const useStyles = makeStyles()({
  chipsContainer: {
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    color: "white",
    width: "100%",
    background: "#131314",
    borderRadius: "10px",
    gap: "15px",
  },
  chipsRow: {
    display: "flex",
    justifyContent: "space-between",
  },
  chip: {
    color: "white",
    padding: "10px",
    fontSize: "13px",
    borderRadius: "10px",
    whiteSpace: "nowrap",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "5px",
  },
  completeChip: {
    background: "#0096FF",
    border: "solid 2px white",
  },
  nextChip: {
    background: "#004b7f",
    border: "solid 1px #0096FF",
  },
  incompleteChip: {
    background: "#58585b",
  },
  emptyChip: {
    background: "transparent",
  },
});

interface Props {
  exercise: Exercise;
  setExerciseToEdit: Dispatch<
    SetStateAction<
      | {
          setIdx: number | undefined;
          exercise: Exercise;
        }
      | undefined
    >
  >;
}

export const SetChips = ({ exercise, setExerciseToEdit }: Props) => {
  const { classes } = useStyles();
  const { curBlock } = useBlock();

  const getNextSetIdx = () => {
    for (let i = 0; i <= exercise?.sets.length; i++) {
      if (!exercise?.sets[i]?.completed || i === exercise?.sets.length)
        return i;
    }
    return -1;
  };

  const getRepProgress = (setIdx: number) => {
    const lastReps = getLastExerciseOccurrence(curBlock, exercise)?.sets[setIdx]
      .reps;
    if (!lastReps) return "--";
    const repsDiff = exercise.sets[setIdx]?.reps - lastReps;
    if (repsDiff === 0) return "--";
    return repsDiff > 0 ? `+${repsDiff}` : `${repsDiff}`;
  };

  const getWeightProgress = (setIdx: number) => {
    const lastWeight = getLastExerciseOccurrence(curBlock, exercise)?.sets[
      setIdx
    ].weight;
    if (!lastWeight) return "--";
    const weightDiff = exercise.sets[setIdx]?.weight - lastWeight;
    if (weightDiff === 0) return "--";
    return weightDiff > 0 ? `+${weightDiff}` : `${weightDiff}`;
  };

  const getProgressColor = (progress: string) => {
    if (progress === "--") return "white";
    if (progress.startsWith("+")) return COLORS.success;
    if (progress.startsWith("-")) return COLORS.danger;
    return "white";
  };

  return (
    <div className={classes.chipsContainer}>
      {exercise.sets.map((set, i) => (
        <button
          key={i}
          className="d-flex align-items-center justify-content-center border border-0 rounded text-nowrap"
          style={{
            height: "40px",
            fontSize: "13px",
            background: set.completed
              ? COLORS.primary
              : i === getNextSetIdx()
              ? COLORS.primaryDark
              : COLORS.container,
          }}
          onClick={() =>
            i <= getNextSetIdx()
              ? setExerciseToEdit({ setIdx: i, exercise })
              : {}
          }
        >
          <span className="text-white">
            {set.completed ? (
              <span className="d-flex gap-2 text-white">
                <span
                  className="fw-bold"
                  style={{ color: getProgressColor(getRepProgress(i)) }}
                >
                  {`${set.reps} rep${
                    set.reps !== 1 ? "s" : ""
                  } (${getRepProgress(i)})`}
                </span>
                <span>with</span>
                <span
                  className="fw-bold"
                  style={{ color: getProgressColor(getWeightProgress(i)) }}
                >{`${set.weight}${exercise.weightType} (${getWeightProgress(
                  i
                )})`}</span>
              </span>
            ) : (
              <span className="d-flex gap-2 text-white">
                <span className="fw-bold">{`${set.reps} rep${
                  set.reps !== 1 ? "s" : ""
                }`}</span>
                <span>with</span>
                <span className="fw-bold">{`${set.weight}${exercise.weightType}`}</span>
              </span>
            )}
          </span>
        </button>
      ))}
      <button
        className="d-flex align-items-center justify-content-center border border-0 rounded text-nowrap"
        style={{
          height: "40px",
          fontSize: "13px",
          background:
            getNextSetIdx() === exercise.sets.length
              ? COLORS.primaryDark
              : COLORS.container,
        }}
        onClick={() =>
          getNextSetIdx() === exercise.sets.length
            ? setExerciseToEdit({
                setIdx: exercise.sets.length,
                exercise,
              })
            : {}
        }
      >
        <BiPlusCircle style={{ color: "white", fontSize: "20px" }} />
      </button>
    </div>
  );
};
