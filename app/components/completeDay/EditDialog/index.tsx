import {
  blockOp,
  selectCurBlock,
  selectCurUser,
} from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { Block, BlockOp, Day, Exercise, Set } from "@/types";
import { Dialog } from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { makeStyles } from "tss-react/mui";
import { EditExercise } from "./EditExercise";
import { EditSet } from "./EditSet";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
  },
  inputContainer: {
    display: "flex",
    flexDirection: "column",
    padding: "10px",
    width: "250px",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "white",
    background: "#adafb3",
    padding: "10px",
  },
  saveButton: {
    background: "#0096FF",
    color: "white",
    fontSize: "14px",
    border: "none",
    borderRadius: "5px",
    padding: "10px",
  },
  deleteButton: {
    background: "transparent",
    border: "none",
    padding: "none",
    color: "red",
    fontSize: "18px",
  },
  rightPad: {
    width: "30px",
  },
});

interface Props {
  setIdx: number | undefined;
  exercise: Exercise;
  exercisesState: Exercise[];
  setExercisesState: Dispatch<SetStateAction<Exercise[]>>;
  onClose: () => void;
}

export const EditDialog = ({
  setIdx,
  exercise,
  exercisesState,
  setExercisesState,
  onClose,
}: Props) => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const curUser = useSelector(selectCurUser);
  const curBlock = useSelector(selectCurBlock);
  const exerciseIdx = exercisesState.findIndex((e) => e.name === exercise.name);
  const [exerciseState, setExerciseState] = useState<Exercise>(
    setIdx === exercise.sets.length
      ? {
          ...exercise,
          sets: [
            ...exercise.sets,
            { ...exercise.sets[setIdx - 1], completed: false, note: "" },
          ],
        }
      : exercise
  );

  const getLaterSessionIdx = () => {
    if (curBlock) {
      const curDayDetail =
        curBlock.weeks[curBlock.curWeekIdx].days[curBlock.curDayIdx];
      for (
        let i = curBlock.curDayIdx + 1;
        i < curBlock.weeks[curBlock.curWeekIdx || 0].days.length;
        i++
      ) {
        const laterSessionDetail = curBlock.weeks[curBlock.curWeekIdx].days[i];
        if (
          curDayDetail.hasGroup &&
          laterSessionDetail.hasGroup &&
          curDayDetail.groupName === laterSessionDetail.groupName
        )
          return i;
      }
    }
    return 0;
  };

  const saveExercises = (complete: Exercise[], nextWeek?: Exercise[]) => {
    if (curBlock) {
      const newDays: Day[] = curBlock.weeks[curBlock.curWeekIdx].days.toSpliced(
        curBlock.curDayIdx,
        1,
        {
          ...curBlock.weeks[curBlock.curWeekIdx].days[curBlock.curDayIdx],
          exercises: complete,
        }
      );

      const newBlock: Block = {
        ...curBlock,
        weeks: curBlock?.weeks.toSpliced(curBlock.curWeekIdx, 1, {
          ...curBlock.weeks[curBlock.curWeekIdx],
          days:
            getLaterSessionIdx() && nextWeek
              ? newDays.toSpliced(getLaterSessionIdx(), 1, {
                  ...curBlock.weeks[curBlock.curWeekIdx].days[
                    getLaterSessionIdx()
                  ],
                  exercises: nextWeek,
                })
              : newDays,
        }),
      };

      dispatch(
        blockOp({
          uid: curUser?._id || "",
          block: newBlock,
          type: BlockOp.Edit,
        })
      );
    }
  };

  const handleSubmitSet = (deleteSetIdx?: number) => {
    if (setIdx !== undefined) {
      const updatedExercise: Exercise = {
        ...exerciseState,
        sets:
          deleteSetIdx === undefined
            ? exerciseState?.sets.toSpliced(setIdx, 1, {
                ...exerciseState.sets[setIdx],
                completed: true,
              })
            : exerciseState.sets.toSpliced(deleteSetIdx, 1),
      };

      const updatedExercises = exercisesState.toSpliced(
        exercisesState.findIndex((e) => e.name === updatedExercise.name),
        1,
        updatedExercise
      );

      const nextWeekExercises: Exercise[] = updatedExercises.map(
        (exercise: Exercise) => ({
          ...exercise,
          sets: exercise.sets.map((set: Set) => ({
            ...set,
            completed: false,
            note: "",
          })),
        })
      );

      setExercisesState(updatedExercises);
      saveExercises(updatedExercises, nextWeekExercises);
      onClose();
    }
  };

  const handleSubmitExercise = () => {
    const updatedExercises = exercisesState.toSpliced(
      exerciseIdx,
      1,
      exerciseState
    );

    setExercisesState(updatedExercises);
    saveExercises(updatedExercises);
    onClose();
  };

  return (
    <Dialog open={!!exerciseState} onClose={onClose}>
      <div className={classes.container}>
        <div className={classes.inputContainer}>
          {setIdx !== undefined ? (
            <EditSet
              setIdx={setIdx}
              exerciseState={exerciseState}
              exercisesState={exercisesState}
              setExerciseState={setExerciseState}
            />
          ) : (
            <EditExercise
              exerciseState={exerciseState}
              setExerciseState={setExerciseState}
            />
          )}
        </div>
        <div className={classes.buttonRow}>
          <button
            className={`${classes.deleteButton}`}
            onClick={() =>
              setIdx !== undefined
                ? handleSubmitSet(setIdx)
                : handleSubmitExercise()
            }
          >
            <FaTrash />
          </button>
          <button
            className={classes.saveButton}
            onClick={() =>
              setIdx !== undefined ? handleSubmitSet() : handleSubmitExercise()
            }
          >
            {`Save ${setIdx !== undefined ? "Set" : "Exercise"}`}
          </button>
          <div className={classes.rightPad} />
        </div>
      </div>
    </Dialog>
  );
};
