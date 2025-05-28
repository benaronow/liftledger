import {
  Block,
  Day,
  Exercise,
  ExerciseApparatus,
  ExerciseName,
  Set,
  WeightType,
} from "@/types";
import { ArrowBackIosNew } from "@mui/icons-material";
import React, { ChangeEvent } from "react";
import Select, { CSSObjectWithLabel } from "react-select";
import { useSelector } from "react-redux";
import {
  selectCurBlock,
  selectEditingBlock,
} from "@/lib/features/user/userSlice";
import { PushButton } from "../../pushButton";
import { makeStyles } from "tss-react/mui";
import { AddButton } from "../../AddButton";
import { LabeledInput } from "../../LabeledInput";
import { FaTrash } from "react-icons/fa";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    fontFamily: "League+Spartan",
    fontSize: "16px",
  },
  exercise: {
    background: "#58585b",
    borderRadius: "5px",
    border: "solid 5px #58585b",
    marginBottom: "15px",
    boxShadow: "0px 5px 10px #131314",
  },
  entryContainer: {
    padding: "10px",
    display: "flex",
    background: "#131314",
    flexDirection: "column",
    width: "100%",
    flex: 1,
    borderRadius: "5px",
    margin: "0px 0px 0px 5px",
    justifyContent: "space-between",
  },
  entry: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  entryName: {
    fontWeight: 600,
    color: "white",
  },
  sideButtons: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "5px",
  },
  sideButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "35px",
    height: "35px",
    border: "none",
    borderRadius: "5px",
    "&:hover": {
      cursor: "pointer",
    },
    fontSize: "20px",
  },
  buttonEnabled: {
    background: "#0096FF",
    color: "white",
  },
  buttonDisabled: {
    background: "#317baf",
    color: "#a7a7a7",
  },
  moveUpButton: {
    transform: "rotate(90deg)",
  },
  moveDownButton: {
    transform: "rotate(270deg)",
  },
  addExerciseButton: {
    color: "blue",
    marginBottom: "-5px",
    "&:hover": {
      cursor: "pointer",
    },
  },
  weightType: {
    width: "100%",
    fontSize: "16px",
  },
  back: {
    color: "white",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    fontWeight: 600,
  },
  inputRow: {
    display: "flex",
    fontSize: "14px",
    alignItems: "center",
    border: "solid 2px #adafb3",
    borderRight: "none",
    borderRadius: "5px 0px 0px 5px",
    padding: "5px",
    background: "white",
    color: "black",
    height: "38px",
  },
  input: {
    border: "none",
    outline: "none",
    fontSize: "16px",
    width: "100%",
  },
  rowName: {
    marginRight: "5px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
});

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
  const { classes } = useStyles();
  const curBlock = useSelector(selectCurBlock);
  const editingBlock = useSelector(selectEditingBlock);
  const exerciseHeight = editingBlock ? "150px" : "190px";
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

  const handleAddExercise = (idx: number) => {
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
      weeks: block.weeks.map((week, wIdx) =>
        wIdx === editingWeekIdx
          ? week.map((day) =>
              shouldEditDay(day)
                ? {
                    ...day,
                    exercises: day.exercises.toSpliced(idx, 0, newExercise),
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

  const selectStyle = {
    control: (basestyles: CSSObjectWithLabel) => ({
      ...basestyles,
      height: "38px",
      border: "solid 2px #adafb3",
      borderLeft: "solid 1px #adafb3",
      borderRadius: "0px 5px 5px 0px",
    }),
  };

  return (
    <div className={classes.container}>
      {block.weeks[editingWeekIdx][editingDay].exercises.map(
        (exercise, idx) => (
          <React.Fragment key={idx}>
            <AddButton onClick={() => handleAddExercise(idx)} />
            <div className={`${classes.exercise} ${classes.entry}`}>
              <div className={classes.sideButtons}>
                <button
                  className={`${classes.sideButton} ${
                    idx === 0 ? classes.buttonDisabled : classes.buttonEnabled
                  }`}
                  onClick={() => handleMoveExercise(exercise, idx, "up")}
                >
                  <ArrowBackIosNew className={classes.moveUpButton} />
                </button>
                <button
                  className={`${classes.sideButton} ${
                    block.weeks[editingWeekIdx][editingDay].exercises.length ===
                    1
                      ? classes.buttonDisabled
                      : classes.buttonEnabled
                  }`}
                  onClick={() => handleRemoveExercise(idx)}
                >
                  <FaTrash />
                </button>
                <button
                  className={`${classes.sideButton} ${
                    idx ===
                    block.weeks[editingWeekIdx][editingDay].exercises.length - 1
                      ? classes.buttonDisabled
                      : classes.buttonEnabled
                  }`}
                  onClick={() => handleMoveExercise(exercise, idx, "down")}
                >
                  <ArrowBackIosNew className={classes.moveDownButton} />
                </button>
              </div>
              <div
                className={classes.entryContainer}
                style={{ height: exerciseHeight }}
              >
                <div className={classes.entry}>
                  <div className={classes.inputRow}>
                    <span className={classes.rowName}>Lift: </span>
                  </div>
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
                    styles={selectStyle}
                  />
                </div>
                <div className={classes.entry}>
                  <div className={classes.inputRow}>
                    <span className={classes.rowName}>Use: </span>
                  </div>
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
                    styles={selectStyle}
                  />
                </div>
                <div className={classes.entry} style={{ gap: "10px" }}>
                  <LabeledInput
                    label="Sets: "
                    textValue={exercise.sets.length}
                    onChangeText={(e: ChangeEvent<HTMLInputElement>) => {
                      handleNumberInput(e, idx, "sets");
                    }}
                  />
                  {!editingBlock && (
                    <LabeledInput
                      label="Reps: "
                      textValue={exercise.sets[0]?.reps || 0}
                      onChangeText={(e: ChangeEvent<HTMLInputElement>) => {
                        handleNumberInput(e, idx, "reps");
                      }}
                    />
                  )}
                </div>
                {!editingBlock && (
                  <>
                    <div className={classes.entry}>
                      <div className={classes.inputRow}>
                        <span className={classes.rowName}>Weight: </span>
                        <input
                          className={classes.input}
                          value={exercise.sets[0]?.weight || 0}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            handleNumberInput(e, idx, "weight");
                          }}
                        />
                      </div>
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
                        styles={selectStyle}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </React.Fragment>
        )
      )}
      <AddButton
        onClick={() =>
          handleAddExercise(
            block.weeks[editingWeekIdx][editingDay].exercises.length
          )
        }
      />
      <PushButton height={40} width={70} onClick={() => setEditingDay(-1)}>
        <span className={classes.back}>Back</span>
      </PushButton>
    </div>
  );
};
