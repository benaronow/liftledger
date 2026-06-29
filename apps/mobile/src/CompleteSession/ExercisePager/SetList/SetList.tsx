import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Exercise,
  Set,
  getCompletedSessionsInProgram,
} from "@liftledger/shared";
import { useProgram, useMe } from "@liftledger/api-client";
import { useCallback, useMemo } from "react";
import { View } from "react-native";
import { Text, TouchableRipple, useTheme } from "react-native-paper";
import { FONT, RADIUS, SPACING } from "../../../theme";
import { computeProgress } from "./computeProgress";
import { ProgressIcon } from "./ProgressIcon";

interface Props {
  exercise: Exercise;
  isCurrentExercise: boolean;
  onEditSet: (setIdx: number) => void;
}

export const SetList = ({ exercise, isCurrentExercise, onEditSet }: Props) => {
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { colors } = useTheme();

  // Progress icons compare against history *within this program only*. Using
  // completedExercises.previous (which spans all programs) was making a freshly
  // duplicated program's icons match against the source program's data.
  const intraProgramPrevious = useMemo<Exercise[]>(() => {
    if (!curProgram) return [];
    return getCompletedSessionsInProgram(curProgram)
      .flatMap((session) => session.exercises)
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
        ? colors.inversePrimary
        : nextSet
          ? colors.secondary
          : colors.surfaceDisabled;

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
          ? (exercise.sets[setIdx].reps ?? 0) - (lastCompletedSet.reps ?? 0)
          : 0;
        const weightDiff = exercise.sets[setIdx]
          ? (exercise.sets[setIdx].weight ?? 0) - (lastCompletedSet.weight ?? 0)
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

  return (
    <View style={{ width: "100%", gap: SPACING.sm }}>
      {exercise.sets.map((set, i) => {
        const diffs = getDiffs(i);
        return (
          <TouchableRipple
            key={i}
            testID={`set-row-${i}`}
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
                ? onEditSet(i)
                : undefined
            }
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
                <Text style={{ color: "white", fontWeight: "700", fontSize: FONT.sm }}>
                  {`${set.reps ?? 0} rep${(set.reps ?? 0) !== 1 ? "s" : ""}`}
                  {set.completed
                    ? ` (${getProgressString(diffs.repDiff)})`
                    : ""}
                </Text>
                <MaterialCommunityIcons name="close" size={12} color="white" />
                <Text style={{ color: "white", fontWeight: "700", fontSize: FONT.sm }}>
                  {`${set.weight ?? 0}${exercise.weightType}`}
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
    </View>
  );
};
