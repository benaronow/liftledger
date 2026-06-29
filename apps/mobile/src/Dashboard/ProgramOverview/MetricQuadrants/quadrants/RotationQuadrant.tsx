import { Program } from "@liftledger/shared";
import { SegmentedBar } from "../SegmentedBar";
import { Quadrant } from "./Quadrant";

type Props = {
  program: Program;
};

export const WeekQuadrant = ({ program }: Props) => {
  return (
    <Quadrant
      corner="tr"
      label="WEEK"
      value={`${program.curWeekIdx + 1} / ${program.length}`}
      bar={<SegmentedBar count={program.length} filled={program.curWeekIdx} />}
    />
  );
};
