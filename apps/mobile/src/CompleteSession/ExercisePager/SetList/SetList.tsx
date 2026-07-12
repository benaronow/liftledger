import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Exercise,
  Set,
  getCompletedSessionsInProgram,
} from "@liftledger/shared";
import { useProgram } from "@liftledger/api-client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { Text, TouchableRipple, useTheme } from "react-native-paper";
import { FONT, RADIUS, SPACING } from "../../../theme";
import { computeProgress } from "./computeProgress";
import { ProgressIcon } from "./ProgressIcon";

export type SetKind = "warmup" | "working";

// Two-line column chip (label above the reps × weight row), so taller than the
// old single-line working-set row.
const ROW_HEIGHT = 56;

interface Props {
  exercise: Exercise;
  isCurrentExercise: boolean;
  onEditSet: (kind: SetKind, idx: number) => void;
}

export const SetList = ({ exercise, isCurrentExercise, onEditSet }: Props) => {
  const { data: curProgram } = useProgram();
  const { colors } = useTheme();

  const intraProgramPrevious = useMemo<Exercise[]>(() => {
    if (!curProgram) return [];
    return getCompletedSessionsInProgram(curProgram)
      .flatMap((session) => session.exercises)
      .reverse();
  }, [curProgram]);

  const chips = useMemo(
    () => [
      ...(exercise.warmupSets ?? []).map((set, idx) => ({
        kind: "warmup" as const,
        idx,
        set,
      })),
      ...exercise.workingSets.map((set, idx) => ({
        kind: "working" as const,
        idx,
        set,
      })),
    ],
    [exercise],
  );

  const nextChipPos = useMemo(() => {
    if (!isCurrentExercise) return -1;
    return chips.findIndex((chip) => !chip.set.completed && !chip.set.skipped);
  }, [chips, isCurrentExercise]);

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
          e.equipment === exercise.equipment &&
          e.gym === exercise.gym &&
          !!e.workingSets[setIdx] &&
          e.workingSets[setIdx].completed
        ) {
          lastCompletedSet = e.workingSets[setIdx];
          break;
        }
      }

      if (lastCompletedSet) {
        const repDiff = exercise.workingSets[setIdx]
          ? (exercise.workingSets[setIdx].reps ?? 0) - (lastCompletedSet.reps ?? 0)
          : 0;
        const weightDiff = exercise.workingSets[setIdx]
          ? (exercise.workingSets[setIdx].weight ?? 0) - (lastCompletedSet.weight ?? 0)
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

  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const [viewportH, setViewportH] = useState(0);
  const focusIdx = nextChipPos >= 0 ? nextChipPos : chips.length;

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
      {chips.map((chip, pos) => {
        const { kind, idx, set } = chip;
        const isWorking = kind === "working";
        const diffs = isWorking
          ? getDiffs(idx)
          : { repDiff: undefined, weightDiff: undefined };
        return (
          <TouchableRipple
            key={`${kind}-${idx}`}
            testID={`set-row-${kind}-${idx}`}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              height: ROW_HEIGHT,
              borderRadius: RADIUS.md,
              paddingLeft: SPACING.sm,
              backgroundColor: getBackground(set, pos === nextChipPos),
            }}
            onPress={() =>
              set.completed || set.skipped || pos <= nextChipPos
                ? onEditSet(kind, idx)
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
              <View style={{ gap: SPACING.xs }}>
                <Text
                  style={{
                    color: "white",
                    fontWeight: "700",
                    fontSize: FONT.xs,
                  }}
                >
                  {isWorking ? "Working" : "Warmup"}
                </Text>
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
                    {isWorking && set.completed
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
                    {`${set.weight ?? 0}${exercise.unit}`}
                    {isWorking && set.completed
                      ? ` (${getProgressString(diffs.weightDiff)})`
                      : ""}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  minWidth: 40,
                  height: ROW_HEIGHT,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isWorking && (
                  <ProgressIcon
                    sign={getProgressSign(idx)}
                    isSetComplete={set.completed}
                    isSetSkipped={set.skipped}
                  />
                )}
              </View>
            </View>
          </TouchableRipple>
        );
      })}
    </ScrollView>
  );
};
