import { Exercise } from "@/types";
import { makeStyles } from "tss-react/mui";
import { BiPlusCircle } from "react-icons/bi";
import { Dispatch, SetStateAction, useContext } from "react";
import { ScreenStateContext } from "@/app/providers/screenStateProvider";

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
  const { innerWidth } = useContext(ScreenStateContext);
  const chipSideLength = innerWidth ? `${(innerWidth - 115) / 4}px` : "60px";

  const getNextSetIdx = () => {
    for (let i = 0; i <= exercise?.sets.length; i++) {
      if (!exercise?.sets[i]?.completed || i === exercise?.sets.length) return i;
    }
    return -1;
  };

  return (
    <div className={classes.chipsContainer}>
      {Array.from(Array(Math.ceil((exercise?.sets.length || 0 + 1) / 4)).keys()).map(
        (i: number) => (
          <div className={classes.chipsRow} key={i}>
            {[0 + i * 4, 1 + i * 4, 2 + i * 4, 3 + i * 4].map((j: number) => {
              if (j === exercise?.sets.length)
                return (
                  <div
                    className={`${classes.chip} ${
                      getNextSetIdx() === exercise?.sets.length
                        ? classes.nextChip
                        : classes.incompleteChip
                    }`}
                    style={{ height: chipSideLength, width: chipSideLength }}
                    onClick={() =>
                      getNextSetIdx() === exercise?.sets.length
                        ? setExerciseToEdit({
                            setIdx: exercise?.sets.length,
                            exercise,
                          })
                        : {}
                    }
                    key={`${j}addset`}
                  >
                    <BiPlusCircle style={{ fontSize: "25px" }} />
                  </div>
                );
              if (j < exercise?.sets.length)
                return (
                  <div
                    className={`${classes.chip} ${
                      exercise?.sets[j].completed
                        ? classes.completeChip
                        : j === getNextSetIdx()
                        ? classes.nextChip
                        : classes.incompleteChip
                    }`}
                    style={{ height: chipSideLength, width: chipSideLength }}
                    onClick={() =>
                      j <= getNextSetIdx()
                        ? setExerciseToEdit({ setIdx: j, exercise })
                        : {}
                    }
                    key={`${j}${exercise?.sets[j].reps}${exercise?.sets[j].weight}`}
                  >
                    <span>{`${exercise?.sets[j].reps} reps`}</span>
                    <span>{`${exercise?.sets[j].weight}${exercise?.weightType}`}</span>
                  </div>
                );
              return (
                <div
                  className={`${classes.chip} ${classes.emptyChip}`}
                  style={{ height: chipSideLength, width: chipSideLength }}
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
