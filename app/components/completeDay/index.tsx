"use client";

import { selectCurBlock, selectCurUser } from "@/lib/features/user/userSlice";
import { Exercise, RouteType } from "@/types";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useCompleteDayStyles } from "./useCompleteDayStyles";
import { Spinner } from "../spinner";
import { ScreenStateContext } from "@/app/providers/screenStateProvider";
import { LoginContext } from "@/app/providers/loginProvider";
import { SetChips } from "./SetChips";
import { EditSetDialog } from "./EditSetDialog";

export const CompleteDay = () => {
  const { classes } = useCompleteDayStyles();
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

  const exercises =
    curBlock &&
    curUser?.curWeekIdx !== undefined &&
    curUser?.curDayIdx !== undefined
      ? curBlock?.weeks[curUser.curWeekIdx].days[curUser.curDayIdx].exercises
      : [];
  useEffect(() => {
    if (!exercises.length) router.push("/dashboard");
  }, [exercises]);

  const [exercisesState, setExercisesState] = useState(exercises);

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
