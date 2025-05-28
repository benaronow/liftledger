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
import { IoMdCloseCircle } from "react-icons/io";

const useStyles = makeStyles()({
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "30px",
    width: "100%",
    padding: "5px",
  },
  headerTitle: {
    color: "white",
    fontSize: "16px",
    fontWeight: 600,
  },
  headerPad: {
    fontSize: "18px",
    width: "20px",
    color: "red",
    padding: "0px",
  },
  closeButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    background: "transparent",
    padding: "0px",
    fontSize: "20px",
    color: "red",
  },
  inputContainer: {
    padding: "0px 5px",
  },
  input: {
    display: "flex",
    flexDirection: "column",
    padding: "10px",
    width: "240px",
    background: "white",
    borderRadius: "5px",
    whiteSpace: "nowrap",
    justifyContent: "space-between",
    gap: "10px",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "white",
    padding: "6px",
    gap: "5px",
  },
  button: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "50px",
    width: "100%",
    fontSize: "30px",
    border: "none",
    borderRadius: "5px",
    padding: "0px",
  },
  saveButton: {
    fontSize: "28px",
  },
  deleteButton: {
    fontSize: "25px",
  },
  buttonEnabled: {
    background: "#0096FF",
    color: "white",
  },
  buttonDisabled: {
    background: "#317baf",
    color: "#a7a7a7",
  },
});

interface Props {
  setIdx: number | undefined;
  exercise: Exercise;
  addIdx: number | undefined;
  setAddIdx: Dispatch<SetStateAction<number | undefined>>;
  exercisesState: Exercise[];
  setExercisesState: Dispatch<SetStateAction<Exercise[]>>;
  onClose: () => void;
}

export type ChangeExerciseType = "name" | "apparatus" | "weightType";
export type SubmitExerciseType = "change" | "add" | "delete";

export const EditDialog = ({
  setIdx,
  exercise,
  addIdx,
  setAddIdx,
  exercisesState,
  setExercisesState,
  onClose,
}: Props) => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const curUser = useSelector(selectCurUser);
  const curBlock = useSelector(selectCurBlock);
  const exerciseIdx = exercisesState.findIndex(
    (e) => e.name === exercise.name && e.apparatus === exercise.apparatus
  );
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

  const saveExercises = (complete: Exercise[]) => {
    if (curBlock) {
      const newDays: Day[] = curBlock.weeks[curBlock.curWeekIdx].toSpliced(
        curBlock.curDayIdx,
        1,
        {
          ...curBlock.weeks[curBlock.curWeekIdx][curBlock.curDayIdx],
          exercises: complete,
        }
      );

      const updatedLaterDays: Day[] = newDays.map((day: Day, idx) =>
        idx <= curBlock.curDayIdx
          ? day
          : {
              ...day,
              exercises: day.exercises.map((exercise: Exercise) => {
                const completedExercise = complete.find(
                  (e: Exercise) =>
                    e.name === exercise.name &&
                    e.apparatus === exercise.apparatus
                );

                return completedExercise
                  ? {
                      ...completedExercise,
                      sets: completedExercise.sets.map((set: Set) => ({
                        ...set,
                        completed: false,
                        note: "",
                      })),
                    }
                  : exercise;
              }),
            }
      );

      const newBlock: Block = {
        ...curBlock,
        weeks: curBlock?.weeks.toSpliced(
          curBlock.curWeekIdx,
          1,
          updatedLaterDays
        ),
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

      setExercisesState(updatedExercises);
      saveExercises(updatedExercises);
      onClose();
    }
  };

  const getExerciseToSubmit = (idx: number, submitType: SubmitExerciseType) => {
    switch (submitType) {
      case "change":
        return exercisesState.toSpliced(idx, 1, exerciseState);
      case "add":
        return exercisesState.toSpliced(idx, 0, exerciseState);
      case "delete":
        return exercisesState.toSpliced(idx, 1);
    }
  };

  const handleSubmitExercise = (submitType: SubmitExerciseType) => {
    const updatedExercises = getExerciseToSubmit(
      exerciseIdx >= 0 ? exerciseIdx : addIdx !== undefined ? addIdx : 0,
      submitType
    );
    setAddIdx(undefined);
    setExercisesState(updatedExercises);
    saveExercises(updatedExercises);
    onClose();
  };

  return (
    <Dialog
      open={!!exerciseState}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "10px",
          background: "#58585b",
        },
      }}
    >
      <div className={classes.header}>
        <div className={classes.headerPad}>
          <button className={classes.closeButton} onClick={onClose}>
            <IoMdCloseCircle />
          </button>
        </div>
        <span className={classes.headerTitle}>{`Edit ${
          setIdx !== undefined ? "Set" : "Exercise"
        }`}</span>
        <div className={classes.headerPad} />
      </div>
      <div className={classes.inputContainer}>
        <div className={classes.input}>
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
      </div>
      <div className={classes.buttonRow}>
        <button
          className={`${classes.button} ${classes.saveButton} ${
            editingType ? classes.buttonDisabled : classes.buttonEnabled
          }`}
          onClick={() =>
            setIdx !== undefined
              ? handleSubmitSet()
              : handleSubmitExercise(addIdx !== undefined ? "add" : "change")
          }
          disabled={!!editingType}
        >
          <FaSave />
        </button>
        <button
          className={`${classes.button} ${classes.deleteButton} ${
            editingType ? classes.buttonDisabled : classes.buttonEnabled
          }`}
          onClick={() =>
            setIdx !== undefined
              ? handleSubmitSet(setIdx)
              : handleSubmitExercise("delete")
          }
          disabled={!!editingType}
        >
          <FaTrash />
        </button>
      </div>
    </Dialog>
  );
};
