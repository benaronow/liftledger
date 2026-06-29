import { MaterialCommunityIcons } from "@expo/vector-icons";
import { isExerciseComplete } from "@liftledger/api-client";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { Exercise } from "@liftledger/shared";
import { useState } from "react";
import { View } from "react-native";
import { Badge } from "../../components/Badge";
import { Info } from "../../components/Info";
import { FAB_SIZE, FAB_TOP, titleRightInset } from "../../layout";
import { Text, useTheme } from "react-native-paper";
import { ProgressChart } from "../../Progress/ProgressChart";
import type { RootStackParamList } from "../../RootNavigator/types";
import { FONT, SPACING } from "../../theme";
import { SetList } from "./SetList/SetList";
import { SubmitSetDialog } from "./SetList/SubmitSetDialog/SubmitSetDialog";

interface Props {
  exercise: Exercise;
  isCurrentExercise: boolean;
  // Let the pager suspend swiping while the progress chart is being touched, so
  // its tooltip pan gesture doesn't fight the horizontal page swipe.
  onChartTouchStart?: () => void;
  onChartTouchEnd?: () => void;
}

export const ExercisePage = ({
  exercise,
  isCurrentExercise,
  onChartTouchStart,
  onChartTouchEnd,
}: Props) => {
  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [editingSetIdx, setEditingSetIdx] = useState<number>();

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
      <Info title="Sets" fill>
        <SetList
          exercise={exercise}
          isCurrentExercise={isCurrentExercise}
          onEditSet={setEditingSetIdx}
        />
      </Info>
      <Info
        title="Progress"
        fill
        titleAction={{
          icon: "arrow-expand",
          onPress: openFullProgress,
          accessibilityLabel: "Open full progress",
        }}
      >
        <View
          style={{ flex: 1 }}
          onTouchStart={onChartTouchStart}
          onTouchEnd={onChartTouchEnd}
          onTouchCancel={onChartTouchEnd}
        >
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
    </View>
  );
};
