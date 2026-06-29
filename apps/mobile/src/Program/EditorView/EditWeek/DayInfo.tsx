import { useProgram, useMe } from "@liftledger/api-client";
import { Day } from "@liftledger/shared";
import { Text, useTheme } from "react-native-paper";
import { FONT } from "../../../theme";
import { Info, InfoAction } from "../../../components/Info";
import { DayErrors } from "../../validateTemplate";
import { useTemplate } from "../../TemplateProvider";

interface Props {
  day: Day;
  dIdx: number;
  errors: DayErrors | undefined;
  onRequestDelete: (dIdx: number) => void;
}

export const DayInfo = ({ day, dIdx, errors, onRequestDelete }: Props) => {
  const { colors } = useTheme();
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const {
    templateProgram,
    setTemplateProgram,
    editingWeekIdx,
    setEditingDayIdx,
  } = useTemplate();

  const week = templateProgram.weeks[editingWeekIdx];

  const handleMoveDay = (
    movedDay: Day,
    dayIdx: number,
    type: "up" | "down",
  ) => {
    if ((dayIdx !== 0 || type !== "up") && (dayIdx !== 6 || type !== "down")) {
      setTemplateProgram({
        ...templateProgram,
        weeks: templateProgram.weeks.map((w, idx) =>
          idx === editingWeekIdx
            ? w
                .toSpliced(dayIdx, 1)
                .toSpliced(type === "up" ? dayIdx - 1 : dayIdx + 1, 0, movedDay)
            : w,
        ),
      });
    }
  };

  const handleDuplicateDay = (dayIdx: number) => {
    const copy: Day = {
      ...templateProgram.weeks[templateProgram.weeks.length - 1][dayIdx],
      name: `${templateProgram.weeks[0][dayIdx].name} (copy)`,
      completedDate: undefined,
    };

    setTemplateProgram({
      ...templateProgram,
      weeks: templateProgram.weeks.map((w, idx) =>
        idx === editingWeekIdx ? w.toSpliced(dayIdx + 1, 0, copy) : w,
      ),
    });
  };

  const isComplete = !!curProgram && curProgram.curDayIdx > dIdx;

  const infoActions: InfoAction[] = [
    {
      icon: "chevron-up",
      disabled: isComplete || dIdx === curProgram?.curDayIdx || dIdx === 0,
      onPress: () => handleMoveDay(day, dIdx, "up"),
      variant: "primary",
    },
    {
      icon: "chevron-down",
      disabled: isComplete || dIdx === week.length - 1,
      onPress: () => handleMoveDay(day, dIdx, "down"),
      variant: "primary",
    },
    {
      icon: "pencil",
      disabled: isComplete,
      onPress: () => setEditingDayIdx(dIdx),
      variant: "primary",
    },
    {
      icon: "content-copy",
      disabled: isComplete || week.length > 6,
      onPress: () => handleDuplicateDay(dIdx),
      variant: "primary",
    },
    {
      icon: "delete",
      disabled: isComplete || week.length === 1,
      onPress: () => onRequestDelete(dIdx),
      variant: "danger",
    },
  ];

  const hasListedExercises = day.exercises.some(
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
    <Info title={day.name} actions={infoActions}>
      {hasListedExercises &&
        day.exercises
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
