import { Block, Day, Exercise, Set } from "@liftledger/shared";
import { useEffect, useState } from "react";
import { FaSave } from "react-icons/fa";
import { EditSet } from "./EditSet";
import { DialogAction, ActionDialog } from "@/components/ActionDialog";
import { IoIosSkipForward } from "react-icons/io";
import {
  findLatestOccurrence,
  useCompletedExercises,
  useCurrentDay,
  useMe,
  useUpdateUserBlock,
  useBlock,
} from "@liftledger/api-client";
import { Spinner } from "react-bootstrap";
import { TimerSettings } from "../../../TimerSettings";

interface Props {
  exercise: Exercise | undefined;
  setIdx: number | undefined;
  onClose: () => void;
}

export const SubmitSetDialog = ({ exercise, setIdx, onClose }: Props) => {
  const { data: curUser } = useMe();
  const { data: curBlock } = useBlock(curUser?._id, curUser?.curBlock);
  const { data: completedExercises } = useCompletedExercises(curUser?._id);
  const { trigger: triggerUpdateUserBlock } = useUpdateUserBlock();

  const { exercises } = useCurrentDay();
  const [submittingSet, setSubmittingSet] = useState(false);
  const [skippingSet, setSkippingSet] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [exerciseState, setExerciseState] = useState<Exercise>();
  useEffect(() => {
    setExerciseState(
      exercise && setIdx === exercise.sets.length
        ? {
            ...exercise,
            sets: [
              ...exercise.sets,
              { ...exercise.sets[setIdx - 1], completed: false, note: "" },
            ],
          }
        : exercise,
    );
  }, [exercise, setIdx]);

  const handleClose = () => {
    onClose();
    setSubmitted(false);
  };

  const saveExercises = async (updatedExercises: Exercise[]) => {
    if (!curUser?._id || !curBlock) return;

    const newDays: Day[] = curBlock.weeks[curBlock.curWeekIdx].toSpliced(
      curBlock.curDayIdx,
      1,
      {
        ...curBlock.weeks[curBlock.curWeekIdx][curBlock.curDayIdx],
        exercises: updatedExercises,
      },
    );

    const updatedLaterDays: Day[] = newDays.map((day: Day, idx) =>
      idx <= curBlock.curDayIdx
        ? day
        : {
            ...day,
            exercises: day.exercises.map((exercise: Exercise) => {
              const completedExercise = updatedExercises.find(
                (e: Exercise) =>
                  e.name === exercise.name &&
                  e.apparatus === exercise.apparatus &&
                  e.gym === exercise.gym,
              );

              return completedExercise
                ? {
                    ...completedExercise,
                    sets: completedExercise.sets
                      .filter((set) => !set.addedOn)
                      .map((set: Set) => ({
                        ...set,
                        completed: false,
                        skipped: undefined,
                        note: "",
                      })),
                  }
                : exercise;
            }),
          },
    );

    const newBlock: Block = {
      ...curBlock,
      weeks: curBlock.weeks.toSpliced(
        curBlock.curWeekIdx,
        1,
        updatedLaterDays,
      ),
    };

    await triggerUpdateUserBlock({ userId: curUser._id, block: newBlock });
  };

  const handleSubmitSet = async (options?: { skip: boolean }) => {
    if (!exerciseState || setIdx === undefined) return;

    if (options?.skip) {
      setSkippingSet(true);
    } else {
      setSubmittingSet(true);
    }

    const latestPreviousSet = findLatestOccurrence(
      completedExercises,
      (e: Exercise) =>
        e.name === exercise?.name &&
        e.apparatus === exercise?.apparatus &&
        e.gym === exercise.gym &&
        !!e.sets[setIdx],
    )?.sets[setIdx];

    const updatedSet = options?.skip
      ? (latestPreviousSet ?? exerciseState.sets[setIdx])
      : exerciseState.sets[setIdx];

    const updatedExercise: Exercise = {
      ...exerciseState,
      sets: exerciseState.sets.toSpliced(setIdx, 1, {
        ...updatedSet,
        completed: !options?.skip,
        skipped: options?.skip,
        addedOn:
          exercise?.sets[setIdx]?.addedOn ??
          (setIdx === exercise?.sets.length && !exercise.addedOn),
      }),
    };

    const updatedExercises = exercises.toSpliced(
      exercises.findIndex(
        (e: Exercise) =>
          e.name === updatedExercise.name &&
          e.apparatus === updatedExercise.apparatus &&
          e.gym === updatedExercise.gym,
      ),
      1,
      updatedExercise,
    );

    await saveExercises(updatedExercises);

    setSubmitted(true);
    setSkippingSet(false);
    setSubmittingSet(false);
  };

  if (!exercise || setIdx === undefined) return null;

  const editActions: DialogAction[] = [
    {
      icon: submittingSet ? (
        <Spinner animation="border" variant="light" />
      ) : (
        <FaSave fontSize={28} />
      ),
      onClick: () => handleSubmitSet(),
      variant: "primary",
      disabled: submittingSet,
    },
    {
      icon: skippingSet ? (
        <Spinner animation="border" variant="light" />
      ) : (
        <IoIosSkipForward fontSize={28} />
      ),
      onClick: () => handleSubmitSet({ skip: true }),
      disabled:
        skippingSet ||
        exerciseState?.sets[setIdx].skipped ||
        setIdx === exercise.sets.length,
      variant: "primaryInverted",
    },
  ];

  return (
    <ActionDialog
      open
      onClose={handleClose}
      title={submitted ? "Start Timer" : "Submit Set"}
      actions={submitted ? [] : editActions}
    >
      {submitted ? (
        <TimerSettings onTimerStarted={handleClose} />
      ) : (
        <EditSet
          exerciseState={exerciseState}
          setExerciseState={setExerciseState}
          setIdx={setIdx}
        />
      )}
    </ActionDialog>
  );
};
