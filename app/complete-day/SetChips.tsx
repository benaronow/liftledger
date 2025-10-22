import { Exercise } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";
import { getLastExerciseOccurrence } from "../utils";
import { useBlock } from "../providers/BlockProvider";
import { COLORS } from "@/lib/constants";
import { BiDotsHorizontalRounded, BiPlusCircle } from "react-icons/bi";
import {
  IoIosArrowDropdownCircle,
  IoIosArrowDropupCircle,
} from "react-icons/io";
import { FaGripLines, FaTimes } from "react-icons/fa";

interface Props {
  exercise: Exercise;
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

export const SetChips = ({ exercise, setExerciseToEdit }: Props) => {
  const { curBlock } = useBlock();

  const getNextSetIdx = () => {
    for (let i = 0; i <= exercise?.sets.length; i++) {
      if (!exercise?.sets[i]?.completed || i === exercise?.sets.length)
        return i;
    }
    return -1;
  };

  const getRepDiff = (setIdx: number) => {
    const lastReps = getLastExerciseOccurrence(curBlock, exercise)?.sets[setIdx]
      .reps;
    if (!lastReps) return 0;
    return exercise.sets[setIdx] ? exercise.sets[setIdx].reps - lastReps : 0;
  };

  const getWeightDiff = (setIdx: number) => {
    const lastWeight = getLastExerciseOccurrence(curBlock, exercise)?.sets[
      setIdx
    ].weight;
    if (!lastWeight) return 0;
    return exercise.sets[setIdx]
      ? exercise.sets[setIdx].weight - lastWeight
      : 0;
  };

  const getProgressString = (diff: number) => {
    if (diff === 0) return "--";
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  const getProgressColor = (diff: number) => {
    if (diff === 0) return "white";
    return diff > 0 ? COLORS.success : COLORS.danger;
  };

  return (
    <div
      className="d-flex flex-column w-100 text-white"
      style={{
        padding: "15px",
        background: "#131314",
        borderRadius: "10px",
        gap: "15px",
      }}
    >
      {exercise.sets.map((set, i) => (
        <button
          key={i}
          className="d-flex align-items-center justify-content-between border border-0 rounded text-nowrap"
          style={{
            padding: "0px 0px 0px 10px",
            height: "40px",
            fontSize: "13px",
            background: set.completed
              ? COLORS.primary
              : i === getNextSetIdx()
              ? COLORS.primaryDark
              : COLORS.container,
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
            className="d-flex align-items-center justify-content-center text-white rounded-end"
            style={{
              minWidth: "40px",
              height: "40px",
            }}
          >
            {set.completed ? (
              <div className="position-relative">
                {getWeightDiff(i) === 0 && getRepDiff(i) === 0 && (
                  <FaGripLines
                    style={{ fontSize: "20px", color: getProgressColor(0) }}
                  />
                )}
                {(getWeightDiff(i) > 0 ||
                  (getRepDiff(i) > 0 && getWeightDiff(i) === 0)) && (
                  <>
                    <div
                      className="position-absolute top-50 start-50 translate-middle bg-white"
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                      }}
                    />
                    <IoIosArrowDropupCircle
                      className="position-absolute top-50 start-50 translate-middle"
                      style={{ fontSize: "30px", color: getProgressColor(1) }}
                    />
                  </>
                )}
                {(getWeightDiff(i) < 0 ||
                  (getRepDiff(i) < 0 && getWeightDiff(i) === 0)) && (
                  <>
                    <div
                      className="position-absolute top-50 start-50 translate-middle bg-white"
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                      }}
                    />
                    <IoIosArrowDropdownCircle
                      className="position-absolute top-50 start-50 translate-middle text-danger"
                      style={{ fontSize: "30px" }}
                    />
                  </>
                )}
              </div>
            ) : (
              <BiDotsHorizontalRounded style={{ fontSize: "30px" }} />
            )}
          </div>
        </button>
      ))}
      <button
        className="d-flex align-items-center justify-content-center border border-0 rounded text-nowrap"
        style={{
          height: "40px",
          fontSize: "13px",
          background:
            getNextSetIdx() === exercise.sets.length
              ? COLORS.primaryDark
              : COLORS.container,
        }}
        onClick={() =>
          getNextSetIdx() === exercise.sets.length
            ? setExerciseToEdit({
                setIdx: exercise.sets.length,
                exercise,
              })
            : {}
        }
      >
        <BiPlusCircle style={{ color: "white", fontSize: "20px" }} />
      </button>
    </div>
  );
};
