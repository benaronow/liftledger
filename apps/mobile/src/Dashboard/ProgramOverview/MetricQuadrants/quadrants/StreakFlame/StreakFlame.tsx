import { Program } from "@liftledger/shared";
import { View } from "react-native";
import { SPACING } from "../../../../../theme";
import { getStreakHeat } from "../StreakQuadrant";
import { FlameTongue, MAX_TONGUE_HEIGHT, TONGUE_WIDTH } from "./FlameTongue";
import { getStreak, withCurrentProgram } from "../getStreak";
import { useAppActive } from "../../PulseProvider";
import { useMe } from "@liftledger/api-client";

const GAP = SPACING.lg;
const BAR_INSET = SPACING.sm;
const TONGUE_STEP = 8;
const HALF_TONGUE = TONGUE_WIDTH / 2;

type Props = {
  program: Program;
  grid: { width: number; height: number };
  barHeight: number;
  keepOutRadius: number;
};

export const StreakFlame = ({
  program,
  grid,
  barHeight,
  keepOutRadius: R,
}: Props) => {
  const appActive = useAppActive();
  const { data: curUser } = useMe();
  const streak = getStreak(withCurrentProgram(curUser?.programs, program));
  const heat = getStreakHeat(streak);
  const flameProgress = heat.tierProgress === 0 ? 1 : heat.tierProgress;

  const barEdgeOffset = GAP / 2 + BAR_INSET;
  const barRightOffset = barEdgeOffset + (grid.width - GAP) / 2 - BAR_INSET * 2;
  const fillTopOffset = barEdgeOffset + (1 - flameProgress) * barHeight;

  const junctionX =
    fillTopOffset < R ? Math.sqrt(R * R - fillTopOffset * fillTopOffset) : 0;
  const startX = Math.max(barEdgeOffset, junctionX);
  const width = Math.max(0, barRightOffset - startX);

  const span = Math.max(0, width - TONGUE_WIDTH);
  const count = Math.max(2, Math.ceil(span / TONGUE_STEP) + 1);

  if (streak === 0 || barHeight === 0) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: grid.width / 2 + startX,
        bottom: grid.height / 2 - fillTopOffset,
        width,
        height: MAX_TONGUE_HEIGHT,
        zIndex: 9,
        elevation: 9,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <FlameTongue
          key={i}
          index={i}
          centerX={HALF_TONGUE + (span / (count - 1)) * i}
          coreColor={heat.frontColor}
          tipColor={heat.nextColor}
          paused={!appActive}
        />
      ))}
    </View>
  );
};
