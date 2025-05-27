import {
  Block,
  Day,
  Exercise,
  ExerciseApparatus,
  ExerciseName,
  Set,
  WeightType,
} from "@/types";
import {
  AddCircleOutline,
  ArrowBackIosNew,
  DeleteOutline,
} from "@mui/icons-material";
import { Input } from "@mui/material";
import { ChangeEvent } from "react";
import Select from "react-select";
import { useEditDayStyles } from "./useEditDayStyles";
import { useCreateBlockStyles } from "../useCreateBlockStyles";
import { useSelector } from "react-redux";
import {
  selectCurBlock,
  selectEditingBlock,
} from "@/lib/features/user/userSlice";

interface EditDayProps {
  block: Block;
  setBlock: (block: Block) => void;
  editingDay: number;
  setEditingDay: (day: number) => void;
}

export const EditDay = ({
  block,
  setBlock,
  editingDay,
  setEditingDay,
}: EditDayProps) => {
  const { classes } = useEditDayStyles();
  const { classes: createBlockClasses } = useCreateBlockStyles();
  const curBlock = useSelector(selectCurBlock);
  const editingBlock = useSelector(selectEditingBlock);
  const editingWeekIdx = editingBlock ? curBlock?.curWeekIdx || 0 : 0;

  const shouldEditDay = (day: Day) => {
    return day.name === block.weeks[editingWeekIdx][editingDay].name;
  };

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
      weeks: block.weeks.map((week, idx) =>
        idx === editingWeekIdx
          ? week.map((day) =>
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
            )
          : week
      ),
    });
  };

  const handleExerciseNameSelect = (name: string, exerciseIdx: number) => {
    setBlock({
      ...block,
      weeks: block.weeks.map((week, idx) =>
        idx === editingWeekIdx
          ? week.map((day) =>
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
            )
          : week
      ),
    });
  };

  const handleExerciseApparatusSelect = (
    apparatus: string,
    exerciseIdx: number
  ) => {
    setBlock({
      ...block,
      weeks: block.weeks.map((week, idx) =>
        idx === editingWeekIdx
          ? week.map((day) =>
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
            )
          : week
      ),
    });
  };

  const handleWeightTypeSelect = (weightType: string, exerciseIdx: number) => {
    setBlock({
      ...block,
      weeks: block.weeks.map((week, idx) =>
        idx === editingWeekIdx
          ? week.map((day) =>
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
            )
          : week
      ),
    });
  };

  const handleNumberInput = (
    e: ChangeEvent<HTMLInputElement>,
    exerciseIdx: number,
    type: "sets" | "reps" | "weight"
  ) => {
    setBlock({
      ...block,
      weeks: block.weeks.map((week, idx) =>
        idx === editingWeekIdx
          ? week.map((day) =>
              shouldEditDay(day)
                ? {
                    ...day,
                    exercises: day.exercises.map((exercise, eIdx) =>
                      exerciseIdx === eIdx
                        ? {
                            ...exercise,
                            sets:
                              type === "sets"
                                ? parseInt(e.target.value) <
                                  exercise.sets.length
                                  ? exercise.sets.slice(
                                      0,
                                      parseInt(e.target.value)
                                    )
                                  : exercise.sets.concat(
                                      Array<Set>(
                                        parseInt(e.target.value) -
                                          exercise.sets.length
                                      ).fill(
                                        exercise.sets[
                                          exercise.sets.length - 1
                                        ] || {
                                          reps: 0,
                                          weight: 0,
                                          completed: false,
                                          note: "",
                                        }
                                      )
                                    )
                                : exercise.sets.map((set: Set) => ({
                                    ...set,
                                    reps:
                                      type === "reps"
                                        ? parseInt(e.target.value) || 0
                                        : set.reps,
                                    weight:
                                      type === "weight"
                                        ? parseFloat(e.target.value) || 0
                                        : set.weight,
                                  })),
                          }
                        : exercise
                    ),
                  }
                : day
            )
          : week
      ),
    });
  };

  const handleAddExercise = () => {
    const newExercise: Exercise = {
      name: "",
      apparatus: "",
      sets: [
        {
          reps: 0,
          weight: 0,
          completed: false,
          note: "",
        },
      ],
      weightType: WeightType.Pounds,
    };

    setBlock({
      ...block,
      weeks: block.weeks.map((week, idx) =>
        idx === editingWeekIdx
          ? week.map((day) =>
              shouldEditDay(day)
                ? {
                    ...day,
                    exercises: [...day.exercises, newExercise],
                  }
                : day
            )
          : week
      ),
    });
  };

  const handleRemoveExercise = (exerciseIdx: number) => {
    if (block.weeks[editingWeekIdx][editingDay].exercises.length > 1)
      setBlock({
        ...block,
        weeks: block.weeks.map((week, idx) =>
          idx === editingWeekIdx
            ? week.map((day) =>
                shouldEditDay(day)
                  ? {
                      ...day,
                      exercises: day.exercises.toSpliced(exerciseIdx, 1),
                    }
                  : day
              )
            : week
        ),
      });
  };

  return (
    <div className={classes.container}>
      {block.weeks[editingWeekIdx][editingDay].exercises.map(
        (exercise, idx) => (
          <div key={idx}>
            <div className={classes.entry}>
              <div className={`${classes.sideButtons} ${classes.leftButtons}`}>
                <div
                  className={`${classes.sideButton} ${classes.leftButton} ${classes.sideButtonTopBottom}`}
                />
                <button
                  className={`${classes.sideButton} ${
                    classes.sideButtonTopTop
                  } ${idx === 0 ? classes.disabled : classes.enabled}`}
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
                    idx ===
                    block.weeks[editingWeekIdx][editingDay].exercises.length - 1
                      ? classes.disabled
                      : classes.enabled
                  }`}
                  onClick={() => handleMoveExercise(exercise, idx, "down")}
                >
                  <ArrowBackIosNew className={classes.moveDownButton} />
                </button>
              </div>
              <div
                className={classes.entryContainer}
                style={{ height: editingBlock ? "160px" : "240px" }}
              >
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
                    className={classes.numberInput}
                    value={exercise.sets.length}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      handleNumberInput(e, idx, "sets");
                    }}
                  />
                  {!editingBlock && (
                    <>
                      <span className={classes.entryName}>Reps: </span>
                      <Input
                        className={classes.numberInput}
                        value={exercise.sets[0]?.reps || 0}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          handleNumberInput(e, idx, "reps");
                        }}
                      />
                    </>
                  )}
                </div>
                {!editingBlock && (
                  <>
                    <div className={classes.entry}>
                      <span className={classes.entryName}>Weight: </span>
                      <Input
                        className={classes.weightInput}
                        value={exercise.sets[0]?.weight || 0}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          handleNumberInput(e, idx, "weight");
                        }}
                      />
                      <Select
                        className={classes.weightType}
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
                  </>
                )}
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
                      block.weeks[editingWeekIdx][editingDay].exercises
                        .length === 1
                        ? classes.disabled
                        : classes.enabled
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )
      )}
      <div className={classes.addDayButtonContainer}>
        <div
          className={`${classes.addDayButton} ${classes.addDayButtonBottom}`}
        />
        <div
          className={`${classes.addDayButton} ${classes.addDayButtonTop}`}
          onClick={handleAddExercise}
        >
          <AddCircleOutline />
        </div>
      </div>
      <div className={createBlockClasses.actions}>
        <div className={createBlockClasses.buttonContainer}>
          <div
            className={`${createBlockClasses.actionButton} ${classes.submitButtonBottom}`}
          />
          <button
            className={`${createBlockClasses.actionButton} ${classes.submitButtonTop}`}
            onClick={() => setEditingDay(-1)}
          >
            Save Day
          </button>
        </div>
      </div>
    </div>
  );
};
