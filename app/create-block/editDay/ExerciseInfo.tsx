import { ArrowBackIosNew } from "@mui/icons-material";
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
import { getLastExerciseOccurrence, getNewSetsFromLast } from "@/app/utils";
import { COLORS } from "@/lib/colors";
import { Info } from "../Info";

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
  const { curBlock, templateBlock, setTemplateBlock, editingWeekIdx } =
    useBlock();
  const pointFive = useMemo(
    () => exercise.sets[0]?.weight % 1 === 0.5,
    [exercise.sets]
  );

  const shouldEditDay = (day: Day) => {
    return day.name === templateBlock.weeks[editingWeekIdx][editingDay].name;
  };

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

  const buttonActions = [
    {
      icon: (
        <ArrowBackIosNew
          fontSize="medium"
          style={{ transform: "rotate(90deg)" }}
        />
      ),
      disabled: eIdx === 0,
      onClick: () => handleMoveExercise("up"),
    },
    {
      icon: (
        <ArrowBackIosNew
          fontSize="medium"
          style={{ transform: "rotate(270deg)" }}
        />
      ),
      disabled:
        eIdx ===
        templateBlock.weeks[editingWeekIdx][editingDay].exercises.length - 1,
      onClick: () => handleMoveExercise("down"),
    },
    {
      icon: <FaTrash fontSize="medium" />,
      disabled:
        templateBlock.weeks[editingWeekIdx][editingDay].exercises.length === 1,
      onClick: () => setDeletingIdx(eIdx),
    },
  ];

  return (
    <Info title={`Exercise ${eIdx + 1}`} actions={buttonActions}>
      <LabeledInput
        label="Exercise:"
        textValue={exercise.name}
        options={Object.values(ExerciseName).filter(
          (o) =>
            !takenExercises.find(
              (e) => e.name === o && e.apparatus === exercise.apparatus
            )
        )}
        onChangeSelect={(e) => handleExerciseNameSelect(e.target.value || "")}
      />
      <LabeledInput
        label="Apparatus:"
        textValue={exercise.apparatus}
        options={Object.values(ExerciseApparatus).filter(
          (o) =>
            !takenExercises.find(
              (e) => e.apparatus === o && e.name === exercise.name
            )
        )}
        onChangeSelect={(e) =>
          handleExerciseApparatusSelect(e.target.value || "")
        }
      />
      <div className="d-flex w-100 gap-3">
        <LabeledInput
          label="Sets: "
          textValue={exercise.sets.length}
          onChangeText={(e: ChangeEvent<HTMLInputElement>) => {
            handleNumberInput(e, "sets");
          }}
        />
        <LabeledInput
          label="Reps: "
          textValue={exercise.sets[0]?.reps || 0}
          onChangeText={(e: ChangeEvent<HTMLInputElement>) => {
            handleNumberInput(e, "reps");
          }}
          disabled={
            !exercise.sets.length ||
            !!getLastExerciseOccurrence(curBlock, exercise)
          }
        />
      </div>
      <div className="d-flex w-100 align-items-end">
        <LabeledInput
          label="Weight:"
          textValue={Math.floor(exercise.sets[0]?.weight) || 0}
          onChangeText={(e: ChangeEvent<HTMLInputElement>) => {
            handleNumberInput(e, "weight");
          }}
          disabled={
            !exercise.sets.length ||
            !!getLastExerciseOccurrence(curBlock, exercise)
          }
        />
        <button
          className="d-flex align-items-center p-1 rounded border-0 ms-1 me-3"
          style={
            !exercise.sets.length ||
            !!getLastExerciseOccurrence(curBlock, exercise)
              ? {
                  color: pointFive
                    ? COLORS.textDisabled
                    : COLORS.primaryDisabled,
                  background: pointFive
                    ? COLORS.primaryDisabled
                    : COLORS.textDisabled,
                }
              : {
                  color: pointFive ? "white" : COLORS.primary,
                  background: pointFive ? COLORS.primary : "white",
                }
          }
          onClick={() => handlePointFive(!pointFive)}
        >
          <span>+0.5lbs</span>
        </button>
        <LabeledInput
          label="Weight type:"
          textValue={exercise.weightType}
          options={Object.values(WeightType)}
          onChangeSelect={(e) => handleWeightTypeSelect(e?.target.value || "")}
        />
      </div>
    </Info>
  );
};
