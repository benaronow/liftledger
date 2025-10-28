"use client";

import { Block, Exercise, RouteType, Set } from "@/lib/types";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { Spinner } from "../components/spinner";
import { useScreenState } from "@/app/providers/ScreenStateProvider";
import { useUser } from "@/app/providers/UserProvider";
import { SetChips } from "./SetChips";
import { EditDialog } from "./EditDialog";
import { BiSolidEdit } from "react-icons/bi";
import { AddButton } from "../components/AddButton";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { useBlock } from "@/app/providers/BlockProvider";
import { ActionsFooter, FooterAction } from "../components/ActionsFooter";
import { ActionButton } from "../components/ActionButton";
import { COLORS } from "@/lib/constants";

export const CompleteDay = () => {
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
      ? COLORS.secondary
      : isExerciseComplete(exercise)
      ? COLORS.success
      : COLORS.dark;

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

  const isDayComplete = useMemo(() => {
    return exercisesState.every((exercise: Exercise) =>
      isExerciseComplete(exercise)
    );
  }, [exercisesState]);

  const footerActions: FooterAction[] = useMemo(
    () => [
      {
        icon: editing ? <IoMdClose /> : <BiSolidEdit />,
        label: editing ? "Stop Editing" : "Edit",
        onClick: () => setEditing((prev) => !prev),
        side: "left",
      },
      {
        icon: <IoMdCheckmark style={{ fontSize: "20px" }} />,
        label: "Finish",
        onClick: finishDay,
        side: "right",
        disabled: !isDayComplete,
      },
    ],
    [setEditing, finishDay, isDayComplete]
  );

  if (!exercises.length || isFetching) return <Spinner />;

  return (
    <>
      <div
        className="d-flex flex-column align-items-center w-100 overflow-scroll"
        style={{ height: "100dvh", padding: "65px 15px 120px" }}
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
                className="d-flex flex-column align-items-center w-100 mb-3 rounded overflow-hidden"
                style={{ boxShadow: "0px 5px 10px #131314" }}
              >
                <div
                  className="w-100 d-flex align-items-center justify-content-between px-2"
                  style={{ background: getAccentColor(exercise, idx) }}
                >
                  {editing && (
                    <ActionButton
                      icon={<BiSolidEdit style={{ fontSize: "20px" }} />}
                      onClick={() => {
                        setAddExerciseIdx(undefined);
                        setExerciseToEdit({ setIdx: undefined, exercise });
                      }}
                    />
                  )}
                  <div
                    className="w-100 d-flex flex-column align-items-center p-2 text-nowrap text-white fw-semibold"
                    style={{ fontFamily: "League+Spartan", fontSize: "16px" }}
                  >
                    <span>{exercise.name}</span>
                    <span>{exercise.apparatus}</span>
                  </div>
                  {editing && <div style={{ minWidth: "35px" }} />}
                </div>
                {!editing && (
                  <SetChips
                    exercise={exercisesState[idx]}
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
                  exercise: newExercise,
                });
              }}
            />
          )}
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
      <ActionsFooter actions={footerActions} />
    </>
  );
};
