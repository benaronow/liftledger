import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Exercise,
  Set,
  getCompletedDaysInProgram,
} from "@liftledger/shared";
import { isExerciseComplete, useProgram, useMe } from "@liftledger/api-client";
import { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { Text, TouchableRipple, useTheme } from "../../../paper";
import { ActionButton } from "../../../components/ActionButton";
import { FONT, RADIUS, SPACING } from "../../../theme";
import { computeProgress } from "./computeProgress";
import { ProgressIcon } from "./ProgressIcon";
import { SubmitSetDialog } from "./SubmitSetDialog/SubmitSetDialog";

interface Props {
  exercise: Exercise;
  isCurrentExercise: boolean;
}

export const SetList = ({ exercise, isCurrentExercise }: Props) => {
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const [editingSetIdx, setEditingSetIdx] = useState<number>();
  const { colors } = useTheme();

  // Progress icons compare against history *within this program only*. Using
  // completedExercises.previous (which spans all programs) was making a freshly
  // duplicated program's icons match against the source program's data.
  const intraProgramPrevious = useMemo<Exercise[]>(() => {
    if (!curProgram) return [];
    return getCompletedDaysInProgram(curProgram)
      .flatMap((day) => day.exercises)
      .reverse();
  }, [curProgram]);

  const nextSetIdx = useMemo(() => {
    if (!isCurrentExercise) return -1;
    for (let i = 0; i <= exercise?.sets.length; i++) {
      if (!exercise?.sets[i]?.completed && !exercise?.sets[i]?.skipped)
        return i;
    }
    return -1;
  }, [exercise, isCurrentExercise]);

  const getBackground = (set: Set, nextSet: boolean) =>
    set.completed
      ? colors.primary
      : set.skipped
        ? colors.primaryDark
        : nextSet
          ? colors.secondary
          : colors.primaryDisabled;

  const getDiffs = useCallback(
    (setIdx: number) => {
      // Same predicate as findLatestOccurrence, but scoped to intra-program
      // history only — fresh duplicate programs would otherwise show "+0/+0"
      // diffs against the source program.
      let lastCompletedSet: Set | undefined;
      for (const e of intraProgramPrevious) {
        if (
          e.name === exercise.name &&
          e.apparatus === exercise.apparatus &&
          e.gym === exercise.gym &&
          !!e.sets[setIdx] &&
          e.sets[setIdx].completed
        ) {
          lastCompletedSet = e.sets[setIdx];
          break;
        }
      }

      if (lastCompletedSet) {
        const repDiff = exercise.sets[setIdx]
          ? exercise.sets[setIdx].reps - lastCompletedSet.reps
          : 0;
        const weightDiff = exercise.sets[setIdx]
          ? exercise.sets[setIdx].weight - lastCompletedSet.weight
          : 0;
        return { repDiff, weightDiff };
      }

      return { repDiff: undefined, weightDiff: undefined };
    },
    [exercise, intraProgramPrevious],
  );

  const getProgressString = (diff: number | undefined) => {
    if (!diff) return "--";
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  const getProgressSign = useCallback(
    (setIdx: number) => computeProgress(setIdx, exercise, intraProgramPrevious),
    [exercise, intraProgramPrevious],
  );

  const exerciseHasSkippedSets = useMemo(
    () => exercise.sets.some((set) => set.skipped),
    [exercise.sets],
  );

  return (
    <View
      style={{
        width: "100%",
        padding: SPACING.sm,
        gap: SPACING.sm,
        backgroundColor: colors.container,
      }}
    >
      {exercise.sets.map((set, i) => {
        const diffs = getDiffs(i);
        return (
          <TouchableRipple
            key={i}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              height: 40,
              borderRadius: RADIUS.md,
              paddingLeft: SPACING.sm,
              backgroundColor: getBackground(set, i === nextSetIdx),
            }}
            onPress={() =>
              set.completed || set.skipped || i <= nextSetIdx
                ? setEditingSetIdx(i)
                : undefined
            }
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
                <Text style={{ color: "white", fontWeight: "700", fontSize: FONT.sm }}>
                  {`${set.reps} rep${set.reps !== 1 ? "s" : ""}`}
                  {set.completed
                    ? ` (${getProgressString(diffs.repDiff)})`
                    : ""}
                </Text>
                <MaterialCommunityIcons name="close" size={12} color="white" />
                <Text style={{ color: "white", fontWeight: "700", fontSize: FONT.sm }}>
                  {`${set.weight}${exercise.weightType}`}
                  {set.completed
                    ? ` (${getProgressString(diffs.weightDiff)})`
                    : ""}
                </Text>
              </View>
              <View
                style={{
                  minWidth: 40,
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    width: 1,
                    height: 30,
                    backgroundColor: "white",
                  }}
                />
                <ProgressIcon
                  sign={getProgressSign(i)}
                  isSetComplete={set.completed}
                  isSetSkipped={set.skipped}
                />
              </View>
            </View>
          </TouchableRipple>
        );
      })}
      <ActionButton
        label="Add set"
        height={40}
        icon={<MaterialCommunityIcons name="plus-circle-outline" size={20} color="white" />}
        onPress={() => setEditingSetIdx(exercise.sets.length)}
        disabled={!isExerciseComplete(exercise) || exerciseHasSkippedSets}
      />
      <SubmitSetDialog
        exercise={exercise}
        setIdx={editingSetIdx}
        onClose={() => setEditingSetIdx(undefined)}
      />
    </View>
  );
};
