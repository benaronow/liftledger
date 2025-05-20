import {
  blockOp,
  selectCurBlock,
  selectCurUser,
} from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { Block, BlockOp, Day, Exercise, Set } from "@/types";
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
            { ...exercise.sets[setIdx - 1], completed: false, note: "" },
          ],
        }
      : exercise
  );
  const [tempWeight, setTempWeight] = useState(
    `${exerciseState.sets[setIdx].weight}`
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
            ? parseFloat(e.target.value) || 0
            : exerciseState.sets[setIdx].weight,
        note:
          type === "note" ? e.target.value : exerciseState.sets[setIdx].note,
      }),
    };

    if (
      type === "weight" &&
      /^$|^-?(?:\d+\.\d*|\d+\.?|\.?\d+)$/.test(e.target.value)
    )
      setTempWeight(e.target.value);

    setExerciseState(newExercise);
  };

  const saveExercises = (complete: Exercise[], nextWeek: Exercise[]) => {
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
          days: getLaterSessionIdx()
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

  const handleSubmit = (deleteSetIdx?: number) => {
    const updatedExercise: Exercise = {
      ...exerciseState,
      sets:
        deleteSetIdx === undefined
          ? exerciseState?.sets.toSpliced(setIdx, 1, {
              ...exerciseState.sets[setIdx],
              completed: true,
            })
          : exerciseState.sets.toSpliced(
              deleteSetIdx === undefined
                ? exerciseState.sets.length
                : deleteSetIdx,
              1
            ),
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
  };

  const getPreviousSessionNote = (exerciseIdx: number, setIdx: number) => {
    if (curBlock) {
      const curDayDetail =
        curBlock.weeks[curBlock.curWeekIdx].days[curBlock.curDayIdx];
      if (curDayDetail?.hasGroup) {
        let note = "";
        for (let i = 0; i < curBlock.curDayIdx; i++) {
          const checkDayDetail = curBlock.weeks[curBlock.curWeekIdx].days[i];
          if (
            checkDayDetail?.hasGroup &&
            checkDayDetail.groupName === curDayDetail.groupName
          )
            note =
              checkDayDetail.exercises[exerciseIdx].sets[setIdx]?.note ||
              "None";
        }
        if (note) return note;
      }
      if (curBlock.curWeekIdx > 0) {
        if (!curDayDetail?.hasGroup)
          return (
            curBlock.weeks[curBlock.curWeekIdx - 1].days[curBlock.curDayIdx]
              .exercises[exerciseIdx].sets[setIdx].note || "None"
          );
        const prevWeekDayIdx =
          curBlock.weeks[curBlock.curWeekIdx - 1].days.findLastIndex(
            (day) => day.hasGroup && day.groupName === curDayDetail.groupName
          ) || curBlock.curDayIdx;
        return (
          curBlock.weeks[curBlock.curWeekIdx - 1].days[prevWeekDayIdx]
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
            value={tempWeight}
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
        <Button onClick={() => handleSubmit(setIdx)}>Delete</Button>
        <Button onClick={() => handleSubmit()}>Save</Button>
      </div>
    </Dialog>
  );
};
