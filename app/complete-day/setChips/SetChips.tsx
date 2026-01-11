import { Exercise, Set } from "@/lib/types";
import { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import { findLatestOccurrence } from "../../../lib/blockUtils";
import { useBlock } from "../../providers/BlockProvider";
import { COLORS } from "@/lib/colors";
import { BiPlusCircle } from "react-icons/bi";
import { FaTimes } from "react-icons/fa";
import { ActionButton } from "../../components/ActionButton";
import { ProgressIcon } from "./ProgressIcon";

interface Props {
  exercise: Exercise;
  isExerciseComplete: boolean;
  isCurrentExercise: boolean;
  setExerciseToEdit: Dispatch<
    SetStateAction<
      | {
          setIdx: number | undefined;
          exercise: Exercise;
        }
      | undefined
    >
  >;
}

export const SetChips = ({
  exercise,
  isExerciseComplete,
  isCurrentExercise,
  setExerciseToEdit,
}: Props) => {
  const { curBlock } = useBlock();

  const nextSetIdx = useMemo(() => {
    if (!isCurrentExercise) return -1;
    for (let i = 0; i <= exercise?.sets.length; i++) {
      if (!exercise?.sets[i]?.completed && !exercise?.sets[i]?.skipped)
        return i;
    }
    return -1;
  }, [exercise, isCurrentExercise]);

  const getBackground = useCallback(
    (set: Set, nextSet: boolean) =>
      set.completed
        ? COLORS.primary
        : set.skipped
        ? COLORS.primaryDark
        : nextSet
        ? COLORS.secondary
        : COLORS.primaryDisabled,
    [nextSetIdx]
  );

  const getDiffs = (setIdx: number) => {
    const lastCompletedSet = findLatestOccurrence(
      curBlock,
      (e: Exercise) => {
        if (
          e.name === exercise.name &&
          e.apparatus === exercise.apparatus &&
          e.sets[setIdx] &&
          e.sets[setIdx].completed
        )
          return e.sets[setIdx];
      },
      true
    );

    if (lastCompletedSet) {
      const repDiff = exercise.sets[setIdx]
        ? exercise.sets[setIdx].reps - lastCompletedSet.reps
        : 0;
      const weightDiff = exercise.sets[setIdx]
        ? exercise.sets[setIdx].weight - lastCompletedSet.weight
        : 0;
      return { repDiff, weightDiff };
    }
    return { repDiff: undefined, weightDiff: undefined };
  };

  const getProgressString = (diff: number | undefined) => {
    if (!diff) return "--";
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  const getProgressSign = (setIdx: number) => {
    const { repDiff, weightDiff } = getDiffs(setIdx);

    if (weightDiff === undefined || repDiff === undefined) return undefined;
    if (weightDiff > 0 || (repDiff > 0 && weightDiff === 0)) return 1;
    if (weightDiff < 0 || (repDiff < 0 && weightDiff === 0)) return -1;
    return 0;
  };

  const exerciseHasSkippedSets = useMemo(
    () => exercise.sets.some((set) => set.skipped),
    [exercise.sets]
  );

  return (
    <div
      className="d-flex flex-column w-100 text-white p-2 gap-2"
      style={{
        background: COLORS.container,
      }}
    >
      {exercise.sets.map((set, i) => (
        <button
          key={i}
          className="d-flex align-items-center justify-content-between border-0 rounded text-nowrap pe-0"
          style={{
            height: "40px",
            fontSize: "13px",
            background: getBackground(set, i === nextSetIdx),
          }}
          onClick={() =>
            set.completed || set.skipped || i <= nextSetIdx
              ? setExerciseToEdit({ setIdx: i, exercise })
              : {}
          }
        >
          <span className="text-white">
            {set.completed ? (
              <span className="d-flex gap-2 text-white align-items-center">
                <span className="fw-bold">
                  <span className="me-1">{`${set.reps} rep${
                    set.reps !== 1 ? "s" : ""
                  }`}</span>
                  <span>{`(${getProgressString(getDiffs(i).repDiff)})`}</span>
                </span>
                <FaTimes />
                <span className="fw-bold">
                  <span className="me-1">{`${set.weight}${exercise.weightType}`}</span>
                  <span>{`(${getProgressString(
                    getDiffs(i).weightDiff
                  )})`}</span>
                </span>
              </span>
            ) : (
              <span className="d-flex gap-2 text-white align-items-center">
                <span className="fw-bold">{`${set.reps} rep${
                  set.reps !== 1 ? "s" : ""
                }`}</span>
                <FaTimes />
                <span className="fw-bold">{`${set.weight}${exercise.weightType}`}</span>
              </span>
            )}
          </span>
          <div
            className="position-relative d-flex justify-content-center align-items-center text-white gap-2"
            style={{
              minWidth: "40px",
              height: "40px",
            }}
          >
            <div
              className="position-absolute bg-white start-0"
              style={{ width: "1px", height: "30px" }}
            />
            <ProgressIcon
              sign={getProgressSign(i)}
              isSetComplete={set.completed}
              isSetSkipped={set.skipped}
            />
          </div>
        </button>
      ))}
      <ActionButton
        className="w-100"
        label="Add set"
        height={40}
        icon={<BiPlusCircle style={{ fontSize: "20px" }} />}
        onClick={() =>
          setExerciseToEdit({
            setIdx: exercise.sets.length,
            exercise,
          })
        }
        disabled={!isExerciseComplete || exerciseHasSkippedSets}
      />
    </div>
  );
};
