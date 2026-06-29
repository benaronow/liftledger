import { Program } from "@liftledger/shared";
import { SegmentedBar } from "../SegmentedBar";
import { Quadrant } from "./Quadrant";

type Props = {
  program: Program;
};

export const DayQuadrant = ({ program }: Props) => {
  const week = program.weeks[program.curWeekIdx] ?? [];
  const day = week[program.curDayIdx];
  const dayName = day?.name?.trim() || `Day ${program.curDayIdx + 1}`;

  return (
    <Quadrant
      corner="tl"
      label="DAY"
      value={dayName}
      bar={<SegmentedBar count={week.length} filled={program.curDayIdx} />}
    />
  );
};
