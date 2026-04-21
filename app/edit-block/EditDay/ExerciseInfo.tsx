import { ArrowBackIosNew } from "@mui/icons-material";
import { LabeledInput } from "@/app/components/LabeledInput";
import { FaTrash } from "react-icons/fa";
import { ChangeEvent, useCallback, useMemo } from "react";
import { Exercise, Set } from "@/lib/types";
import { useBlock } from "@/app/layoutProviders/BlockProvider";
import { Info, InfoAction } from "../Info";
import { useCompletedExercises } from "@/app/layoutProviders/CompletedExercisesProvider";
import { useEditBlock } from "../EditBlockProvider";
import { WEIGHT_TYPES } from "@/lib/weightTypes";
import { ExerciseNameSelect } from "@/app/components/ExerciseNameSelect";
import { ExerciseApparatusSelect } from "@/app/components/ExerciseApparatusSelect";
import { moveExercise } from "./moveExercise";

export type ExerciseInfoName = "name" | "apparatus" | "weightType";

interface Props {
  exercise: Exercise;
  eIdx: number;
}

export const ExerciseInfo = ({ exercise, eIdx }: Props) => {
  const { curBlock, templateBlock, setTemplateBlock, editingWeekIdx } =
    useBlock();
  const { getNewSetsFromLatest, getUpdatedExercise } = useCompletedExercises();
  const { editingDayIdx, setDeletingExerciseIdx } = useEditBlock();
  const curDayExercises = useMemo(
    () => templateBlock.weeks[editingWeekIdx][editingDayIdx].exercises,
    [templateBlock],
  );

  const visibleExerciseCount = useMemo(
    () => curDayExercises.filter((e) => !e.addedOn).length,
    [curDayExercises],
  );

  const handleMoveExercise = (type: "up" | "down") => {
    setTemplateBlock({
      ...templateBlock,
      weeks: templateBlock.weeks.map((week, wIdx) =>
        wIdx === editingWeekIdx
          ? week.map((day, dIdx) =>
              dIdx !== editingDayIdx
                ? day
                : {
                    ...day,
                    exercises: moveExercise(day.exercises, eIdx, type),
                  },
            )
          : week,
      ),
    });
  };

  const updateExercise = (exerciseUpdate: Exercise) => {
    setTemplateBlock({
      ...templateBlock,
      weeks: templateBlock.weeks.map((week, wIdx) =>
        wIdx === editingWeekIdx
          ? week.map((day, dIdx) =>
              dIdx === editingDayIdx
                ? {
                    ...day,
                    exercises: day.exercises.map((exercise, idx) =>
                      eIdx === idx ? exerciseUpdate : exercise,
                    ),
                  }
                : day,
            )
          : week,
      ),
    });
  };

  const handleNumberInput = (
    e: ChangeEvent<HTMLInputElement>,
    type: "sets" | "reps" | "weight",
  ) => {
    const parsed =
      type === "weight" ? parseFloat(e.target.value) : parseInt(e.target.value);
    const value = parsed
      ? type === "sets"
        ? Math.min(parsed, 999)
        : parsed
      : 0;

    updateExercise({
      ...exercise,
      sets:
        type === "sets"
          ? getNewSetsFromLatest(exercise, value)
          : exercise.sets.map((set: Set) => ({
              ...set,
              reps: type === "reps" ? value : exercise.sets[0].reps,
              weight: type === "weight" ? value : exercise.sets[0].weight,
            })),
    });
  };

  const infoActions: InfoAction[] = [
    {
      icon: (
        <ArrowBackIosNew
          fontSize="medium"
          style={{ transform: "rotate(90deg)" }}
        />
      ),
      disabled: eIdx === 0,
      onClick: () => handleMoveExercise("up"),
      variant: "primary",
    },
    {
      icon: (
        <ArrowBackIosNew
          fontSize="medium"
          style={{ transform: "rotate(270deg)" }}
        />
      ),
      disabled: eIdx === visibleExerciseCount - 1,
      onClick: () => handleMoveExercise("down"),
      variant: "primary",
    },
    {
      icon: <FaTrash fontSize="medium" />,
      disabled: curDayExercises.length === 1,
      onClick: () => setDeletingExerciseIdx(eIdx),
      variant: "danger",
    },
  ];

  const editDisabled = useMemo(() => {
    return !exercise.sets.length;
  }, [exercise]);

  const switchExercise = useCallback(
    (value: string, type: ExerciseInfoName) => {
      const updatedExercise = getUpdatedExercise(value, type, exercise);

      updateExercise(updatedExercise);
    },
    [getUpdatedExercise, exercise, updateExercise],
  );

  return (
    <Info title={`Exercise ${eIdx + 1}`} actions={infoActions}>
      <ExerciseNameSelect
        label="Exercise:"
        curExercise={exercise}
        reservedExercises={curDayExercises}
        onSelect={(value) => switchExercise(value, "name")}
        className="mb-0"
      />
      <ExerciseApparatusSelect
        label="Apparatus:"
        curExercise={exercise}
        reservedExercises={curDayExercises}
        onSelect={(value) => switchExercise(value, "apparatus")}
        className="mb-0"
      />
      <div className="d-flex w-100 gap-3">
        <LabeledInput
          label="Sets:"
          textValue={exercise.sets.filter((set) => !set.addedOn).length}
          onChangeText={(e: ChangeEvent<HTMLInputElement>) => {
            handleNumberInput(e, "sets");
          }}
        />
        {!curBlock && (
          <LabeledInput
            label="Reps:"
            textValue={exercise.sets[0]?.reps || 0}
            onChangeText={(e: ChangeEvent<HTMLInputElement>) => {
              handleNumberInput(e, "reps");
            }}
            disabled={editDisabled}
          />
        )}
      </div>
      {!curBlock && (
        <div className="d-flex w-100 gap-3 ">
          <LabeledInput
            label="Weight:"
            textValue={exercise.sets[0]?.weight || ""}
            type="number"
            step="any"
            min="0"
            onChangeText={(e: ChangeEvent<HTMLInputElement>) => {
              handleNumberInput(e, "weight");
            }}
            disabled={editDisabled}
          />
          <LabeledInput
            label="Weight type:"
            textValue={exercise.weightType}
            options={WEIGHT_TYPES}
            includeEmptyOption
            onChangeSelect={(e) => switchExercise(e.target.value, "weightType")}
          />
        </div>
      )}
    </Info>
  );
};
