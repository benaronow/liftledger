import {
  getNewSetsFromLatest,
  getUpdatedExercise,
  useProgram,
  useCompletedExercises,
  useMe,
} from "@liftledger/api-client";
import { Exercise } from "@liftledger/shared";
import { useCallback, useMemo } from "react";
import { View } from "react-native";
import { ExerciseApparatusSelect } from "../../../components/ExerciseApparatusSelect";
import { ExerciseNameSelect } from "../../../components/ExerciseNameSelect";
import { WeightTypeSelect } from "../../../components/WeightTypeSelect";
import { SPACING } from "../../../theme";
import { NumberInput } from "../../../components/inputs";
import { Info, InfoAction } from "../../../components/Info";
import { useTemplate } from "../../TemplateProvider";
import { fullExerciseIndex, moveExercise } from "./moveExercise";

type ExerciseInfoName = "name" | "apparatus" | "weightType";

interface Props {
  exercise: Exercise;
  eIdx: number;
  onRequestDelete: (eIdx: number) => void;
}

export const ExerciseInfo = ({ exercise, eIdx, onRequestDelete }: Props) => {
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { data: completedExercises } = useCompletedExercises(curUser?._id);
  const {
    templateProgram,
    setTemplateProgram,
    editingWeekIdx,
    editingDayIdx,
    templateErrors,
  } = useTemplate();

  const errors = templateErrors.days[editingDayIdx]?.exercises[eIdx] ?? {};

  const curDayExercises = useMemo(
    () => templateProgram.weeks[editingWeekIdx][editingDayIdx].exercises,
    [templateProgram, editingWeekIdx, editingDayIdx],
  );

  const visibleExerciseCount = useMemo(
    () => curDayExercises.filter((e) => !e.addedOn).length,
    [curDayExercises],
  );

  const updateExercise = useCallback(
    (exerciseUpdate: Exercise) => {
      // eIdx is the position in the *visible* list; map it to the full-array
      // index so hidden addedOn exercises don't shift the target.
      const fullIdx = fullExerciseIndex(curDayExercises, eIdx);
      setTemplateProgram({
        ...templateProgram,
        weeks: templateProgram.weeks.map((week, wIdx) =>
          wIdx === editingWeekIdx
            ? week.map((day, dIdx) =>
                dIdx === editingDayIdx
                  ? {
                      ...day,
                      exercises: day.exercises.map((ex, idx) =>
                        idx === fullIdx ? exerciseUpdate : ex,
                      ),
                    }
                  : day,
              )
            : week,
        ),
      });
    },
    [
      templateProgram,
      setTemplateProgram,
      editingWeekIdx,
      editingDayIdx,
      eIdx,
      curDayExercises,
    ],
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

  // Sets is a list length, not a Set value: regenerate the set list (capped at
  // 999). An empty field commits null, which we ignore so clearing it mid-edit
  // doesn't wipe the existing sets — it snaps back to the count on blur.
  const handleSetsCount = (count: number | null) => {
    if (count == null) return;
    updateExercise({
      ...exercise,
      sets: getNewSetsFromLatest(
        completedExercises,
        exercise,
        Math.min(count, 999),
      ),
    });
  };

  const updateSetsField = (field: "reps" | "weight", value: number | null) => {
    updateExercise({
      ...exercise,
      sets: exercise.sets.map((set) => ({
        ...set,
        reps: field === "reps" ? value : exercise.sets[0].reps,
        weight: field === "weight" ? value : exercise.sets[0].weight,
      })),
    });
  };

  const switchExercise = useCallback(
    (value: string, type: ExerciseInfoName) => {
      updateExercise(
        getUpdatedExercise(completedExercises, value, type, exercise),
      );
    },
    [completedExercises, exercise, updateExercise],
  );

  const editDisabled = !exercise.sets.length;

  const infoActions: InfoAction[] = [
    {
      icon: "chevron-up",
      disabled: eIdx === 0,
      onPress: () => handleMoveExercise("up"),
      variant: "primary",
    },
    {
      icon: "chevron-down",
      disabled: eIdx === visibleExerciseCount - 1,
      onPress: () => handleMoveExercise("down"),
      variant: "primary",
    },
    {
      icon: "delete",
      disabled: curDayExercises.length === 1,
      onPress: () => onRequestDelete(eIdx),
      variant: "danger",
    },
  ];

  const setCount = exercise.sets.filter((set) => !set.addedOn).length;

  return (
    <Info title={`Exercise ${eIdx + 1}`} actions={infoActions}>
      <ExerciseNameSelect
        label="Exercise"
        error={errors.name}
        curExercise={exercise}
        reservedExercises={curDayExercises}
        onSelect={(value) => switchExercise(value, "name")}
      />
      <ExerciseApparatusSelect
        label="Apparatus"
        error={errors.apparatus}
        curExercise={exercise}
        reservedExercises={curDayExercises}
        onSelect={(value) => switchExercise(value, "apparatus")}
      />
      <View style={rowStyle}>
        <NumberInput
          style={{ flex: 1 }}
          label="Sets"
          value={setCount}
          error={errors.sets}
          onChangeValue={handleSetsCount}
        />
        {!curProgram && (
          <NumberInput
            style={{ flex: 1 }}
            label="Reps"
            value={exercise.sets[0]?.reps ?? null}
            disabled={editDisabled}
            onChangeValue={(reps) => updateSetsField("reps", reps)}
          />
        )}
      </View>
      {!curProgram && (
        <View style={rowStyle}>
          <NumberInput
            style={{ flex: 1 }}
            label="Weight"
            value={exercise.sets[0]?.weight ?? null}
            decimal
            disabled={editDisabled}
            onChangeValue={(weight) => updateSetsField("weight", weight)}
          />
          <View style={cellStyle}>
            <WeightTypeSelect
              label="Weight Type"
              error={errors.weightType}
              value={exercise.weightType}
              onSelect={(value) => switchExercise(value, "weightType")}
            />
          </View>
        </View>
      )}
    </Info>
  );
};

const rowStyle = {
  flexDirection: "row" as const,
  width: "100%" as const,
  gap: SPACING.md,
};
const cellStyle = { flex: 1 };
