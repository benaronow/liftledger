import { MdArrowBackIosNew } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { ChangeEvent, useCallback, useMemo } from "react";
import { Exercise, Set } from "@liftledger/shared";
import {
  getNewSetsFromLatest,
  getUpdatedExercise,
  useCompletedExercises,
  useMe,
  useProgram,
} from "@liftledger/api-client";
import { Info, InfoAction } from "../Info";
import { useTemplate } from "../../TemplateProvider";
import { WEIGHT_TYPES } from "@liftledger/shared";
import { ExerciseNameSelect } from "@/components/ExerciseNameSelect";
import { ExerciseApparatusSelect } from "@/components/ExerciseApparatusSelect";
import { moveExercise } from "./moveExercise";
import { LabeledTextInput, LabeledSelect } from "@/components/inputs";

export type ExerciseInfoName = "name" | "apparatus" | "weightType";

// Empty input → null; an unparseable string → null. Reps are whole numbers,
// weight allows decimals.
const commitNumber = (text: string, kind: "reps" | "weight"): number | null => {
  if (text.trim() === "") return null;
  const n = kind === "weight" ? parseFloat(text) : parseInt(text, 10);
  return Number.isNaN(n) ? null : n;
};

interface Props {
  exercise: Exercise;
  eIdx: number;
  onRequestDelete: (eIdx: number) => void;
}

export const ExerciseInfo = ({ exercise, eIdx, onRequestDelete }: Props) => {
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { data: completedExercises } = useCompletedExercises(curUser?._id);
  const { templateProgram, setTemplateProgram, editingWeekIdx, editingDayIdx } =
    useTemplate();
  const curDayExercises = useMemo(
    () => templateProgram.weeks[editingWeekIdx][editingDayIdx].exercises,
    [templateProgram, editingWeekIdx, editingDayIdx],
  );

  const visibleExerciseCount = useMemo(
    () => curDayExercises.filter((e) => !e.addedOn).length,
    [curDayExercises],
  );

  const handleMoveExercise = (type: "up" | "down") => {
    setTemplateProgram({
      ...templateProgram,
      weeks: templateProgram.weeks.map((week, wIdx) =>
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

  const updateExercise = useCallback(
    (exerciseUpdate: Exercise) => {
      setTemplateProgram({
        ...templateProgram,
        weeks: templateProgram.weeks.map((week, wIdx) =>
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
    },
    [templateProgram, setTemplateProgram, editingWeekIdx, editingDayIdx, eIdx],
  );

  const handleNumberInput = (
    e: ChangeEvent<HTMLInputElement>,
    type: "sets" | "reps" | "weight",
  ) => {
    if (type === "sets") {
      // Sets is a list length, not a Set value: empty means "0 sets".
      const parsed = parseInt(e.target.value);
      const value = parsed ? Math.min(parsed, 999) : 0;
      updateExercise({
        ...exercise,
        sets: getNewSetsFromLatest(completedExercises, exercise, value),
      });
      return;
    }

    const value = commitNumber(e.target.value, type);
    updateExercise({
      ...exercise,
      sets: exercise.sets.map((set: Set) => ({
        ...set,
        reps: type === "reps" ? value : exercise.sets[0].reps,
        weight: type === "weight" ? value : exercise.sets[0].weight,
      })),
    });
  };

  const infoActions: InfoAction[] = [
    {
      icon: (
        <MdArrowBackIosNew
          size={24}
          style={{ transform: "rotate(90deg)" }}
        />
      ),
      disabled: eIdx === 0,
      onClick: () => handleMoveExercise("up"),
      variant: "primary",
    },
    {
      icon: (
        <MdArrowBackIosNew
          size={24}
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
      onClick: () => onRequestDelete(eIdx),
      variant: "danger",
    },
  ];

  const editDisabled = useMemo(() => {
    return !exercise.sets.length;
  }, [exercise]);

  const switchExercise = useCallback(
    (value: string, type: ExerciseInfoName) => {
      const updatedExercise = getUpdatedExercise(
        completedExercises,
        value,
        type,
        exercise,
      );

      updateExercise(updatedExercise);
    },
    [completedExercises, exercise, updateExercise],
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
        <LabeledTextInput
          label="Sets:"
          value={exercise.sets.filter((set) => !set.addedOn).length}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            handleNumberInput(e, "sets");
          }}
        />
        {!curProgram && (
          <LabeledTextInput
            label="Reps:"
            value={exercise.sets[0]?.reps || 0}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleNumberInput(e, "reps");
            }}
            disabled={editDisabled}
          />
        )}
      </div>
      {!curProgram && (
        <div className="d-flex w-100 gap-3 ">
          <LabeledTextInput
            label="Weight:"
            value={exercise.sets[0]?.weight || ""}
            type="number"
            step="any"
            min="0"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleNumberInput(e, "weight");
            }}
            disabled={editDisabled}
          />
          <LabeledSelect
            label="Weight type:"
            value={exercise.weightType}
            options={WEIGHT_TYPES}
            includeEmptyOption
            onChange={(e) => switchExercise(e.target.value, "weightType")}
          />
        </div>
      )}
    </Info>
  );
};
