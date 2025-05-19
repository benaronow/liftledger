import {
  blockOp,
  selectCurBlock,
  selectCurUser,
} from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { Block, BlockOp, Day, Exercise } from "@/types";
import { Button, Dialog, Input } from "@mui/material";
import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    padding: "20px",
  },
  inputRow: {
    display: "flex",
    fontSize: "14px",
    alignItems: "center",
  },
  rowName: {
    marginRight: "5px",
  },
});

type ChangeType = "reps" | "weight" | "note";

interface Props {
  setIdx: number;
  exercise: Exercise;
  exercisesState: Exercise[];
  setExercisesState: Dispatch<SetStateAction<Exercise[]>>;
  onClose: () => void;
}

export const EditSetDialog = ({
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
  const [exerciseState, setExerciseState] = useState<Exercise>(
    setIdx === exercise.sets.length
      ? {
          ...exercise,
          sets: [
            ...exercise.sets,
            { ...exercise.sets[setIdx - 1], completed: false },
          ],
        }
      : exercise
  );

  const getLaterSessionIdx = () => {
    if (
      curBlock &&
      curUser?.curWeekIdx !== undefined &&
      curUser?.curDayIdx !== undefined
    ) {
      const curDayDetail =
        curBlock.weeks[curUser.curWeekIdx].days[curUser.curDayIdx];
      for (
        let i = curUser.curDayIdx + 1;
        i < curBlock.weeks[curUser.curWeekIdx || 0].days.length;
        i++
      ) {
        const laterSessionDetail = curBlock.weeks[curUser.curWeekIdx].days[i];
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

  const handleSetChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: ChangeType
  ) => {
    const newExercise: Exercise = {
      ...exerciseState,
      sets: exerciseState?.sets.toSpliced(setIdx, 1, {
        ...exerciseState.sets[setIdx],
        reps:
          type === "reps"
            ? parseInt(e.target.value) || 0
            : exerciseState.sets[setIdx].reps,
        weight:
          type === "weight"
            ? parseInt(e.target.value) || 0
            : exerciseState.sets[setIdx].weight,
        note:
          type === "note" ? e.target.value : exerciseState.sets[setIdx].note,
      }),
    };

    setExerciseState(newExercise);
  };

  const saveExercises = (completeEx: Exercise[], incompleteEx: Exercise[]) => {
    if (
      curUser &&
      curBlock &&
      curUser.curWeekIdx !== undefined &&
      curUser.curDayIdx !== undefined
    ) {
      const newDays: Day[] = curBlock.weeks[curUser.curWeekIdx].days.toSpliced(
        curUser.curDayIdx,
        1,
        {
          ...curBlock.weeks[curUser.curWeekIdx].days[curUser.curDayIdx],
          exercises: completeEx,
        }
      );

      const newBlock: Block = {
        ...curBlock,
        weeks: curBlock?.weeks.toSpliced(curUser?.curWeekIdx, 1, {
          ...curBlock.weeks[curUser.curWeekIdx],
          days: getLaterSessionIdx()
            ? newDays.toSpliced(curUser.curDayIdx + getLaterSessionIdx(), 1, {
                ...curBlock.weeks[curUser.curWeekIdx].days[curUser.curDayIdx],
                exercises: incompleteEx,
              })
            : newDays,
        }),
      };

      dispatch(
        blockOp({
          uid: curUser._id || "",
          block: newBlock,
          curWeek: curUser.curWeekIdx,
          type: BlockOp.Edit,
        })
      );
    }
  };

  const handleSave = () => {
    const completedSetExercise: Exercise = {
      ...exerciseState,
      sets: exerciseState?.sets.toSpliced(setIdx, 1, {
        ...exerciseState.sets[setIdx],
        completed: true,
      }),
    };

    const createNewExercisesState = (state: Exercise) =>
      exercisesState.toSpliced(
        exercisesState.findIndex((e) => e.name === state.name),
        1,
        state
      );

    setExercisesState(createNewExercisesState(completedSetExercise));
    saveExercises(
      createNewExercisesState(completedSetExercise),
      createNewExercisesState(exerciseState)
    );
    onClose();
  };

  const getPreviousSessionNote = (exerciseIdx: number, setIdx: number) => {
    if (curUser?.curWeekIdx !== undefined && curUser?.curDayIdx !== undefined) {
      const curDayDetail =
        curBlock?.weeks[curUser.curWeekIdx].days[curUser.curDayIdx];
      if (curDayDetail?.hasGroup) {
        let note = "";
        for (let i = 0; i < curUser.curDayIdx; i++) {
          const checkDayDetail = curBlock?.weeks[curUser.curWeekIdx].days[i];
          if (
            checkDayDetail?.hasGroup &&
            checkDayDetail.groupName === curDayDetail.groupName
          )
            note =
              checkDayDetail.exercises[exerciseIdx].sets[setIdx].note || "None";
        }
        if (note) return note;
      }
      if (curUser.curWeekIdx > 0) {
        if (!curDayDetail?.hasGroup)
          return (
            curBlock?.weeks[curUser.curWeekIdx - 1].days[curUser.curDayIdx]
              .exercises[exerciseIdx].sets[setIdx].note || "None"
          );
        const prevWeekDayIdx =
          curBlock?.weeks[curUser.curWeekIdx - 1].days.findLastIndex(
            (day) => day.hasGroup && day.groupName === curDayDetail.groupName
          ) || curUser.curDayIdx;
        return (
          curBlock?.weeks[curUser.curWeekIdx - 1].days[prevWeekDayIdx]
            .exercises[exerciseIdx].sets[setIdx].note || "None"
        );
      }
    }
    return "None";
  };

  return (
    <Dialog open={setIdx !== undefined && !!exerciseState} onClose={onClose}>
      <div className={classes.container}>
        <span>{`Previous session note: ${getPreviousSessionNote(
          exercisesState.findIndex((e) => e.name === exerciseState.name),
          setIdx
        )}`}</span>
        <div className={classes.inputRow}>
          <span className={classes.rowName}>Reps:</span>
          <Input
            value={
              setIdx !== undefined ? exerciseState?.sets[setIdx]?.reps : ""
            }
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleSetChange(e, "reps");
            }}
          />
        </div>
        <div className={classes.inputRow}>
          <span className={classes.rowName}>Weight:</span>
          <Input
            value={
              setIdx !== undefined ? exerciseState?.sets[setIdx]?.weight : ""
            }
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleSetChange(e, "weight");
            }}
          />
        </div>
        <div className={classes.inputRow}>
          <span className={classes.rowName}>Note:</span>
          <Input
            value={
              setIdx !== undefined ? exerciseState?.sets[setIdx]?.note : ""
            }
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleSetChange(e, "note");
            }}
          />
        </div>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </Dialog>
  );
};
