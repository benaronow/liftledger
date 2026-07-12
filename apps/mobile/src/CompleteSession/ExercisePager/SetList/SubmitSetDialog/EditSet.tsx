import { Exercise, Set, findLatestOccurrence } from "@liftledger/shared";
import { Dispatch, SetStateAction, useMemo } from "react";
import { Pressable, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCompletedExercises } from "@liftledger/api-client";
import { AppTextInput, NumberInput } from "../../../../components/inputs";
import { FONT, SPACING } from "../../../../theme";
import { SetKind } from "../SetList";

interface Props {
  exerciseState?: Exercise;
  setExerciseState: Dispatch<SetStateAction<Exercise | undefined>>;
  kind: SetKind;
  setIdx: number;
}

export const EditSet = ({
  exerciseState,
  setExerciseState,
  kind,
  setIdx,
}: Props) => {
  const { colors } = useTheme();
  const { data: completedExercises } = useCompletedExercises();

  const isWarmup = kind === "warmup";
  const curSet = isWarmup
    ? exerciseState?.warmupSets?.[setIdx]
    : exerciseState?.workingSets[setIdx];
  const dropSets = curSet?.dropSets ?? [];

  const latestPreviousSetNote = useMemo(() => {
    const occurrence = findLatestOccurrence(
      completedExercises,
      (e: Exercise) =>
        e.name === exerciseState?.name &&
        e.equipment === exerciseState?.equipment &&
        (isWarmup ? !!e.warmupSets?.[setIdx] : !!e.workingSets[setIdx]),
    );
    return isWarmup
      ? occurrence?.warmupSets?.[setIdx]?.note
      : occurrence?.workingSets[setIdx]?.note;
  }, [exerciseState, setIdx, completedExercises, isWarmup]);

  const updateSet = (update: Partial<Set>) => {
    if (!exerciseState) return;

    if (isWarmup) {
      const warmups = exerciseState.warmupSets ?? [];
      setExerciseState({
        ...exerciseState,
        warmupSets: warmups.toSpliced(setIdx, 1, {
          ...warmups[setIdx],
          ...update,
        }),
      });
    } else {
      setExerciseState({
        ...exerciseState,
        workingSets: exerciseState.workingSets.toSpliced(setIdx, 1, {
          ...exerciseState.workingSets[setIdx],
          ...update,
        }),
      });
    }
  };

  const handleAddDropset = () => {
    const dropIdx = dropSets.length;
    const prefill = findLatestOccurrence(
      completedExercises,
      (e: Exercise) =>
        e.name === exerciseState?.name &&
        e.equipment === exerciseState?.equipment &&
        e.gym === exerciseState?.gym &&
        !!e.workingSets[setIdx]?.dropSets?.[dropIdx],
    )?.workingSets[setIdx].dropSets![dropIdx];

    updateSet({
      dropSets: [
        ...dropSets,
        {
          reps: prefill?.reps ?? null,
          weight: prefill?.weight ?? null,
          note: "",
          completed: false,
        },
      ],
    });
  };

  const handleDropChange = (
    dropIdx: number,
    field: "reps" | "weight",
    value: number | null,
  ) =>
    updateSet({
      dropSets: dropSets.toSpliced(dropIdx, 1, {
        ...dropSets[dropIdx],
        [field]: value,
      }),
    });

  const handleDeleteDrop = (dropIdx: number) =>
    updateSet({ dropSets: dropSets.toSpliced(dropIdx, 1) });

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
      {!isWarmup && (
        <>
          {dropSets.map((drop, dropIdx) => (
            <View
              key={dropIdx}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: SPACING.sm,
              }}
            >
              <NumberInput
                style={{ flex: 1 }}
                label="Reps"
                testID={`dropset-input-reps-${dropIdx}`}
                value={drop.reps ?? null}
                onChangeValue={(reps) => handleDropChange(dropIdx, "reps", reps)}
              />
              <NumberInput
                style={{ flex: 1 }}
                label="Weight"
                testID={`dropset-input-weight-${dropIdx}`}
                value={drop.weight ?? null}
                decimal
                onChangeValue={(weight) =>
                  handleDropChange(dropIdx, "weight", weight)
                }
              />
              <Pressable
                onPress={() => handleDeleteDrop(dropIdx)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Delete dropset"
              >
                <MaterialCommunityIcons
                  name="delete"
                  size={22}
                  color={colors.error}
                />
              </Pressable>
            </View>
          ))}
          <Pressable
            onPress={handleAddDropset}
            accessibilityRole="button"
            accessibilityLabel="Add dropset"
            style={{ alignSelf: "flex-start" }}
          >
            <Text
              style={{
                color: colors.primary,
                fontWeight: "700",
                fontSize: FONT.sm,
              }}
            >
              + Add dropset
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
};
