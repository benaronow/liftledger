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
import { ChangeEvent } from "react";
import Select from "react-select";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()({
  createBlockContainer: {
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
  uniEntry: {
    margin: "-10px 0px -10px 0px",
  },
  entryName: {
    fontFamily: "Gabarito",
    fontWeight: 600,
    fontSize: "16px",
  },
  entryDivider: {
    width: "100%",
    height: "1.5px",
    background: "#0096FF",
    marginBottom: "10px",
  },
  exercise: {
    justifyContent: "space-between",
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
  },
  submitButton: {
    marginTop: "10px",
    border: "solid",
    borderWidth: "1px",
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
  },
  backButton: {
    fontFamily: "Gabarito",
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
    exerciseNumber: number,
    type: "up" | "down"
  ) => {
    const day = block.weeks[0].days[editingDay - 1];
    const withoutExercise: Exercise[] = day.exercises.toSpliced(
      exerciseNumber - 1,
      1
    );
    const newExercises: Exercise[] = withoutExercise.toSpliced(
      type === "up" ? exerciseNumber - 2 : exerciseNumber,
      0,
      exercise
    );
    const newDays: Day[] = block.weeks[0].days.toSpliced(editingDay - 1, 1, {
      ...day,
      exercises: newExercises,
    });
    setBlock({ ...block, weeks: [{ number: 1, days: newDays }] });
  };

  const handleExerciseNameSelect = (
    name: ExerciseName | string,
    exerciseNumber: number
  ) => {
    const day = block.weeks[0].days[editingDay - 1];
    const newExercise: Exercise = {
      ...day.exercises[exerciseNumber - 1],
      name,
    };
    const newExercises: Exercise[] = day.exercises.toSpliced(
      exerciseNumber - 1,
      1,
      newExercise
    );
    const newDays: Day[] = block.weeks[0].days.toSpliced(editingDay - 1, 1, {
      ...day,
      exercises: newExercises,
    });
    setBlock({ ...block, weeks: [{ number: 1, days: newDays }] });
  };

  const handleExerciseApparatusSelect = (
    apparatus: ExerciseApparatus | string,
    exerciseNumber: number
  ) => {
    const day = block.weeks[0].days[editingDay - 1];
    const newExercise: Exercise = {
      ...day.exercises[exerciseNumber - 1],
      apparatus,
    };
    const newExercises: Exercise[] = day.exercises.toSpliced(
      exerciseNumber - 1,
      1,
      newExercise
    );
    const newDays: Day[] = block.weeks[0].days.toSpliced(editingDay - 1, 1, {
      ...day,
      exercises: newExercises,
    });
    setBlock({ ...block, weeks: [{ number: 1, days: newDays }] });
  };

  const handleWeightTypeSelect = (
    weightType: WeightType | string,
    exerciseNumber: number
  ) => {
    const day = block.weeks[0].days[editingDay - 1];
    const newExercise: Exercise = {
      ...day.exercises[exerciseNumber - 1],
      weightType,
    };
    const newExercises: Exercise[] = day.exercises.toSpliced(
      exerciseNumber - 1,
      1,
      newExercise
    );
    const newDays: Day[] = block.weeks[0].days.toSpliced(editingDay - 1, 1, {
      ...day,
      exercises: newExercises,
    });
    setBlock({ ...block, weeks: [{ number: 1, days: newDays }] });
  };

  const handleNumberInput = (
    e: ChangeEvent<HTMLInputElement>,
    exerciseNumber: number,
    type: string
  ) => {
    if (type === "length") {
      setBlock({ ...block, length: parseInt(e.target.value) || 0 });
    } else {
      const day = block.weeks[0].days[editingDay - 1];
      const newExercise: Exercise = {
        ...day.exercises[exerciseNumber - 1],
        sets:
          type === "sets"
            ? parseInt(e.target.value) || 0
            : day.exercises[exerciseNumber - 1].sets,
        reps:
          type === "reps"
            ? [parseInt(e.target.value) || 0]
            : day.exercises[exerciseNumber - 1].reps,
        weight:
          type === "weight"
            ? [parseInt(e.target.value) || 0]
            : day.exercises[exerciseNumber - 1].weight,
      };
      const newExercises: Exercise[] = day.exercises.toSpliced(
        exerciseNumber - 1,
        1,
        newExercise
      );
      const newDays: Day[] = block.weeks[0].days.toSpliced(editingDay - 1, 1, {
        ...day,
        exercises: newExercises,
      });
      setBlock({ ...block, weeks: [{ number: 1, days: newDays }] });
    }
  };

  const handleUnilateralChange = (exerciseNumber: number) => {
    const day = block.weeks[0].days[editingDay - 1];
    const newExercise: Exercise = {
      ...day.exercises[exerciseNumber - 1],
      unilateral: !day.exercises[exerciseNumber - 1].unilateral,
    };
    const newExercises: Exercise[] = day.exercises.toSpliced(
      exerciseNumber - 1,
      1,
      newExercise
    );
    const newDays: Day[] = block.weeks[0].days.toSpliced(editingDay - 1, 1, {
      ...day,
      exercises: newExercises,
    });
    setBlock({ ...block, weeks: [{ number: 1, days: newDays }] });
  };

  const handleAddExercise = () => {
    const day = block.weeks[0].days[editingDay - 1];
    const newExercise: Exercise = {
      name: "",
      apparatus: "",
      musclesWorked: [],
      sets: 0,
      reps: [0],
      weight: [0],
      weightType: WeightType.Pounds,
      unilateral: false,
      prevSessionNote: "",
    };
    const newDays: Day[] = block.weeks[0].days.toSpliced(editingDay - 1, 1, {
      ...day,
      exercises: [...day.exercises, newExercise],
    });
    setBlock({ ...block, weeks: [{ number: 1, days: newDays }] });
  };

  const handleRemoveExercise = (exerciseNumber: number) => {
    const day = block.weeks[0].days[editingDay - 1];
    const newExercises: Exercise[] = day.exercises.toSpliced(
      exerciseNumber - 1,
      1
    );
    const newDays: Day[] = block.weeks[0].days.toSpliced(editingDay - 1, 1, {
      ...day,
      exercises: newExercises,
    });
    if (day.exercises.length > 1)
      setBlock({ ...block, weeks: [{ number: 1, days: newDays }] });
  };

  const handleGoBack = () => {
    setEditingDay(0);
  };

  return (
    <div className={classes.createBlockContainer}>
      <div className={classes.goBack} onClick={handleGoBack}>
        <ArrowBackIosNew className={classes.backArrow}></ArrowBackIosNew>
        <span className={classes.backButton}>Go Back</span>
      </div>
      <div className={classes.entryDivider}></div>
      {block.weeks[0].days[editingDay - 1].exercises.map((exercise, idx) => (
        <>
          <div className={classes.entry} key={idx}>
            <div className={classes.moveDayButtons}>
              <div onClick={() => handleMoveExercise(exercise, idx + 1, "up")}>
                <ArrowBackIosNew className={classes.moveUpButton} />
              </div>
              <div
                onClick={() => handleMoveExercise(exercise, idx + 1, "down")}
              >
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
                      handleExerciseNameSelect(e?.value || "", idx + 1)
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
                      handleExerciseApparatusSelect(e?.value || "", idx + 1)
                    }
                  />
                </div>
                <div className={classes.entry}>
                  <span className={classes.entryName}>Sets: </span>
                  <Input
                    className={classes.numberInput}
                    value={exercise.sets}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleNumberInput(e, idx + 1, "sets")
                    }
                  />
                  <span className={classes.entryName}>Reps: </span>
                  <Input
                    className={classes.numberInput}
                    value={exercise.reps[0]}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleNumberInput(e, idx + 1, "reps")
                    }
                  />
                </div>
                <div className={classes.entry}>
                  <span className={classes.entryName}>Weight: </span>
                  <Input
                    className={classes.weightInput}
                    value={exercise.weight[0]}
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
                <div className={`${classes.entry} ${classes.uniEntry}`}>
                  <span className={classes.entryName}>Unilateral?</span>
                  <Checkbox
                    checked={exercise.unilateral}
                    onChange={() => handleUnilateralChange(idx + 1)}
                  />
                </div>
              </div>
            </div>
            <div onClick={() => handleRemoveExercise(idx + 1)}>
              <DeleteOutline
                className={`${
                  block.weeks[0].days[editingDay - 1].exercises.length > 1
                    ? classes.removeButton
                    : classes.disabled
                }`}
              />
            </div>
          </div>
          <div className={classes.entryDivider}></div>
        </>
      ))}
      <div className={classes.addExerciseButton} onClick={handleAddExercise}>
        <AddCircleOutline style={{ color: "#0096FF" }}></AddCircleOutline>
      </div>
    </div>
  );
};
