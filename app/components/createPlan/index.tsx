"use client";

import {
  Day,
  Exercise,
  ExerciseApparatus,
  ExerciseName,
  Plan,
  WeightType,
} from "@/types";
import { ArrowBackIosNew, DeleteOutline } from "@mui/icons-material";
import { Box, Button, Checkbox, Input } from "@mui/material";
import { ChangeEvent, FormEvent, useState } from "react";
import Select from "react-select";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()({
  createPlanContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  entry: {
    display: "flex",
    alignItems: "center",
    marginTop: "10px",
    width: "100%",
    justifyContent: "center",
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
    transform: "rotate(90deg)",
    "&:hover": {
      cursor: "pointer",
    },
  },
  moveDownButton: {
    height: "15px",
    transform: "rotate(270deg)",
    "&:hover": {
      cursor: "pointer",
    },
  },
  entryContainer: {
    padding: "10px 10px 10px 10px",
    background: "lightgray",
    borderRadius: "10px 10px 10px 10px",
    marginLeft: "5px",
    marginRight: "5px",
  },
  input: {
    border: "solid",
    borderColor: "gray",
    borderWidth: "1px",
    borderRadius: "5px",
    marginLeft: "5px",
    width: "170px",
    background: 'white',
  },
  editButton: {
    marginLeft: "5px",
  },
  removeButton: {
    "&:hover": {
      cursor: "pointer",
    },
  },
  disabled: {
    color: "lightgray",
  },
  addDayButton: {
    marginTop: "10px",
    border: "solid",
    borderWidth: "1px",
  },
  submitButton: {
    marginTop: "10px",
    border: "solid",
    borderWidth: "1px",
  },
  stopEditingButton: {
    marginRight: "10px",
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
    width: "35px",
    height: "38px",
    background: "white",
  },
  weightInput: {
    marginLeft: "5px",
    border: "solid",
    borderColor: "gray",
    borderWidth: "1px",
    borderRadius: "5px 0px 0px 5px",
    width: "45px",
    height: "38px",
    background: "white",
  },
  checkbox: {},
});

const boxStyle = {
  position: "absolute",
  top: "15%",
  right: "50%",
  transform: "translate(50%)",
  background: "white",
  outline: 0,
  border: "solid",
  borderColor: "lightgray",
  borderRadius: "25px",
  padding: "10px 10px 10px 10px",
};

