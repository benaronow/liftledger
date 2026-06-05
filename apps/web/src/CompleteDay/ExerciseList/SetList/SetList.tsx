import {
  Exercise,
  Set,
  DARK_COLORS,
  getCompletedDaysInBlock,
} from "@liftledger/shared";
import { RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { BiPlusCircle } from "react-icons/bi";
import { FaTimes } from "react-icons/fa";
import { ActionButton } from "@/components/ActionButton";
import { ProgressIcon } from "./ProgressIcon";
import { isExerciseComplete, useMe, useBlock } from "@liftledger/api-client";
import { computeProgress } from "./computeProgress";
import { SubmitSetDialog } from "./SubmitSetDialog/SubmitSetDialog";
import { useTheme } from "@/providers/ThemeProvider";

interface Props {
  exercise: Exercise;
  isCurrentExercise: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
}

export const SetList = ({
  exercise,
  isCurrentExercise,
  containerRef,
}: Props) => {
  const { data: curUser } = useMe();
  const { data: curBlock } = useBlock(curUser?._id, curUser?.curBlock);
  const [editingSetIdx, setEditingSetIdx] = useState<number>();
  const { colors } = useTheme();

  // Progress icons compare against history *within this block only*. Using
  // completedExercises.previous (which spans all blocks) was making a freshly
  // duplicated block's icons match against the source block's data.
  const intraBlockPrevious = useMemo<Exercise[]>(() => {
    if (!curBlock) return [];
    return getCompletedDaysInBlock(curBlock)
      .flatMap((day) => day.exercises)
      .reverse();
  }, [curBlock]);

  useEffect(() => {
    const el = document.getElementById(exercise.name + exercise.apparatus);

    if (el && isCurrentExercise)
      containerRef.current?.scrollTo({
        top: el.offsetTop - 65,
        behavior: "smooth",
      });
  }, [exercise.name, exercise.apparatus, isCurrentExercise, containerRef]);

  const nextSetIdx = useMemo(() => {
    if (!isCurrentExercise) return -1;
    for (let i = 0; i <= exercise?.sets.length; i++) {
      if (!exercise?.sets[i]?.completed && !exercise?.sets[i]?.skipped)
        return i;
    }
    return -1;
  }, [exercise, isCurrentExercise]);

  const getBackground = (set: Set, nextSet: boolean) =>
    set.completed
      ? DARK_COLORS.primary
      : set.skipped
        ? DARK_COLORS.primaryDark
        : nextSet
          ? DARK_COLORS.secondary
          : DARK_COLORS.primaryDisabled;

  const getDiffs = useCallback(
    (setIdx: number) => {
      // Same predicate as findLatestOccurrence, but scoped to intra-block
      // history only — fresh duplicate blocks would otherwise show "+0/+0"
      // diffs against the source block.
      let lastCompletedSet: Set | undefined;
      for (const e of intraBlockPrevious) {
        if (
          e.name === exercise.name &&
          e.apparatus === exercise.apparatus &&
          e.gym === exercise.gym &&
          !!e.sets[setIdx] &&
          e.sets[setIdx].completed
        ) {
          lastCompletedSet = e.sets[setIdx];
          break;
        }
      }

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
    },
    [exercise, intraBlockPrevious],
  );

  const getProgressString = (diff: number | undefined) => {
    if (!diff) return "--";
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  const getProgressSign = useCallback(
    (setIdx: number) => computeProgress(setIdx, exercise, intraBlockPrevious),
    [exercise, intraBlockPrevious],
  );

  const exerciseHasSkippedSets = useMemo(
    () => exercise.sets.some((set) => set.skipped),
    [exercise.sets],
  );

  return (
    <div
      className="d-flex flex-column w-100 text-white p-2 gap-2"
      style={{
        background: colors.container,
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
              ? setEditingSetIdx(i)
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
                    getDiffs(i).weightDiff,
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
        onClick={() => setEditingSetIdx(exercise.sets.length)}
        disabled={!isExerciseComplete(exercise) || exerciseHasSkippedSets}
      />
      <SubmitSetDialog
        exercise={exercise}
        setIdx={editingSetIdx}
        onClose={() => setEditingSetIdx(undefined)}
      />
    </div>
  );
};
