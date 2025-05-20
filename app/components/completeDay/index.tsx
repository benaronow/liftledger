"use client";

import {
  blockOp,
  selectCurBlock,
  selectCurUser,
} from "@/lib/features/user/userSlice";
import { Block, BlockOp, Exercise, RouteType } from "@/types";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useCompleteDayStyles } from "./useCompleteDayStyles";
import { Spinner } from "../spinner";
import { ScreenStateContext } from "@/app/providers/screenStateProvider";
import { LoginContext } from "@/app/providers/loginProvider";
import { SetChips } from "./SetChips";
import { EditSetDialog } from "./EditSetDialog";
import { Button } from "@mui/material";
import { useAppDispatch } from "@/lib/hooks";

export const CompleteDay = () => {
  const { classes } = useCompleteDayStyles();
  const dispatch = useAppDispatch();
  const curUser = useSelector(selectCurUser);
  const curBlock = useSelector(selectCurBlock);
  const router = useRouter();
  const { session } = useContext(LoginContext);
  const { isFetching, toggleScreenState } = useContext(ScreenStateContext);
  const [setToEdit, setSetToEdit] = useState<{
    setIdx: number;
    exercise: Exercise;
  }>();

  useEffect(() => {
    if (!session) {
      router.push("/dashboard");
    } else {
      toggleScreenState("fetching", false);
      router.prefetch(RouteType.Add);
      router.prefetch(RouteType.Home);
      router.prefetch(RouteType.Profile);
      router.prefetch(RouteType.History);
      router.prefetch(RouteType.Progress);
    }
  }, []);

  const exercises = curBlock
    ? curBlock.weeks[curBlock.curWeekIdx].days[curBlock.curDayIdx].exercises
    : [];
  useEffect(() => {
    if (!exercises.length) router.push("/dashboard");
  }, [exercises]);

  const [exercisesState, setExercisesState] = useState(exercises);

  const finishDay = () => {
    if (curBlock) {
      const newBlock: Block = {
        ...curBlock,
        weeks: curBlock.weeks.toSpliced(curBlock.curWeekIdx, 1, {
          ...curBlock.weeks[curBlock.curWeekIdx],
          days: curBlock.weeks[curBlock.curWeekIdx].days.toSpliced(
            curBlock.curDayIdx,
            1,
            {
              ...curBlock.weeks[curBlock.curWeekIdx].days[curBlock.curDayIdx],
              completed: true,
              completedDate: new Date(),
            }
          ),
        }),
      };

      dispatch(
        blockOp({
          uid: curUser?._id || "",
          block: newBlock,
          type: BlockOp.Edit,
        })
      );

      router.push("/dashboard");
    }
  };

  if (!exercises.length || isFetching) return <Spinner />;

  return (
    <>
      <div className={classes.container}>
        <div className={classes.box}>
          {exercises?.map((exercise, idx) => (
            <div className={classes.exerciseContainer} key={idx}>
              <div className={classes.eName}>
                <span className={classes.entryTitle}>{exercise.name}</span>
                <span className={classes.entryTitle}>{`(${
                  exercise.apparatus
                }, ${exercise.unilateral ? "Unilateral" : "Bilateral"})`}</span>
              </div>
              <SetChips
                exercise={exercisesState[idx]}
                setSetToEdit={setSetToEdit}
              />
            </div>
          ))}
        </div>
        <Button onClick={finishDay}>Finish</Button>
      </div>
      {setToEdit && (
        <EditSetDialog
          setIdx={setToEdit.setIdx}
          exercise={setToEdit.exercise}
          exercisesState={exercisesState}
          setExercisesState={setExercisesState}
          onClose={() => setSetToEdit(undefined)}
        />
      )}
    </>
  );
};
