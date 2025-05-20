import { Exercise, Set } from "@/types";
import { makeStyles } from "tss-react/mui";
import { CiCirclePlus } from "react-icons/ci";
import { Dispatch, SetStateAction } from "react";

const useStyles = makeStyles()({
  chipsContainer: {
    padding: "15px",
    display: "flex",
    flexWrap: "wrap",
    color: "white",
    width: "100%",
    gap: "15px",
  },
  chip: {
    color: "white",
    padding: "10px",
    fontSize: "13px",
    borderRadius: "10px",
    whiteSpace: "nowrap",
    display: "flex",
    flexDirection: "column",
    height: "60px",
    width: "60px",
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
    border: "dotted 2px #0096FF",
  },
  incompleteChip: {
    background: "#58585b",
    border: "dotted 2px #0096FF",
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
          <span>{`${exercise.sets[idx].reps} reps`}</span>
          <span>{`${exercise.sets[idx].weight}${exercise.weightType}`}</span>
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
