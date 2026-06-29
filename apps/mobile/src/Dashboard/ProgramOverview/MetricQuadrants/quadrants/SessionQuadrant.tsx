import { Program } from "@liftledger/shared";
import { SegmentedBar } from "../SegmentedBar";
import { Quadrant } from "./Quadrant";

type Props = {
  program: Program;
};

export const SessionQuadrant = ({ program }: Props) => {
  const rotation = program.rotations[program.curRotationIdx] ?? [];
  const session = rotation[program.curSessionIdx];
  const sessionName = session?.name?.trim() || `Session ${program.curSessionIdx + 1}`;

  return (
    <Quadrant
      corner="tl"
      label="DAY"
      value={sessionName}
      bar={<SegmentedBar count={rotation.length} filled={program.curSessionIdx} />}
    />
  );
};
