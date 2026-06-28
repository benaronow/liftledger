import { Program } from "@liftledger/shared";
import { ContinuousBar } from "../ContinuousBar";
import { Quadrant } from "./Quadrant";
import { LayoutChangeEvent } from "react-native";
import { getStreak } from "./getStreak";

export const STREAK_TARGET = 10;
export const STREAK_COLOR = "#FFAA00";

type Props = {
  program: Program;
  onLayout?: (e: LayoutChangeEvent) => void;
};

export const StreakQuadrant = ({ program, onLayout }: Props) => {
  const streak = getStreak(program);
  const fillPercent = streak / STREAK_TARGET;

  return (
    <Quadrant
      corner="br"
      label="DAY STREAK"
      value={`${streak}`}
      bar={
        <ContinuousBar
          fillPercent={fillPercent}
          color={STREAK_COLOR}
          onLayout={onLayout}
        />
      }
    />
  );
};
