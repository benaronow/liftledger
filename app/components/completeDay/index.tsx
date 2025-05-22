"use client";

import {
  blockOp,
  selectCurBlock,
  selectCurUser,
} from "@/lib/features/user/userSlice";
import { Block, BlockOp, Exercise, RouteType, Set } from "@/types";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useCompleteDayStyles } from "./useCompleteDayStyles";
import { Spinner } from "../spinner";
import { ScreenStateContext } from "@/app/providers/screenStateProvider";
import { LoginContext } from "@/app/providers/loginProvider";
import { SetChips } from "./SetChips";
import { EditDialog } from "./EditDialog";
import { useAppDispatch } from "@/lib/hooks";
import { PushButton } from "../pushButton";
import { BiSolidEdit } from "react-icons/bi";

export const CompleteDay = () => {
  const { classes } = useCompleteDayStyles();
  const dispatch = useAppDispatch();
  const curUser = useSelector(selectCurUser);
  const curBlock = useSelector(selectCurBlock);
  const router = useRouter();
  const { session } = useContext(LoginContext);
  const { isFetching, toggleScreenState } = useContext(ScreenStateContext);
  const [exerciseToEdit, setExerciseToEdit] = useState<{
    setIdx: number | undefined;
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

  const isExerciseComplete = (exercise: Exercise) =>
    exercise.sets.reduce(
      (acc: boolean, curSet: Set) => acc && curSet.completed,
      true
    );
  const currentExIdx = exercisesState.findIndex(
    (exercise: Exercise) => !isExerciseComplete(exercise)
  );
  const getAccentColor = (exercise: Exercise, idx: number) =>
    idx === currentExIdx
      ? "#a3258c"
      : isExerciseComplete(exercise)
      ? "#09c104"
      : "#58585b";

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
        {exercises?.map((exercise, idx) => (
          <div
            className={classes.exerciseContainer}
            style={{
              borderColor: getAccentColor(exercise, idx),
              background: getAccentColor(exercise, idx),
            }}
            key={idx}
          >
            <div className={classes.exerciseTop}>
              <div className={classes.leftPad} />
              <div className={classes.eName}>
                <span className={classes.entryTitle}>{exercise.name}</span>
                <span className={classes.entryTitle}>{`(${exercise.apparatus}${
                  exercise.unilateral ? ", Unilateral" : ""
                })`}</span>
              </div>
              <button
                className={classes.editButton}
                onClick={() =>
                  setExerciseToEdit({ setIdx: undefined, exercise })
                }
              >
                <BiSolidEdit />
              </button>
            </div>
            <SetChips
              exercise={exercisesState[idx]}
              setExerciseToEdit={setExerciseToEdit}
            />
          </div>
        ))}
        <PushButton height={40} width={80} onClick={finishDay}>
          <span className={classes.finish}>Finish</span>
        </PushButton>
      </div>
      {exerciseToEdit && (
        <EditDialog
          setIdx={exerciseToEdit.setIdx}
          exercise={exerciseToEdit.exercise}
          exercisesState={exercisesState}
          setExercisesState={setExercisesState}
          onClose={() => setExerciseToEdit(undefined)}
        />
      )}
    </>
  );
};
