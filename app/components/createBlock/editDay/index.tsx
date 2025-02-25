import {
  Block,
  Day,
  Exercise,
  ExerciseApparatus,
  ExerciseName,
  WeightType,
} from "@/types";
import {
  AddCircleOutline,
  ArrowBackIosNew,
  DeleteOutline,
} from "@mui/icons-material";
import { Checkbox, Input } from "@mui/material";
import { ChangeEvent, useEffect, useRef } from "react";
import Select from "react-select";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  entry: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
    width: "100%",
    justifyContent: "center",
  },
  entriesContainer: {
    width: "100%",
  },
  uniEntry: {
    margin: "-10px 0px -10px 0px",
  },
  entryName: {
    fontFamily: "League+Spartan",
    fontWeight: 600,
    fontSize: "16px",
  },
  entryDivider: {
    width: "100%",
    height: "2px",
    background: "#0096FF",
    marginBottom: "10px",
  },
  moveDayButtons: {
    display: "flex",
    flexDirection: "column",
    height: "50px",
    justifyContent: "center",
    alignItems: "center",
  },
  moveUpButton: {
    height: "15px",
    color: "#0096FF",
    transform: "rotate(90deg)",
    "&:hover": {
      cursor: "pointer",
    },
  },
  moveDownButton: {
    height: "15px",
    color: "#0096FF",
    transform: "rotate(270deg)",
    "&:hover": {
      cursor: "pointer",
    },
  },
  entryContainer: {
    display: "flex",
    flex: 1,
    padding: "10px 10px 10px 10px",
    background: "lightgray",
    borderRadius: "10px 10px 10px 10px",
    marginLeft: "5px",
    marginRight: "5px",
  },
  entryColumn: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  input: {
    border: "solid",
    borderColor: "gray",
    borderWidth: "1px",
    borderRadius: "5px",
    marginLeft: "5px",
    width: "100%",
    background: "white",
  },
  removeButton: {
    "&:hover": {
      cursor: "pointer",
    },
  },
  disabled: {
    color: "lightgray",
  },
  addExerciseButton: {
    color: "blue",
    marginBottom: "-5px",
    "&:hover": {
      cursor: "pointer",
    },
  },
  numberInput: {
    marginLeft: "5px",
    marginRight: "5px",
    border: "solid",
    borderColor: "gray",
    borderWidth: "1px",
    borderRadius: "5px",
    width: "100%",
    height: "38px",
    paddingLeft: "5px",
    background: "white",
  },
  weightInput: {
    marginLeft: "5px",
    border: "solid",
    borderColor: "gray",
    borderWidth: "1px",
    borderRadius: "5px 0px 0px 5px",
    width: "100%",
    height: "38px",
    paddingLeft: "5px",
    background: "white",
  },
  goBack: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
    "&:hover": {
      cursor: "pointer",
    },
  },
  backButton: {
    fontFamily: "League+Spartan",
    fontWeight: 600,
    fontSize: "16px",
    color: "#0096FF",
  },
  backArrow: {
    height: "15px",
    color: "#0096FF",
  },
});

interface EditDayProps {
  block: Block;
  editingDay: number;
  setBlock: (block: Block) => void;
  setEditingDay: (day: number) => void;
}

