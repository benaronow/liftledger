import { Program } from "@liftledger/shared";
import { SegmentedBar } from "../SegmentedBar";
import { Quadrant } from "./Quadrant";
import { isFullySkipped } from "./getStreak";

type Props = {
  program: Program;
};

export const SessionQuadrant = ({ program }: Props) => {
  const rotation = program.rotations[program.curRotationIdx] ?? [];
  const session = rotation[program.curSessionIdx];
  const sessionName =
    session?.name?.trim() || `Session ${program.curSessionIdx + 1}`;

  const skipped = new Set(
    rotation.flatMap((session, i) =>
      i < program.curSessionIdx && isFullySkipped(session) ? [i] : [],
    ),
  );

  return (
    <Quadrant
      corner="tl"
      label="SESSION"
      value={sessionName}
      bar={
        <SegmentedBar
          count={rotation.length}
          filled={program.curSessionIdx}
          skipped={skipped}
        />
      }
    />
  );
};
