import { ProgramSummary } from "@liftledger/shared";
import dayjs from "dayjs";
import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Button, Text, useTheme } from "react-native-paper";
import { SPACING, RADIUS, FONT } from "../../theme";

const EXPAND_MS = 200;
import { getMaxProgramStreak } from "../../Dashboard/ProgramOverview/MetricQuadrants/quadrants/getStreak";
import { RootStackParamList } from "../../RootNavigator/types";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface Props {
  summary: ProgramSummary;
  disabled?: boolean;
  expanded: boolean;
  onToggle: () => void;
}

export const CompletedProgram = ({
  summary,
  disabled,
  expanded,
  onToggle,
}: Props) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();

  const rotation = useSharedValue(expanded ? 1 : 0);
  useEffect(() => {
    rotation.value = withTiming(expanded ? 1 : 0, { duration: EXPAND_MS });
  }, [expanded, rotation]);
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  const stats = expanded
    ? [
        {
          label: "Dates",
          value: `${summary.startDate ? dayjs(summary.startDate).format("M/DD/YY") : "N/A"} - ${
            summary.endDate ? dayjs(summary.endDate).format("M/DD/YY") : "N/A"
          }`,
        },
        { label: "Rotations", value: String(summary.rotationCount) },
        { label: "Sessions", value: String(summary.sessionCount) },
        { label: "Rest days", value: String(summary.restDays) },
        {
          label: "Max streak",
          value: String(
            getMaxProgramStreak(summary.workoutDays, summary.restDays),
          ),
        },
        {
          label: "Total lifted",
          value: `${summary.volume.toLocaleString()}${summary.unit}`,
        },
      ]
    : [];

  const duplicate = () =>
    navigation.navigate(
      "Tabs",
      { screen: "Program", params: { duplicateFrom: summary._id } },
      { pop: true },
    );

  const viewAll = () =>
    navigation.navigate(
      "Tabs",
      {
        screen: "Progress",
        params: { screen: "ProgramDetail", params: { programId: summary._id } },
      },
      { pop: true },
    );

  return (
    <Animated.View
      layout={LinearTransition.duration(EXPAND_MS)}
      style={{
        width: "100%",
        marginBottom: SPACING.md,
        borderRadius: RADIUS.sm,
        overflow: "hidden",
        backgroundColor: colors.surface,
      }}
    >
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: SPACING.sm,
          minHeight: 44,
          paddingLeft: SPACING.md,
          paddingRight: SPACING.sm,
          paddingVertical: SPACING.sm,
        }}
      >
        <Text
          style={{
            flex: 1,
            fontSize: FONT.base,
            fontWeight: "800",
            color: colors.onSurface,
          }}
          numberOfLines={1}
        >
          {summary.name}
        </Text>
        <Animated.View style={chevronStyle}>
          <MaterialCommunityIcons
            name="chevron-down"
            size={24}
            color={colors.onSurfaceVariant}
          />
        </Animated.View>
      </Pressable>

      {expanded && (
        <Animated.View
          entering={FadeIn.duration(EXPAND_MS)}
          exiting={FadeOut.duration(EXPAND_MS / 2)}
          style={{
            paddingHorizontal: SPACING.md,
            paddingBottom: SPACING.md,
            gap: SPACING.md,
          }}
        >
          <View
            style={{
              height: StyleSheet.hairlineWidth,
              backgroundColor: colors.onSurfaceVariant,
              opacity: 0.4,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              rowGap: SPACING.md,
            }}
          >
            {stats.map((stat) => (
              <View key={stat.label} style={{ width: "50%", gap: 2 }}>
                <Text
                  style={{
                    fontSize: FONT.xs,
                    color: colors.onSurfaceVariant,
                  }}
                >
                  {stat.label}
                </Text>
                <Text
                  style={{
                    fontSize: FONT.base,
                    fontWeight: "700",
                    color: colors.onSurface,
                  }}
                >
                  {stat.value}
                </Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: SPACING.sm, width: "100%" }}>
            <Button
              mode="contained"
              icon="content-copy"
              disabled={disabled}
              onPress={duplicate}
              style={{ borderRadius: RADIUS.md, flex: 1 }}
            >
              Duplicate
            </Button>
            <Button
              mode="contained"
              icon="format-list-bulleted"
              onPress={viewAll}
              style={{ borderRadius: RADIUS.md, flex: 1 }}
            >
              View all
            </Button>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};
