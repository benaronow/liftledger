import { Exercise, Set } from "@liftledger/shared";
import { Dispatch, SetStateAction, useMemo } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import {
  findLatestOccurrence,
  useCompletedExercises,
  useMe,
} from "@liftledger/api-client";
import { AppTextInput, NumberInput } from "../../../../components/inputs";
import { FONT, SPACING } from "../../../../theme";

interface Props {
  exerciseState?: Exercise;
  setExerciseState: Dispatch<SetStateAction<Exercise | undefined>>;
  setIdx: number;
}

export const EditSet = ({ exerciseState, setExerciseState, setIdx }: Props) => {
  const { data: curUser } = useMe();
  const { data: completedExercises } = useCompletedExercises(curUser?._id);

  const curSet = exerciseState?.sets[setIdx];

  const latestPreviousSetNote = useMemo(() => {
    return findLatestOccurrence(
      completedExercises,
      (e: Exercise) =>
        e.name === exerciseState?.name &&
        e.equipment === exerciseState?.equipment &&
        !!e.sets[setIdx],
    )?.sets[setIdx].note;
  }, [exerciseState, setIdx, completedExercises]);

  const updateSet = (update: Partial<Set>) => {
    if (!exerciseState) return;

    setExerciseState({
      ...exerciseState,
      sets: exerciseState.sets.toSpliced(setIdx, 1, {
        ...exerciseState.sets[setIdx],
        ...update,
      }),
    });
  };

  return (
    <View style={{ width: "100%", gap: SPACING.sm }}>
      {!!latestPreviousSetNote && (
        <Text style={{ color: "white", fontSize: FONT.sm }}>{`Previous note: ${latestPreviousSetNote}`}</Text>
      )}
      <NumberInput
        label="Reps"
        testID="set-input-reps"
        value={curSet?.reps ?? null}
        onChangeValue={(reps) => updateSet({ reps })}
      />
      <NumberInput
        label="Weight"
        testID="set-input-weight"
        value={curSet?.weight ?? null}
        decimal
        onChangeValue={(weight) => updateSet({ weight })}
      />
      <AppTextInput
        label="Note"
        testID="set-input-note"
        value={curSet?.note}
        onChangeText={(note) => updateSet({ note })}
      />
    </View>
  );
};