export const EditDay = ({
  block,
  setBlock,
  editingDay,
  setEditingDay,
}: EditDayProps) => {
  const { classes } = useStyles();
  const addRef = useRef<HTMLDivElement>(null);

  const dayGroup = block.weeks[0].days[editingDay].groupName;
  const shouldEditDay = (day: Day) => {
    return (
      day.hasGroup &&
      block.weeks[0].days
        .filter((day) => day.groupName === dayGroup)
        .map((groupDay) => groupDay.name)
        .includes(day.name)
    );
  };

  useEffect(() => {
    if (addRef.current)
      addRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }, [block.weeks[0].days[editingDay].exercises.length]);

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

  const handleMoveExercise = (
    exercise: Exercise,
    exerciseIdx: number,
    type: "up" | "down"
  ) => {
    setBlock({
      ...block,
      weeks: block.weeks.map((week) => ({
        ...week,
        days: week.days.map((day) =>
          shouldEditDay(day)
            ? {
                ...day,
                exercises: day.exercises
                  .toSpliced(exerciseIdx, 1)
                  .toSpliced(
                    type === "up" ? exerciseIdx - 1 : exerciseIdx + 1,
                    0,
                    exercise
                  ),
              }
            : day
        ),
      })),
    });
  };

  const handleExerciseNameSelect = (
    name: ExerciseName | string,
    exerciseIdx: number
  ) => {
    setBlock({
      ...block,
      weeks: block.weeks.map((week) => ({
        ...week,
        days: week.days.map((day) =>
          shouldEditDay(day)
            ? {
                ...day,
                exercises: day.exercises.map((exercise, eIdx) =>
                  exerciseIdx === eIdx
                    ? {
                        ...exercise,
                        name,
                      }
                    : exercise
                ),
              }
            : day
        ),
      })),
    });
  };

  const handleExerciseApparatusSelect = (
    apparatus: ExerciseApparatus | string,
    exerciseIdx: number
  ) => {
    setBlock({
      ...block,
      weeks: block.weeks.map((week) => ({
        ...week,
        days: week.days.map((day) =>
          shouldEditDay(day)
            ? {
                ...day,
                exercises: day.exercises.map((exercise, eIdx) =>
                  exerciseIdx === eIdx
                    ? {
                        ...exercise,
                        apparatus,
                      }
                    : exercise
                ),
              }
            : day
        ),
      })),
    });
  };

  const handleWeightTypeSelect = (
    weightType: WeightType | string,
    exerciseIdx: number
  ) => {
    setBlock({
      ...block,
      weeks: block.weeks.map((week) => ({
        ...week,
        days: week.days.map((day) =>
          shouldEditDay(day)
            ? {
                ...day,
                exercises: day.exercises.map((exercise, eIdx) =>
                  exerciseIdx === eIdx
                    ? {
                        ...exercise,
                        weightType,
                      }
                    : exercise
                ),
              }
            : day
        ),
      })),
    });
  };

  const handleNumberInput = (
    e: ChangeEvent<HTMLInputElement>,
    exerciseIdx: number,
    type: string
  ) => {
    setBlock({
      ...block,
      weeks: block.weeks.map((week) => ({
        ...week,
        days: week.days.map((day) =>
          shouldEditDay(day)
            ? {
                ...day,
                exercises: day.exercises.map((exercise, eIdx) =>
                  exerciseIdx === eIdx
                    ? {
                        ...exercise,
                        sets:
                          type === "sets"
                            ? parseInt(e.target.value) || 0
                            : day.exercises[exerciseIdx].sets,
                        reps:
                          type === "reps"
                            ? [parseInt(e.target.value) || 0]
                            : day.exercises[exerciseIdx].reps,
                        weight:
                          type === "weight"
                            ? [parseInt(e.target.value) || 0]
                            : day.exercises[exerciseIdx].weight,
                      }
                    : exercise
                ),
              }
            : day
        ),
      })),
    });
  };

  const handleUnilateralChange = (exerciseIdx: number) => {
    setBlock({
      ...block,
      weeks: block.weeks.map((week) => ({
        ...week,
        days: week.days.map((day) =>
          shouldEditDay(day)
            ? {
                ...day,
                exercises: day.exercises.map((exercise, eIdx) =>
                  exerciseIdx === eIdx
                    ? {
                        ...exercise,
                        unilateral: !exercise.unilateral,
                      }
                    : exercise
                ),
              }
            : day
        ),
      })),
    });
  };

  const handleAddExercise = () => {
    const newExercise: Exercise = {
      name: "",
      apparatus: "",
      sets: 0,
      reps: [0],
      weight: [0],
      weightType: WeightType.Pounds,
      unilateral: false,
      note: "",
      completed: false,
    };
    setBlock({
      ...block,
      weeks: block.weeks.map((week) => ({
        ...week,
        days: week.days.map((day) =>
          shouldEditDay(day)
            ? {
                ...day,
                exercises: [...day.exercises, newExercise],
              }
            : day
        ),
      })),
    });
  };

  const handleRemoveExercise = (exerciseIdx: number) => {
    if (block.weeks[0].days[editingDay].exercises.length > 1)
      setBlock({
        ...block,
        weeks: block.weeks.map((week) => ({
          ...week,
          days: week.days.map((day) =>
            shouldEditDay(day)
              ? {
                  ...day,
                  exercises: day.exercises.toSpliced(exerciseIdx, 1),
                }
              : day
          ),
        })),
      });
  };

  const handleGoBack = () => {
    setEditingDay(-1);
  };

  return (
    <div className={classes.container}>
      <div className={classes.goBack} onClick={handleGoBack}>
        <ArrowBackIosNew className={classes.backArrow}></ArrowBackIosNew>
        <span className={classes.backButton}>Go Back</span>
      </div>
      {block.weeks[0].days[editingDay].exercises.map((exercise, idx) => (
        <div className={classes.container} key={idx}>
          {idx > 0 && <div className={classes.entryDivider} />}
          <div className={classes.entriesContainer}>
            <div className={classes.entry}>
              <div className={classes.moveDayButtons}>
                <div onClick={() => handleMoveExercise(exercise, idx, "up")}>
                  <ArrowBackIosNew className={classes.moveUpButton} />
                </div>
                <div onClick={() => handleMoveExercise(exercise, idx, "down")}>
                  <ArrowBackIosNew className={classes.moveDownButton} />
                </div>
              </div>
              <div className={classes.entryContainer}>
                <div className={classes.entryColumn}>
                  <div className={classes.entry}>
                    <span className={classes.entryName}>Lift: </span>
                    <Select
                      className={classes.input}
                      value={
                        exercise.name
                          ? { value: exercise.name, label: exercise.name }
                          : null
                      }
                      defaultValue={exerciseNameOptions[0]}
                      options={exerciseNameOptions}
                      isSearchable
                      onChange={(e) =>
                        handleExerciseNameSelect(e?.value || "", idx)
                      }
                    />
                  </div>
                  <div className={classes.entry}>
                    <span className={classes.entryName}>Use: </span>
                    <Select
                      className={classes.input}
                      value={
                        exercise.apparatus
                          ? {
                              value: exercise.apparatus,
                              label: exercise.apparatus,
                            }
                          : null
                      }
                      defaultValue={exerciseApparatusOptions[0]}
                      options={exerciseApparatusOptions}
                      isSearchable
                      onChange={(e) =>
                        handleExerciseApparatusSelect(e?.value || "", idx)
                      }
                    />
                  </div>
                  <div className={classes.entry}>
                    <span className={classes.entryName}>Sets: </span>
                    <Input
                      disabled={
                        block.weeks[0].days[editingDay].exercises[idx].completed
                      }
                      className={classes.numberInput}
                      value={exercise.sets}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleNumberInput(e, idx, "sets")
                      }
                    />
                    <span className={classes.entryName}>Reps: </span>
                    <Input
                      disabled={
                        block.weeks[0].days[editingDay].exercises[idx].completed
                      }
                      className={classes.numberInput}
                      value={exercise.reps[0]}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleNumberInput(e, idx, "reps")
                      }
                    />
                  </div>
                  <div className={classes.entry}>
                    <span className={classes.entryName}>Weight: </span>
                    <Input
                      disabled={
                        block.weeks[0].days[editingDay].exercises[idx].completed
                      }
                      className={classes.weightInput}
                      value={exercise.weight[0]}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleNumberInput(e, idx, "weight")
                      }
                    />
                    <Select
                      value={
                        exercise.weightType
                          ? {
                              value: exercise.weightType,
                              label: exercise.weightType,
                            }
                          : null
                      }
                      defaultValue={weightTypeOptions[0]}
                      options={weightTypeOptions}
                      onChange={(e) =>
                        handleWeightTypeSelect(e?.value || "", idx)
                      }
                      styles={{
                        control: (basestyles) => ({
                          ...basestyles,
                          height: "38px",
                          borderColor: "gray",
                          borderRadius: "0px 5px 5px 0px",
                        }),
                      }}
                    />
                  </div>
                  <div className={`${classes.entry} ${classes.uniEntry}`}>
                    <span className={classes.entryName}>Unilateral?</span>
                    <Checkbox
                      checked={exercise.unilateral}
                      onChange={() => handleUnilateralChange(idx)}
                    />
                  </div>
                </div>
              </div>
              <div onClick={() => handleRemoveExercise(idx)}>
                <DeleteOutline
                  className={`${
                    block.weeks[0].days[editingDay].exercises.length > 1
                      ? classes.removeButton
                      : classes.disabled
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
      <div
        className={classes.addExerciseButton}
        onClick={handleAddExercise}
        ref={addRef}
      >
        <AddCircleOutline style={{ color: "#0096FF" }}></AddCircleOutline>
      </div>
    </div>
  );
};
