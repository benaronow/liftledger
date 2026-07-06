import { Exercise } from "@liftledger/shared";
import { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import { View } from "react-native";
import {
  CurrentExercisesState,
  getUpdatedExercise,
  useCompletedExercises,
  useCurrentSession,
  useMe,
} from "@liftledger/api-client";
import { ExerciseEquipmentSelect } from "../../../components/ExerciseEquipmentSelect";
import { ExerciseNameSelect } from "../../../components/ExerciseNameSelect";
import { UnitSelect } from "../../../components/UnitSelect";
import { SPACING } from "../../../theme";

type ExerciseInfoName = "name" | "equipment" | "unit";

interface Props {
  newExercise: Exercise;
  setNewExercise: Dispatch<SetStateAction<Exercise>>;
}

export const EditExercise = ({ newExercise, setNewExercise }: Props) => {
  const { exercises } = useCurrentSession();
  const { data: curUser } = useMe();
  const { data: completedExercises } = useCompletedExercises(curUser?._id);

  const switchExercise = useCallback(
    (value: string, type: ExerciseInfoName) => {
      setNewExercise(
        getUpdatedExercise(completedExercises, value, type, newExercise),
      );
    },
    [completedExercises, newExercise, setNewExercise],
  );

  const currentExercisesState = useMemo<CurrentExercisesState>(
    () => ({
      curExercise: newExercise,
      allReservedExercises: exercises,
    }),
    [exercises, newExercise],
  );

  return (
    <View style={{ width: "100%", gap: SPACING.sm }}>
      <ExerciseNameSelect
        value={newExercise.name}
        label="Exercise"
        currentExercisesState={currentExercisesState}
        onSelect={(value) => switchExercise(value, "name")}
        canAddCustom
      />
      <ExerciseEquipmentSelect
        value={newExercise.equipment}
        label="Equipment"
        currentExercisesState={currentExercisesState}
        onSelect={(value) => switchExercise(value, "equipment")}
        canAddCustom
      />
      <UnitSelect
        label="Unit"
        value={newExercise.unit}
        onSelect={(value) => switchExercise(value, "unit")}
      />
    </View>
  );
};
