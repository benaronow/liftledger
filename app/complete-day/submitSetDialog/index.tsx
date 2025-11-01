import { Block, Day, Exercise, Set } from "@/lib/types";
import { Dispatch, SetStateAction, useState } from "react";
import { FaSave } from "react-icons/fa";
import { EditSet } from "./EditSet";
import { DialogAction, ActionDialog } from "../../components/ActionDialog";
import { useBlock } from "@/app/providers/BlockProvider";
import { IoIosSkipForward } from "react-icons/io";
import { findLatestPreviousOccurrence } from "@/lib/blockUtils";

interface Props {
  setIdx: number;
  exercise: Exercise;
  exercisesState: Exercise[];
  setExercisesState: Dispatch<SetStateAction<Exercise[]>>;
  onClose: () => void;
}

export const SubmitSetDialog = ({
  setIdx,
  exercise,
  exercisesState,
  setExercisesState,
  onClose,
}: Props) => {
  const { curBlock, updateBlock } = useBlock();
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

  const saveExercises = (updatedExercises: Exercise[]) => {
    if (curBlock) {
      const newDays: Day[] = curBlock.weeks[curBlock.curWeekIdx].toSpliced(
        curBlock.curDayIdx,
        1,
        {
          ...curBlock.weeks[curBlock.curWeekIdx][curBlock.curDayIdx],
          exercises: updatedExercises,
        }
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
                    e.apparatus === exercise.apparatus
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
            }
      );

      const newBlock: Block = {
        ...curBlock,
        weeks: curBlock?.weeks.toSpliced(
          curBlock.curWeekIdx,
          1,
          updatedLaterDays
        ),
      };

      updateBlock(newBlock);
    }
  };

  const handleSubmitSet = (skip: boolean) => {
    const latestPreviousSet = findLatestPreviousOccurrence(
      curBlock,
      (e: Exercise) => {
        if (
          e.name === exercise.name &&
          e.apparatus === exercise.apparatus &&
          e.sets[setIdx]
        )
          return e.sets[setIdx];
      }
    );

    const updatedSets = skip
      ? latestPreviousSet ?? exerciseState.sets[setIdx]
      : exerciseState.sets[setIdx];

    const updatedExercise: Exercise = {
      ...exerciseState,
      sets: exerciseState.sets.toSpliced(setIdx, 1, {
        ...updatedSets,
        completed: !skip,
        skipped: skip,
        addedOn: setIdx === exercise.sets.length,
      }),
    };

    const updatedExercises = exercisesState.toSpliced(
      exercisesState.findIndex(
        (e) =>
          e.name === updatedExercise.name &&
          e.apparatus === updatedExercise.apparatus
      ),
      1,
      updatedExercise
    );

    setExercisesState(updatedExercises);
    saveExercises(updatedExercises);
    onClose();
  };

  const editActions: DialogAction[] = [
    {
      icon: <FaSave fontSize={28} />,
      onClick: () => handleSubmitSet(false),
      variant: "primary",
    },
    {
      icon: <IoIosSkipForward fontSize={28} />,
      onClick: () => handleSubmitSet(true),
      disabled:
        exerciseState.sets[setIdx].skipped || setIdx === exercise.sets.length,
      variant: "primaryInverted",
    },
  ];

  return (
    <ActionDialog
      open={true}
      onClose={onClose}
      title="Submit Set"
      actions={editActions}
    >
      <EditSet
        setIdx={setIdx}
        exerciseState={exerciseState}
        setExerciseState={setExerciseState}
      />
    </ActionDialog>
  );
};
