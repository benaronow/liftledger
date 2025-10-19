import {
  Exercise,
  ExerciseApparatus,
  ExerciseName,
  WeightType,
} from "@/lib/types";
import React, { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { BiSolidEdit } from "react-icons/bi";
import { IoArrowBack } from "react-icons/io5";
import { makeStyles } from "tss-react/mui";
import { ChangeExerciseType } from ".";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    height: "160px",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  optionsContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    alignItems: "center",
    overflow: "scroll",
    paddingBottom: "5px",
  },
  value: {
    display: "flex",
    flexDirection: "column",
  },
  valueLabel: {
    fontSize: "14px",
    fontWeight: 600,
    marginBottom: "10px",
  },
  valueButton: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "14px",
    background: "transparent",
    color: "#0096FF",
    padding: "0px",
    border: "none",
  },
  itemButton: {
    width: "100%",
    border: "none",
    borderRadius: "50px",
    display: "flex",
    alignItems: "center",
    whiteSpace: "nowrap",
    padding: "5px",
    fontSize: "13px",
  },
  selectedItem: {
    background: "#0096FF",
    color: "white",
  },
  unselectedItem: {
    color: "#0096FF",
  },
  pad: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  },
});

interface Props {
  exerciseState: Exercise;
  setExerciseState: Dispatch<SetStateAction<Exercise>>;
  editingType: ChangeExerciseType | "";
  setEditingType: Dispatch<SetStateAction<ChangeExerciseType | "">>;
}

export const EditExercise = ({
  exerciseState,
  setExerciseState,
  editingType,
  setEditingType,
}: Props) => {
  const { classes } = useStyles();
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
    setExerciseState({
      ...exerciseState,
      name: type === "name" ? (e as ExerciseName) : exerciseState.name,
      apparatus:
        type === "apparatus"
          ? (e as ExerciseApparatus)
          : exerciseState.apparatus,
      weightType:
        type === "weightType" ? (e as WeightType) : exerciseState.weightType,
    });
  };

  const isCurrentlySelected = (
    option: ExerciseName | ExerciseApparatus | WeightType
  ) =>
    option === exerciseState.name ||
    option === exerciseState.apparatus ||
    option === exerciseState.weightType;

  return (
    <div className={classes.container}>
      {editingType === "" ? (
        <>
          {exerciseMap.map((entry) => (
            <div className={classes.value} key={entry.name}>
              <span className={classes.valueLabel}>{entry.title}</span>
              <button
                className={classes.valueButton}
                onClick={() => setEditingType(entry.name as ChangeExerciseType)}
              >
                <BiSolidEdit />
                {entry.value}
              </button>
            </div>
          ))}
        </>
      ) : (
        <div className={classes.optionsContainer} ref={scrollContainerRef}>
          {exerciseMap.map((entry) => (
            <React.Fragment key={entry.name}>
              {editingType === entry.name && (
                <React.Fragment key={`${entry.name}${editingType}`}>
                  {entry.options.map((option) => (
                    <button
                      className={`${classes.itemButton} ${
                        isCurrentlySelected(option)
                          ? classes.selectedItem
                          : classes.unselectedItem
                      }`}
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
                      <div className={classes.pad}>
                        {isCurrentlySelected(option) && <IoArrowBack />}
                      </div>
                      {option}
                      <div className={classes.pad}></div>
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
