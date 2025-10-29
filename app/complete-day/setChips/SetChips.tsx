import { Exercise } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";
import { getLastExerciseOccurrence } from "../../utils";
import { useBlock } from "../../providers/BlockProvider";
import { COLORS } from "@/lib/colors";
import { BiPlusCircle } from "react-icons/bi";
import { FaTimes } from "react-icons/fa";
import { ActionButton } from "../../components/ActionButton";
import { ProgressIcon } from "./ProgressIcon";

interface Props {
  exercise: Exercise;
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
  isCurrentExercise,
  setExerciseToEdit,
}: Props) => {
  const { curBlock } = useBlock();

  const getNextSetIdx = () => {
    if (!isCurrentExercise) return -1;
    for (let i = 0; i <= exercise?.sets.length; i++) {
      if (!exercise?.sets[i]?.completed || i === exercise?.sets.length)
        return i;
    }
    return -1;
  };

  const getRepDiff = (setIdx: number) => {
    const lastReps = getLastExerciseOccurrence(curBlock, exercise, false)?.sets[
      setIdx
    ]?.reps;
    if (lastReps)
      return exercise.sets[setIdx] ? exercise.sets[setIdx].reps - lastReps : 0;
  };

  const getWeightDiff = (setIdx: number) => {
    const lastWeight = getLastExerciseOccurrence(curBlock, exercise, false)
      ?.sets[setIdx]?.weight;
    if (lastWeight)
      return exercise.sets[setIdx]
        ? exercise.sets[setIdx].weight - lastWeight
        : 0;
  };

  const getProgressString = (diff: number | undefined) => {
    if (!diff) return "--";
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  const getProgressSign = (i: number) => {
    const weightDiff = getWeightDiff(i);
    const repDiff = getRepDiff(i);

    if (!weightDiff || !repDiff) return undefined;
    if (weightDiff > 0 || (repDiff > 0 && weightDiff === 0)) return 1;
    if (weightDiff < 0 || (repDiff < 0 && weightDiff === 0)) return -1;
    return 0;
  };

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
            background: set.completed
              ? COLORS.primary
              : i === getNextSetIdx()
              ? COLORS.secondary
              : COLORS.primaryDisabled,
          }}
          onClick={() =>
            i <= getNextSetIdx()
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
                  <span>{`(${getProgressString(getRepDiff(i))})`}</span>
                </span>
                <FaTimes />
                <span className="fw-bold">
                  <span className="me-1">{`${set.weight}${exercise.weightType}`}</span>
                  <span>{`(${getProgressString(getWeightDiff(i))})`}</span>
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
          getNextSetIdx() === exercise.sets.length
            ? setExerciseToEdit({
                setIdx: exercise.sets.length,
                exercise,
              })
            : {}
        }
        disabled={getNextSetIdx() !== exercise.sets.length}
      />
    </div>
  );
};
