import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Exercise,
  Set,
  getCompletedSessionsInProgram,
} from "@liftledger/shared";
import { isExerciseComplete, useProgram, useMe } from "@liftledger/api-client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { Text, TouchableRipple, useTheme } from "react-native-paper";
import { FONT, RADIUS, SPACING } from "../../../theme";
import { computeProgress } from "./computeProgress";
import { ProgressIcon } from "./ProgressIcon";

const ROW_HEIGHT = 40;

interface Props {
  exercise: Exercise;
  isCurrentExercise: boolean;
  onEditSet: (setIdx: number) => void;
}

export const SetList = ({ exercise, isCurrentExercise, onEditSet }: Props) => {
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { colors } = useTheme();

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
        ? "#7D7D82"
        : nextSet
          ? colors.secondary
          : colors.surfaceDisabled;

  const getDiffs = useCallback(
    (setIdx: number) => {
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

  const canAddSet =
    isExerciseComplete(exercise) && !exercise.sets.some((set) => set.skipped);

  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const [viewportH, setViewportH] = useState(0);
  const focusIdx = nextSetIdx >= 0 ? nextSetIdx : exercise.sets.length;

  useEffect(() => {
    if (!viewportH) return;
    const top = SPACING.sm + focusIdx * (ROW_HEIGHT + SPACING.sm);
    const bottom = top + ROW_HEIGHT;
    if (top < scrollY.current) {
      scrollRef.current?.scrollTo({ y: top, animated: true });
    } else if (bottom > scrollY.current + viewportH) {
      scrollRef.current?.scrollTo({ y: bottom - viewportH, animated: true });
    }
  }, [focusIdx, viewportH]);

  return (
    <ScrollView
      ref={scrollRef}
      onLayout={(e) => setViewportH(e.nativeEvent.layout.height)}
      onScroll={(e) => {
        scrollY.current = e.nativeEvent.contentOffset.y;
      }}
      scrollEventThrottle={16}
      style={{
        flex: 1,
        width: "100%",
        borderRadius: RADIUS.sm,
        backgroundColor: colors.secondaryContainer,
      }}
      contentContainerStyle={{
        gap: SPACING.sm,
        padding: SPACING.sm,
      }}
    >
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: SPACING.sm,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "700",
                    fontSize: FONT.sm,
                  }}
                >
                  {`${set.reps ?? 0} rep${(set.reps ?? 0) !== 1 ? "s" : ""}`}
                  {set.completed
                    ? ` (${getProgressString(diffs.repDiff)})`
                    : ""}
                </Text>
                <MaterialCommunityIcons name="close" size={12} color="white" />
                <Text
                  style={{
                    color: "white",
                    fontWeight: "700",
                    fontSize: FONT.sm,
                  }}
                >
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
      <TouchableRipple
        testID="add-set"
        accessibilityLabel="Add set"
        disabled={!canAddSet}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          height: 40,
          borderRadius: RADIUS.md,
          backgroundColor: canAddSet ? colors.primary : colors.surfaceDisabled,
        }}
        onPress={() => onEditSet(exercise.sets.length)}
      >
        <MaterialCommunityIcons
          name="plus"
          size={20}
          color={canAddSet ? colors.onPrimary : colors.onSurfaceDisabled}
        />
      </TouchableRipple>
    </ScrollView>
  );
};
