import { Session } from "@liftledger/shared";
import { View } from "react-native";
import { SPACING } from "../../theme";
import { AccordionRow } from "./AccordionRow";
import { SessionRow } from "./SessionRow";

interface Props {
  rotation: Session[];
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onChange: (rotation: Session[]) => void;
}

export const RotationRow = ({
  rotation,
  index,
  expanded,
  onToggle,
  onChange,
}: Props) => {
  const completed = rotation.filter((s) => s.completedDate).length;

  const setSession = (idx: number, session: Session) =>
    onChange(rotation.toSpliced(idx, 1, session));

  return (
    <AccordionRow
      title={`Rotation ${index + 1}`}
      subtitle={`${completed}/${rotation.length} session${
        rotation.length === 1 ? "" : "s"
      } completed`}
      emphasis
      expanded={expanded}
      onToggle={onToggle}
    >
      <View style={{ gap: SPACING.sm }}>
        {rotation.map((session, idx) => (
          <SessionRow
            key={idx}
            session={session}
            label={`Day ${idx + 1}`}
            onChange={(next) => setSession(idx, next)}
          />
        ))}
      </View>
    </AccordionRow>
  );
};
