import { Exercise, Set } from "@/types";
import { makeStyles } from "tss-react/mui";
import { CiCirclePlus } from "react-icons/ci";
import { Dispatch, SetStateAction } from "react";

const useStyles = makeStyles()({
  chipsContainer: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    color: "white",
  },
  chip: {
    color: "white",
    padding: "10px",
    fontSize: "14px",
    borderRadius: "10px",
    whiteSpace: "nowrap",
  },
  completeChip: {
    background: "#0096FF",
    border: "solid 1px white",
  },
  nextChip: {
    background: "#004b7f",
    border: "dotted 1px #0096FF",
  },
  incompleteChip: {
    background: "transparent",
    border: "dotted 1px #0096FF",
  },
});

interface Props {
  exercise: Exercise;
  setSetToEdit: Dispatch<
    SetStateAction<
      | {
          setIdx: number;
          exercise: Exercise;
        }
      | undefined
    >
  >;
}

export const SetChips = ({ exercise, setSetToEdit }: Props) => {
  const { classes } = useStyles();

  const getNextSetIdx = () => {
    for (let i = 0; i < exercise.sets.length; i++) {
      if (!exercise.sets[i].completed) return i;
    }
    return -1;
  };

  return (
    <div className={classes.chipsContainer}>
      {exercise.sets.map((set: Set, idx: number) => (
        <div
          className={`${classes.chip} ${
            set.completed
              ? classes.completeChip
              : idx === getNextSetIdx()
              ? classes.nextChip
              : classes.incompleteChip
          }`}
          onClick={() => setSetToEdit({ setIdx: idx, exercise })}
          key={`${idx}${set.reps}${set.weight}`}
        >
          <span>{`${exercise.sets[idx].reps} x ${exercise.sets[idx].weight}${exercise.weightType}`}</span>
        </div>
      ))}
      <div
        className={`${classes.chip} ${
          getNextSetIdx() === -1 ? classes.nextChip : classes.incompleteChip
        }`}
        onClick={() => setSetToEdit({ setIdx: exercise.sets.length, exercise })}
      >
        <CiCirclePlus />
      </div>
    </div>
  );
};
