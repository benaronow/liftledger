import { Exercise, WEIGHT_TYPES } from "@liftledger/shared";
import { Dispatch, SetStateAction, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import {
  getUpdatedExercise,
  useCompletedExercises,
  useCurrentDay,
  useMe,
} from "@liftledger/api-client";
import { ExerciseApparatusSelect } from "../../../../components/ExerciseApparatusSelect";
import { ExerciseNameSelect } from "../../../../components/ExerciseNameSelect";
import { LabeledSelect } from "../../../../components/inputs";
import { SPACING } from "../../../../theme";

type ExerciseInfoName = "name" | "apparatus" | "weightType";

interface Props {
  newExercise: Exercise;
  setNewExercise: Dispatch<SetStateAction<Exercise>>;
}

export const EditExercise = ({ newExercise, setNewExercise }: Props) => {
  const { exercises } = useCurrentDay();
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
    <View style={styles.body}>
      <ExerciseNameSelect
        label="Exercise:"
        curExercise={newExercise}
        reservedExercises={exercises}
        onSelect={(value) => switchExercise(value, "name")}
      />
      <ExerciseApparatusSelect
        label="Apparatus:"
        curExercise={newExercise}
        reservedExercises={exercises}
        onSelect={(value) => switchExercise(value, "apparatus")}
      />
      <LabeledSelect
        label="Weight Type:"
        value={newExercise.weightType}
        options={WEIGHT_TYPES}
        includeEmptyOption
        onChange={(value) => switchExercise(value, "weightType")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  body: { width: "100%", gap: SPACING.sm },
});
