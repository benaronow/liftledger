import {
  Exercise,
  ExerciseApparatus,
  ExerciseName,
  WeightType,
} from "@/lib/types";
import React, { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { BiSolidEdit } from "react-icons/bi";
import { IoArrowBack } from "react-icons/io5";
import { ChangeExerciseType } from ".";
import { getNewSetsFromLast } from "@/app/utils";
import { useBlock } from "@/app/providers/BlockProvider";

interface Props {
  exerciseState: Exercise;
  setExerciseState: Dispatch<SetStateAction<Exercise>>;
  editingType: ChangeExerciseType | "";
  setEditingType: Dispatch<SetStateAction<ChangeExerciseType | "">>;
  takenExercises: Exercise[];
}

export const EditExercise = ({
  exerciseState,
  setExerciseState,
  editingType,
  setEditingType,
  takenExercises,
}: Props) => {
  const { curBlock } = useBlock();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollToButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (scrollToButtonRef.current && scrollContainerRef.current) {
      const itemPosition = scrollToButtonRef.current.offsetTop - 60;
      scrollContainerRef.current.scrollTop = itemPosition;
    }
  }, [editingType]);

  const exerciseMap = [
    {
      name: "name",
      title: "Exercise:",
      value: exerciseState.name || "Select",
      options: Object.values(ExerciseName),
    },
    {
      name: "apparatus",
      title: "Apparatus:",
      value: exerciseState.apparatus || "Select",
      options: Object.values(ExerciseApparatus),
    },
    {
      name: "weightType",
      title: "Weight Type:",
      value: exerciseState.weightType || "Select",
      options: Object.values(WeightType),
    },
  ];

  const handleExerciseChange = (
    e: ExerciseName | ExerciseApparatus | WeightType | "",
    type: ChangeExerciseType
  ) => {
    const newExercise = {
      name: type === "name" ? (e as ExerciseName) : exerciseState.name,
      apparatus:
        type === "apparatus"
          ? (e as ExerciseApparatus)
          : exerciseState.apparatus,
      weightType:
        type === "weightType" ? (e as WeightType) : exerciseState.weightType,
      sets: [],
    };

    setExerciseState({
      ...newExercise,
      sets: getNewSetsFromLast(curBlock, newExercise),
    });
  };

  const isCurrentlySelected = (
    option: ExerciseName | ExerciseApparatus | WeightType
  ) =>
    option === exerciseState.name ||
    option === exerciseState.apparatus ||
    option === exerciseState.weightType;

  return (
    <div
      className="d-flex flex-column align-items-start justify-content-between"
      style={{ height: "160px" }}
    >
      {editingType === "" ? (
        <>
          {exerciseMap.map((entry) => (
            <div key={entry.name} className="d-flex flex-column mb-2">
              <span className="small fw-semibold">{entry.title}</span>
              <button
                className="d-flex align-items-center gap-1 bg-transparent p-0 border-0 small"
                style={{ color: "#0096FF" }}
                onClick={() => setEditingType(entry.name as ChangeExerciseType)}
              >
                <BiSolidEdit />
                {entry.value}
              </button>
            </div>
          ))}
        </>
      ) : (
        <div
          ref={scrollContainerRef}
          className="w-100 d-flex flex-column gap-1 align-items-center overflow-auto pb-1"
        >
          {exerciseMap.map((entry) => (
            <React.Fragment key={entry.name}>
              {editingType === entry.name && (
                <React.Fragment key={`${entry.name}${editingType}`}>
                  {entry.options
                    .filter((o) => {
                      if (entry.name === "name") {
                        return !takenExercises.find(
                          (e) =>
                            e.name === o &&
                            e.apparatus === exerciseState.apparatus
                        );
                      }
                      if (entry.name === "apparatus") {
                        return !takenExercises.find(
                          (e) =>
                            e.apparatus === o && e.name === exerciseState.name
                        );
                      }
                      return true;
                    })
                    .map((option) => (
                      <button
                        className="w-100 border-0 rounded-pill d-flex align-items-center text-nowrap p-1 small"
                        style={{
                          ...(isCurrentlySelected(option)
                            ? { background: "#0096FF", color: "white" }
                            : { color: "#0096FF" }),
                        }}
                        key={option}
                        onClick={() => {
                          if (editingType)
                            handleExerciseChange(option, editingType);
                          setEditingType("");
                        }}
                        ref={
                          isCurrentlySelected(option) ? scrollToButtonRef : null
                        }
                      >
                        <div className="w-100 d-flex justify-content-start align-items-center">
                          {isCurrentlySelected(option) && <IoArrowBack />}
                        </div>
                        {option}
                        <div className="w-100 d-flex justify-content-start align-items-center"></div>
                      </button>
                    ))}
                </React.Fragment>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
