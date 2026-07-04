import { Program } from "@liftledger/shared";
import { useState } from "react";
import { LayoutChangeEvent, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { ContinuousBar } from "../ContinuousBar";
import { Quadrant } from "./Quadrant";
import { getRestDaysRemaining, getStreak } from "./getStreak";
import { StreakInfoDialog } from "./StreakInfoDialog";

export const STREAK_TARGET = 10;
export const STREAK_COLOR = "#FFAA00";

type Props = {
  program: Program;
  onLayout?: (e: LayoutChangeEvent) => void;
};

export const StreakQuadrant = ({ program, onLayout }: Props) => {
  const { colors } = useTheme();
  const [infoOpen, setInfoOpen] = useState(false);

  const streak = getStreak(program);
  const fillPercent = streak / STREAK_TARGET;
  const restDaysRemaining = getRestDaysRemaining(program);
  const restDays = program.restDays ?? 0;

  return (
    <>
      <Quadrant
        corner="br"
        label="STREAK"
        value={`${streak}`}
        labelLeading={
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
                restDaysRemaining === 1
                  ? colors.error
                  : colors.onSurfaceDisabled
              }
            />
          </Pressable>
        }
        bar={
          <ContinuousBar
            fillPercent={fillPercent}
            color={STREAK_COLOR}
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
