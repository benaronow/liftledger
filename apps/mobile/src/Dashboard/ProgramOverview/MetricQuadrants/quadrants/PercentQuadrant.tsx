import { Program } from "@liftledger/shared";
import { ContinuousBar } from "../ContinuousBar";
import { Quadrant } from "./Quadrant";

type Props = {
  program: Program;
};

export const PercentQuadrant = ({ program }: Props) => {
  const sessionsPerRotation = program.rotations[0]?.length ?? 0;
  const totalSessions = program.length * sessionsPerRotation;
  const completedSessions = program.rotations.reduce(
    (sum, rotation) => sum + rotation.filter((session) => session.completedDate).length,
    0,
  );
  const percent = totalSessions ? completedSessions / totalSessions : 0;

  return (
    <Quadrant
      corner="bl"
      label="COMPLETE"
      value={`${Math.round(percent * 100)}%`}
      bar={<ContinuousBar fillPercent={percent} pulse />}
    />
  );
};
