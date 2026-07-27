import { Program } from "@liftledger/shared";
import { useState } from "react";
import { LayoutChangeEvent, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMe } from "@liftledger/api-client";
import { useTheme } from "react-native-paper";
import { ContinuousBar } from "../ContinuousBar";
import { Quadrant } from "./Quadrant";
import {
  getRestDaysRemaining,
  getStreak,
  withCurrentProgram,
} from "./getStreak";
import { StreakInfoDialog } from "./StreakInfoDialog";

export const STREAK_TARGET = 10;

export const STREAK_HEAT = [
  "#FFAA00",
  "#FFC01A",
  "#FFD84D",
  "#FBEFA0",
  "#EAF2FF",
  "#93C5FD",
  "#7C93FF",
  "#B57BFF",
  "#EC6DC9",
  "#FF7A54",
];

export const STREAK_COLOR = STREAK_HEAT[0];

const heatColor = (tier: number) =>
  STREAK_HEAT[
    ((tier % STREAK_HEAT.length) + STREAK_HEAT.length) % STREAK_HEAT.length
  ];

export const getStreakHeat = (streak: number) => {
  const tier = Math.floor(streak / STREAK_TARGET);
  return {
    tier,
    tierProgress: (streak % STREAK_TARGET) / STREAK_TARGET,
    baseColor: tier === 0 ? null : heatColor(tier - 1),
    frontColor: heatColor(tier),
    nextColor: heatColor(tier + 1),
  };
};

type Props = {
  program: Program;
  onLayout?: (e: LayoutChangeEvent) => void;
};

export const StreakQuadrant = ({ program, onLayout }: Props) => {
  const { colors } = useTheme();
  const { data: curUser } = useMe();
  const [infoOpen, setInfoOpen] = useState(false);

  const streak = getStreak(withCurrentProgram(curUser?.programs, program));
  const heat = getStreakHeat(streak);
  const restDaysRemaining = getRestDaysRemaining(program);
  const restDays = program.restDays ?? 0;

  return (
    <>
      <Quadrant
        corner="br"
        label="STREAK"
        value={`${streak}`}
        labelTrailing={
          <Pressable
            onPress={() => setInfoOpen(true)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Streak info"
          >
            <MaterialCommunityIcons
              name="information-outline"
              size={14}
              color={
                restDaysRemaining === 0
                  ? colors.error
                  : restDaysRemaining === 1
                    ? colors.tertiaryContainer
                    : colors.onSurfaceDisabled
              }
            />
          </Pressable>
        }
        bar={
          <ContinuousBar
            fillPercent={heat.tierProgress}
            color={heat.frontColor}
            baseColor={heat.baseColor}
            onLayout={onLayout}
          />
        }
      />
      <StreakInfoDialog
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        restDays={restDays}
        restDaysRemaining={restDaysRemaining}
        accentColor={STREAK_COLOR}
      />
    </>
  );
};
