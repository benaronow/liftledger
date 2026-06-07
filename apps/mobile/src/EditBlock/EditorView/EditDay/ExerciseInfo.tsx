import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  getNewSetsFromLatest,
  getUpdatedExercise,
  useBlock,
  useCompletedExercises,
  useMe,
} from "@liftledger/api-client";
import { Exercise, WEIGHT_TYPES } from "@liftledger/shared";
import { useCallback, useMemo } from "react";
import { View } from "react-native";
import { ExerciseApparatusSelect } from "../../../components/ExerciseApparatusSelect";
import { ExerciseNameSelect } from "../../../components/ExerciseNameSelect";
import { LabeledSelect, LabeledTextInput } from "../../../components/inputs";
import { SPACING } from "../../../theme";
import { Info, InfoAction } from "../Info";
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
  const { data: curBlock } = useBlock(curUser?._id, curUser?.curBlock);
  const { data: completedExercises } = useCompletedExercises(curUser?._id);
  const { templateBlock, setTemplateBlock, editingWeekIdx, editingDayIdx } =
    useTemplate();

  const curDayExercises = useMemo(
    () => templateBlock.weeks[editingWeekIdx][editingDayIdx].exercises,
    [templateBlock, editingWeekIdx, editingDayIdx],
  );

  const visibleExerciseCount = useMemo(
    () => curDayExercises.filter((e) => !e.addedOn).length,
    [curDayExercises],
  );

  const updateExercise = useCallback(
    (exerciseUpdate: Exercise) => {
      setTemplateBlock({
        ...templateBlock,
        weeks: templateBlock.weeks.map((week, wIdx) =>
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
    [templateBlock, setTemplateBlock, editingWeekIdx, editingDayIdx, eIdx],
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
      icon: <MaterialCommunityIcons name="chevron-up" size={22} color="white" />,
      disabled: eIdx === 0,
      onPress: () => handleMoveExercise("up"),
      variant: "primary",
    },
    {
      icon: <MaterialCommunityIcons name="chevron-down" size={22} color="white" />,
      disabled: eIdx === visibleExerciseCount - 1,
      onPress: () => handleMoveExercise("down"),
      variant: "primary",
    },
    {
      icon: <MaterialCommunityIcons name="delete" size={20} color="white" />,
      disabled: curDayExercises.length === 1,
      onPress: () => onRequestDelete(eIdx),
      variant: "danger",
    },
  ];

  const setCount = exercise.sets.filter((set) => !set.addedOn).length;

  return (
    <Info title={`Exercise ${eIdx + 1}`} actions={infoActions}>
      <ExerciseNameSelect
        label="Exercise:"
        curExercise={exercise}
        reservedExercises={curDayExercises}
        onSelect={(value) => switchExercise(value, "name")}
      />
      <ExerciseApparatusSelect
        label="Apparatus:"
        curExercise={exercise}
        reservedExercises={curDayExercises}
        onSelect={(value) => switchExercise(value, "apparatus")}
      />
      <View style={rowStyle}>
        <View style={cellStyle}>
          <LabeledTextInput
            label="Sets:"
            value={String(setCount)}
            keyboardType="number-pad"
            onChangeText={(text) => handleNumberInput(text, "sets")}
          />
        </View>
        {!curBlock && (
          <View style={cellStyle}>
            <LabeledTextInput
              label="Reps:"
              value={String(exercise.sets[0]?.reps || 0)}
              keyboardType="number-pad"
              editable={!editDisabled}
              onChangeText={(text) => handleNumberInput(text, "reps")}
            />
          </View>
        )}
      </View>
      {!curBlock && (
        <View style={rowStyle}>
          <View style={cellStyle}>
            <LabeledTextInput
              label="Weight:"
              value={
                exercise.sets[0]?.weight ? String(exercise.sets[0].weight) : ""
              }
              keyboardType="decimal-pad"
              editable={!editDisabled}
              onChangeText={(text) => handleNumberInput(text, "weight")}
            />
          </View>
          <View style={cellStyle}>
            <LabeledSelect
              label="Weight type:"
              value={exercise.weightType}
              options={WEIGHT_TYPES}
              includeEmptyOption
              onChange={(value) => switchExercise(value, "weightType")}
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
