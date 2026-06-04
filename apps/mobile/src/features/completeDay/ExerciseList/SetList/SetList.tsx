import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  Exercise,
  Set,
  getCompletedDaysInBlock,
} from "@liftledger/shared";
import { isExerciseComplete, useBlock, useMe } from "@liftledger/api-client";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ActionButton } from "../../../../components/ActionButton";
import { FONT, RADIUS, SPACING } from "../../../../theme";
import { computeProgress } from "./computeProgress";
import { ProgressIcon } from "./ProgressIcon";
import { SubmitSetDialog } from "./SubmitSetDialog/SubmitSetDialog";

interface Props {
  exercise: Exercise;
  isCurrentExercise: boolean;
}

export const SetList = ({ exercise, isCurrentExercise }: Props) => {
  const { data: curUser } = useMe();
  const { data: curBlock } = useBlock(curUser?._id, curUser?.curBlock);
  const [editingSetIdx, setEditingSetIdx] = useState<number>();

  // Progress icons compare against history *within this block only*. Using
  // completedExercises.previous (which spans all blocks) was making a freshly
  // duplicated block's icons match against the source block's data.
  const intraBlockPrevious = useMemo<Exercise[]>(() => {
    if (!curBlock) return [];
    return getCompletedDaysInBlock(curBlock)
      .flatMap((day) => day.exercises)
      .reverse();
  }, [curBlock]);

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
      ? COLORS.primary
      : set.skipped
        ? COLORS.primaryDark
        : nextSet
          ? COLORS.secondary
          : COLORS.primaryDisabled;

  const getDiffs = useCallback(
    (setIdx: number) => {
      // Same predicate as findLatestOccurrence, but scoped to intra-block
      // history only — fresh duplicate blocks would otherwise show "+0/+0"
      // diffs against the source block.
      let lastCompletedSet: Set | undefined;
      for (const e of intraBlockPrevious) {
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
    [exercise, intraBlockPrevious],
  );

  const getProgressString = (diff: number | undefined) => {
    if (!diff) return "--";
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  const getProgressSign = useCallback(
    (setIdx: number) => computeProgress(setIdx, exercise, intraBlockPrevious),
    [exercise, intraBlockPrevious],
  );

  const exerciseHasSkippedSets = useMemo(
    () => exercise.sets.some((set) => set.skipped),
    [exercise.sets],
  );

  return (
    <View style={styles.container}>
      {exercise.sets.map((set, i) => {
        const diffs = getDiffs(i);
        return (
          <Pressable
            key={i}
            style={[
              styles.setRow,
              { backgroundColor: getBackground(set, i === nextSetIdx) },
            ]}
            onPress={() =>
              set.completed || set.skipped || i <= nextSetIdx
                ? setEditingSetIdx(i)
                : undefined
            }
          >
            <View style={styles.setStats}>
              <Text style={styles.statText}>
                {`${set.reps} rep${set.reps !== 1 ? "s" : ""}`}
                {set.completed
                  ? ` (${getProgressString(diffs.repDiff)})`
                  : ""}
              </Text>
              <Ionicons name="close" size={12} color="white" />
              <Text style={styles.statText}>
                {`${set.weight}${exercise.weightType}`}
                {set.completed
                  ? ` (${getProgressString(diffs.weightDiff)})`
                  : ""}
              </Text>
            </View>
            <View style={styles.iconCell}>
              <View style={styles.divider} />
              <ProgressIcon
                sign={getProgressSign(i)}
                isSetComplete={set.completed}
                isSetSkipped={set.skipped}
              />
            </View>
          </Pressable>
        );
      })}
      <ActionButton
        label="Add set"
        height={40}
        icon={<Ionicons name="add-circle-outline" size={20} color="white" />}
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

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: SPACING.sm,
    gap: SPACING.sm,
    backgroundColor: COLORS.container,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 40,
    borderRadius: RADIUS.md,
    paddingLeft: SPACING.sm,
  },
  setStats: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  statText: { color: "white", fontWeight: "700", fontSize: FONT.sm },
  iconCell: {
    minWidth: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    position: "absolute",
    left: 0,
    width: 1,
    height: 30,
    backgroundColor: "white",
  },
});