export const CreatePlan = () => {
  const { classes } = useStyles();

  const [plan, setPlan] = useState<Plan>({
    name: "",
    days: [
      {
        name: "Day 1",
        exercises: [
          {
            name: "",
            apparatus: "",
            musclesWorked: [],
            sets: 0,
            reps: 0,
            weight: 0,
            weightType: WeightType.Pounds,
            unilateral: false,
            previousSessionNote: "",
          },
        ],
      },
    ],
  });
  const [editingDay, setEditingDay] = useState(0);

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

  const handlePlanNameInput = (e: ChangeEvent<HTMLInputElement>) => {
    setPlan({ ...plan, name: e.target.value });
  };

  const handleDayNameInput = (
    e: ChangeEvent<HTMLInputElement>,
    dayNumber: number
  ) => {
    const newDay: Day = {
      name: e.target.value,
      exercises: plan.days[dayNumber - 1].exercises,
    };
    const newDays: Day[] = plan.days.toSpliced(dayNumber - 1, 1, newDay);
    setPlan({ ...plan, days: newDays });
  };

  const handleExerciseNameSelect = (
    name: ExerciseName | string,
    exerciseNumber: number
  ) => {
    const day = plan.days[editingDay - 1];
    const newExercise: Exercise = {
      ...day.exercises[exerciseNumber - 1],
      name,
    };
    const newExercises: Exercise[] = day.exercises.toSpliced(
      exerciseNumber - 1,
      1,
      newExercise
    );
    const newDays: Day[] = plan.days.toSpliced(editingDay - 1, 1, {
      ...day,
      exercises: newExercises,
    });
    setPlan({ ...plan, days: newDays });
  };

  const handleExerciseApparatusSelect = (
    apparatus: ExerciseApparatus | string,
    exerciseNumber: number
  ) => {
    const day = plan.days[editingDay - 1];
    const newExercise: Exercise = {
      ...day.exercises[exerciseNumber - 1],
      apparatus,
    };
    const newExercises: Exercise[] = day.exercises.toSpliced(
      exerciseNumber - 1,
      1,
      newExercise
    );
    const newDays: Day[] = plan.days.toSpliced(editingDay - 1, 1, {
      ...day,
      exercises: newExercises,
    });
    setPlan({ ...plan, days: newDays });
  };

  const handleAddDay = () => {
    const dayNumber = plan.days.length + 1;
    const newDay: Day = {
      name: `Day ${dayNumber}`,
      exercises: [
        {
          name: "",
          apparatus: "",
          musclesWorked: [],
          sets: 0,
          reps: 0,
          weight: 0,
          weightType: WeightType.Pounds,
          unilateral: false,
          previousSessionNote: "",
        },
      ],
    };
    setPlan({ ...plan, days: [...plan.days, newDay] });
  };

  const handleAddExercise = () => {
    const day = plan.days[editingDay - 1];
    const newExercise: Exercise = {
      name: "",
      apparatus: "",
      musclesWorked: [],
      sets: 0,
      reps: 0,
      weight: 0,
      weightType: WeightType.Pounds,
      unilateral: false,
      previousSessionNote: "",
    };
    const newDays: Day[] = plan.days.toSpliced(editingDay - 1, 1, {
      ...day,
      exercises: [...day.exercises, newExercise],
    });
    setPlan({ ...plan, days: newDays });
  };

  const handleEditDay = (dayNumber: number) => {
    setEditingDay(dayNumber);
  };

  const handleRemoveDay = (dayNumber: number) => {
    const newDays: Day[] = plan.days.toSpliced(dayNumber - 1, 1);
    if (plan.days.length > 1) setPlan({ ...plan, days: newDays });
  };

  const handleRemoveExercise = (exerciseNumber: number) => {
    const day = plan.days[editingDay - 1];
    const newExercises: Exercise[] = day.exercises.toSpliced(
      exerciseNumber - 1,
      1
    );
    const newDays: Day[] = plan.days.toSpliced(editingDay - 1, 1, {
      ...day,
      exercises: newExercises,
    });
    if (day.exercises.length > 1) setPlan({ ...plan, days: newDays });
  };

  const handleMoveDay = (day: Day, dayNumber: number, type: "up" | "down") => {
    const withoutDay: Day[] = plan.days.toSpliced(dayNumber - 1, 1);
    const newDays: Day[] = withoutDay.toSpliced(
      type === "up" ? dayNumber - 2 : dayNumber,
      0,
      day
    );
    setPlan({ ...plan, days: newDays });
  };

  const handleMoveExercise = (
    exercise: Exercise,
    exerciseNumber: number,
    type: "up" | "down"
  ) => {
    const day = plan.days[editingDay - 1];
    const withoutExercise: Exercise[] = day.exercises.toSpliced(
      exerciseNumber - 1,
      1
    );
    const newExercises: Exercise[] = withoutExercise.toSpliced(
      type === "up" ? exerciseNumber - 2 : exerciseNumber,
      0,
      exercise
    );
    const newDays: Day[] = plan.days.toSpliced(editingDay - 1, 1, {
      ...day,
      exercises: newExercises,
    });
    setPlan({ ...plan, days: newDays });
  };

  const handleNumberInput = (
    e: ChangeEvent<HTMLInputElement>,
    exerciseNumber: number,
    type: string
  ) => {
    const day = plan.days[editingDay - 1];
    const newExercise: Exercise = {
      ...day.exercises[exerciseNumber - 1],
      sets:
        type === "sets"
          ? parseInt(e.target.value) || 0
          : day.exercises[exerciseNumber - 1].sets,
      reps:
        type === "reps"
          ? parseInt(e.target.value) || 0
          : day.exercises[exerciseNumber - 1].reps,
      weight:
        type === "weight"
          ? parseInt(e.target.value) || 0
          : day.exercises[exerciseNumber - 1].weight,
    };
    const newExercises: Exercise[] = day.exercises.toSpliced(
      exerciseNumber - 1,
      1,
      newExercise
    );
    const newDays: Day[] = plan.days.toSpliced(editingDay - 1, 1, {
      ...day,
      exercises: newExercises,
    });
    setPlan({ ...plan, days: newDays });
  };

  const handleWeightTypeSelect = (
    weightType: WeightType | string,
    exerciseNumber: number
  ) => {
    const day = plan.days[editingDay - 1];
    const newExercise: Exercise = {
      ...day.exercises[exerciseNumber - 1],
      weightType,
    };
    const newExercises: Exercise[] = day.exercises.toSpliced(
      exerciseNumber - 1,
      1,
      newExercise
    );
    const newDays: Day[] = plan.days.toSpliced(editingDay - 1, 1, {
      ...day,
      exercises: newExercises,
    });
    setPlan({ ...plan, days: newDays });
  };

  const handleUnilateralChange = (exerciseNumber: number) => {
    const day = plan.days[editingDay - 1];
    const newExercise: Exercise = {
      ...day.exercises[exerciseNumber - 1],
      unilateral: !day.exercises[exerciseNumber - 1].unilateral,
    };
    const newExercises: Exercise[] = day.exercises.toSpliced(
      exerciseNumber - 1,
      1,
      newExercise
    );
    const newDays: Day[] = plan.days.toSpliced(editingDay - 1, 1, {
      ...day,
      exercises: newExercises,
    });
    setPlan({ ...plan, days: newDays });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <Box sx={boxStyle}>
      {editingDay === 0 ? (
        <form className={classes.createPlanContainer} onSubmit={handleSubmit}>
          <span>Create Plan</span>
          <div className={classes.entry}>
            <span>Plan Name: </span>
            <Input
              className={classes.input}
              value={plan.name}
              onChange={handlePlanNameInput}
            ></Input>
          </div>
          {plan.days.map((day, idx) => (
            <div className={classes.entry} key={idx}>
              <div className={classes.moveDayButtons}>
                <div onClick={() => handleMoveDay(day, idx + 1, "up")}>
                  <ArrowBackIosNew className={classes.moveUpButton} />
                </div>
                <div onClick={() => handleMoveDay(day, idx + 1, "down")}>
                  <ArrowBackIosNew className={classes.moveDownButton} />
                </div>
              </div>
              <div className={classes.entryContainer}>
                <Input
                  className={classes.input}
                  value={day.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleDayNameInput(e, idx + 1)
                  }
                ></Input>
                <Button
                  className={classes.editButton}
                  onClick={() => handleEditDay(idx + 1)}
                >
                  Edit
                </Button>
              </div>
              <div onClick={() => handleRemoveDay(idx + 1)}>
                <DeleteOutline
                  className={`${
                    plan.days.length > 1
                      ? classes.removeButton
                      : classes.disabled
                  }`}
                />
              </div>
            </div>
          ))}
          {plan.days.length < 7 && (
            <Button className={classes.addDayButton} onClick={handleAddDay}>
              Add Day
            </Button>
          )}
          <Button className={classes.submitButton} type="submit">
            Save
          </Button>
        </form>
      ) : (
        <div className={classes.createPlanContainer}>
          <span>Edit Day</span>
          {plan.days[editingDay - 1].exercises.map((exercise, idx) => (
            <div className={classes.entry} key={idx}>
              <div className={classes.moveDayButtons}>
                <div
                  onClick={() => handleMoveExercise(exercise, idx + 1, "up")}
                >
                  <ArrowBackIosNew className={classes.moveUpButton} />
                </div>
                <div
                  onClick={() => handleMoveExercise(exercise, idx + 1, "down")}
                >
                  <ArrowBackIosNew className={classes.moveDownButton} />
                </div>
              </div>
              <div className={classes.entryContainer}>
                <div className={classes.entry}>
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
                      handleExerciseNameSelect(e?.value || "", idx + 1)
                    }
                  />
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
                      handleExerciseApparatusSelect(e?.value || "", idx + 1)
                    }
                  />
                </div>
                <div className={classes.entry}>
                  <span>Sets: </span>
                  <Input
                    className={classes.numberInput}
                    value={exercise.sets}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleNumberInput(e, idx + 1, "sets")
                    }
                  />
                  <span>Reps: </span>
                  <Input
                    className={classes.numberInput}
                    value={exercise.reps}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleNumberInput(e, idx + 1, "reps")
                    }
                  />
                  <span>Weight: </span>
                  <Input
                    className={classes.weightInput}
                    value={exercise.weight}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleNumberInput(e, idx + 1, "weight")
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
                      handleWeightTypeSelect(e?.value || "", idx + 1)
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
                <div className={classes.entry}>
                  <span>Unilateral?</span>
                  <Checkbox
                    className={classes.checkbox}
                    checked={exercise.unilateral}
                    onChange={() => handleUnilateralChange(idx + 1)}
                  />
                </div>
              </div>
              <div></div>
              <div onClick={() => handleRemoveExercise(idx + 1)}>
                <DeleteOutline
                  className={`${
                    plan.days[editingDay - 1].exercises.length > 1
                      ? classes.removeButton
                      : classes.disabled
                  }`}
                />
              </div>
            </div>
          ))}
          <Button className={classes.addDayButton} onClick={handleAddExercise}>
            Add Exercise
          </Button>
          <Button
            className={classes.submitButton}
            onClick={() => setEditingDay(0)}
          >
            Save
          </Button>
        </div>
      )}
    </Box>
  );
};
