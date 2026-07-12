import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { Exercise } from "@liftledger/shared";
import { isExerciseComplete } from "@liftledger/api-client";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Badge } from "../../components/Badge";
import { Info } from "../../components/Info";
import {
  FAB_SIZE,
  FAB_TOP,
  timerTitleRightInset,
  titleRightInset,
} from "../../layout";
import { Text, useTheme } from "react-native-paper";
import { ProgressChart } from "../../Progress/ProgressChart";
import type { RootStackParamList } from "../../RootNavigator/types";
import { FONT, SPACING } from "../../theme";
import { SetKind, SetList } from "./SetList/SetList";
import { SubmitSetDialog } from "./SetList/SubmitSetDialog/SubmitSetDialog";

interface Props {
  exercise: Exercise;
  isCurrentExercise: boolean;
  timerRunning: boolean;
  onChartTouchStart?: () => void;
  onChartTouchEnd?: () => void;
}

export const ExercisePage = ({
  exercise,
  isCurrentExercise,
  timerRunning,
  onChartTouchStart,
  onChartTouchEnd,
}: Props) => {
  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [editingSet, setEditingSet] = useState<{
    kind: SetKind;
    idx: number;
  }>();
  const [showAll, setShowAll] = useState(false);

  // Add-set enable logic (spec C3). Two non-overlapping cases: add a warmup
  // while none are logged yet and no working set has been started, or add a
  // working set once all working sets are done. "started" = completed or
  // skipped, so warmup-add doesn't re-enable after a working set is skipped.
  const warmups = exercise.warmupSets ?? [];
  const allWarmupsDone = warmups.every((s) => s.completed || s.skipped);
  const anyWorkingStarted = exercise.workingSets.some(
    (s) => s.completed || s.skipped,
  );
  const noWarmupSkipped = !warmups.some((s) => s.skipped);
  const noWorkingSkipped = !exercise.workingSets.some((s) => s.skipped);
  const allWorkingDone = isExerciseComplete(exercise);

  const canAddWarmup = allWarmupsDone && !anyWorkingStarted && noWarmupSkipped;
  const canAddWorking = allWorkingDone && noWorkingSkipped;
  const canAdd = canAddWarmup || canAddWorking;
  const addKind: SetKind = canAddWarmup ? "warmup" : "working";

  const handleAddSet = () =>
    setEditingSet({
      kind: addKind,
      idx: addKind === "warmup" ? warmups.length : exercise.workingSets.length,
    });

  const openFullProgress = () =>
    navigation.navigate(
      "Tabs",
      {
        screen: "Progress",
        params: { name: exercise.name, equipment: exercise.equipment },
      },
      { pop: true },
    );

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: SPACING.lg,
        paddingTop: FAB_TOP,
      }}
    >
      <View
        style={{
          marginBottom: SPACING.md,
          paddingRight:
            (timerRunning ? timerTitleRightInset() : titleRightInset(1)) -
            SPACING.lg,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: SPACING.sm,
            minHeight: FAB_SIZE,
          }}
        >
          <Text
            style={{
              flexShrink: 1,
              fontSize: FONT.xl,
              fontWeight: "700",
              color: colors.onSurface,
            }}
          >
            {exercise.name}
          </Text>
          {exercise.addedOn && <Badge label="ADD-ON" />}
        </View>
        <Text
          style={{
            fontSize: FONT.base,
            fontWeight: "600",
            color: colors.onSurfaceDisabled,
          }}
        >
          {exercise.equipment}
        </Text>
      </View>
      <Info
        title="Sets"
        fill
        headerRight={
          <Pressable
            onPress={handleAddSet}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Add set"
            disabled={!canAdd}
          >
            <MaterialCommunityIcons
              name="plus"
              size={20}
              color={canAdd ? colors.primary : colors.onSurfaceDisabled}
            />
          </Pressable>
        }
      >
        <SetList
          exercise={exercise}
          isCurrentExercise={isCurrentExercise}
          onEditSet={(kind, idx) => setEditingSet({ kind, idx })}
        />
      </Info>
      <Info
        title="Progress"
        fill
        overflowVisible
        headerRight={
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: SPACING.md,
            }}
          >
            <Pressable
              onPress={() => setShowAll((v) => !v)}
              hitSlop={8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: SPACING.xs,
              }}
            >
              <MaterialCommunityIcons
                name={showAll ? "checkbox-marked" : "checkbox-blank-outline"}
                size={20}
                color={showAll ? colors.primary : colors.onSurfaceVariant}
              />
              <Text style={{ color: colors.onSurface, fontSize: FONT.base }}>
                Show all
              </Text>
            </Pressable>
            <Pressable
              onPress={openFullProgress}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Open full progress"
            >
              <MaterialCommunityIcons
                name="arrow-expand"
                size={20}
                color={colors.primary}
              />
            </Pressable>
          </View>
        }
      >
        <View
          style={{ flex: 1 }}
          onTouchStart={onChartTouchStart}
          onTouchEnd={onChartTouchEnd}
          onTouchCancel={onChartTouchEnd}
        >
          <ProgressChart
            selectedName={exercise.name}
            selectedEquipment={exercise.equipment}
            gym={showAll ? undefined : exercise.gym}
          />
        </View>
      </Info>
      <SubmitSetDialog
        exercise={exercise}
        editingSet={editingSet}
        onClose={() => setEditingSet(undefined)}
      />
    </View>
  );
};
