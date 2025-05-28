"use client";

import {
  blockOp,
  selectCurBlock,
  selectCurUser,
} from "@/lib/features/user/userSlice";
import { Block, BlockOp, Exercise, RouteType, Set } from "@/types";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Spinner } from "../spinner";
import { ScreenStateContext } from "@/app/providers/screenStateProvider";
import { LoginContext } from "@/app/providers/loginProvider";
import { SetChips } from "./SetChips";
import { EditDialog } from "./EditDialog";
import { useAppDispatch } from "@/lib/hooks";
import { PushButton } from "../pushButton";
import { BiSolidEdit } from "react-icons/bi";
import { GrPowerReset } from "react-icons/gr";
import { makeStyles } from "tss-react/mui";
import { getLastExerciseOccurrence } from "@/app/utils";
import { AddButton } from "../AddButton";

export const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    height: "100dvh",
    padding: "65px 15px 90px",
    overflow: "scroll",
  },
  exerciseContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    borderRadius: "10px",
    marginBottom: "15px",
    border: "solid 5px",
    boxShadow: "0px 5px 10px #131314",
  },
  entryTitle: {
    fontFamily: "League+Spartan",
    fontSize: "16px",
    fontWeight: 600,
    color: "white",
  },
  exerciseTop: {
    width: "95%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  squareButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "30px",
    minWidth: "30px",
    color: "white",
    border: "solid 1px white",
    borderRadius: "5px",
    background: "#0096FF",
    fontSize: "20px",
  },
  eName: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textWrap: "nowrap",
    borderRadius: "5px 5px 0px 0px",
    padding: "5px 0px 10px",
  },
  finish: {
    color: "white",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    fontWeight: 600,
  },
  addExercise: {
    width: "90%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  addExerciseSpacing: {
    width: "100%",
    height: "2px",
    background: "#0096FF",
  },
  addExerciseButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0096FF",
    color: "white",
    fontSize: "20px",
    padding: "0px",
    height: "20px",
    minWidth: "20px",
    border: "1px solid white",
    borderRadius: "20px",
    margin: "0px 10px",
  },
});

export const CompleteDay = () => {
  const { classes } = useStyles();
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
  const [addExerciseIdx, setAddExerciseIdx] = useState<number | undefined>(
    undefined
  );

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
    ? curBlock.weeks[curBlock.curWeekIdx][curBlock.curDayIdx].exercises
    : [];

  useEffect(() => {
    if (!exercises.length) router.push("/dashboard");
  }, [exercises]);

  const [exercisesState, setExercisesState] = useState(exercises);

  const isExerciseComplete = (exercise: Exercise) =>
    exercise.sets.length !== 0 &&
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

  const resetExercise = (idx: number, exercise: Exercise) => {
    if (curBlock) {
      const previousExercise = getLastExerciseOccurrence(curBlock, exercise);

      const newExercises = previousExercise
        ? curBlock.weeks[curBlock.curWeekIdx][
            curBlock.curDayIdx
          ].exercises.toSpliced(idx, 1, {
            ...previousExercise,
            sets: previousExercise.sets.map((set: Set) => ({
              ...set,
              completed: false,
              note: "",
            })),
          })
        : exercisesState;

      const newBlock: Block = {
        ...curBlock,
        weeks: curBlock.weeks.toSpliced(
          curBlock.curWeekIdx,
          1,
          curBlock.weeks[curBlock.curWeekIdx].toSpliced(curBlock.curDayIdx, 1, {
            ...curBlock.weeks[curBlock.curWeekIdx][curBlock.curDayIdx],
            exercises: newExercises,
          })
        ),
      };

      dispatch(
        blockOp({
          uid: curUser?._id || "",
          block: newBlock,
          type: BlockOp.Edit,
        })
      );

      setExercisesState(newExercises);
    }
  };

  const finishDay = () => {
    if (curBlock) {
      const newBlock: Block = {
        ...curBlock,
        weeks: curBlock.weeks.toSpliced(
          curBlock.curWeekIdx,
          1,
          curBlock.weeks[curBlock.curWeekIdx].toSpliced(curBlock.curDayIdx, 1, {
            ...curBlock.weeks[curBlock.curWeekIdx][curBlock.curDayIdx],
            completedDate: new Date(),
          })
        ),
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

  const newExercise: Exercise = {
    name: "",
    apparatus: "",
    weightType: "",
    sets: [],
  };

  if (!exercises.length || isFetching) return <Spinner />;

  return (
    <>
      <div className={classes.container}>
        {exercises?.map((exercise, idx) => (
          <React.Fragment key={idx}>
            <AddButton
              onClick={() => {
                setAddExerciseIdx(idx);
                setExerciseToEdit({
                  setIdx: undefined,
                  exercise: newExercise,
                });
              }}
            />
            <div
              className={classes.exerciseContainer}
              style={{
                borderColor: getAccentColor(exercise, idx),
                background: getAccentColor(exercise, idx),
              }}
              key={idx}
            >
              <div className={classes.exerciseTop}>
                <button
                  className={classes.squareButton}
                  onClick={() => resetExercise(idx, exercise)}
                >
                  <GrPowerReset />
                </button>
                <div className={classes.eName}>
                  <span className={classes.entryTitle}>{exercise.name}</span>
                  <span className={classes.entryTitle}>
                    {exercise.apparatus}
                  </span>
                </div>
                <button
                  className={classes.squareButton}
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
          </React.Fragment>
        ))}
        <AddButton
          onClick={() => {
            setAddExerciseIdx(exercisesState.length);
            setExerciseToEdit({
              setIdx: undefined,
              exercise: newExercise,
            });
          }}
        />
        <PushButton height={40} width={80} onClick={finishDay}>
          <span className={classes.finish}>Finish</span>
        </PushButton>
      </div>
      {exerciseToEdit && (
        <EditDialog
          setIdx={exerciseToEdit.setIdx}
          exercise={exerciseToEdit.exercise}
          addIdx={addExerciseIdx}
          setAddIdx={setAddExerciseIdx}
          exercisesState={exercisesState}
          setExercisesState={setExercisesState}
          onClose={() => setExerciseToEdit(undefined)}
        />
      )}
    </>
  );
};
