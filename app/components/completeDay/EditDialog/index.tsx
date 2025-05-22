import {
  blockOp,
  selectCurBlock,
  selectCurUser,
} from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { Block, BlockOp, Day, Exercise, Set } from "@/types";
import { Dialog } from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";
import { FaSave, FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { makeStyles } from "tss-react/mui";
import { EditExercise } from "./EditExercise";
import { EditSet } from "./EditSet";
import { IoCloseCircle } from "react-icons/io5";

const useStyles = makeStyles()({
  inputContainer: {
    display: "flex",
    flexDirection: "column",
    padding: "10px 10px 0px",
    width: "240px",
    borderRadius: "20px",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "white",
    background: "#adafb3",
    padding: "10px 25px",
  },
  buttonSpacing: {
    width: "100%",
    height: "2px",
    background: "white",
    margin: "0px 10px",
  },
  saveButton: {
    fontSize: "14px",
    border: "none",
    borderRadius: "5px",
    padding: "10px",
  },
  saveEnabled: {
    color: "#0096FF",
    fontSize: "24px",
  },
  saveDisabled: {
    color: "#306a93",
    fontSize: "24px",
  },
  smallButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    padding: "0px",
    width: "30px",
    height: "30px",
    borderRadius: "5px",
  },
  backButton: {
    color: "black",
    fontSize: "28px",
  },
  deleteButton: {
    color: "red",
    fontSize: "20px",
  },
});

interface Props {
  setIdx: number | undefined;
  exercise: Exercise;
  exercisesState: Exercise[];
  setExercisesState: Dispatch<SetStateAction<Exercise[]>>;
  onClose: () => void;
}

export type ChangeExerciseType = "name" | "apparatus" | "weightType";

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
  const [editingType, setEditingType] = useState<ChangeExerciseType | "">("");

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
            editingType={editingType}
            setEditingType={setEditingType}
          />
        )}
      </div>
      <div className={classes.buttonRow}>
        <button
          className={`${classes.smallButton} ${classes.backButton}`}
          onClick={onClose}
        >
          <IoCloseCircle />
        </button>
        <div className={classes.buttonSpacing} />
        <button
          className={`${classes.smallButton} ${
            editingType ? classes.saveDisabled : classes.saveEnabled
          }`}
          onClick={() =>
            setIdx !== undefined ? handleSubmitSet() : handleSubmitExercise()
          }
          disabled={!!editingType}
        >
          <FaSave />
        </button>
        <div className={classes.buttonSpacing} />
        <button
          className={`${classes.smallButton} ${classes.deleteButton}`}
          onClick={() =>
            setIdx !== undefined
              ? handleSubmitSet(setIdx)
              : handleSubmitExercise()
          }
        >
          <FaTrash />
        </button>
      </div>
    </Dialog>
  );
};
