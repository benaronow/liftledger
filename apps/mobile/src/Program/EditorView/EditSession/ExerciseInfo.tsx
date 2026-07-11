import {
  useProgram,
  useCompletedExercises,
  CurrentExercisesState,
} from "@liftledger/api-client";
import {
  Exercise,
  getNewSetsFromLatest,
  getUpdatedExercise,
} from "@liftledger/shared";
import { useCallback, useMemo } from "react";
import { View } from "react-native";
import { EquipmentSelect } from "../../../components/EquipmentSelect";
import { ExerciseNameSelect } from "../../../components/ExerciseNameSelect";
import { UnitSelect } from "../../../components/UnitSelect";
import { SPACING } from "../../../theme";
import { NumberInput } from "../../../components/inputs";
import { Info, InfoAction } from "../../../components/Info";
import { useTemplate } from "../../TemplateProvider";
import { fullExerciseIndex, moveExercise } from "./moveExercise";

type ExerciseInfoName = "name" | "equipment" | "unit";

interface Props {
  exercise: Exercise;
  eIdx: number;
  onRequestDelete: (eIdx: number) => void;
}

export const ExerciseInfo = ({ exercise, eIdx, onRequestDelete }: Props) => {
  const { data: curProgram } = useProgram();
  const { data: completedExercises } = useCompletedExercises();
  const {
    templateProgram,
    setTemplateProgram,
    editingRotationIdx,
    editingSessionIdx,
    templateErrors,
  } = useTemplate();

  const errors =
    templateErrors.sessions[editingSessionIdx]?.exercises[eIdx] ?? {};

  const curSessionExercises = useMemo(
    () =>
      templateProgram.rotations[editingRotationIdx][editingSessionIdx]
        .exercises,
    [templateProgram, editingRotationIdx, editingSessionIdx],
  );

  const visibleExerciseCount = useMemo(
    () => curSessionExercises.filter((e) => !e.addedOn).length,
    [curSessionExercises],
  );

  const updateExercise = useCallback(
    (exerciseUpdate: Exercise) => {
      const fullIdx = fullExerciseIndex(curSessionExercises, eIdx);

      setTemplateProgram({
        ...templateProgram,
        rotations: templateProgram.rotations.map((rotation, wIdx) =>
          wIdx === editingRotationIdx
            ? rotation.map((session, dIdx) =>
                dIdx === editingSessionIdx
                  ? {
                      ...session,
                      exercises: session.exercises.map((ex, idx) =>
                        idx === fullIdx ? exerciseUpdate : ex,
                      ),
                    }
                  : session,
              )
            : rotation,
        ),
      });
    },
    [
      templateProgram,
      setTemplateProgram,
      editingRotationIdx,
      editingSessionIdx,
      eIdx,
      curSessionExercises,
    ],
  );

  const handleMoveExercise = (type: "up" | "down") => {
    setTemplateProgram({
      ...templateProgram,
      rotations: templateProgram.rotations.map((rotation, wIdx) =>
        wIdx === editingRotationIdx
          ? rotation.map((session, dIdx) =>
              dIdx !== editingSessionIdx
                ? session
                : {
                    ...session,
                    exercises: moveExercise(session.exercises, eIdx, type),
                  },
            )
          : rotation,
      ),
    });
  };

  const handleSetsCount = (count: number | null) => {
    if (count == null) return;

    updateExercise({
      ...exercise,
      workingSets: getNewSetsFromLatest(
        completedExercises,
        exercise,
        Math.min(count, 999),
      ),
    });
  };

  const updateSetsField = (field: "reps" | "weight", value: number | null) => {
    updateExercise({
      ...exercise,
      workingSets: exercise.workingSets.map((set) => ({
        ...set,
        reps: field === "reps" ? value : exercise.workingSets[0].reps,
        weight: field === "weight" ? value : exercise.workingSets[0].weight,
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

  const editDisabled = !exercise.workingSets.length;

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
      disabled: curSessionExercises.length === 1,
      onPress: () => onRequestDelete(eIdx),
      variant: "danger",
    },
  ];

  const setCount = useMemo(
    () => exercise.workingSets.filter((set) => !set.addedOn).length,
    [exercise],
  );

  const currentExercisesState = useMemo<CurrentExercisesState>(
    () => ({
      curExercise: exercise,
      allReservedExercises: curSessionExercises,
    }),
    [curSessionExercises, exercise],
  );

  return (
    <Info title={`Exercise ${eIdx + 1}`} actions={infoActions}>
      <ExerciseNameSelect
        value={exercise.name ?? ""}
        label="Exercise"
        error={errors.name}
        currentExercisesState={currentExercisesState}
        onSelect={(value) => switchExercise(value, "name")}
        canAddCustom
      />
      <EquipmentSelect
        value={exercise.equipment ?? ""}
        label="Equipment"
        error={errors.equipment}
        currentExercisesState={currentExercisesState}
        onSelect={(value) => switchExercise(value, "equipment")}
        canAddCustom
      />
      <View style={rowStyle}>
        <NumberInput
          style={{ flex: 1 }}
          label="Sets"
          value={setCount}
          error={errors.workingSets}
          onChangeValue={handleSetsCount}
        />
        {!curProgram && (
          <NumberInput
            style={{ flex: 1 }}
            label="Reps"
            value={exercise.workingSets[0]?.reps ?? null}
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
            value={exercise.workingSets[0]?.weight ?? null}
            decimal
            disabled={editDisabled}
            onChangeValue={(weight) => updateSetsField("weight", weight)}
          />
          <View style={cellStyle}>
            <UnitSelect
              label="Unit"
              error={errors.unit}
              value={exercise.unit}
              onSelect={(value) => switchExercise(value, "unit")}
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
