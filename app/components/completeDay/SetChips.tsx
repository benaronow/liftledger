import { Exercise } from "@/types";
import { makeStyles } from "tss-react/mui";
import { BiPlusCircle } from "react-icons/bi";
import { Dispatch, SetStateAction } from "react";

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
      {Array.from(Array(Math.ceil((exercise.sets.length + 1) / 4)).keys()).map(
        (i: number) => (
          <div className={classes.chipsRow} key={i}>
            {[0 + i * 4, 1 + i * 4, 2 + i * 4, 3 + i * 4].map((j: number) => {
              if (j === exercise.sets.length)
                return (
                  <div
                    className={`${classes.chip} ${
                      getNextSetIdx() === -1
                        ? classes.nextChip
                        : classes.incompleteChip
                    }`}
                    onClick={() =>
                      getNextSetIdx() === -1
                        ? setSetToEdit({
                            setIdx: exercise.sets.length,
                            exercise,
                          })
                        : {}
                    }
                    key={`${j}addset`}
                  >
                    <BiPlusCircle style={{ fontSize: "25px" }} />
                  </div>
                );
              if (j < exercise.sets.length)
                return (
                  <div
                    className={`${classes.chip} ${
                      exercise.sets[j].completed
                        ? classes.completeChip
                        : j === getNextSetIdx()
                        ? classes.nextChip
                        : classes.incompleteChip
                    }`}
                    onClick={() =>
                      j <= getNextSetIdx()
                        ? setSetToEdit({ setIdx: j, exercise })
                        : {}
                    }
                    key={`${j}${exercise.sets[j].reps}${exercise.sets[j].weight}`}
                  >
                    <span>{`${exercise.sets[j].reps} reps`}</span>
                    <span>{`${exercise.sets[j].weight}${exercise.weightType}`}</span>
                  </div>
                );
              return (
                <div
                  className={`${classes.chip} ${classes.emptyChip}`}
                  key={`${j}empty`}
                />
              );
            })}
          </div>
        )
      )}
    </div>
  );
};
