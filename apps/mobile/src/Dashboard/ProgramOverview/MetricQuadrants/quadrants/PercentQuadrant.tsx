import { Program } from "@liftledger/shared";
import { ContinuousBar } from "../ContinuousBar";
import { Quadrant } from "./Quadrant";

type Props = {
  program: Program;
};

export const PercentQuadrant = ({ program }: Props) => {
  const daysPerWeek = program.weeks[0]?.length ?? 0;
  const totalDays = program.length * daysPerWeek;
  const completedDays = program.weeks.reduce(
    (sum, week) => sum + week.filter((day) => day.completedDate).length,
    0,
  );
  const percent = totalDays ? completedDays / totalDays : 0;

  return (
    <Quadrant
      corner="bl"
      label="COMPLETE"
      value={`${Math.round(percent * 100)}%`}
      bar={<ContinuousBar fillPercent={percent} />}
    />
  );
};
