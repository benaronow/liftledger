import { MaterialCommunityIcons } from "@expo/vector-icons";
import { isExerciseComplete } from "@liftledger/api-client";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { Exercise } from "@liftledger/shared";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge } from "../../components/Badge";
import { Info, InfoAction } from "../../components/Info";
import { FAB_SIZE, FAB_TOP, titleRightInset } from "../../layout";
import { Text, useTheme } from "react-native-paper";
import { ProgressChart } from "../../Progress/ProgressChart";
import type { RootStackParamList } from "../../RootNavigator/types";
import { FONT, SPACING } from "../../theme";
import { pagerBarClearance } from "./PagerBar";
import { SetList } from "./SetList/SetList";
import { SubmitSetDialog } from "./SetList/SubmitSetDialog/SubmitSetDialog";

interface Props {
  exercise: Exercise;
  isCurrentExercise: boolean;
  // Page width — each page fills one screen of the horizontal pager.
  width: number;
}

// Height of the chart area inside the Progress card (the chart sizes itself
// to its container, so it needs a fixed height inside the scroll content).
const CHART_HEIGHT = 280;

export const ExercisePage = ({
  exercise,
  isCurrentExercise,
  width,
}: Props) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [editingSetIdx, setEditingSetIdx] = useState<number>();

  // Jump to the full Progress page (all gyms) for this exercise, replacing
  // CompleteSession so there's no back stack (pop), like the dashboard bounce.
  const openFullProgress = () =>
    navigation.navigate(
      "Tabs",
      {
        screen: "Progress",
        params: { name: exercise.name, apparatus: exercise.apparatus },
      },
      { pop: true },
    );

  const isComplete = isExerciseComplete(exercise);

  const setsActions: InfoAction[] = [
    {
      icon: "plus",
      accessibilityLabel: "Add set",
      onPress: () => setEditingSetIdx(exercise.sets.length),
      // Extra sets can only follow a fully completed exercise, and skipping a
      // set forfeits the option (web parity).
      disabled: !isComplete || exercise.sets.some((set) => set.skipped),
      variant: "primary",
    },
  ];

  return (
    <ScrollView
      style={{ width }}
      contentContainerStyle={{
        paddingHorizontal: SPACING.lg,
        paddingTop: FAB_TOP,
        // Keep the last card reachable above the floating pager bar.
        paddingBottom: pagerBarClearance(insets.bottom),
      }}
    >
      <View
        style={{
          marginBottom: SPACING.md,
          // The scroll content is already inset by the screen padding; stop
          // the title the rest of the way short of the pinned speed-dial FAB.
          paddingRight: titleRightInset(1) - SPACING.lg,
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
          {isComplete && (
            <MaterialCommunityIcons
              name="check-circle"
              size={22}
              color={colors.tertiary}
            />
          )}
          {exercise.addedOn && <Badge label="ADD-ON" />}
        </View>
        <Text
          style={{
            fontSize: FONT.base,
            fontWeight: "600",
            color: colors.onSurfaceDisabled,
          }}
        >
          {exercise.apparatus}
        </Text>
      </View>

      <Info title="Sets" actions={setsActions}>
        <SetList
          exercise={exercise}
          isCurrentExercise={isCurrentExercise}
          onEditSet={setEditingSetIdx}
        />
      </Info>

      <Info
        title="Progress"
        titleAction={{
          icon: "arrow-expand",
          onPress: openFullProgress,
          accessibilityLabel: "Open full progress",
        }}
      >
        <View style={{ height: CHART_HEIGHT }}>
          <ProgressChart
            selectedName={exercise.name}
            selectedApparatus={exercise.apparatus}
            gym={exercise.gym}
          />
        </View>
      </Info>

      <SubmitSetDialog
        exercise={exercise}
        setIdx={editingSetIdx}
        onClose={() => setEditingSetIdx(undefined)}
      />
    </ScrollView>
  );
};
