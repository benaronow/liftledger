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
import { useEditDayStyles } from "./useEditDayStyles";

interface EditDayProps {
  block: Block;
  editingDay: number;
  setBlock: (block: Block) => void;
  setEditingDay: (day: number) => void;
}

export const EditDay = ({ block, setBlock, editingDay }: EditDayProps) => {
  const { classes } = useEditDayStyles();
  const addRef = useRef<HTMLDivElement>(null);

  const dayGroup = block.weeks[0].days[editingDay].groupName;
  const shouldEditDay = (day: Day) => {
    return dayGroup
      ? block.weeks[0].days
          .filter((day) => day.groupName === dayGroup)
          .map((groupDay) => groupDay.name)
          .includes(day.name)
      : day.name === block.weeks[0].days[editingDay].name;
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
                            ? (e.target.value as unknown as number)
                            : day.exercises[exerciseIdx].sets,
                        reps:
                          type === "reps"
                            ? [e.target.value as unknown as number]
                            : day.exercises[exerciseIdx].reps,
                        weight:
                          type === "weight"
                            ? [e.target.value as unknown as number]
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

  return (
    <div className={classes.container}>
      {block.weeks[0].days[editingDay].exercises.map((exercise, idx) => (
        <div key={idx}>
          <div className={classes.entry}>
            <div className={`${classes.sideButtons} ${classes.leftButtons}`}>
              <div
                className={`${classes.sideButton} ${classes.leftButton} ${classes.sideButtonTopBottom}`}
              />
              <button
                className={`${classes.sideButton} ${classes.sideButtonTopTop} ${
                  idx === 0 ? classes.disabled : classes.enabled
                }`}
                onClick={() => handleMoveExercise(exercise, idx, "up")}
              >
                <ArrowBackIosNew className={classes.moveUpButton} />
              </button>
              <div
                className={`${classes.sideButton} ${classes.leftButton} ${classes.sideButtonBottomBottom}`}
              />
              <button
                className={`${classes.sideButton} ${classes.leftButton} ${
                  classes.sideButtonBottomTop
                } ${
                  idx === block.weeks[0].days[editingDay].exercises.length - 1
                    ? classes.disabled
                    : classes.enabled
                }`}
                onClick={() => handleMoveExercise(exercise, idx, "down")}
              >
                <ArrowBackIosNew className={classes.moveDownButton} />
              </button>
            </div>
            <div className={classes.entryContainer}>
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
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    if (/^\d*$/.test(e.target.value))
                      handleNumberInput(e, idx, "sets");
                  }}
                />
                <span className={classes.entryName}>Reps: </span>
                <Input
                  disabled={
                    block.weeks[0].days[editingDay].exercises[idx].completed
                  }
                  className={classes.numberInput}
                  value={exercise.reps[0]}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    if (/^\d*$/.test(e.target.value))
                      handleNumberInput(e, idx, "reps");
                  }}
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
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    if (/^\d*\.?\d*$/.test(e.target.value))
                      handleNumberInput(e, idx, "weight");
                  }}
                />
                <Select
                  className={classes.weightType}
                  isDisabled={
                    block.weeks[0].days[editingDay].exercises[idx].completed
                  }
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
                  onChange={(e) => handleWeightTypeSelect(e?.value || "", idx)}
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
            <div className={`${classes.sideButtons} ${classes.rightButtons}`}>
              <div
                className={`${classes.sideButton} ${classes.rightButton} ${classes.sideButtonBottom}`}
              />
              <button
                className={`${classes.sideButton} ${classes.rightButton} ${classes.sideButtonTop}`}
                onClick={() => handleRemoveExercise(idx)}
              >
                <DeleteOutline
                  className={`${
                    block.weeks[0].days[editingDay].exercises.length === 1
                      ? classes.disabled
                      : classes.enabled
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      ))}
      <div className={classes.addDayButtonContainer}>
        <div
          className={`${classes.addDayButton} ${classes.addDayButtonBottom}`}
        />
        <div
          className={`${classes.addDayButton} ${classes.addDayButtonTop}`}
          onClick={handleAddExercise}
          ref={addRef}
        >
          <AddCircleOutline />
        </div>
      </div>
    </div>
  );
};
