import { Exercise, ExerciseApparatus, ExerciseName, WeightType } from "@/types";
import { Dispatch, SetStateAction, useState } from "react";
import { BiSolidEdit } from "react-icons/bi";
import Select from "react-select";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    overflow: "scroll",
    height: "200px",
  },
  optionsContainer: {
    justifyContent: "space-evenly",
    alignItems: "flex-start",
  },
  exerciseLabel: {
    fontSize: "14px",
  },
  exerciseButton: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "14px",
    background: "transparent",
    color: "#0096FF",
    padding: "0",
    border: "none",
  },
});

interface Props {
  exerciseState: Exercise;
  setExerciseState: Dispatch<SetStateAction<Exercise>>;
}

export const EditExercise = ({ exerciseState, setExerciseState }: Props) => {
  const { classes } = useStyles();
  type ChangeExerciseType = "name" | "apparatus" | "weightType";
  const [editingType, setEditingType] = useState<ChangeExerciseType | "">("");

  const exerciseNameOptions = Object.values(ExerciseName).map((value) => ({
    value,
    label: value,
  }));

  const exerciseApparatusOptions = Object.values(ExerciseApparatus).map(
    (value) => ({
      value,
      label: value,
    })
  );

  const weightTypeOptions = Object.values(WeightType).map((value) => ({
    value,
    label: value,
  }));

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

  return (
    <div
      className={`${classes.container} ${
        editingType === "" && classes.optionsContainer
      }`}
    >
      {editingType === "" && (
        <>
          <span className={classes.exerciseLabel}>Exercise:</span>
          <button
            className={classes.exerciseButton}
            onClick={() => setEditingType("name")}
          >
            <BiSolidEdit />
            {exerciseState.name}
          </button>
          <span className={classes.exerciseLabel}>Apparatus:</span>
          <button
            className={classes.exerciseButton}
            onClick={() => setEditingType("apparatus")}
          >
            <BiSolidEdit />
            {exerciseState.apparatus}
          </button>
          <span className={classes.exerciseLabel}>Weight Type:</span>
          <button
            className={classes.exerciseButton}
            onClick={() => setEditingType("weightType")}
          >
            <BiSolidEdit />
            {exerciseState.weightType}
          </button>
        </>
      )}
      {editingType === "name" && (
        <Select
          className=""
          menuIsOpen={true}
          value={
            exerciseState.name
              ? {
                  value: exerciseState.name,
                  label: exerciseState.name,
                }
              : null
          }
          defaultValue={exerciseNameOptions.find(
            (option) => option.value === exerciseState.name
          )}
          options={exerciseNameOptions}
          isSearchable
          onChange={(e) => {
            handleExerciseChange(e?.value || "", "name");
            setEditingType("");
          }}
        />
      )}
      {editingType === "apparatus" && (
        <Select
          className=""
          menuIsOpen={true}
          value={
            exerciseState.apparatus
              ? {
                  value: exerciseState.apparatus,
                  label: exerciseState.apparatus,
                }
              : null
          }
          defaultValue={exerciseApparatusOptions.find(
            (option) => option.value === exerciseState.apparatus
          )}
          options={exerciseApparatusOptions}
          isSearchable
          onChange={(e) => {
            handleExerciseChange(e?.value || "", "apparatus");
            setEditingType("");
          }}
        />
      )}
      {editingType === "weightType" && (
        <Select
          className=""
          menuIsOpen={true}
          value={
            exerciseState.weightType
              ? {
                  value: exerciseState.weightType,
                  label: exerciseState.weightType,
                }
              : null
          }
          defaultValue={weightTypeOptions.find(
            (option) => option.value === exerciseState.weightType
          )}
          options={weightTypeOptions}
          isSearchable
          onChange={(e) => {
            handleExerciseChange(e?.value || "", "weightType");
            setEditingType("");
          }}
        />
      )}
    </div>
  );
};
