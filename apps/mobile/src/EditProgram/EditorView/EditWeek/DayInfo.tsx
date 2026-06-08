import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useProgram, useMe } from "@liftledger/api-client";
import { Day } from "@liftledger/shared";
import { Text, useTheme } from "../../../paper";
import { FONT } from "../../../theme";
import { Info, InfoAction } from "../Info";
import { useTemplate } from "../../TemplateProvider";

interface Props {
  day: Day;
  dIdx: number;
  hasErrors: boolean;
  onRequestDelete: (dIdx: number) => void;
}

export const DayInfo = ({ day, dIdx, hasErrors, onRequestDelete }: Props) => {
  const { colors } = useTheme();
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { templateProgram, setTemplateProgram, editingWeekIdx, setEditingDayIdx } =
    useTemplate();

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

  const infoActions: InfoAction[] = [
    {
      icon: <MaterialCommunityIcons name="chevron-up" size={22} color="white" />,
      disabled: dIdx === curProgram?.curDayIdx || dIdx === 0,
      onPress: () => handleMoveDay(day, dIdx, "up"),
      variant: "primary",
    },
    {
      icon: <MaterialCommunityIcons name="chevron-down" size={22} color="white" />,
      disabled: dIdx === week.length - 1,
      onPress: () => handleMoveDay(day, dIdx, "down"),
      variant: "primary",
    },
    {
      icon: <MaterialCommunityIcons name="pencil" size={22} color="white" />,
      onPress: () => setEditingDayIdx(dIdx),
      variant: "primary",
    },
    {
      icon: <MaterialCommunityIcons name="content-copy" size={22} color="white" />,
      disabled: week.length > 6,
      onPress: () => handleDuplicateDay(dIdx),
      variant: "primary",
    },
    {
      icon: <MaterialCommunityIcons name="delete" size={20} color="white" />,
      disabled: week.length === 1,
      onPress: () => onRequestDelete(dIdx),
      variant: "danger",
    },
  ];

  const disabledMessage =
    curProgram && curProgram.curDayIdx > dIdx
      ? "Day complete, cannot be edited or moved until next week."
      : "";

  const exerciseCount = day.exercises.reduce(
    (acc, ex) =>
      acc + (ex.addedOn ? 0 : ex.sets.filter((s) => !s.addedOn).length),
    0,
  );

  const hasListedExercises = day.exercises.some(
    (e) => e.name && e.apparatus && e.sets.length,
  );

  return (
    <Info
      title={`Day ${dIdx + 1}`}
      actions={infoActions}
      disabledMessage={disabledMessage}
    >
      <Text style={boldStyle(colors.text)}>{`Name: ${day.name} [${exerciseCount}]`}</Text>
      {hasListedExercises &&
        day.exercises
          .filter((ex) => !ex.addedOn)
          .map((ex, i) => (
            <Text style={lineStyle(colors.text)} key={ex._id ?? i}>
              {`${i + 1}. ${ex.name} [${ex.sets.filter((s) => !s.addedOn).length}]`}
            </Text>
          ))}
      {hasErrors && (
        <Text style={errorStyle(colors.danger)}>Must add at least one exercise.</Text>
      )}
    </Info>
  );
};

const boldStyle = (textColor: string) => ({
  color: textColor,
  fontSize: FONT.sm,
  fontWeight: "700" as const,
});
const lineStyle = (textColor: string) => ({ color: textColor, fontSize: FONT.sm });
const errorStyle = (dangerColor: string) => ({
  color: dangerColor,
  fontSize: FONT.sm,
  fontWeight: "700" as const,
});
