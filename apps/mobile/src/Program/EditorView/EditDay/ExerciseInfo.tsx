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
import { AppTextInput } from "../../../components/inputs";
import { Info, InfoAction } from "../../../components/Info";
import { useTemplate } from "../../TemplateProvider";
import { moveExercise } from "./moveExercise";

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
                      exercises: day.exercises.map((ex, idx) =>
                        eIdx === idx ? exerciseUpdate : ex,
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

  const handleNumberInput = (
    text: string,
    type: "sets" | "reps" | "weight",
  ) => {
    const parsed = type === "weight" ? parseFloat(text) : parseInt(text);
    const value = parsed
      ? type === "sets"
        ? Math.min(parsed, 999)
        : parsed
      : 0;

    updateExercise({
      ...exercise,
      sets:
        type === "sets"
          ? getNewSetsFromLatest(completedExercises, exercise, value)
          : exercise.sets.map((set) => ({
              ...set,
              reps: type === "reps" ? value : exercise.sets[0].reps,
              weight: type === "weight" ? value : exercise.sets[0].weight,
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
        curExercise={exercise}
        reservedExercises={curDayExercises}
        onSelect={(value) => switchExercise(value, "name")}
      />
      <ExerciseApparatusSelect
        label="Apparatus"
        curExercise={exercise}
        reservedExercises={curDayExercises}
        onSelect={(value) => switchExercise(value, "apparatus")}
      />
      <View style={rowStyle}>
        <AppTextInput
          style={{ flex: 1 }}
          label="Sets"
          value={String(setCount)}
          keyboardType="number-pad"
          onChangeText={(text) => handleNumberInput(text, "sets")}
        />
        {!curProgram && (
          <AppTextInput
            style={{ flex: 1 }}
            label="Reps"
            value={String(exercise.sets[0]?.reps || 0)}
            keyboardType="number-pad"
            disabled={editDisabled}
            onChangeText={(text) => handleNumberInput(text, "reps")}
          />
        )}
      </View>
      {!curProgram && (
        <View style={rowStyle}>
          <AppTextInput
            style={{ flex: 1 }}
            label="Weight"
            value={
              exercise.sets[0]?.weight ? String(exercise.sets[0].weight) : ""
            }
            keyboardType="decimal-pad"
            disabled={editDisabled}
            onChangeText={(text) => handleNumberInput(text, "weight")}
          />
          <View style={cellStyle}>
            <WeightTypeSelect
              label="Weight Type"
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
