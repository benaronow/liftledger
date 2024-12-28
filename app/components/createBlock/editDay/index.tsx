import {
  Block,
  Day,
  Exercise,
  ExerciseApparatus,
  ExerciseName,
  WeightType,
} from "@/types";
import { ArrowBackIosNew, DeleteOutline } from "@mui/icons-material";
import { Button, Checkbox, Input } from "@mui/material";
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
    marginTop: "10px",
    width: "100%",
    justifyContent: "center",
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
    display: "flex",
    flex: 1,
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

  return (
    <div className={classes.createBlockContainer}>
      <span>Edit Day</span>
      {block.weeks[0].days[editingDay - 1].exercises.map((exercise, idx) => (
        <div className={classes.entry} key={idx}>
          <div className={classes.moveDayButtons}>
            <div onClick={() => handleMoveExercise(exercise, idx + 1, "up")}>
              <ArrowBackIosNew className={classes.moveUpButton} />
            </div>
            <div onClick={() => handleMoveExercise(exercise, idx + 1, "down")}>
              <ArrowBackIosNew className={classes.moveDownButton} />
            </div>
          </div>
          <div className={classes.entryContainer}>
            <div>
              <div className={classes.entry}>
                <span>Lift: </span>
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
                <span>Use: </span>
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
                  value={exercise.reps[0]}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleNumberInput(e, idx + 1, "reps")
                  }
                />
              </div>
              <div className={classes.entry}>
                <span>Weight: </span>
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
              <div className={classes.entry}>
                <span>Unilateral?</span>
                <Checkbox
                  checked={exercise.unilateral}
                  onChange={() => handleUnilateralChange(idx + 1)}
                />
              </div>
            </div>
          </div>
          <div></div>
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
      ))}
      <Button className={classes.addDayButton} onClick={handleAddExercise}>
        Add Exercise
      </Button>
      <Button className={classes.submitButton} onClick={() => setEditingDay(0)}>
        Save
      </Button>
    </div>
  );
};
