import { makeStyles } from "tss-react/mui";
import { ArrowBackIosNew } from "@mui/icons-material";
import Select, { CSSObjectWithLabel } from "react-select";
import { LabeledInput } from "../../components/LabeledInput";
import { FaTrash } from "react-icons/fa";
import { ChangeEvent, useMemo } from "react";
import {
  Day,
  Exercise,
  ExerciseApparatus,
  ExerciseName,
  Set,
  WeightType,
} from "@/lib/types";
import { useBlock } from "@/app/providers/BlockProvider";
import { getNewSetsFromLast } from "@/app/utils";

const useStyles = makeStyles()({
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
    gap: "10px",
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

interface Props {
  exercise: Exercise;
  takenExercises: Exercise[];
  eIdx: number;
  editingDay: number;
  setDeletingIdx: React.Dispatch<React.SetStateAction<number | undefined>>;
}

export const ExerciseInfo = ({
  exercise,
  takenExercises,
  eIdx,
  editingDay,
  setDeletingIdx,
}: Props) => {
  const { classes } = useStyles();
  const { curBlock, templateBlock, setTemplateBlock, editingWeekIdx } =
    useBlock();
  const pointFive = useMemo(
    () => exercise.sets[0]?.weight % 1 === 0.5,
    [exercise.sets]
  );

  const shouldEditDay = (day: Day) => {
    return day.name === templateBlock.weeks[editingWeekIdx][editingDay].name;
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

  const handleMoveExercise = (type: "up" | "down") => {
    setTemplateBlock({
      ...templateBlock,
      weeks: templateBlock.weeks.map((week, idx) =>
        idx === editingWeekIdx
          ? week.map((day) =>
              shouldEditDay(day)
                ? {
                    ...day,
                    exercises: day.exercises
                      .toSpliced(eIdx, 1)
                      .toSpliced(
                        type === "up" ? eIdx - 1 : eIdx + 1,
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

  const updateExercise = (exerciseUpdate: Exercise) => {
    setTemplateBlock({
      ...templateBlock,
      weeks: templateBlock.weeks.map((week, wIdx) =>
        wIdx === editingWeekIdx
          ? week.map((day) =>
              shouldEditDay(day)
                ? {
                    ...day,
                    exercises: day.exercises.map((exercise, idx) =>
                      eIdx === idx ? exerciseUpdate : exercise
                    ),
                  }
                : day
            )
          : week
      ),
    });
  };

  const handleExerciseNameSelect = (name: string) => {
    const newExercise = { ...exercise, name };
    updateExercise({
      ...newExercise,
      sets: getNewSetsFromLast(curBlock, newExercise),
    });
  };

  const handleExerciseApparatusSelect = (apparatus: string) => {
    const newExercise = { ...exercise, apparatus };
    updateExercise({
      ...newExercise,
      sets: getNewSetsFromLast(curBlock, newExercise),
    });
  };

  const handleWeightTypeSelect = (weightType: string) => {
    updateExercise({
      ...exercise,
      weightType: weightType as WeightType,
    });
  };

  const createNewSets = (numSets: number) => {
    const sets = exercise.sets.length
      ? exercise.sets
      : getNewSetsFromLast(curBlock, exercise);

    return numSets < sets.length
      ? sets.slice(0, numSets)
      : sets.concat(
          Array<Set>(numSets - sets.length).fill(sets[sets.length - 1])
        );
  };

  const handleNumberInput = (
    e: ChangeEvent<HTMLInputElement>,
    type: "sets" | "reps" | "weight"
  ) => {
    const value = parseInt(e.target.value)
      ? Math.min(
          parseInt(e.target.value),
          type === "sets" ? 999 : parseInt(e.target.value)
        )
      : 0;

    updateExercise({
      ...exercise,
      sets:
        type === "sets"
          ? createNewSets(value)
          : exercise.sets.map((set: Set) => ({
              ...set,
              reps: type === "reps" ? value : set.reps,
              weight:
                type === "weight" ? value + (pointFive ? 0.5 : 0) : set.weight,
            })),
    });
  };

  const handlePointFive = (selected: boolean) => {
    updateExercise({
      ...exercise,
      sets: exercise.sets.map((set: Set) => ({
        ...set,
        weight: Math.floor(set.weight) + (selected ? 0.5 : 0),
      })),
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
    <div className={`${classes.exercise} ${classes.entry}`}>
      <div className={classes.sideButtons}>
        <button
          className={`${classes.sideButton} ${
            eIdx === 0 ? classes.buttonDisabled : classes.buttonEnabled
          }`}
          onClick={() => handleMoveExercise("up")}
        >
          <ArrowBackIosNew className={classes.moveUpButton} />
        </button>
        <button
          className={`${classes.sideButton} ${
            templateBlock.weeks[editingWeekIdx][editingDay].exercises.length ===
            1
              ? classes.buttonDisabled
              : classes.buttonEnabled
          }`}
          onClick={() => setDeletingIdx(eIdx)}
        >
          <FaTrash />
        </button>
        <button
          className={`${classes.sideButton} ${
            eIdx ===
            templateBlock.weeks[editingWeekIdx][editingDay].exercises.length - 1
              ? classes.buttonDisabled
              : classes.buttonEnabled
          }`}
          onClick={() => handleMoveExercise("down")}
        >
          <ArrowBackIosNew className={classes.moveDownButton} />
        </button>
      </div>
      <div className={classes.entryContainer}>
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
            options={exerciseNameOptions.filter(
              (o) =>
                !takenExercises.find(
                  (e) =>
                    e.name === o.value && e.apparatus === exercise.apparatus
                )
            )}
            isSearchable
            onChange={(e) => handleExerciseNameSelect(e?.value || "")}
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
            options={exerciseApparatusOptions.filter(
              (o) =>
                !takenExercises.find(
                  (e) => e.apparatus === o.value && e.name === exercise.name
                )
            )}
            isSearchable
            onChange={(e) => handleExerciseApparatusSelect(e?.value || "")}
            styles={selectStyle}
          />
        </div>
        <div className={classes.entry} style={{ gap: "10px" }}>
          <LabeledInput
            label="Sets: "
            textValue={exercise.sets.length}
            onChangeText={(e: ChangeEvent<HTMLInputElement>) => {
              handleNumberInput(e, "sets");
            }}
          />
          {!curBlock && (
            <LabeledInput
              label="Reps: "
              textValue={exercise.sets[0]?.reps || 0}
              onChangeText={(e: ChangeEvent<HTMLInputElement>) => {
                handleNumberInput(e, "reps");
              }}
              disabled={!exercise.sets.length}
            />
          )}
        </div>
        {!curBlock && (
          <>
            <div className={classes.entry}>
              <div className={classes.inputRow}>
                <span className={classes.rowName}>Weight: </span>
                <input
                  className={classes.input}
                  style={{ width: "100%" }}
                  value={Math.floor(exercise.sets[0]?.weight) || 0}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    handleNumberInput(e, "weight");
                  }}
                  disabled={!exercise.sets.length}
                />
              </div>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: pointFive ? "white" : "#0096FF",
                  background: pointFive ? "#0096FF" : "white",
                  height: "38px",
                  border: "solid 2px #adafb3",
                  borderRight: "solid 1px #adafb3",
                }}
                onClick={() => handlePointFive(!pointFive)}
              >
                <span>+0.5lbs</span>
              </button>
              <Select
                className={classes.weightType}
                value={
                  exercise.weightType
                    ? {
                        value: exercise.weightType,
                        label: exercise.weightType,
                      }
                    : undefined
                }
                options={weightTypeOptions}
                onChange={(e) => handleWeightTypeSelect(e?.value || "")}
                styles={selectStyle}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
