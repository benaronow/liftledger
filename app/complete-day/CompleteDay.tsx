"use client";

import { Block, Exercise, RouteType, Set } from "@/lib/types";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Spinner } from "../components/spinner";
import { useScreenState } from "@/app/providers/ScreenStateProvider";
import { useUser } from "@/app/providers/UserProvider";
import { SetChips } from "./SetChips";
import { EditDialog } from "./EditDialog";
import { PushButton } from "../components/pushButton";
import { BiSolidEdit } from "react-icons/bi";
import { makeStyles } from "tss-react/mui";
import { AddButton } from "../components/AddButton";
import { IoMdClose } from "react-icons/io";
import { useBlock } from "@/app/providers/BlockProvider";

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
    height: "35px",
    minWidth: "35px",
    color: "white",
    border: "none",
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
  actionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    width: "100%",
    padding: "0px 10px",
  },
});

export const CompleteDay = () => {
  const { classes } = useStyles();
  const router = useRouter();
  const { session } = useUser();
  const { curBlock, editBlock } = useBlock();
  const { isFetching, toggleScreenState } = useScreenState();
  const [exerciseToEdit, setExerciseToEdit] = useState<{
    setIdx: number | undefined;
    exercise: Exercise;
  }>();
  const [addExerciseIdx, setAddExerciseIdx] = useState<number | undefined>(
    undefined
  );
  const [editing, setEditing] = useState(false);

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

      editBlock(newBlock);

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
            {editing && (
              <AddButton
                onClick={() => {
                  setAddExerciseIdx(idx);
                  setExerciseToEdit({
                    setIdx: undefined,
                    exercise: newExercise,
                  });
                }}
              />
            )}
            <div
              className={classes.exerciseContainer}
              style={{
                borderColor: getAccentColor(exercise, idx),
                background: getAccentColor(exercise, idx),
              }}
              key={idx}
            >
              <div className={classes.exerciseTop}>
                {editing && <div style={{ minWidth: "35px" }} />}
                <div className={classes.eName}>
                  <span className={classes.entryTitle}>{exercise.name}</span>
                  <span className={classes.entryTitle}>
                    {exercise.apparatus}
                  </span>
                </div>
                {editing && (
                  <button
                    className={classes.squareButton}
                    onClick={() =>
                      setExerciseToEdit({ setIdx: undefined, exercise })
                    }
                  >
                    <BiSolidEdit />
                  </button>
                )}
              </div>
              <SetChips
                exercise={exercisesState[idx]}
                setExerciseToEdit={setExerciseToEdit}
              />
            </div>
          </React.Fragment>
        ))}
        {editing && (
          <AddButton
            onClick={() => {
              setAddExerciseIdx(exercisesState.length);
              setExerciseToEdit({
                setIdx: undefined,
                exercise: newExercise,
              });
            }}
          />
        )}
        <div className={classes.actionRow}>
          <button
            className={classes.squareButton}
            onClick={() => setEditing((prev) => !prev)}
          >
            {editing ? <IoMdClose /> : <BiSolidEdit />}
          </button>
          <PushButton height={40} width={80} onClick={finishDay}>
            <span className={classes.finish}>Finish</span>
          </PushButton>
          <div style={{ minWidth: "35px" }} />
        </div>
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
