import { Exercise } from "@liftledger/shared";
import { Dispatch, SetStateAction, useMemo } from "react";
import { Text } from "react-native";
import {
  findLatestOccurrence,
  useCompletedExercises,
  useMe,
} from "@liftledger/api-client";
import { LabeledTextInput } from "../../../../components/inputs";
import { FONT, SPACING } from "../../../../theme";

interface Props {
  exerciseState?: Exercise;
  setExerciseState: Dispatch<SetStateAction<Exercise | undefined>>;
  setIdx: number;
}

export const EditSet = ({ exerciseState, setExerciseState, setIdx }: Props) => {
  const { data: curUser } = useMe();
  const { data: completedExercises } = useCompletedExercises(curUser?._id);

  const latestPreviousSetNote = useMemo(() => {
    return findLatestOccurrence(
      completedExercises,
      (e: Exercise) =>
        e.name === exerciseState?.name &&
        e.apparatus === exerciseState?.apparatus &&
        !!e.sets[setIdx],
    )?.sets[setIdx].note;
  }, [exerciseState, setIdx, completedExercises]);

  const handleChange = (text: string, type: "reps" | "weight" | "note") => {
    if (!exerciseState) return;

    setExerciseState({
      ...exerciseState,
      sets: exerciseState.sets.toSpliced(setIdx, 1, {
        ...exerciseState.sets[setIdx],
        reps:
          type === "reps"
            ? parseInt(text) || 0
            : exerciseState.sets[setIdx].reps,
        weight:
          type === "weight"
            ? parseFloat(text) || 0
            : exerciseState.sets[setIdx].weight,
        note: type === "note" ? text : exerciseState.sets[setIdx].note,
      }),
    });
  };

  const curSet = exerciseState?.sets[setIdx];

  return (
    <>
      {!!latestPreviousSetNote && (
        <Text style={{ width: "100%", color: "white", fontSize: FONT.sm, marginBottom: SPACING.xs }}>{`Previous note: ${latestPreviousSetNote}`}</Text>
      )}
      <LabeledTextInput
        label="Reps:"
        value={curSet?.reps ? String(curSet.reps) : ""}
        keyboardType="number-pad"
        onChangeText={(text) => handleChange(text, "reps")}
      />
      <LabeledTextInput
        label="Weight:"
        value={curSet?.weight ? String(curSet.weight) : ""}
        keyboardType="decimal-pad"
        onChangeText={(text) => handleChange(text, "weight")}
      />
      <LabeledTextInput
        label="Note:"
        value={curSet?.note}
        onChangeText={(text) => handleChange(text, "note")}
      />
    </>
  );
};

