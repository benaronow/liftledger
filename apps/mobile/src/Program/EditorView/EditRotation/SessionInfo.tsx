import { useProgram, useMe } from "@liftledger/api-client";
import { Session } from "@liftledger/shared";
import { Text, useTheme } from "react-native-paper";
import { FONT } from "../../../theme";
import { Info, InfoAction } from "../../../components/Info";
import { SessionErrors } from "../../validateTemplate";
import { useTemplate } from "../../TemplateProvider";

interface Props {
  session: Session;
  dIdx: number;
  errors: SessionErrors | undefined;
  onRequestDelete: (dIdx: number) => void;
}

export const SessionInfo = ({ session, dIdx, errors, onRequestDelete }: Props) => {
  const { colors } = useTheme();
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const {
    templateProgram,
    setTemplateProgram,
    editingRotationIdx,
    setEditingSessionIdx,
  } = useTemplate();

  const rotation = templateProgram.rotations[editingRotationIdx];

  const handleMoveSession = (
    movedSession: Session,
    sessionIdx: number,
    type: "up" | "down",
  ) => {
    if ((sessionIdx !== 0 || type !== "up") && (sessionIdx !== 6 || type !== "down")) {
      setTemplateProgram({
        ...templateProgram,
        rotations: templateProgram.rotations.map((w, idx) =>
          idx === editingRotationIdx
            ? w
                .toSpliced(sessionIdx, 1)
                .toSpliced(type === "up" ? sessionIdx - 1 : sessionIdx + 1, 0, movedSession)
            : w,
        ),
      });
    }
  };

  const handleDuplicateSession = (sessionIdx: number) => {
    const copy: Session = {
      ...templateProgram.rotations[templateProgram.rotations.length - 1][sessionIdx],
      name: `${templateProgram.rotations[0][sessionIdx].name} (copy)`,
      completedDate: undefined,
    };

    setTemplateProgram({
      ...templateProgram,
      rotations: templateProgram.rotations.map((w, idx) =>
        idx === editingRotationIdx ? w.toSpliced(sessionIdx + 1, 0, copy) : w,
      ),
    });
  };

  const isComplete = !!curProgram && curProgram.curSessionIdx > dIdx;

  const infoActions: InfoAction[] = [
    {
      icon: "chevron-up",
      disabled: isComplete || dIdx === curProgram?.curSessionIdx || dIdx === 0,
      onPress: () => handleMoveSession(session, dIdx, "up"),
      variant: "primary",
    },
    {
      icon: "chevron-down",
      disabled: isComplete || dIdx === rotation.length - 1,
      onPress: () => handleMoveSession(session, dIdx, "down"),
      variant: "primary",
    },
    {
      icon: "pencil",
      disabled: isComplete,
      onPress: () => setEditingSessionIdx(dIdx),
      variant: "primary",
    },
    {
      icon: "content-copy",
      disabled: isComplete || rotation.length > 6,
      onPress: () => handleDuplicateSession(dIdx),
      variant: "primary",
    },
    {
      icon: "delete",
      disabled: isComplete || rotation.length === 1,
      onPress: () => onRequestDelete(dIdx),
      variant: "danger",
    },
  ];

  const hasListedExercises = session.exercises.some(
    (e) => e.name && e.apparatus && e.sets.length,
  );

  const errorLines = [
    ...(errors?.name ? [errors.name] : []),
    ...(errors?.exercises ?? []).flatMap((exErrors, i) =>
      Object.keys(exErrors).length > 0
        ? [`Exercise ${i + 1}: Not complete`]
        : [],
    ),
  ];

  return (
    <Info title={session.name} actions={infoActions}>
      {hasListedExercises &&
        session.exercises
          .filter((ex) => !ex.addedOn)
          .map((ex, i) => (
            <Text style={lineStyle(colors.onSurface)} key={ex._id ?? i}>
              {`${i + 1}. ${ex.name} [${ex.sets.filter((s) => !s.addedOn).length}]`}
            </Text>
          ))}
      {errorLines.map((line, i) => (
        <Text key={i} style={errorStyle(colors.error)}>
          {line}
        </Text>
      ))}
    </Info>
  );
};

const lineStyle = (textColor: string) => ({
  color: textColor,
  fontSize: FONT.sm,
});
const errorStyle = (dangerColor: string) => ({
  color: dangerColor,
  fontSize: FONT.sm,
  fontWeight: "700" as const,
});
