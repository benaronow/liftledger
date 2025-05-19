import { Exercise, Set } from "@/types";
import { makeStyles } from "tss-react/mui";
import { CiCirclePlus } from "react-icons/ci";
import { Dispatch, SetStateAction } from "react";

const useStyles = makeStyles()({
  chipsContainer: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  completeChip: {
    background: "#0096FF",
    color: "white",
    whiteSpace: "nowrap",
    borderRadius: "15px",
    padding: "10px",
    fontSize: "14px",
  },
  incompleteChip: {
    background: "red",
    color: "white",
    whiteSpace: "nowrap",
    borderRadius: "15px",
    padding: "10px",
    fontSize: "14px",
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
  return (
    <div className={classes.chipsContainer}>
      {exercise.sets.map((set: Set, idx: number) => (
        <div
          className={
            set.completed ? classes.completeChip : classes.incompleteChip
          }
          onClick={() => setSetToEdit({ setIdx: idx, exercise })}
          key={`${idx}${set.reps}${set.weight}`}
        >
          <span>{`${exercise.sets[idx].reps} x ${exercise.sets[idx].weight}${exercise.weightType}`}</span>
        </div>
      ))}
      <div
        className={classes.incompleteChip}
        onClick={() => setSetToEdit({ setIdx: exercise.sets.length, exercise })}
      >
        <CiCirclePlus />
      </div>
    </div>
  );
};
