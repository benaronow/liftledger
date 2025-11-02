"use client";

import { Block, Exercise, RouteType, Set } from "@/lib/types";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { Spinner } from "../components/spinner";
import { useScreenState } from "@/app/providers/ScreenStateProvider";
import { useUser } from "@/app/providers/UserProvider";
import { SetChips } from "./setChips/SetChips";
import { BiSolidEdit } from "react-icons/bi";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { useBlock } from "@/app/providers/BlockProvider";
import { ActionsFooter, FooterAction } from "../components/ActionsFooter";
import { COLORS } from "@/lib/colors";
import { SubmitSetDialog } from "./submitSetDialog";
import { AddButton } from "../components/AddButton";
import { AddExerciseDialog } from "./addExerciseDialog";
import { RiTimerLine } from "react-icons/ri";
import { useTimer } from "../providers/TimerProvider";

export const CompleteDay = () => {
  const router = useRouter();
  const { session } = useUser();
  const { timerEnd, setTimerDialogOpen } = useTimer();
  const { curBlock, updateBlock } = useBlock();
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
      (acc: boolean, curSet: Set) =>
        acc && (curSet.completed || (curSet.skipped ?? false)),
      true
    );

  const currentExIdx = exercisesState.findIndex(
    (exercise: Exercise) => !isExerciseComplete(exercise)
  );

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

      updateBlock(newBlock);

      router.push("/dashboard");
    }
  };

  const newExercise: Exercise = {
    name: "",
    apparatus: "",
    weightType: "",
    sets: [],
  };

  const isDayComplete = useMemo(() => {
    return exercises.every((exercise: Exercise) =>
      isExerciseComplete(exercise)
    );
  }, [exercises]);

  const footerActions: FooterAction[] = useMemo(
    () => [
      {
        icon: <RiTimerLine fontSize={20} />,
        label: "Timer",
        onClick: () => setTimerDialogOpen(true),
        disabled: !!timerEnd,
        variant: "primary",
      },
      {
        icon: editing ? <IoMdClose /> : <BiSolidEdit />,
        label: editing ? "Stop Editing" : "Edit",
        onClick: () => setEditing((prev) => !prev),
        variant: "primary",
      },
      {
        icon: <IoMdCheckmark style={{ fontSize: "20px" }} />,
        label: "Finish",
        onClick: finishDay,
        disabled: !isDayComplete,
        variant: "primary",
      },
    ],
    [setEditing, finishDay, isDayComplete]
  );

  if (!exercises.length || isFetching) return <Spinner />;

  return (
    <>
      <div
        className="d-flex flex-column align-items-center w-100 overflow-scroll"
        style={{ height: "100dvh", padding: "65px 15px 140px" }}
      >
        <div className="d-flex flex-column align-items-center w-100">
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
                className={`d-flex flex-column align-items-center w-100 rounded overflow-hidden mb-${
                  idx === exercisesState.length - 1 ? "3" : "4"
                }`}
                style={{ boxShadow: "0px 5px 10px #131314" }}
              >
                <div
                  className="w-100 d-flex align-items-center justify-content-center px-2"
                  style={{
                    background: isExerciseComplete(exercise)
                      ? COLORS.success
                      : COLORS.dark,
                  }}
                >
                  <div
                    className="w-100 d-flex flex-column align-items-center p-2 text-nowrap text-white fw-semibold"
                    style={{ fontFamily: "League+Spartan", fontSize: "16px" }}
                  >
                    <span>{exercise.name}</span>
                    <span>{exercise.apparatus}</span>
                  </div>
                </div>
                {!editing && (
                  <SetChips
                    exercise={exercisesState[idx]}
                    isExerciseComplete={isExerciseComplete(exercisesState[idx])}
                    isCurrentExercise={idx === currentExIdx}
                    setExerciseToEdit={setExerciseToEdit}
                  />
                )}
              </div>
            </React.Fragment>
          ))}
          {editing && (
            <AddButton
              onClick={() => {
                setAddExerciseIdx(exercisesState.length);
                setExerciseToEdit({
                  setIdx: undefined,
                  exercise: { ...newExercise, addedOn: true },
                });
              }}
            />
          )}
        </div>
      </div>
      {exerciseToEdit && exerciseToEdit.setIdx !== undefined && (
        <SubmitSetDialog
          setIdx={exerciseToEdit.setIdx}
          exercise={exerciseToEdit.exercise}
          exercisesState={exercisesState}
          setExercisesState={setExercisesState}
          onClose={() => setExerciseToEdit(undefined)}
        />
      )}
      {exerciseToEdit && addExerciseIdx !== undefined && (
        <AddExerciseDialog
          addIdx={addExerciseIdx}
          exercisesState={exercisesState}
          setExercisesState={setExercisesState}
          onClose={() => {
            setAddExerciseIdx(undefined);
            setExerciseToEdit(undefined);
          }}
        />
      )}
      <ActionsFooter actions={footerActions} />
    </>
  );
};
