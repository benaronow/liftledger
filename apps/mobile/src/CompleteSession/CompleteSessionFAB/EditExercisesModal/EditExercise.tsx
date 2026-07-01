import { Exercise } from "@liftledger/shared";
import { Dispatch, SetStateAction, useCallback } from "react";
import { View } from "react-native";
import {
  getUpdatedExercise,
  useCompletedExercises,
  useCurrentSession,
  useMe,
} from "@liftledger/api-client";
import { ExerciseEquipmentSelect } from "../../../components/ExerciseEquipmentSelect";
import { ExerciseNameSelect } from "../../../components/ExerciseNameSelect";
import { WeightTypeSelect } from "../../../components/WeightTypeSelect";
import { SPACING } from "../../../theme";

type ExerciseInfoName = "name" | "equipment" | "weightType";

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

  return (
    <View style={{ width: "100%", gap: SPACING.sm }}>
      <ExerciseNameSelect
        label="Exercise"
        curExercise={newExercise}
        reservedExercises={exercises}
        onSelect={(value) => switchExercise(value, "name")}
      />
      <ExerciseEquipmentSelect
        label="Equipment"
        curExercise={newExercise}
        reservedExercises={exercises}
        onSelect={(value) => switchExercise(value, "equipment")}
      />
      <WeightTypeSelect
        label="Weight Type"
        value={newExercise.weightType}
        onSelect={(value) => switchExercise(value, "weightType")}
      />
    </View>
  );
};

